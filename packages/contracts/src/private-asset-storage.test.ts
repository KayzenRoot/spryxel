import { describe, expect, it } from 'vitest';
import {
  privateAssetCommandSchema,
  privateAssetBeginCommandSchema,
} from './private-asset-storage.js';

const projectId = '0190f000-0000-7000-8000-000000000002';
const assetVersionId = '0190f000-0000-7000-8000-000000000004';
const uploadAttemptId = '0190f000-0000-7000-8000-000000000006';
const target = { projectId, assetVersionId };
const begin = {
  ...target,
  operation: 'begin' as const,
  mediaType: 'image/png' as const,
  sizeBytes: 1024,
  declaredSha256: 'a'.repeat(64),
  idempotencyKey: 'a'.repeat(24),
};

describe('internal private asset commands, no storage access', () => {
  it('accepts bounded begin and canonicalizes UUIDv7', () => {
    const mixedCaseId = '0190fabc-0000-7a00-8abc-00000000000a';
    expect(
      privateAssetBeginCommandSchema.parse({
        ...begin,
        projectId: mixedCaseId.toUpperCase(),
      }).projectId,
    ).toBe(mixedCaseId);
    expect(
      privateAssetBeginCommandSchema.parse({
        ...begin,
        assetVersionId: mixedCaseId.toUpperCase(),
      }).assetVersionId,
    ).toBe(mixedCaseId);
  });
  it('rejects supplied tenant/actor/role/bucket/object keys and URLs', () => {
    for (const extra of [
      { tenantId: projectId },
      { subjectId: projectId },
      { role: 'OWNER' },
      { bucket: 'public' },
      { objectKey: '../tenant' },
      { signedUrl: 'https://invalid.example.test' },
    ])
      expect(privateAssetCommandSchema.safeParse({ ...begin, ...extra }).success).toBe(false);
  });
  it('rejects unapproved media, sizes, digest and idempotency inputs', () => {
    for (const extra of [
      { mediaType: 'image/svg+xml' },
      { mediaType: 'application/zip' },
      { sizeBytes: 0 },
      { sizeBytes: 10485761 },
      { sizeBytes: 1.5 },
      { declaredSha256: 'A'.repeat(64) },
      { declaredSha256: 'abc' },
      { idempotencyKey: 'short' },
      { idempotencyKey: 'a'.repeat(129) },
      { projectId: '0190f000-0000-4000-8000-000000000002' },
      { assetVersionId: '../foreign' },
    ])
      expect(privateAssetBeginCommandSchema.safeParse({ ...begin, ...extra }).success).toBe(false);
  });
  it('validates five strict internal operation shapes', () => {
    for (const command of [
      begin,
      { ...target, operation: 'finalize', uploadAttemptId },
      { ...target, operation: 'read' },
      { ...target, operation: 'abort', uploadAttemptId },
      { ...target, operation: 'revoke' },
    ])
      expect(privateAssetCommandSchema.safeParse(command).success).toBe(true);
    for (const command of [
      { ...target, operation: 'delete' },
      { ...target, operation: 'finalize', uploadAttemptId: 'bad' },
      { ...target, operation: 'abort' },
      { ...target, operation: 'read', public: true },
    ])
      expect(privateAssetCommandSchema.safeParse(command).success).toBe(false);
  });
});
