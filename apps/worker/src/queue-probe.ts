import { randomBytes } from 'node:crypto';
import { Queue, QueueEvents, Worker } from 'bullmq';
import type { TransientQueueProbe } from '@spryxel/domain';
import { Redis } from 'ioredis';

export class BullMqTechnicalQueueProbe implements TransientQueueProbe {
  constructor(private readonly redisUrl: string) {}

  async ping(): Promise<void> {
    await runTechnicalQueueProbe(this.redisUrl);
  }
}

export async function assertQueueNamespaceEmpty(redis: Redis, queueName: string): Promise<void> {
  const match = `bull:${queueName}:*`;
  let cursor = '0';

  do {
    const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', match, 'COUNT', 100);
    if (keys.length > 0) {
      throw new Error('Technical queue probe left disposable Redis keys');
    }
    cursor = nextCursor;
  } while (cursor !== '0');
}

export async function runTechnicalQueueProbe(
  redisUrl: string,
  timeoutMs = 10_000,
): Promise<{ queueRoundTrip: true }> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error('Technical queue probe timeout must be positive');
  }

  const name = `platform-probe-${randomBytes(6).toString('hex')}`;
  const nonce = randomBytes(12).toString('hex');
  const queueConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    connectTimeout: 2_000,
  });
  const workerConnection = queueConnection.duplicate();
  const eventsConnection = queueConnection.duplicate();
  const connections = [queueConnection, workerConnection, eventsConnection];
  const queue = new Queue(name, { connection: queueConnection });
  const events = new QueueEvents(name, { connection: eventsConnection });
  const worker = new Worker(
    name,
    async (job) => {
      if (job.name !== 'platform-connectivity-probe' || job.data.nonce !== nonce) {
        throw new Error('Unexpected technical probe payload');
      }
      return { nonce };
    },
    { connection: workerConnection, concurrency: 1 },
  );

  queue.on('error', () => {});
  events.on('error', () => {});
  worker.on('error', () => {});

  let terminated = false;
  let probeFailed = false;
  let probeFailure: unknown;
  function forceDisconnectBackend(owner: { getBackend(): unknown }): void {
    const backend = owner.getBackend() as {
      connection?: { _client?: { disconnect(reconnect?: boolean): void } };
      blockingConnection?: { _client?: { disconnect(reconnect?: boolean): void } };
    };
    for (const connection of [backend.connection, backend.blockingConnection]) {
      try {
        // BullMQ's public disconnect waits for connection initialization. On a
        // hung Redis endpoint, reach its already-created ioredis adapter so the
        // owned socket can be terminated without waiting for that initialization.
        connection?._client?.disconnect(false);
      } catch {
        // Continue terminating every other probe-owned connection.
      }
    }
  }

  function terminateResources(): void {
    if (terminated) return;
    terminated = true;
    for (const disconnect of [
      () => worker.disconnect(),
      () => events.disconnect(),
      () => queue.disconnect(),
    ]) {
      try {
        void Promise.resolve(disconnect()).catch(() => {});
      } catch {
        // Continue terminating the remaining BullMQ-managed clients.
      }
    }
    for (const close of [() => worker.close(true), () => events.close(), () => queue.close()]) {
      try {
        void Promise.resolve(close()).catch(() => {});
      } catch {
        // A timeout must still disconnect the clients if a BullMQ close call throws synchronously.
      }
    }
    for (const connection of connections) {
      try {
        connection.disconnect(false);
      } catch {
        // Continue terminating the remaining probe-owned Redis connections.
      }
    }
    for (const owner of [worker, events, queue]) {
      forceDisconnectBackend(owner);
    }
  }

  const deadlineAt = Date.now() + timeoutMs;
  let deadlineTimer: NodeJS.Timeout | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    deadlineTimer = setTimeout(() => {
      terminateResources();
      reject(probeFailed ? probeFailure : new Error('Technical queue probe timed out'));
    }, timeoutMs);
  });

  const operation = runRoundTripAndCleanup();
  try {
    return await Promise.race([operation, deadline]);
  } finally {
    if (deadlineTimer) clearTimeout(deadlineTimer);
  }

  async function runRoundTripAndCleanup(): Promise<{ queueRoundTrip: true }> {
    let probeError: unknown;
    try {
      await Promise.all([queue.waitUntilReady(), events.waitUntilReady(), worker.waitUntilReady()]);
      const job = await queue.add(
        'platform-connectivity-probe',
        { nonce },
        { removeOnComplete: true },
      );
      const remainingMs = Math.max(1, deadlineAt - Date.now());
      const result = await job.waitUntilFinished(events, remainingMs);
      if (!result || typeof result !== 'object' || !('nonce' in result) || result.nonce !== nonce) {
        throw new Error('Technical queue probe returned an invalid result');
      }
    } catch (error) {
      probeError = error;
      probeFailed = true;
      probeFailure = error;
    }

    const cleanupError = await cleanupResources();
    if (probeError) throw probeError;
    if (cleanupError) throw cleanupError;
    return { queueRoundTrip: true };
  }

  async function cleanupResources(): Promise<unknown> {
    let cleanupError: unknown;
    async function attempt(action: () => Promise<unknown>): Promise<void> {
      try {
        await action();
      } catch (error) {
        cleanupError ??= error;
      }
    }

    await attempt(() => worker.close());
    await attempt(() => events.close());
    await attempt(() => queue.obliterate({ force: true }));
    await attempt(() => assertQueueNamespaceEmpty(queueConnection, name));
    await attempt(() => queue.close());
    for (const connection of connections) {
      if (connection.status === 'end') continue;
      await attempt(() => connection.quit());
    }
    return cleanupError;
  }
}
