import { describe, expect, it } from 'vitest';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { verifyWorkOSAccessToken } from './jwt.js';

const now = new Date('2026-10-02T12:00:00.000Z');
const issuer = 'https://auth.example.test';
const audience = 'https://api.spryxel.example';

async function fixture() {
  const signing = await generateKeyPair('RS256');
  const other = await generateKeyPair('RS256');
  const publicJwk = await exportJWK(signing.publicKey);
  const wrongJwk = await exportJWK(other.publicKey);
  const jwks = createLocalJWKSet({
    keys: [
      { ...publicJwk, kid: 'workos-fixture', alg: 'RS256', use: 'sig' },
      { ...wrongJwk, kid: 'other-fixture', alg: 'RS256', use: 'sig' },
    ],
  });

  async function token(
    claims: Record<string, unknown> = {},
    options: {
      key?: typeof signing.privateKey;
      issuer?: string;
      audience?: string;
      expiresAt?: number;
      subject?: string | null;
      notBefore?: number;
    } = {},
  ) {
    const builder = new SignJWT({
      sid: 'session_fixture_01',
      auth_time: Math.floor(now.getTime() / 1000) - 45,
      ...claims,
    })
      .setProtectedHeader({ alg: 'RS256', kid: 'workos-fixture', typ: 'JWT' })
      .setIssuer(options.issuer ?? issuer)
      .setAudience(options.audience ?? audience);
    const subject =
      options.subject === null
        ? undefined
        : (options.subject ?? (typeof claims.sub === 'string' ? claims.sub : 'user_fixture_01'));
    if (subject !== undefined) builder.setSubject(subject);
    if (options.notBefore !== undefined) builder.setNotBefore(options.notBefore);
    return builder
      .setIssuedAt(Math.floor(now.getTime() / 1000) - 30)
      .setExpirationTime(options.expiresAt ?? Math.floor(now.getTime() / 1000) + 300)
      .sign(options.key ?? signing.privateKey);
  }

  return { jwks, other, token };
}

describe('WorkOS access token verification', () => {
  it('returns a provider-neutral principal only after valid signature and claims', async () => {
    const keys = await fixture();
    const principal = await verifyWorkOSAccessToken(await keys.token(), keys.jwks, {
      issuer,
      audience,
      currentDate: now,
    });

    expect(principal).toEqual({
      externalSubject: { provider: 'workos', subject: 'user_fixture_01' },
      externalSession: { provider: 'workos', session: 'session_fixture_01' },
      authTimeSeconds: Math.floor(now.getTime() / 1000) - 45,
      verifiedAuthenticationMethods: [],
      impersonated: false,
    });
  });

  it('rejects wrong signature, issuer, audience and expiry', async () => {
    const keys = await fixture();
    const valid = await keys.token();
    const badSignature = await keys.token({}, { key: keys.other.privateKey });
    const wrongIssuer = await keys.token({}, { issuer: 'https://untrusted.example.test' });
    const wrongAudience = await keys.token({}, { audience: 'https://other-api.example' });
    const expired = await keys.token({}, { expiresAt: Math.floor(now.getTime() / 1000) - 10 });
    const futureNotBefore = await keys.token(
      {},
      { notBefore: Math.floor(now.getTime() / 1000) + 10 },
    );
    const missingSubject = await keys.token({}, { subject: null });

    for (const [label, token] of [
      ['signature', badSignature] as const,
      ['issuer', wrongIssuer] as const,
      ['audience', wrongAudience] as const,
      ['expiry', expired] as const,
      ['not-before', futureNotBefore] as const,
      ['missing subject', missingSubject] as const,
    ]) {
      const result = await Promise.allSettled([
        verifyWorkOSAccessToken(token, keys.jwks, { issuer, audience, currentDate: now }),
      ]);
      expect(result[0]?.status, `wrong ${label} was accepted`).toBe('rejected');
    }
    await expect(
      verifyWorkOSAccessToken(valid, keys.jwks, { issuer: '', audience, currentDate: now }),
    ).rejects.toThrow();
  });

  it('rejects unsupported token context, missing session/auth time and impersonation', async () => {
    const keys = await fixture();
    const invalidClaims = [
      { sub: '' },
      { sid: '' },
      { auth_time: undefined },
      { auth_time: Math.floor(now.getTime() / 1000) + 6 },
      { sub_profile: 'ai_agent' },
      { act: { sub: 'admin_fixture' } },
      { impersonator: { email: 'actor@example.test' } },
      { amr: 'mfa' },
    ];

    for (const claims of invalidClaims) {
      await expect(
        verifyWorkOSAccessToken(await keys.token(claims), keys.jwks, {
          issuer,
          audience,
          currentDate: now,
        }),
      ).rejects.toThrow();
    }
  });

  it('preserves verified MFA evidence without trusting organization role claims', async () => {
    const keys = await fixture();
    const principal = await verifyWorkOSAccessToken(
      await keys.token({ amr: ['pwd', 'mfa'], org_id: 'org_external', role: 'admin' }),
      keys.jwks,
      { issuer, audience, currentDate: now },
    );

    expect(principal.verifiedAuthenticationMethods).toEqual(['pwd', 'mfa']);
    expect(principal).not.toHaveProperty('role');
  });
});
