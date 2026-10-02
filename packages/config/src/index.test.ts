import { describe, expect, it } from 'vitest';
import { ConfigValidationError, parseRuntimeConfig, redactRuntimeConfig } from './index.js';

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
});
