import { describe, expect, it } from 'vitest';
import { healthResponseSchema, readinessResponseSchema } from './index.js';

describe('platform contracts', () => {
  it('accepts safe liveness output', () => {
    expect(
      healthResponseSchema.parse({ service: 'api', status: 'ok', requestId: 'req-123' }),
    ).toMatchObject({ status: 'ok' });
  });

  it('rejects dependency details outside the bounded categories', () => {
    expect(() =>
      readinessResponseSchema.parse({
        service: 'api',
        status: 'unavailable',
        requestId: 'req-123',
        dependencies: [{ name: 'database-url', status: 'unavailable' }],
      }),
    ).toThrow();
  });
});
