import { buildApiServer, readApiConfig } from './server.js';
import { closeApiSafely } from './shutdown.js';

const config = readApiConfig();
const app = buildApiServer(config);

try {
  await app.ready();
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  const errorName = error instanceof Error ? error.name : 'Error';
  const errorType = /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(errorName) ? errorName : 'Error';
  app.log.error({ event: 'api.startup_failed', errorType }, 'api startup failed');
  await closeApiSafely(
    () => app.close(),
    (fields, message) => app.log.error(fields, message),
  );
  process.exitCode = 1;
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void closeApiSafely(
      () => app.close(),
      (fields, message) => app.log.error(fields, message),
    ).then((exitCode) => {
      process.exitCode = exitCode;
    });
  });
}
