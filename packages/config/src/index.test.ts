import { describe, expect, it } from 'vitest';
import {
  ConfigValidationError,
  parseMigrationDatabaseUrl,
  parseRuntimeConfig,
  redactRuntimeConfig,
} from './index.js';

describe('runtime configuration', () => {
  it('fails closed with sanitized field errors', () => {
    const secret = 'do-not-print-this';
    try {
      parseRuntimeConfig({ DATABASE_URL: secret, NODE_ENV: 'production' }, 'api');
      throw new Error('expected configuration parsing to fail');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigValidationError);
      expect(JSON.stringify(error)).not.toContain(secret);
    }
  });

  it('redacts URL and credential values in the safe configuration summary', () => {
    const config = parseRuntimeConfig(
      {
        DATABASE_URL: 'postgresql://user:db-secret@localhost:5432/app',
        REDIS_URL: 'redis://:redis-secret@localhost:6379/0',
        S3_ENDPOINT: 'http://127.0.0.1:8333',
        S3_ACCESS_KEY_ID: 'access-secret',
        S3_SECRET_ACCESS_KEY: 's3-secret',
        S3_BUCKET: 'spryxel-test',
      },
      'api',
    );
    const serialized = JSON.stringify(redactRuntimeConfig(config));
    for (const secret of ['db-secret', 'redis-secret', 'access-secret', 's3-secret']) {
      expect(serialized).not.toContain(secret);
    }
    expect(serialized.match(/\[REDACTED\]/g)).toHaveLength(4);
  });

  it('rejects partial S3 credentials without printing secret values', () => {
    expect(() =>
      parseRuntimeConfig(
        { S3_ENDPOINT: 'http://127.0.0.1:8333', S3_SECRET_ACCESS_KEY: 'private' },
        'api',
      ),
    ).toThrow(ConfigValidationError);
  });

  it('rejects credentials embedded in the S3 endpoint', () => {
    expect(() =>
      parseRuntimeConfig({ S3_ENDPOINT: 'http://user:private@127.0.0.1:8333' }, 'api'),
    ).toThrow(ConfigValidationError);
  });

  it('requires complete WorkOS verification settings when any auth setting is supplied', () => {
    expect(() => parseRuntimeConfig({ WORKOS_CLIENT_ID: 'client_fixture' }, 'api')).toThrow(
      ConfigValidationError,
    );
  });

  it('requires explicit API issuer and audience in production and redacts provider secrets', () => {
    expect(() =>
      parseRuntimeConfig(
        { NODE_ENV: 'production', DATABASE_URL: 'postgresql://app:secret@localhost/app' },
        'api',
      ),
    ).toThrow(ConfigValidationError);

    const config = parseRuntimeConfig(
      {
        WORKOS_API_KEY: 'sk_workos_secret',
        WORKOS_CLIENT_ID: 'client_fixture',
        WORKOS_ISSUER: 'https://auth.example.test',
        WORKOS_TOKEN_AUDIENCE: 'https://api.example.test',
        MIGRATION_DATABASE_URL: 'postgresql://migrator:migration-secret@localhost/app',
      },
      'api',
    );

    const summary = JSON.stringify(redactRuntimeConfig(config));
    expect(summary).not.toContain('sk_workos_secret');
    expect(summary).not.toContain('migration-secret');
    expect(
      parseMigrationDatabaseUrl({
        MIGRATION_DATABASE_URL: 'postgresql://migrator:migration-secret@localhost/app',
      }),
    ).toBe('postgresql://migrator:migration-secret@localhost/app');
    expect(() => parseMigrationDatabaseUrl({ MIGRATION_DATABASE_URL: 'not-a-url-secret' })).toThrow(
      ConfigValidationError,
    );
  });
});
