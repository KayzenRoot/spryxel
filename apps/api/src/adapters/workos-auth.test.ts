import { describe, expect, it } from 'vitest';
import { mapWorkOSSession } from './workos-auth.js';

describe('WorkOS session mapping', () => {
  it('maps safe session references and preserves impersonation evidence without provider details', () => {
    const mapped = mapWorkOSSession(
      {
        object: 'session',
        id: 'session_fixture',
        userId: 'user_fixture',
        ipAddress: '203.0.113.7',
        userAgent: 'fixture browser',
        impersonator: { email: 'operator@example.test', reason: 'support' },
        authMethod: 'sso',
        status: 'active',
        expiresAt: '2026-10-03T11:00:00.000Z',
        endedAt: null,
        createdAt: '2026-10-02T11:00:00.000Z',
        updatedAt: '2026-10-02T11:00:00.000Z',
      },
      'session_fixture',
    );

    expect(mapped).toEqual({
      id: 'session_fixture',
      status: 'active',
      authMethod: 'sso',
      createdAt: '2026-10-02T11:00:00.000Z',
      expiresAt: '2026-10-03T11:00:00.000Z',
      current: true,
      impersonated: true,
    });
    expect(JSON.stringify(mapped)).not.toContain('operator@example.test');
    expect(JSON.stringify(mapped)).not.toContain('203.0.113.7');
    expect(JSON.stringify(mapped)).not.toContain('fixture browser');
  });

  it('marks ordinary sessions non-impersonated and identifies the current reference', () => {
    const mapped = mapWorkOSSession(
      {
        object: 'session',
        id: 'session_other',
        userId: 'user_fixture',
        ipAddress: null,
        userAgent: null,
        authMethod: 'password',
        status: 'revoked',
        expiresAt: '2026-10-03T11:00:00.000Z',
        endedAt: '2026-10-02T12:00:00.000Z',
        createdAt: '2026-10-02T11:00:00.000Z',
        updatedAt: '2026-10-02T12:00:00.000Z',
      },
      'session_current',
    );

    expect(mapped).toMatchObject({
      id: 'session_other',
      status: 'revoked',
      current: false,
      impersonated: false,
    });
  });
});
