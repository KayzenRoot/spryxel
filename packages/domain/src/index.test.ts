import { describe, expect, it } from 'vitest';
import {
  AssetContractValidationError,
  assertIdempotentPayloadReplay,
  assertVersionStatusTransition,
  canCreateProject,
  compileAssetContract,
  createUuidV7,
  deriveAssetContractRequestSha256,
  nextDurableJobState,
  normalizeProjectName,
  prepareAssetVersion,
  prepareProjectDnaVersion,
  restoreAssetVersionAsNew,
  restoreProjectDnaVersionAsNew,
  summarizeReadiness,
  VersionedEntityConflictError,
  type VersionedPayloadSchema,
} from './index.js';

const projectDnaPayloadSchema: VersionedPayloadSchema = {
  parse(value) {
    return value;
  },
};
const assetMetadataPayloadSchema: VersionedPayloadSchema = {
  parse(value) {
    return value;
  },
};

describe('readiness summary', () => {
  it('allows explicitly disabled optional adapters', () => {
    expect(summarizeReadiness([{ name: 'redis', state: 'disabled' }])).toBe('ready');
  });

  it('marks a failed configured dependency unavailable', () => {
    expect(summarizeReadiness([{ name: 'postgres', state: 'unavailable' }])).toBe('unavailable');
  });
});

describe('Asset Contract compiler and durable Job policy', () => {
  it('canonicalizes property order and Unicode before hashing', () => {
    const first = compileAssetContract({
      skuId: 'SKU-001',
      specification: { z: 1, label: 'Cafe\u0301', nested: { b: true, a: 2 } },
    });
    const second = compileAssetContract({
      skuId: 'SKU-001',
      specification: { nested: { a: 2, b: true }, label: 'Café', z: 1 },
    });
    expect(first.canonicalSpecification).toBe(second.canonicalSpecification);
    expect(first.specificationSha256).toBe(second.specificationSha256);
    expect(first.requestSha256).toBe(second.requestSha256);
    expect(Object.isFrozen(first)).toBe(true);
    expect(first.executionBounds).toEqual({
      maxCandidates: 1,
      maxRetries: 2,
      maxRepairs: 0,
      maxWallTimeMs: 5_000,
    });
    expect(Object.isFrozen(first.executionBounds)).toBe(true);
    expect(Reflect.set(first, 'executionBounds', second.executionBounds)).toBe(false);
    for (const changedBounds of [
      { ...first.executionBounds, maxCandidates: 2 },
      { ...first.executionBounds, maxRetries: 1 },
      { ...first.executionBounds, maxRepairs: 1 },
      { ...first.executionBounds, maxWallTimeMs: 4_999 },
    ]) {
      expect(
        deriveAssetContractRequestSha256(first.skuId, first.specificationSha256, changedBounds),
      ).not.toBe(first.requestSha256);
    }
  });

  it('does not accept execution bounds as caller-controlled draft fields', () => {
    const compiled = compileAssetContract({
      skuId: 'SKU-001',
      specification: { width: 12 },
      executionBounds: { maxCandidates: 99, maxRetries: 99, maxRepairs: 99, maxWallTimeMs: 99_999 },
    } as Parameters<typeof compileAssetContract>[0]);

    expect(compiled.executionBounds).toEqual({
      maxCandidates: 1,
      maxRetries: 2,
      maxRepairs: 0,
      maxWallTimeMs: 5_000,
    });
  });

  it('orders canonical keys by locale-independent UTF-16 code units', () => {
    const compiled = compileAssetContract({
      skuId: 'SKU-001',
      specification: { ä: 1, z: 2, a: 3 },
    });

    expect(compiled.canonicalSpecification).toBe('{"a":3,"z":2,"ä":1}');
  });

  it('rejects unknown catalog IDs, excessive envelopes, and non-JSON values', () => {
    expect(() => compileAssetContract({ skuId: 'SKU-999', specification: {} })).toThrow(
      AssetContractValidationError,
    );
    const oversizedEnvelope = Object.fromEntries(
      Array.from({ length: 17 }, (_, index) => [`field-${index}`, 'x'.repeat(4_096)]),
    );
    expect(() =>
      compileAssetContract({ skuId: 'SKU-001', specification: oversizedEnvelope }),
    ).toThrow(expect.objectContaining({ code: 'specification_too_large' }));
    expect(() =>
      compileAssetContract({ skuId: 'SKU-001', specification: { value: Number.NaN } }),
    ).toThrow(AssetContractValidationError);
  });

  it('rejects strings and keys PostgreSQL jsonb cannot represent', () => {
    for (const value of ['\u0000', '\ud800', '\udc00']) {
      expect(() => compileAssetContract({ skuId: 'SKU-001', specification: { value } })).toThrow(
        AssetContractValidationError,
      );
      expect(() =>
        compileAssetContract({ skuId: 'SKU-001', specification: { [value]: 1 } }),
      ).toThrow(AssetContractValidationError);
    }
  });

  it('accepts JSONB-valid prototype-like keys and rejects NFC-normalized collisions', () => {
    const prototypeLikeKeys = JSON.parse(
      '{"__proto__":{"safe":true},"constructor":"ok"}',
    ) as unknown;
    const compiled = compileAssetContract({ skuId: 'SKU-001', specification: prototypeLikeKeys });
    expect(compiled.canonicalSpecification).toBe('{"__proto__":{"safe":true},"constructor":"ok"}');
    expect(Object.getPrototypeOf(compiled.specification)).toBeNull();

    const collidingKeys = Object.assign({}, { 'e\u0301': 1, é: 2 });
    expect(() => compileAssetContract({ skuId: 'SKU-001', specification: collidingKeys })).toThrow(
      expect.objectContaining({ code: 'invalid_specification' }),
    );
  });

  it('enforces the finite state machine and bounded retry path', () => {
    expect(nextDurableJobState('queued', 'claim')).toBe('running');
    expect(nextDurableJobState('running', 'retry')).toBe('queued');
    expect(nextDurableJobState('running', 'request_cancel')).toBe('cancel_requested');
    expect(nextDurableJobState('cancel_requested', 'finish_cancel')).toBe('cancelled');
    expect(() => nextDurableJobState('succeeded', 'claim')).toThrow();
  });
});

describe('project policy and normalization', () => {
  it('allows creation only for privileged active-tenant roles', () => {
    expect(canCreateProject('OWNER')).toBe(true);
    expect(canCreateProject('ADMIN')).toBe(true);
    expect(canCreateProject('MEMBER')).toBe(false);
  });

  it('normalizes whitespace and Unicode composition consistently', () => {
    expect(normalizeProjectName('  Cafe\u0301   Quest  ')).toBe('Café Quest');
  });
});

describe('immutable Project DNA and Asset versions', () => {
  const tenantId = '0190f000-0000-7000-8000-000000000001';
  const projectId = '0190f000-0000-7000-8000-000000000002';
  const entityId = '0190f000-0000-7000-8000-000000000003';
  const versionId = '0190f000-0000-7000-8000-000000000004';
  const actorSubjectId = '0190f000-0000-7000-8000-000000000005';
  const idempotencyKeySha256 = 'a'.repeat(64);
  const provenance = {
    source: 'manual' as const,
    actorSubjectId,
    recordedAt: '2026-10-18T12:00:00.000Z',
    sourceVersionId: null,
  };

  it('generates opaque UUIDv7 identities without deriving them from payload content', () => {
    const id = createUuidV7(new Date('2026-10-18T12:00:00.000Z'));
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(id).not.toBe('a'.repeat(64));
  });

  it('canonicalizes equivalent payloads independently from identity and digest', () => {
    const first = prepareProjectDnaVersion({
      id: entityId,
      tenantId,
      projectId,
      versionId,
      version: 1,
      idempotencyKeySha256,
      payloadSchema: projectDnaPayloadSchema,
      provenance,
      payload: {
        schemaVersion: 'project-dna.v1',
        status: 'draft',
        styleIdentity: 'Cafe\u0301',
        palette: [{ name: 'Dusk', colors: ['#111827'] }],
        visualReferenceIds: [],
        constraints: { z: 1, nested: { b: true, a: 2 } },
        rules: ['Keep silhouettes readable'],
      },
    });
    const second = prepareProjectDnaVersion({
      id: '0190f000-0000-7000-8000-000000000006',
      tenantId,
      projectId,
      versionId: '0190f000-0000-7000-8000-000000000007',
      version: 1,
      idempotencyKeySha256: 'b'.repeat(64),
      payloadSchema: projectDnaPayloadSchema,
      provenance,
      payload: {
        schemaVersion: 'project-dna.v1',
        status: 'draft',
        styleIdentity: 'Café',
        palette: [{ name: 'Dusk', colors: ['#111827'] }],
        visualReferenceIds: [],
        constraints: { nested: { a: 2, b: true }, z: 1 },
        rules: ['Keep silhouettes readable'],
      },
    });
    expect(first.canonicalPayload).toBe(second.canonicalPayload);
    expect(first.payloadSha256).toBe(second.payloadSha256);
    expect(first.id).not.toBe(first.payloadSha256);
    expect(first.id).not.toBe(second.id);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.payload)).toBe(true);
  });

  it('rejects malformed identities, oversized or non-JSON content, and invalid version counters', () => {
    const valid: Parameters<typeof prepareProjectDnaVersion>[0] = {
      id: entityId,
      tenantId,
      projectId,
      versionId,
      version: 1,
      idempotencyKeySha256,
      payloadSchema: projectDnaPayloadSchema,
      provenance,
      payload: {
        schemaVersion: 'project-dna.v1',
        status: 'draft',
        styleIdentity: 'Pixel fantasy',
        palette: [],
        visualReferenceIds: [],
        constraints: {},
        rules: [],
      },
    };
    expect(() =>
      prepareProjectDnaVersion({ ...valid, id: '0190f000-0000-4000-8000-000000000003' }),
    ).toThrow();
    expect(() => prepareProjectDnaVersion({ ...valid, version: 0 })).toThrow();
    expect(() =>
      prepareProjectDnaVersion({
        ...valid,
        payload: { ...valid.payload, constraints: { nested: Number.NaN } },
      }),
    ).toThrow();
    expect(() =>
      prepareProjectDnaVersion({
        ...valid,
        payload: { ...valid.payload, rules: ['x'.repeat(70_000)] },
      }),
    ).toThrow();
    expect(() =>
      prepareProjectDnaVersion({
        ...valid,
        payloadSchema: {
          parse() {
            throw new Error('private schema parser detail');
          },
        },
      }),
    ).toThrow(expect.objectContaining({ code: 'invalid_payload' }));
  });

  it('replays the original identity for equal payloads and rejects a conflicting digest', () => {
    const original = { entityId, versionId, version: 1 };
    expect(
      assertIdempotentPayloadReplay(
        { payloadSha256: 'c'.repeat(64), value: original },
        'c'.repeat(64),
      ),
    ).toBe(original);
    expect(() =>
      assertIdempotentPayloadReplay(
        { payloadSha256: 'c'.repeat(64), value: original },
        'd'.repeat(64),
      ),
    ).toThrow(VersionedEntityConflictError);
  });

  it('restores DNA and Asset content as new immutable versions with linked provenance', () => {
    const dna = prepareProjectDnaVersion({
      id: entityId,
      tenantId,
      projectId,
      versionId,
      version: 4,
      idempotencyKeySha256,
      payloadSchema: projectDnaPayloadSchema,
      provenance,
      payload: {
        schemaVersion: 'project-dna.v1',
        status: 'published',
        styleIdentity: 'Pixel fantasy',
        palette: [],
        visualReferenceIds: [],
        constraints: {},
        rules: [],
      },
    });
    const restoredDna = restoreProjectDnaVersionAsNew({
      source: dna,
      versionId: '0190f000-0000-7000-8000-000000000008',
      version: 5,
      idempotencyKeySha256: 'b'.repeat(64),
      actorSubjectId,
      recordedAt: '2026-10-18T12:01:00.000Z',
      payloadSchema: projectDnaPayloadSchema,
    });
    expect(restoredDna.id).toBe(dna.id);
    expect(restoredDna.versionId).not.toBe(dna.versionId);
    expect(restoredDna.version).toBe(5);
    expect(restoredDna.provenance.source).toBe('restore');
    expect(restoredDna.provenance.sourceVersionId).toBe(dna.versionId);
    expect(restoredDna.payload.status).toBe('draft');
    expect(dna.payload.status).toBe('published');

    const asset = prepareAssetVersion({
      assetId: entityId,
      tenantId,
      projectId,
      versionId,
      version: 1,
      idempotencyKeySha256,
      payloadSchema: assetMetadataPayloadSchema,
      provenance,
      payload: {
        schemaVersion: 'asset-metadata.v1',
        assetType: 'character',
        assetSubtype: null,
        name: 'Forest Keeper',
        description: null,
        tags: [],
        status: 'published',
        lineage: [],
        assetContract: null,
        projectDna: null,
        dimensions: null,
        paletteId: null,
        attributes: {},
      },
    });
    const restoredAsset = restoreAssetVersionAsNew({
      source: asset,
      versionId: '0190f000-0000-7000-8000-000000000009',
      version: 2,
      idempotencyKeySha256: 'c'.repeat(64),
      actorSubjectId,
      recordedAt: '2026-10-18T12:02:00.000Z',
      payloadSchema: assetMetadataPayloadSchema,
    });
    expect(restoredAsset.versionId).not.toBe(asset.versionId);
    expect(restoredAsset.provenance.sourceVersionId).toBe(asset.versionId);
    expect(restoredAsset.payload.status).toBe('draft');
    expect(asset.payload.status).toBe('published');
    expect(() =>
      restoreAssetVersionAsNew({
        source: asset,
        versionId: asset.versionId,
        version: 2,
        idempotencyKeySha256: 'c'.repeat(64),
        actorSubjectId,
        recordedAt: '2026-10-18T12:02:00.000Z',
        payloadSchema: assetMetadataPayloadSchema,
      }),
    ).toThrow();
  });

  it('allows only forward lifecycle transitions for immutable versions', () => {
    expect(assertVersionStatusTransition('draft', 'published')).toBe('published');
    expect(assertVersionStatusTransition('published', 'archived')).toBe('archived');
    expect(() => assertVersionStatusTransition('archived', 'published')).toThrow();
    expect(() => assertVersionStatusTransition('published', 'draft')).toThrow();
  });
});
