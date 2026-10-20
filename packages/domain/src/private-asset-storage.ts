// Pure fail-closed Phase C policy; NOT a DB authorization adapter.
// An authenticated backend MUST re-fetch a fresh membership and asset/version
// snapshot under PostgreSQL FORCE RLS on EACH operation. Do not pass client data.
export type PrivateAssetOperation = 'begin' | 'finalize' | 'read' | 'abort' | 'revoke';
export type PrivateAssetPrincipal = Readonly<{ subjectId: string; tenantId: string }>;
export type PrivateAssetMembership = Readonly<{
  subjectId: string; tenantId: string; projectId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER'; active: boolean;
}>;
export type PrivateAssetResolvedScope = Readonly<{
  tenantId: string; projectId: string; assetVersionId: string;
  versionStatus: 'draft' | 'published' | 'archived';
  assetReadAllowed: boolean; uploadInitiatorSubjectId: string | null;
  membership: PrivateAssetMembership | null;
}>;
export type PrivateAssetPolicyInput = Readonly<{
  operation: PrivateAssetOperation; principal: PrivateAssetPrincipal | null;
  requestedProjectId: string; requestedAssetVersionId: string;
  resolved: PrivateAssetResolvedScope | null;
}>;
const uuidV7Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const validId = (v: unknown): v is string => typeof v === 'string' && uuidV7Pattern.test(v);

export function canAccessPrivateAsset(input: PrivateAssetPolicyInput): boolean {
  const { principal, resolved, operation } = input;
  const membership = resolved?.membership;
  if (!principal || !resolved || !membership) return false;
  if (![principal.subjectId, principal.tenantId, input.requestedProjectId,
    input.requestedAssetVersionId, resolved.tenantId, resolved.projectId,
    resolved.assetVersionId, membership.subjectId, membership.tenantId,
    membership.projectId].every(validId)) return false;
  if (membership.active !== true ||
    membership.subjectId !== principal.subjectId ||
    membership.tenantId !== principal.tenantId ||
    resolved.tenantId !== principal.tenantId ||
    membership.projectId !== input.requestedProjectId ||
    resolved.projectId !== input.requestedProjectId ||
    resolved.assetVersionId !== input.requestedAssetVersionId) return false;

  const privileged = membership.role === 'OWNER' || membership.role === 'ADMIN';
  if (operation === 'read') return resolved.assetReadAllowed === true &&
    (privileged || membership.role === 'MEMBER');
  if (operation === 'revoke') return privileged;
  if (resolved.versionStatus !== 'draft') return false;
  if (operation === 'begin') return privileged;
  if (operation === 'finalize') return privileged &&
    validId(resolved.uploadInitiatorSubjectId);
  if (operation === 'abort') return privileged ||
    (membership.role === 'MEMBER' &&
      validId(resolved.uploadInitiatorSubjectId) &&
      resolved.uploadInitiatorSubjectId === principal.subjectId);
  return false;
}
