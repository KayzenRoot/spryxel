import { describe, expect, it } from 'vitest';
import { canAccessPrivateAsset, type PrivateAssetPolicyInput } from './private-asset-storage.js';

const subjectId = '0190f000-0000-7000-8000-000000000001';
const tenantId = '0190f000-0000-7000-8000-000000000002';
const projectId = '0190f000-0000-7000-8000-000000000003';
const assetVersionId = '0190f000-0000-7000-8000-000000000004';
const other = '0190f000-0000-7000-8000-000000000005';
const initiator = '0190f000-0000-7000-8000-000000000006';
const attemptId = '0190f000-0000-7000-8000-000000000007';
const good: PrivateAssetPolicyInput = {
  operation: 'begin',
  principal: { subjectId, tenantId },
  requestedProjectId: projectId,
  requestedAssetVersionId: assetVersionId,
  requestedUploadAttemptId: null,
  resolved: {
    tenantId,
    projectId,
    assetVersionId,
    versionStatus: 'draft',
    assetReadAllowed: true,
    uploadAttempt: {
      id: attemptId,
      tenantId,
      projectId,
      assetVersionId,
      initiatorSubjectId: initiator,
    },
    membership: { subjectId, tenantId, projectId, role: 'OWNER', active: true },
  },
};
describe('private asset fail-closed tenant/project/version scope policy', () => {
  it('allows OWNER and ADMIN for privileged operations with valid scope', () => {
    const scope = good.resolved!;
    for (const role of ['OWNER', 'ADMIN'] as const) {
      const resolved = {
        ...scope,
        membership: { ...scope.membership!, role },
      };
      for (const operation of ['begin', 'finalize', 'revoke'] as const)
        expect(
          canAccessPrivateAsset({
            ...good,
            operation,
            requestedUploadAttemptId: operation === 'finalize' ? attemptId : null,
            resolved,
          }),
        ).toBe(true);
      expect(canAccessPrivateAsset({ ...good, operation: 'read', resolved })).toBe(true);
      expect(
        canAccessPrivateAsset({
          ...good,
          operation: 'read',
          resolved: { ...resolved, assetReadAllowed: false },
        }),
      ).toBe(false);
    }
  });
  it('rejects mismatched tenant, project, version, subject and membership', () => {
    const r = good.resolved!;
    const m = r.membership!;
    for (const candidate of [
      { ...good, principal: { subjectId, tenantId: other } },
      { ...good, principal: { subjectId: other, tenantId } },
      { ...good, requestedProjectId: other },
      { ...good, requestedAssetVersionId: other },
      { ...good, resolved: { ...r, tenantId: other } },
      { ...good, resolved: { ...r, projectId: other } },
      { ...good, resolved: { ...r, assetVersionId: other } },
      { ...good, resolved: { ...r, membership: { ...m, tenantId: other } } },
      { ...good, resolved: { ...r, membership: { ...m, projectId: other } } },
      { ...good, resolved: { ...r, membership: { ...m, subjectId: other } } },
    ])
      expect(canAccessPrivateAsset(candidate)).toBe(false);
  });
  it('rejects missing or inactive membership, missing principal and malformed IDs', () => {
    const r = good.resolved!;
    expect(canAccessPrivateAsset({ ...good, principal: null })).toBe(false);
    expect(canAccessPrivateAsset({ ...good, resolved: null })).toBe(false);
    expect(canAccessPrivateAsset({ ...good, resolved: { ...r, membership: null } })).toBe(false);
    expect(
      canAccessPrivateAsset({
        ...good,
        resolved: {
          ...r,
          membership: { ...r.membership!, active: false },
        },
      }),
    ).toBe(false);
    expect(canAccessPrivateAsset({ ...good, requestedProjectId: '../other' })).toBe(false);
  });
  it('requires explicit asset read permission even for admins; MEMBER cannot write', () => {
    const r = good.resolved!;
    const member = { ...r.membership!, role: 'MEMBER' as const };
    for (const operation of ['begin', 'finalize', 'revoke'] as const)
      expect(
        canAccessPrivateAsset({ ...good, operation, resolved: { ...r, membership: member } }),
      ).toBe(false);
    expect(
      canAccessPrivateAsset({ ...good, operation: 'read', resolved: { ...r, membership: member } }),
    ).toBe(true);
    expect(
      canAccessPrivateAsset({
        ...good,
        operation: 'read',
        resolved: {
          ...r,
          membership: member,
          assetReadAllowed: false,
        },
      }),
    ).toBe(false);
    expect(
      canAccessPrivateAsset({
        ...good,
        operation: 'read',
        resolved: {
          ...r,
          assetReadAllowed: false,
        },
      }),
    ).toBe(false);
  });
  it('allows only initiator to abort as MEMBER; published and archived cannot be mutated', () => {
    const r = good.resolved!;
    const member = { ...r.membership!, subjectId: initiator, role: 'MEMBER' as const };
    const own = {
      ...good,
      principal: { subjectId: initiator, tenantId },
      operation: 'abort' as const,
      requestedUploadAttemptId: attemptId,
      resolved: { ...r, membership: member },
    };
    expect(canAccessPrivateAsset(own)).toBe(true);
    expect(
      canAccessPrivateAsset({
        ...own,
        resolved: {
          ...own.resolved,
          uploadAttempt: { ...r.uploadAttempt!, initiatorSubjectId: other },
        },
      }),
    ).toBe(false);
    for (const versionStatus of ['published', 'archived'] as const)
      for (const operation of ['begin', 'finalize', 'abort'] as const)
        expect(
          canAccessPrivateAsset({
            ...good,
            operation,
            resolved: {
              ...r,
              versionStatus,
            },
          }),
        ).toBe(false);
    expect(
      canAccessPrivateAsset({
        ...good,
        operation: 'finalize',
        requestedUploadAttemptId: attemptId,
        resolved: {
          ...r,
          uploadAttempt: null,
        },
      }),
    ).toBe(false);
  });
  it('binds finalize and abort to the exact authoritative upload attempt', () => {
    const scope = good.resolved!;
    const attempt = scope.uploadAttempt!;
    const scopedFinalize = {
      ...good,
      operation: 'finalize' as const,
      requestedUploadAttemptId: attemptId,
    };
    const scopedAbort = {
      ...good,
      operation: 'abort' as const,
      requestedUploadAttemptId: attemptId,
    };
    expect(canAccessPrivateAsset(scopedFinalize)).toBe(true);
    expect(canAccessPrivateAsset(scopedAbort)).toBe(true);
    for (const command of [scopedFinalize, scopedAbort]) {
      expect(canAccessPrivateAsset({ ...command, requestedUploadAttemptId: other })).toBe(false);
      expect(canAccessPrivateAsset({ ...command, requestedUploadAttemptId: null })).toBe(false);
      expect(
        canAccessPrivateAsset({
          ...command,
          resolved: {
            ...scope,
            uploadAttempt: null,
          },
        }),
      ).toBe(false);
      for (const change of [
        { id: other },
        { tenantId: other },
        { projectId: other },
        { assetVersionId: other },
        { initiatorSubjectId: 'invalid' },
      ])
        expect(
          canAccessPrivateAsset({
            ...command,
            resolved: {
              ...scope,
              uploadAttempt: { ...attempt, ...change },
            },
          }),
        ).toBe(false);
    }
    expect(canAccessPrivateAsset({ ...good, requestedUploadAttemptId: attemptId })).toBe(false);
  });

  it('rejects forged unknown version status at runtime, including read and revoke', () => {
    const scope = good.resolved!;
    for (const operation of ['begin', 'read', 'revoke', 'finalize', 'abort'] as const) {
      expect(
        canAccessPrivateAsset({
          ...good,
          operation,
          requestedUploadAttemptId:
            operation === 'finalize' || operation === 'abort' ? attemptId : null,
          resolved: { ...scope, versionStatus: 'deleted' as never },
        }),
      ).toBe(false);
    }
    for (const status of ['published', 'archived'] as const) {
      expect(
        canAccessPrivateAsset({
          ...good,
          operation: 'read',
          resolved: { ...scope, versionStatus: status },
        }),
      ).toBe(true);
    }
  });
  it('denies future unknown operations and unknown roles', () => {
    expect(canAccessPrivateAsset({ ...good, operation: 'delete' as never })).toBe(false);
    expect(
      canAccessPrivateAsset({
        ...good,
        resolved: {
          ...good.resolved!,
          membership: { ...good.resolved!.membership!, role: 'SUPERUSER' as never },
        },
      }),
    ).toBe(false);
  });
});
