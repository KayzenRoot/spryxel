export type TenantRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type TenantMembership = {
  subjectId: string;
  tenantId: string;
  role: TenantRole;
  active: boolean;
};

export type ExternalSubjectReference = {
  provider: string;
  subject: string;
};

export type ExternalSessionReference = {
  provider: string;
  session: string;
};

export type AuthenticatedPrincipal = {
  externalSubject: ExternalSubjectReference;
  externalSession: ExternalSessionReference;
  authTimeSeconds: number;
  verifiedAuthenticationMethods: readonly string[];
  impersonated: boolean;
};

export type AuthorizationDecision =
  | { allowed: true; role: TenantRole }
  | { allowed: false; reason: 'membership_required' | 'insufficient_role' };

const roleRank: Record<TenantRole, number> = {
  MEMBER: 1,
  ADMIN: 2,
  OWNER: 3,
};

export function authorizeTenantMembership(input: {
  principalSubjectId: string;
  requestedTenantId: string;
  membership: TenantMembership | null;
  minimumRole: TenantRole;
}): AuthorizationDecision {
  const membership = input.membership;
  if (
    !membership?.active ||
    membership.subjectId !== input.principalSubjectId ||
    membership.tenantId !== input.requestedTenantId
  ) {
    return { allowed: false, reason: 'membership_required' };
  }

  if (roleRank[membership.role] < roleRank[input.minimumRole]) {
    return { allowed: false, reason: 'insufficient_role' };
  }

  return { allowed: true, role: membership.role };
}

export type SensitiveActionDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason: 'privileged_role_required' | 'recent_auth_required' | 'strong_auth_required';
    };

export function evaluateSensitiveAction(input: {
  role: TenantRole;
  authTimeSeconds: number | undefined;
  verifiedAuthenticationMethods: readonly string[];
  nowSeconds: number;
  maxAgeSeconds: number;
}): SensitiveActionDecision {
  if (input.role !== 'OWNER' && input.role !== 'ADMIN') {
    return { allowed: false, reason: 'privileged_role_required' };
  }

  const authTime = input.authTimeSeconds;
  if (
    authTime === undefined ||
    !Number.isFinite(authTime) ||
    authTime > input.nowSeconds ||
    input.nowSeconds - authTime > input.maxAgeSeconds
  ) {
    return { allowed: false, reason: 'recent_auth_required' };
  }

  if (!input.verifiedAuthenticationMethods.includes('mfa')) {
    return { allowed: false, reason: 'strong_auth_required' };
  }

  return { allowed: true };
}

export type IdentityBootstrapResult = {
  subjectId: string;
  tenantId: string;
  role: TenantRole;
  created: boolean;
};

export type IdentityRepositoryPort = {
  bootstrap(principal: AuthenticatedPrincipal, requestId: string): Promise<IdentityBootstrapResult>;
  listMemberships(subjectId: string): Promise<TenantMembership[]>;
  recordSessionRevocation(input: {
    subjectId: string;
    tenantId: string;
    sessionId: string;
    requestId: string;
  }): Promise<void>;
};

export type ExternalSession = {
  id: string;
  status: 'active' | 'expired' | 'revoked';
  authMethod: string;
  createdAt: string;
  expiresAt: string;
  current: boolean;
  impersonated: boolean;
};

export type IdentitySessionProviderPort = {
  listSessions(
    externalSubject: ExternalSubjectReference,
    currentSessionId: string,
  ): Promise<ExternalSession[]>;
  revokeSession(externalSubject: ExternalSubjectReference, sessionId: string): Promise<boolean>;
};
