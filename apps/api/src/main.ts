import { buildApiServer, readApiConfig } from './server.js';
import { closeApiSafely } from './shutdown.js';

const config = readApiConfig();
const app = buildApiServer(config);

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error({ err: error }, 'api startup failed');
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
