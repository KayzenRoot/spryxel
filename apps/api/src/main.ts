import { buildApiServer, readApiConfig } from './server.js';

const config = readApiConfig();
const app = buildApiServer(config);

try {
  await app.listen({ host: config.host, port: config.port });
} catch (error) {
  app.log.error({ err: error }, 'api startup failed');
  process.exitCode = 1;
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, async () => {
    await app.close();
    process.exitCode = 0;
  });
}
