import { describe, expect, it } from 'vitest';
import { canAccessPrivateAsset, type PrivateAssetPolicyInput } from './private-asset-storage.js';

const subjectId = '0190f000-0000-7000-8000-000000000001';
const tenantId = '0190f000-0000-7000-8000-000000000002';
const projectId = '0190f000-0000-7000-8000-000000000003';
const assetVersionId = '0190f000-0000-7000-8000-000000000004';
const other = '0190f000-0000-7000-8000-000000000005';
const initiator = '0190f000-0000-7000-8000-000000000006';
const good: PrivateAssetPolicyInput = {
  operation: 'begin', principal: { subjectId, tenantId },
  requestedProjectId: projectId, requestedAssetVersionId: assetVersionId,
  resolved: {
    tenantId, projectId, assetVersionId, versionStatus: 'draft',
    assetReadAllowed: true, uploadInitiatorSubjectId: initiator,
    membership: { subjectId, tenantId, projectId, role: 'OWNER', active: true },
  },
};
describe('private asset fail-closed tenant/project/version scope policy', () => {
  it('allows current privileged membership for begin/finalize/revoke', () => {
    for (const operation of ['begin', 'finalize', 'revoke'] as const)
      expect(canAccessPrivateAsset({ ...good, operation })).toBe(true);
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
    ]) expect(canAccessPrivateAsset(candidate)).toBe(false);
  });
  it('rejects missing or inactive membership, missing principal and malformed IDs', () => {
    const r = good.resolved!;
    expect(canAccessPrivateAsset({ ...good, principal: null })).toBe(false);
    expect(canAccessPrivateAsset({ ...good, resolved: null })).toBe(false);
    expect(canAccessPrivateAsset({ ...good, resolved: { ...r, membership: null } })).toBe(false);
    expect(canAccessPrivateAsset({ ...good, resolved: {
      ...r, membership: { ...r.membership!, active: false },
    } })).toBe(false);
    expect(canAccessPrivateAsset({ ...good, requestedProjectId: '../other' })).toBe(false);
  });
  it('requires explicit asset read permission even for admins; MEMBER cannot write', () => {
    const r = good.resolved!;
    const member = { ...r.membership!, role: 'MEMBER' as const };
    for (const operation of ['begin', 'finalize', 'revoke'] as const)
      expect(canAccessPrivateAsset({ ...good, operation, resolved: { ...r, membership: member } })).toBe(false);
    expect(canAccessPrivateAsset({ ...good, operation: 'read', resolved: { ...r, membership: member } })).toBe(true);
    expect(canAccessPrivateAsset({ ...good, operation: 'read', resolved: {
      ...r, membership: member, assetReadAllowed: false,
    } })).toBe(false);
    expect(canAccessPrivateAsset({ ...good, operation: 'read', resolved: {
      ...r, assetReadAllowed: false,
    } })).toBe(false);
  });
  it('allows only initiator to abort as MEMBER; published and archived cannot be mutated', () => {
    const r = good.resolved!;
    const member = { ...r.membership!, subjectId: initiator, role: 'MEMBER' as const };
    const own = { ...good, principal: { subjectId: initiator, tenantId },
      operation: 'abort' as const, resolved: { ...r, membership: member } };
    expect(canAccessPrivateAsset(own)).toBe(true);
    expect(canAccessPrivateAsset({ ...own, resolved: { ...own.resolved, uploadInitiatorSubjectId: other } })).toBe(false);
    for (const versionStatus of ['published', 'archived'] as const)
      for (const operation of ['begin', 'finalize', 'abort'] as const)
        expect(canAccessPrivateAsset({ ...good, operation, resolved: {
          ...r, versionStatus,
        } })).toBe(false);
    expect(canAccessPrivateAsset({ ...good, operation: 'finalize', resolved: {
      ...r, uploadInitiatorSubjectId: null,
    } })).toBe(false);
  });
  it('denies future unknown operations and unknown roles', () => {
    expect(canAccessPrivateAsset({ ...good, operation: 'delete' as never })).toBe(false);
    expect(canAccessPrivateAsset({ ...good, resolved: {
      ...good.resolved!, membership: { ...good.resolved!.membership!, role: 'SUPERUSER' as never },
    } })).toBe(false);
  });
});
