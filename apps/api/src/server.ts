import { parseRuntimeConfig, type RuntimeConfig } from '@spryxel/config';
import { requestIdPattern, type ReadinessDependency, type ServiceName } from '@spryxel/contracts';
import { summarizeReadiness } from '@spryxel/domain';
import { createLogger } from '@spryxel/observability';
import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { DrizzlePostgresReadinessProbe } from './adapters/postgres-readiness.js';
import { RedisTransientReadinessProbe } from './adapters/redis-readiness.js';
import { S3CompatibleStorageProbe } from './adapters/s3-storage.js';

export function buildApiServer(config: RuntimeConfig) {
  const logger = createLogger({ level: config.logLevel, name: 'spryxel-api' });
  const app = Fastify({
    loggerInstance: logger,
    genReqId: (request) => {
      const supplied = request.headers['x-request-id'];
      return typeof supplied === 'string' && requestIdPattern.test(supplied)
        ? supplied
        : randomUUID();
    },
  });

  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  app.get('/healthz', async (request) => ({
    service: 'api' satisfies ServiceName,
    status: 'ok' as const,
    requestId: request.id,
  }));

  app.get('/readyz', async (request, reply) => {
    const databaseUrl = config.databaseUrl;
    const redisUrl = config.redisUrl;
    const dependencyResults = await Promise.all([
      runProbe('postgres', databaseUrl, () => {
        if (!databaseUrl) return Promise.resolve();
        return new DrizzlePostgresReadinessProbe(databaseUrl).ping();
      }),
      runProbe('redis', redisUrl, () => {
        if (!redisUrl) return Promise.resolve();
        return new RedisTransientReadinessProbe(redisUrl).ping();
      }),
      runProbe('object-storage', config.s3Endpoint, () =>
        new S3CompatibleStorageProbe(config).probe(),
      ),
    ]);
    const status = summarizeReadiness(
      dependencyResults.map((dependency) => ({ name: dependency.name, state: dependency.status })),
    );
    return reply.code(status === 'ready' ? 200 : 503).send({
      service: 'api',
      status,
      dependencies: dependencyResults,
      requestId: request.id,
    });
  });

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, requestId: request.id }, 'request failed');
    reply.code(500).send({ error: 'internal_error', requestId: request.id });
  });

  return app;
}

async function runProbe(
  name: ReadinessDependency['name'],
  configuredValue: string | undefined,
  probe: () => Promise<void>,
): Promise<ReadinessDependency> {
  if (!configuredValue) return { name, status: 'disabled' };
  try {
    await withTimeout(probe(), 2_500);
    return { name, status: 'ready' };
  } catch {
    return { name, status: 'unavailable' };
  }
}

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Readiness probe timed out')), timeoutMs);
    operation.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function readApiConfig(source: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return parseRuntimeConfig(source, 'api');
}
