// Pure fail-closed Phase C policy; NOT a DB authorization adapter.
// An authenticated backend MUST re-fetch a fresh membership and asset/version
// snapshot under PostgreSQL FORCE RLS on EACH operation. Do not pass client data.
export type PrivateAssetOperation = 'begin' | 'finalize' | 'read' | 'abort' | 'revoke';
export type PrivateAssetPrincipal = Readonly<{ subjectId: string; tenantId: string }>;
export type PrivateAssetMembership = Readonly<{
  subjectId: string;
  tenantId: string;
  projectId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  active: boolean;
}>;
export type PrivateAssetResolvedAttempt = Readonly<{
  id: string;
  tenantId: string;
  projectId: string;
  assetVersionId: string;
  initiatorSubjectId: string;
}>;
export type PrivateAssetResolvedScope = Readonly<{
  tenantId: string;
  projectId: string;
  assetVersionId: string;
  versionStatus: 'draft' | 'published' | 'archived';
  assetReadAllowed: boolean;
  uploadAttempt: PrivateAssetResolvedAttempt | null;
  membership: PrivateAssetMembership | null;
}>;
export type PrivateAssetPolicyInput = Readonly<{
  operation: PrivateAssetOperation;
  principal: PrivateAssetPrincipal | null;
  requestedProjectId: string;
  requestedAssetVersionId: string;
  requestedUploadAttemptId: string | null;
  resolved: PrivateAssetResolvedScope | null;
}>;
const uuidV7Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const validId = (v: unknown): v is string => typeof v === 'string' && uuidV7Pattern.test(v);

function hasValidAssetScope(
  input: PrivateAssetPolicyInput,
  principal: PrivateAssetPrincipal,
  resolved: PrivateAssetResolvedScope,
  membership: PrivateAssetMembership,
): boolean {
  return (
    [
      principal.subjectId,
      principal.tenantId,
      input.requestedProjectId,
      input.requestedAssetVersionId,
      resolved.tenantId,
      resolved.projectId,
      resolved.assetVersionId,
      membership.subjectId,
      membership.tenantId,
      membership.projectId,
    ].every(validId) &&
    membership.active === true &&
    membership.subjectId === principal.subjectId &&
    membership.tenantId === principal.tenantId &&
    resolved.tenantId === principal.tenantId &&
    membership.projectId === input.requestedProjectId &&
    resolved.projectId === input.requestedProjectId &&
    resolved.assetVersionId === input.requestedAssetVersionId
  );
}

function isKnownVersionStatus(value: unknown): value is PrivateAssetResolvedScope['versionStatus'] {
  switch (value) {
    case 'draft':
    case 'published':
    case 'archived':
      return true;
    default:
      return false;
  }
}

function isUploadAttemptOperation(operation: PrivateAssetOperation): boolean {
  return operation === 'finalize' || operation === 'abort';
}

function isPrivilegedMembership(membership: PrivateAssetMembership): boolean {
  return membership.role === 'OWNER' || membership.role === 'ADMIN';
}

function matchesRequestedUploadAttempt(
  input: PrivateAssetPolicyInput,
  principal: PrivateAssetPrincipal,
  attempt: PrivateAssetResolvedAttempt | null,
): attempt is PrivateAssetResolvedAttempt {
  return (
    attempt !== null &&
    validId(input.requestedUploadAttemptId) &&
    [
      attempt.id,
      attempt.tenantId,
      attempt.projectId,
      attempt.assetVersionId,
      attempt.initiatorSubjectId,
    ].every(validId) &&
    attempt.id === input.requestedUploadAttemptId &&
    attempt.tenantId === principal.tenantId &&
    attempt.projectId === input.requestedProjectId &&
    attempt.assetVersionId === input.requestedAssetVersionId
  );
}

export function canAccessPrivateAsset(input: PrivateAssetPolicyInput): boolean {
  const { principal, resolved, operation } = input;
  const membership = resolved?.membership;
  if (
    !principal ||
    !resolved ||
    !membership ||
    !hasValidAssetScope(input, principal, resolved, membership)
  )
    return false;

  // TypeScript unions do not validate runtime snapshots from a DB or adapter.
  if (!isKnownVersionStatus(resolved.versionStatus)) return false;
  if (!isUploadAttemptOperation(operation) && input.requestedUploadAttemptId !== null) return false;

  const privileged = isPrivilegedMembership(membership);
  const draft = resolved.versionStatus === 'draft';
  switch (operation) {
    case 'read':
      return resolved.assetReadAllowed === true && (privileged || membership.role === 'MEMBER');
    case 'revoke':
      return privileged;
    case 'begin':
      return draft && privileged;
    case 'finalize':
      return (
        draft &&
        matchesRequestedUploadAttempt(input, principal, resolved.uploadAttempt) &&
        privileged
      );
    case 'abort':
      return (
        draft &&
        matchesRequestedUploadAttempt(input, principal, resolved.uploadAttempt) &&
        (privileged ||
          (membership.role === 'MEMBER' &&
            resolved.uploadAttempt.initiatorSubjectId === principal.subjectId))
      );
    default:
      return false;
  }
}
