import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { Queue, Worker, type Job } from 'bullmq';
import { compileAssetContract, integrityCheckOperation } from '@spryxel/domain';
import {
  claimDurableJob,
  finishDurableJob,
  reconcileDurableJobs,
  type Database,
} from '@spryxel/db';
import { Redis } from 'ioredis';

const queueName = 'spryxel-durable-jobs-v1';
const queueSchemaVersion = 'job-reference.v1';
const reconciliationBatchSize = 50;
const reconciliationIntervalMs = 1_000;
const reconciliationBudgetMs = 5_000;
const workerLeaseSeconds = 10;
const operationBudgetMs = 5_000;
const queueErrorLogIntervalMs = 60_000;

export type DurableJobReference = { jobId: string; schemaVersion: typeof queueSchemaVersion };
export type QueueErrorSource = 'queue' | 'worker';

export function workerRedisConnectionOptions() {
  return { maxRetriesPerRequest: null, connectTimeout: 2_000 } as const;
}

export function createRateLimitedQueueErrorReporter(
  onOutcome: (fields: Record<string, unknown>, message: string) => void,
  now: () => number = Date.now,
  intervalMs = queueErrorLogIntervalMs,
): (source: QueueErrorSource, error: Error) => void {
  const lastReportedAt = new Map<QueueErrorSource, number>();
  return (source, error) => {
    const timestamp = now();
    const previous = lastReportedAt.get(source);
    if (previous !== undefined && timestamp - previous < intervalMs) return;
    lastReportedAt.set(source, timestamp);
    const errorType = /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(error.name) ? error.name : 'Error';
    onOutcome({ event: `jobs.${source}_error`, errorType }, `durable Job ${source} Redis error`);
  };
}

export class DurableJobQueueRuntime {
  private readonly queueConnection: Redis;
  private readonly workerConnection: Redis;
  private readonly queue: Queue<DurableJobReference>;
  private readonly worker: Worker<DurableJobReference>;
  private timer: NodeJS.Timeout | undefined;
  private reconciling: Promise<void> | undefined;
  private stopping = false;
  private readonly reportQueueError: ReturnType<typeof createRateLimitedQueueErrorReporter>;

  constructor(
    private readonly database: Database,
    redisUrl: string,
    private readonly workerId = `worker-${randomUUID()}`,
    private readonly onOutcome: (
      fields: Record<string, unknown>,
      message: string,
    ) => void = () => {},
  ) {
    this.queueConnection = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      connectTimeout: 2_000,
      commandTimeout: 1_000,
    });
    this.workerConnection = new Redis(redisUrl, workerRedisConnectionOptions());
    this.reportQueueError = createRateLimitedQueueErrorReporter(onOutcome);
    this.queue = new Queue<DurableJobReference>(queueName, {
      connection: this.queueConnection,
      defaultJobOptions: { removeOnComplete: true, removeOnFail: true, attempts: 1 },
    });
    this.worker = new Worker<DurableJobReference>(queueName, (job) => this.process(job), {
      connection: this.workerConnection,
      concurrency: 4,
      lockDuration: 30_000,
      maxStalledCount: 1,
    });
    this.queue.on('error', (error) => this.reportQueueError('queue', error));
    this.worker.on('error', (error) => this.reportQueueError('worker', error));
  }

  async start(): Promise<void> {
    await Promise.all([this.queue.waitUntilReady(), this.worker.waitUntilReady()]);
    await this.reconcileOnce();
    this.timer = setInterval(() => {
      void this.reconcileOnce().catch(() => {
        this.onOutcome(
          { event: 'jobs.reconcile_failed' },
          'durable Job reconciliation unavailable',
        );
      });
    }, reconciliationIntervalMs);
    this.timer.unref();
  }

  async stop(): Promise<void> {
    this.stopping = true;
    if (this.timer) clearInterval(this.timer);
    await this.reconciling?.catch(() => {});
    await this.worker.close();
    await this.queue.close();
    await Promise.all([this.queueConnection.quit(), this.workerConnection.quit()]);
  }

  async reconcileOnce(): Promise<void> {
    if (this.stopping) return;
    if (this.reconciling) return this.reconciling;
    this.reconciling = (async () => {
      const startedAt = performance.now();
      const jobIds = await reconcileDurableJobs(this.database, reconciliationBatchSize);
      for (const jobId of jobIds) {
        if (timeBudgetExceeded(startedAt, reconciliationBudgetMs)) break;
        await enqueueDurableJobReference(this.queue, jobId);
      }
    })();
    try {
      await this.reconciling;
    } finally {
      this.reconciling = undefined;
    }
  }

  private async process(job: Job<DurableJobReference>): Promise<{ outcome: string }> {
    const reference = parseJobReference(job.data);
    if (!reference) {
      this.onOutcome(
        { event: 'jobs.invalid_queue_reference' },
        'invalid durable Job queue reference',
      );
      return { outcome: 'ignored' };
    }
    const claim = await claimDurableJob(
      this.database,
      reference.jobId,
      this.workerId,
      workerLeaseSeconds,
    );
    if (!claim) return { outcome: 'already_claimed_or_terminal' };

    const startedAt = performance.now();
    let outcome: 'succeeded' | 'failed' | 'cancelled' = 'failed';
    let failureCode: string | undefined;
    try {
      if (timeBudgetExceeded(startedAt, operationBudgetMs)) {
        failureCode = 'execution_timeout';
      } else if (claim.operationType !== integrityCheckOperation) {
        failureCode = 'contract_integrity_mismatch';
      } else {
        const compiled = compileAssetContract({
          skuId: claim.skuId,
          specification: claim.specification,
        });
        if (timeBudgetExceeded(startedAt, operationBudgetMs)) failureCode = 'execution_timeout';
        else if (compiled.specificationSha256 === claim.specificationSha256) outcome = 'succeeded';
        else failureCode = 'contract_integrity_mismatch';
      }
    } catch {
      failureCode = 'contract_integrity_mismatch';
    }

    const finalized = await finishDurableJob(this.database, {
      jobId: claim.jobId,
      attemptId: claim.attemptId,
      leaseToken: claim.leaseToken,
      outcome,
      ...(failureCode ? { failureCode } : {}),
    });
    this.onOutcome(
      {
        event: 'jobs.integrity_check_finished',
        jobId: claim.jobId,
        attemptId: claim.attemptId,
        outcome: finalized ? outcome : 'lease_lost',
      },
      'durable Asset Contract integrity check finished',
    );
    return { outcome: finalized ? outcome : 'lease_lost' };
  }
}

export function timeBudgetExceeded(
  startedAtMs: number,
  budgetMs: number,
  nowMs = performance.now(),
): boolean {
  return (
    !Number.isFinite(startedAtMs) ||
    !Number.isFinite(budgetMs) ||
    budgetMs <= 0 ||
    !Number.isFinite(nowMs) ||
    nowMs - startedAtMs >= budgetMs
  );
}

export async function enqueueDurableJobReference(
  queue: Queue<DurableJobReference>,
  jobId: string,
): Promise<void> {
  await queue.add(
    'asset-contract-integrity-check',
    { jobId, schemaVersion: queueSchemaVersion },
    { jobId, removeOnComplete: true, removeOnFail: true, attempts: 1 },
  );
}

export function parseJobReference(value: unknown): DurableJobReference | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).some((key) => key !== 'jobId' && key !== 'schemaVersion') ||
    typeof record.jobId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(record.jobId) ||
    record.schemaVersion !== queueSchemaVersion
  ) {
    return null;
  }
  return { jobId: record.jobId, schemaVersion: queueSchemaVersion };
}

export function durableQueueName(): string {
  return queueName;
}
