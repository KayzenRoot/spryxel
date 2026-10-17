import { parseRuntimeConfig } from '@spryxel/config';
import { createDatabase } from '@spryxel/db';
import { createLogger } from '@spryxel/observability';
import { DurableJobQueueRuntime } from './durable-jobs.js';
import { workerStatus } from './index.js';

const config = parseRuntimeConfig(process.env, 'worker');
const logger = createLogger({ level: config.logLevel, name: 'spryxel-worker' });
const status = workerStatus();

if (process.argv.includes('--self-test')) {
  logger.info({ event: 'worker.ready', ...status, mode: 'technical-self-test' }, 'worker ready');
  await new Promise<void>((resolveFlush) => logger.flush(() => resolveFlush()));
} else {
  if (!config.workerDatabaseUrl || !config.redisUrl) {
    throw new Error('Worker requires WORKER_DATABASE_URL and REDIS_URL');
  }
  const database = createDatabase(config.workerDatabaseUrl, {}, 'worker');
  const runtime = new DurableJobQueueRuntime(
    database,
    config.redisUrl,
    undefined,
    (fields, message) => {
      logger.info(fields, message);
    },
  );
  let stopped = false;
  const stop = async () => {
    if (stopped) return;
    stopped = true;
    await runtime.stop();
    await database.close();
    logger.info({ event: 'worker.stopped' }, 'worker stopped');
  };
  await database.validateRuntimeRole();
  await runtime.start();
  logger.info(
    { event: 'worker.started', ...status },
    'worker started with bounded integrity consumer',
  );
  process.once('SIGINT', () => void stop());
  process.once('SIGTERM', () => void stop());
  await new Promise<void>((resolve) => {
    process.once('SIGINT', resolve);
    process.once('SIGTERM', resolve);
  });
  await stop();
}
