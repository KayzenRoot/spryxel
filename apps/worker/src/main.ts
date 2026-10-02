import { parseRuntimeConfig } from '@spryxel/config';
import { createLogger } from '@spryxel/observability';
import { workerStatus } from './index.js';

const config = parseRuntimeConfig(process.env, 'worker');
const logger = createLogger({ level: config.logLevel, name: 'spryxel-worker' });
const status = workerStatus();

if (process.argv.includes('--self-test')) {
  logger.info({ event: 'worker.ready', ...status, mode: 'technical-self-test' }, 'worker ready');
  await new Promise<void>((resolveFlush) => logger.flush(() => resolveFlush()));
} else {
  logger.info({ event: 'worker.started', ...status }, 'worker started without product consumers');
  await new Promise<void>((resolve) => {
    process.once('SIGINT', resolve);
    process.once('SIGTERM', resolve);
  });
  logger.info({ event: 'worker.stopped' }, 'worker stopped');
}
