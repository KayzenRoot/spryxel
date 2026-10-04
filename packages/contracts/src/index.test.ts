import { describe, expect, it } from 'vitest';
import {
  healthResponseSchema,
  projectCreateRequestSchema,
  readinessResponseSchema,
  safeJobSchema,
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

describe('safe durable Job boundary', () => {
  it('accepts the bounded job detail projection and rejects internal contract bodies', () => {
    const id = '0190f000-0000-7000-8000-000000000001';
    const projection = {
      id,
      projectId: id,
      operationType: 'asset_contract.integrity_check.v1',
      status: 'queued',
      retryable: true,
      cancelEligible: true,
      attemptCount: 0,
      maxAttempts: 3,
      resultCode: null,
      failureCode: null,
      createdAt: '2026-10-04T00:00:00.000Z',
      updatedAt: '2026-10-04T00:00:00.000Z',
      contract: {
        id,
        version: 1,
        schemaVersion: 'asset-contract.v1',
        skuId: 'SKU-001',
        specificationSha256: 'a'.repeat(64),
      },
      attempts: [],
    };
    expect(safeJobSchema.parse(projection)).toMatchObject({ status: 'queued' });
    expect(() => safeJobSchema.parse({ ...projection, createdBySubjectId: id })).toThrow();
    expect(() =>
      safeJobSchema.parse({
        ...projection,
        contract: { ...projection.contract, specification: { secret: true } },
      }),
    ).toThrow();
  });
});
