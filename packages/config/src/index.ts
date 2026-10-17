import { z } from '@spryxel/contracts';

const blankToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalString = z.preprocess(blankToUndefined, z.string().trim().min(1).optional());

const runtimeConfigSchema = z
  .object({
    serviceName: z.enum(['api', 'worker']),
    nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
    host: z.string().trim().min(1).default('127.0.0.1'),
    port: z.coerce.number().int().min(1).max(65_535).default(3001),
    logLevel: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    databaseUrl: optionalString,
    workerDatabaseUrl: optionalString,
    redisUrl: optionalString,
    s3Endpoint: optionalString,
    s3Region: z.string().trim().min(1).default('us-east-1'),
    s3AccessKeyId: optionalString,
    s3SecretAccessKey: optionalString,
    s3Bucket: optionalString,
    workosApiKey: optionalString,
    workosClientId: optionalString,
    workosIssuer: optionalString,
    workosAudience: optionalString,
  })
  .superRefine((config, context) => {
    if (
      config.databaseUrl &&
      !isUrlWithProtocols(config.databaseUrl, ['postgres:', 'postgresql:'], true)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['databaseUrl'],
        message: 'must use the postgres or postgresql URL scheme',
      });
    }

    if (
      config.workerDatabaseUrl &&
      !isUrlWithProtocols(config.workerDatabaseUrl, ['postgres:', 'postgresql:'], true)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['workerDatabaseUrl'],
        message: 'must use the postgres or postgresql URL scheme',
      });
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

    if (config.nodeEnv === 'production' && config.serviceName === 'api' && !config.databaseUrl) {
      context.addIssue({
        code: 'custom',
        path: ['databaseUrl'],
        message: 'is required in production',
      });
    }
    if (
      config.nodeEnv === 'production' &&
      config.serviceName === 'worker' &&
      !config.workerDatabaseUrl
    ) {
      context.addIssue({
        code: 'custom',
        path: ['workerDatabaseUrl'],
        message: 'is required for the restricted worker service role in production',
      });
    }

    const workosValues = [
      config.workosApiKey,
      config.workosClientId,
      config.workosIssuer,
      config.workosAudience,
    ];
    if (workosValues.some(Boolean) && workosValues.some((value) => !value)) {
      context.addIssue({
        code: 'custom',
        path: ['workosIssuer'],
        message: 'API key, client ID, expected issuer, and audience must be configured together',
      });
    }
    if (
      config.nodeEnv === 'production' &&
      config.serviceName === 'api' &&
      workosValues.some((value) => !value)
    ) {
      context.addIssue({
        code: 'custom',
        path: ['workosIssuer'],
        message: 'WorkOS API key, client ID, issuer, and audience are required in production',
      });
    }
    for (const [field, value] of [
      ['workosIssuer', config.workosIssuer],
      ['workosAudience', config.workosAudience],
    ] as const) {
      if (value && !isUrlWithProtocols(value, ['https:'])) {
        context.addIssue({
          code: 'custom',
          path: [field],
          message: 'must be a credential-free HTTPS URL',
        });
      }
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
    serviceName,
    nodeEnv: source.NODE_ENV,
    host: source.HOST,
    port: source.PORT,
    logLevel: source.LOG_LEVEL,
    databaseUrl: source.DATABASE_URL,
    workerDatabaseUrl: source.WORKER_DATABASE_URL,
    redisUrl: source.REDIS_URL,
    s3Endpoint: source.S3_ENDPOINT,
    s3Region: source.S3_REGION,
    s3AccessKeyId: source.S3_ACCESS_KEY_ID,
    s3SecretAccessKey: source.S3_SECRET_ACCESS_KEY,
    s3Bucket: source.S3_BUCKET,
    workosApiKey: source.WORKOS_API_KEY,
    workosClientId: source.WORKOS_CLIENT_ID,
    workosIssuer: source.WORKOS_ISSUER,
    workosAudience: source.WORKOS_TOKEN_AUDIENCE,
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
    workerDatabaseUrl: config.workerDatabaseUrl ? '[REDACTED]' : undefined,
    redisUrl: config.redisUrl ? '[REDACTED]' : undefined,
    s3Endpoint: config.s3Endpoint,
    s3Region: config.s3Region,
    s3AccessKeyId: config.s3AccessKeyId ? '[REDACTED]' : undefined,
    s3SecretAccessKey: config.s3SecretAccessKey ? '[REDACTED]' : undefined,
    s3Bucket: config.s3Bucket,
    workosApiKey: config.workosApiKey ? '[REDACTED]' : undefined,
    workosClientId: config.workosClientId,
    workosIssuer: config.workosIssuer,
    workosAudience: config.workosAudience,
  };
}

export function parseMigrationDatabaseUrl(
  source: NodeJS.ProcessEnv | Record<string, string | undefined>,
): string {
  const value = source.MIGRATION_DATABASE_URL?.trim();
  if (!value || !isUrlWithProtocols(value, ['postgres:', 'postgresql:'], true)) {
    throw new ConfigValidationError([
      'MIGRATION_DATABASE_URL: a postgres or postgresql migration-owner URL is required',
    ]);
  }
  return value;
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
