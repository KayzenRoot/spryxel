import { describe, expect, it } from 'vitest';
import {
  authorizeTenantMembership,
  evaluateSensitiveAction,
  type TenantMembership,
} from './index.js';

const ownerMembership: TenantMembership = {
  subjectId: 'subject-a',
  tenantId: 'tenant-a',
  role: 'OWNER',
  active: true,
};

describe('tenant authorization policy', () => {
  it('fails closed when membership is absent and requires owner for owner-level operations', () => {
    expect(
      authorizeTenantMembership({
        principalSubjectId: 'subject-a',
        requestedTenantId: 'tenant-a',
        membership: null,
        minimumRole: 'MEMBER',
      }),
    ).toEqual({ allowed: false, reason: 'membership_required' });

    expect(
      authorizeTenantMembership({
        principalSubjectId: 'subject-a',
        requestedTenantId: 'tenant-a',
        membership: { ...ownerMembership, role: 'ADMIN' },
        minimumRole: 'OWNER',
      }),
    ).toEqual({ allowed: false, reason: 'insufficient_role' });
  });

  it('allows only an active matching member with the required role', () => {
    expect(
      authorizeTenantMembership({
        principalSubjectId: 'subject-a',
        requestedTenantId: 'tenant-a',
        membership: ownerMembership,
        minimumRole: 'ADMIN',
      }),
    ).toMatchObject({ allowed: true, role: 'OWNER' });

    expect(
      authorizeTenantMembership({
        principalSubjectId: 'subject-b',
        requestedTenantId: 'tenant-a',
        membership: ownerMembership,
        minimumRole: 'MEMBER',
      }),
    ).toMatchObject({ allowed: false, reason: 'membership_required' });

    expect(
      authorizeTenantMembership({
        principalSubjectId: 'subject-a',
        requestedTenantId: 'tenant-b',
        membership: ownerMembership,
        minimumRole: 'MEMBER',
      }),
    ).toMatchObject({ allowed: false, reason: 'membership_required' });
  });

  it('rejects inactive members and members below the required role', () => {
    expect(
      authorizeTenantMembership({
        principalSubjectId: 'subject-a',
        requestedTenantId: 'tenant-a',
        membership: { ...ownerMembership, active: false },
        minimumRole: 'MEMBER',
      }),
    ).toMatchObject({ allowed: false, reason: 'membership_required' });

    expect(
      authorizeTenantMembership({
        principalSubjectId: 'subject-a',
        requestedTenantId: 'tenant-a',
        membership: { ...ownerMembership, role: 'MEMBER' },
        minimumRole: 'ADMIN',
      }),
    ).toMatchObject({ allowed: false, reason: 'insufficient_role' });
  });
});

describe('sensitive action step-up policy', () => {
  const nowSeconds = 1_800_000_000;

  it('requires recent auth and verified MFA evidence for owner/admin actions', () => {
    expect(
      evaluateSensitiveAction({
        role: 'OWNER',
        authTimeSeconds: nowSeconds - 60,
        verifiedAuthenticationMethods: ['pwd', 'mfa'],
        nowSeconds,
        maxAgeSeconds: 300,
      }),
    ).toMatchObject({ allowed: true });

    expect(
      evaluateSensitiveAction({
        role: 'ADMIN',
        authTimeSeconds: nowSeconds - 60,
        verifiedAuthenticationMethods: ['pwd'],
        nowSeconds,
        maxAgeSeconds: 300,
      }),
    ).toMatchObject({ allowed: false, reason: 'strong_auth_required' });

    expect(
      evaluateSensitiveAction({
        role: 'OWNER',
        authTimeSeconds: nowSeconds - 301,
        verifiedAuthenticationMethods: ['mfa'],
        nowSeconds,
        maxAgeSeconds: 300,
      }),
    ).toMatchObject({ allowed: false, reason: 'recent_auth_required' });
  });

  it('fails closed for missing or future auth_time and never upgrades a member', () => {
    expect(
      evaluateSensitiveAction({
        role: 'OWNER',
        authTimeSeconds: undefined,
        verifiedAuthenticationMethods: ['mfa'],
        nowSeconds,
        maxAgeSeconds: 300,
      }),
    ).toMatchObject({ allowed: false, reason: 'recent_auth_required' });

    expect(
      evaluateSensitiveAction({
        role: 'OWNER',
        authTimeSeconds: nowSeconds + 1,
        verifiedAuthenticationMethods: ['mfa'],
        nowSeconds,
        maxAgeSeconds: 300,
      }),
    ).toMatchObject({ allowed: false, reason: 'recent_auth_required' });

    expect(
      evaluateSensitiveAction({
        role: 'MEMBER',
        authTimeSeconds: nowSeconds,
        verifiedAuthenticationMethods: ['mfa'],
        nowSeconds,
        maxAgeSeconds: 300,
      }),
    ).toMatchObject({ allowed: false, reason: 'privileged_role_required' });
  });
});
