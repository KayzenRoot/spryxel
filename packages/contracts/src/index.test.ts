import { describe, expect, it } from 'vitest';
import {
  healthResponseSchema,
  projectCreateRequestSchema,
  readinessResponseSchema,
} from './index.js';

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

  it('normalizes project names before validation and rejects empty or extra fields', () => {
    expect(projectCreateRequestSchema.parse({ name: '  Spryxel   Studio  ' })).toEqual({
      name: 'Spryxel Studio',
    });
    expect(() => projectCreateRequestSchema.parse({ name: '   ' })).toThrow();
    expect(() => projectCreateRequestSchema.parse({ name: 'x'.repeat(121) })).toThrow();
    expect(() =>
      projectCreateRequestSchema.parse({ name: 'Studio', tenantId: 'client-choice' }),
    ).toThrow();
  });
});
