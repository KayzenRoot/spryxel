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

export async function runTechnicalQueueProbe(
  redisUrl: string,
  timeoutMs = 10_000,
): Promise<{ queueRoundTrip: true }> {
  const name = `platform-probe-${randomBytes(6).toString('hex')}`;
  const nonce = randomBytes(12).toString('hex');
  const queueConnection = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    connectTimeout: 2_000,
  });
  const workerConnection = queueConnection.duplicate();
  const eventsConnection = queueConnection.duplicate();
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

  try {
    await Promise.all([queue.waitUntilReady(), events.waitUntilReady(), worker.waitUntilReady()]);
    const job = await queue.add(
      'platform-connectivity-probe',
      { nonce },
      { removeOnComplete: true },
    );
    const result = await job.waitUntilFinished(events, timeoutMs);
    if (!result || typeof result !== 'object' || !('nonce' in result) || result.nonce !== nonce) {
      throw new Error('Technical queue probe returned an invalid result');
    }
    return { queueRoundTrip: true };
  } finally {
    await Promise.allSettled([worker.close(), events.close(), queue.close()]);
    await Promise.allSettled([
      queueConnection.quit(),
      workerConnection.quit(),
      eventsConnection.quit(),
    ]);
  }
}
