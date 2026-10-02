import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import pino, { type DestinationStream, type Logger, type LoggerOptions } from 'pino';

const secretPaths = [
  'authorization',
  'cookie',
  'password',
  'secret',
  'secretAccessKey',
  's3SecretAccessKey',
  'accessKeyId',
  's3AccessKeyId',
  'databaseUrl',
  'redisUrl',
  'req.headers.authorization',
  'req.headers.cookie',
  'headers.authorization',
  'headers.cookie',
  '*.password',
  '*.secret',
  '*.secretAccessKey',
  '*.s3SecretAccessKey',
  '*.accessKeyId',
  '*.s3AccessKeyId',
  '*.databaseUrl',
  '*.redisUrl',
];

export function createLogger(
  options: { level?: string; name?: string } = {},
  destination?: DestinationStream,
): Logger {
  const config: LoggerOptions = {
    level: options.level ?? 'info',
    name: options.name ?? 'spryxel',
    redact: { paths: secretPaths, censor: '[REDACTED]' },
    serializers: {
      err: pino.stdSerializers.err,
    },
  };
  return pino(config, destination);
}

export async function withSpan<T>(name: string, operation: () => Promise<T>): Promise<T> {
  const span = trace.getTracer('spryxel.platform').startSpan(name);
  try {
    return await context.with(trace.setSpan(context.active(), span), operation);
  } catch (error) {
    span.recordException(new Error(error instanceof Error ? error.name : 'operation failed'));
    span.setStatus({ code: SpanStatusCode.ERROR });
    throw error;
  } finally {
    span.end();
  }
}
