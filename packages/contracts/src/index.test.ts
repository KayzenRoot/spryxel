import { describe, expect, it } from 'vitest';
import {
  assetMetadataV1Schema,
  creditSummaryResponseSchema,
  healthResponseSchema,
  projectCreateRequestSchema,
  projectDnaV1Schema,
  provenanceV1Schema,
  readinessResponseSchema,
  safeJobSchema,
  sha256HexSchema,
  uuidV7Schema,
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

describe('Project DNA and Asset Core v1 contracts', () => {
  const id = '0190f000-0000-7000-8000-000000000001';

  it('accepts strict UUIDv7 and content digest values while rejecting other UUID versions', () => {
    expect(uuidV7Schema.parse(id)).toBe(id);
    expect(uuidV7Schema.parse(id.toUpperCase())).toBe(id);
    expect(() => uuidV7Schema.parse('0190f000-0000-4000-8000-000000000001')).toThrow();
    expect(() => uuidV7Schema.parse('0190f000-0000-7000-7000-000000000001')).toThrow();
    expect(sha256HexSchema.parse('a'.repeat(64))).toBe('a'.repeat(64));
    expect(() => sha256HexSchema.parse('A'.repeat(64))).toThrow();
  });

  it('accepts bounded versioned DNA and rejects unknown, invalid, and oversized content', () => {
    const dna = {
      schemaVersion: 'project-dna.v1',
      status: 'draft',
      styleIdentity: 'hand-painted pixel fantasy',
      palette: [{ name: 'Dusk', colors: ['#111827', '#A78BFA'] }],
      visualReferenceIds: [id],
      constraints: { canvas: { maxWidth: 256, maxHeight: 256 } },
      rules: ['Keep silhouettes readable'],
      provenance: {
        source: 'manual',
        actorSubjectId: id,
        recordedAt: '2026-10-18T12:00:00.000Z',
        sourceVersionId: null,
      },
    };
    expect(projectDnaV1Schema.parse(dna)).toEqual(dna);
    expect(() =>
      projectDnaV1Schema.parse({ ...dna, providerUrl: 'https://example.invalid' }),
    ).toThrow();
    expect(() => projectDnaV1Schema.parse({ ...dna, schemaVersion: 'project-dna.v2' })).toThrow();
    expect(() =>
      projectDnaV1Schema.parse({ ...dna, palette: [{ name: 'bad', colors: ['red'] }] }),
    ).toThrow();
    expect(() => projectDnaV1Schema.parse({ ...dna, rules: ['x'.repeat(70_000)] })).toThrow();
  });

  it('validates strict asset metadata, tenant/project UUIDv7 associations, and provenance', () => {
    const asset = {
      schemaVersion: 'asset-metadata.v1',
      assetType: 'character',
      assetSubtype: 'npc',
      name: 'Forest Keeper',
      description: 'A non-player character.',
      tags: ['forest', 'friendly'],
      status: 'draft',
      lineage: [],
      assetContract: { id, version: 1 },
      projectDna: { id, version: 2 },
      dimensions: { width: 64, height: 64, frameCount: 1, fps: null },
      paletteId: null,
      attributes: {},
      provenance: {
        source: 'manual',
        actorSubjectId: id,
        recordedAt: '2026-10-18T12:00:00.000Z',
        sourceVersionId: null,
      },
    };
    expect(assetMetadataV1Schema.parse(asset)).toEqual(asset);
    expect(() => assetMetadataV1Schema.parse({ ...asset, tenantId: 'caller-selected' })).toThrow();
    expect(() =>
      assetMetadataV1Schema.parse({
        ...asset,
        projectDna: { id: '0190f000-0000-4000-8000-000000000001', version: 1 },
      }),
    ).toThrow();
    expect(() =>
      assetMetadataV1Schema.parse({
        ...asset,
        provenance: { ...asset.provenance, secret: 'must fail closed' },
      }),
    ).toThrow();
    expect(() =>
      provenanceV1Schema.parse({
        source: 'restore',
        actorSubjectId: id,
        recordedAt: 'not-a-time',
        sourceVersionId: id,
      }),
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
        executionBounds: {
          maxCandidates: 1,
          maxRetries: 2,
          maxRepairs: 0,
          maxWallTimeMs: 5_000,
        },
      },
      attempts: [],
    };
    expect(safeJobSchema.parse(projection)).toMatchObject({ status: 'queued' });
    expect(() => safeJobSchema.parse({ ...projection, createdBySubjectId: id })).toThrow();
    const attempt = {
      id,
      executorKind: 'spryxel.asset_contract.integrity_worker',
      executorVersion: 'v1',
      attemptNumber: 1,
      status: 'succeeded',
      startedAt: '2026-10-04T00:00:00.000Z',
      completedAt: '2026-10-04T00:00:01.000Z',
      failureCode: null,
    };
    expect(
      safeJobSchema.parse({ ...projection, attemptCount: 1, attempts: [attempt] }).attempts[0],
    ).toMatchObject({
      executorKind: 'spryxel.asset_contract.integrity_worker',
      executorVersion: 'v1',
    });
    expect(() =>
      safeJobSchema.parse({
        ...projection,
        attemptCount: 1,
        attempts: [{ ...attempt, executorVersion: '0.0.0' }],
      }),
    ).toThrow();
    expect(() =>
      safeJobSchema.parse({
        ...projection,
        contract: { ...projection.contract, specification: { secret: true } },
      }),
    ).toThrow();
  });
});

describe('safe credit summary boundary', () => {
  const tenantId = '0190f000-0000-7000-8000-000000000001';

  it('accepts bounded integer strings and rejects unsafe or internal financial data', () => {
    const summary = {
      tenantId,
      asOf: '2026-10-04T00:00:00.000Z',
      requestId: 'credit-read-123',
      balances: {
        availableCredits: '0',
        reservedCredits: '9007199254740993',
        committedCredits: '9223372036854775807',
      },
      counters: { openReservations: 0, ledgerEntries: 3 },
    };
    expect(creditSummaryResponseSchema.parse(summary)).toEqual(summary);
    expect(() =>
      creditSummaryResponseSchema.parse({
        ...summary,
        balances: { ...summary.balances, availableCredits: '-1' },
      }),
    ).toThrow();
    expect(() =>
      creditSummaryResponseSchema.parse({
        ...summary,
        balances: { ...summary.balances, availableCredits: '9223372036854775808' },
      }),
    ).toThrow();
    expect(() => creditSummaryResponseSchema.parse({ ...summary, walletId: tenantId })).toThrow();
    expect(() =>
      creditSummaryResponseSchema.parse({
        ...summary,
        counters: { ...summary.counters, ledgerEntries: Number.MAX_SAFE_INTEGER + 1 },
      }),
    ).toThrow();
  });
});
