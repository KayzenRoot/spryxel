import { z } from '@spryxel/contracts';

const blankToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalString = z.preprocess(blankToUndefined, z.string().trim().min(1).optional());

const runtimeConfigSchema = z
  .object({
    nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
    host: z.string().trim().min(1).default('127.0.0.1'),
    port: z.coerce.number().int().min(1).max(65_535).default(3001),
    logLevel: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    databaseUrl: optionalString,
    redisUrl: optionalString,
    s3Endpoint: optionalString,
    s3Region: z.string().trim().min(1).default('us-east-1'),
    s3AccessKeyId: optionalString,
    s3SecretAccessKey: optionalString,
    s3Bucket: optionalString,
  })
  .superRefine((config, context) => {
    if (config.databaseUrl) {
      const valid = isUrlWithProtocols(config.databaseUrl, ['postgres:', 'postgresql:'], true);
      if (!valid) {
        context.addIssue({
          code: 'custom',
          path: ['databaseUrl'],
          message: 'must use the postgres or postgresql URL scheme',
        });
      }
    }

    if (config.redisUrl && !isUrlWithProtocols(config.redisUrl, ['redis:', 'rediss:'], true)) {
      context.addIssue({
        code: 'custom',
        path: ['redisUrl'],
        message: 'must use the redis or rediss URL scheme',
      });
    }

    if (config.s3Endpoint && !isUrlWithProtocols(config.s3Endpoint, ['http:', 'https:'])) {
      context.addIssue({
        code: 'custom',
        path: ['s3Endpoint'],
        message: 'must be an http or https URL without embedded credentials',
      });
    }

    const s3Values = [
      config.s3Endpoint,
      config.s3AccessKeyId,
      config.s3SecretAccessKey,
      config.s3Bucket,
    ];
    if (s3Values.some(Boolean) && s3Values.some((value) => !value)) {
      context.addIssue({
        code: 'custom',
        path: ['s3Endpoint'],
        message: 'endpoint, access key, secret key, and bucket must be configured together',
      });
    }

    if (config.nodeEnv === 'production' && !config.databaseUrl) {
      context.addIssue({
        code: 'custom',
        path: ['databaseUrl'],
        message: 'is required in production',
      });
    }
  });

export type RuntimeConfig = z.infer<typeof runtimeConfigSchema> & {
  serviceName: 'api' | 'worker';
};

export class ConfigValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super('Runtime configuration is invalid');
    this.name = 'ConfigValidationError';
    this.issues = issues;
  }
}

export function parseRuntimeConfig(
  source: NodeJS.ProcessEnv | Record<string, string | undefined>,
  serviceName: 'api' | 'worker',
): RuntimeConfig {
  const result = runtimeConfigSchema.safeParse({
    nodeEnv: source.NODE_ENV,
    host: source.HOST,
    port: source.PORT,
    logLevel: source.LOG_LEVEL,
    databaseUrl: source.DATABASE_URL,
    redisUrl: source.REDIS_URL,
    s3Endpoint: source.S3_ENDPOINT,
    s3Region: source.S3_REGION,
    s3AccessKeyId: source.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: source.S3_SECRET_ACCESS_KEY,
    s3Bucket: source.S3_BUCKET,
  });

  if (!result.success) {
    const issues = result.error.issues.map((issue) => {
      const field = issue.path.length > 0 ? issue.path.join('.') : 'configuration';
      return `${field}: ${issue.message}`;
    });
    throw new ConfigValidationError(issues);
  }

  return { ...result.data, serviceName };
}

export function redactRuntimeConfig(config: RuntimeConfig): Record<string, unknown> {
  return {
    serviceName: config.serviceName,
    nodeEnv: config.nodeEnv,
    host: config.host,
    port: config.port,
    logLevel: config.logLevel,
    databaseUrl: config.databaseUrl ? '[REDACTED]' : undefined,
    redisUrl: config.redisUrl ? '[REDACTED]' : undefined,
    s3Endpoint: config.s3Endpoint,
    s3Region: config.s3Region,
    s3AccessKeyId: config.s3AccessKeyId ? '[REDACTED]' : undefined,
    s3SecretAccessKey: config.s3SecretAccessKey ? '[REDACTED]' : undefined,
    s3Bucket: config.s3Bucket,
  };
}

function isUrlWithProtocols(
  value: string,
  protocols: string[],
  allowEmbeddedCredentials = false,
): boolean {
  try {
    const url = new URL(value);
    return (
      protocols.includes(url.protocol) &&
      (allowEmbeddedCredentials || (!url.username && !url.password))
    );
  } catch {
    return false;
  }
}
