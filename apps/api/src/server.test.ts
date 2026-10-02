import { describe, expect, it } from 'vitest';
import { parseRuntimeConfig } from '@spryxel/config';
import type {
  AuthenticatedPrincipal,
  IdentityRepositoryPort,
  IdentitySessionProviderPort,
} from '@spryxel/identity';
import { InvalidAccessTokenError } from './auth/jwt.js';
import { buildApiServer } from './server.js';

describe('API foundation routes', () => {
  it('returns safe liveness and a bounded request ID', async () => {
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'));
    try {
      const response = await app.inject({
        method: 'GET',
        url: '/healthz',
        headers: { 'x-request-id': 'smoke-123' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers['x-request-id']).toBe('smoke-123');
      expect(response.json()).toEqual({ service: 'api', status: 'ok', requestId: 'smoke-123' });
    } finally {
      await app.close();
    }
  });

  it('reports disabled optional adapters without exposing configuration', async () => {
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'));
    try {
      const response = await app.inject({ method: 'GET', url: '/readyz' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        service: 'api',
        status: 'ready',
        dependencies: [
          { name: 'postgres', status: 'disabled' },
          { name: 'redis', status: 'disabled' },
          { name: 'object-storage', status: 'disabled' },
        ],
      });
      expect(response.body).not.toContain('secret');
    } finally {
      await app.close();
    }
  });

  it('replaces an invalid incoming request ID instead of reflecting it', async () => {
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'));
    try {
      const response = await app.inject({
        method: 'GET',
        url: '/healthz',
        headers: { 'x-request-id': 'bad\nvalue' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers['x-request-id']).not.toBe('bad\nvalue');
      expect(response.json().requestId).toBe(response.headers['x-request-id']);
    } finally {
      await app.close();
    }
  });
});

describe('identity API boundary', () => {
  const principal: AuthenticatedPrincipal = {
    externalSubject: { provider: 'workos', subject: 'user_fixture' },
    externalSession: { provider: 'workos', session: 'session_fixture' },
    authTimeSeconds: 1_800_000_000,
    verifiedAuthenticationMethods: ['pwd'],
    impersonated: false,
  };
  const bootstrap = {
    subjectId: '0199c321-5f24-7a3a-8f03-8d4e8d34c7b1',
    tenantId: '0199c321-5f24-7a3a-8f03-8d4e8d34c7b2',
    role: 'OWNER' as const,
    created: true,
  };

  function dependencies(
    overrides: {
      authenticateToken?: (token: string) => Promise<AuthenticatedPrincipal>;
      identityRepository?: IdentityRepositoryPort;
      sessionProvider?: IdentitySessionProviderPort;
    } = {},
  ) {
    const identityRepository: IdentityRepositoryPort = {
      bootstrap: async () => bootstrap,
      listMemberships: async () => [
        {
          subjectId: bootstrap.subjectId,
          tenantId: bootstrap.tenantId,
          role: 'OWNER',
          active: true,
        },
      ],
      recordSessionRevocation: async () => undefined,
      ...overrides.identityRepository,
    };
    return {
      authenticateToken: overrides.authenticateToken ?? (async () => principal),
      identityRepository,
      sessionProvider: overrides.sessionProvider,
    };
  }

  it('returns safe RFC 9457-style 401 for a missing bearer and does not call storage', async () => {
    const identityRepository = {
      bootstrap: async () => bootstrap,
      listMemberships: async () => [],
      recordSessionRevocation: async () => undefined,
    } satisfies IdentityRepositoryPort;
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
      ...dependencies({ identityRepository }),
      identityRepository,
    });
    try {
      const response = await app.inject({ method: 'GET', url: '/v1/me' });
      expect(response.statusCode).toBe(401);
      expect(response.headers['content-type']).toContain('application/problem+json');
      expect(response.headers['www-authenticate']).toContain('Bearer');
      expect(response.json()).toMatchObject({ status: 401, title: 'Authentication required' });
      expect(response.body).not.toContain('user_fixture');
    } finally {
      await app.close();
    }
  });

  it('resolves a signed provider principal to local identity and membership only', async () => {
    const repository = dependencies().identityRepository;
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
      ...dependencies({
        identityRepository: {
          ...repository,
          bootstrap: async (_principal, requestId) => {
            expect(requestId).toMatch(/^[A-Za-z0-9._:-]+$/);
            return bootstrap;
          },
        },
      }),
    });
    try {
      const response = await app.inject({
        method: 'GET',
        url: '/v1/me',
        headers: { authorization: 'Bearer valid-fixture-token' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({
        subjectId: bootstrap.subjectId,
        tenantId: bootstrap.tenantId,
        role: 'OWNER',
      });
      expect(response.body).not.toContain('user_fixture');
    } finally {
      await app.close();
    }
  });

  it('does not disclose whether another user session exists and revokes only owned sessions', async () => {
    const provider = {
      listSessions: async () => [
        {
          id: 'session_fixture',
          status: 'active' as const,
          authMethod: 'password',
          createdAt: '2026-10-02T11:00:00.000Z',
          expiresAt: '2026-10-03T11:00:00.000Z',
          current: true,
          impersonated: false,
        },
      ],
      revokeSession: async (_external, sessionId) => sessionId === 'session_fixture',
    } satisfies IdentitySessionProviderPort;
    const recordSessionRevocation = async () => undefined;
    const identityRepository = {
      ...dependencies().identityRepository,
      recordSessionRevocation,
    };
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
      ...dependencies({ identityRepository, sessionProvider: provider }),
    });
    try {
      const missing = await app.inject({
        method: 'DELETE',
        url: '/v1/me/sessions/session_other',
        headers: { authorization: 'Bearer valid-fixture-token' },
      });
      expect(missing.statusCode).toBe(404);
      const revoked = await app.inject({
        method: 'DELETE',
        url: '/v1/me/sessions/session_fixture',
        headers: { authorization: 'Bearer valid-fixture-token' },
      });
      expect(revoked.statusCode).toBe(204);
    } finally {
      await app.close();
    }
  });

  it('maps invalid tokens to 401 and JWKS outages to a safe 503', async () => {
    const config = parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api');
    const invalidApp = buildApiServer(config, {
      ...dependencies({
        authenticateToken: async () => {
          throw new InvalidAccessTokenError();
        },
      }),
    });
    const unavailableApp = buildApiServer(config, {
      ...dependencies({
        authenticateToken: async () => {
          throw Object.assign(new Error('JWKS unavailable'), { code: 'ERR_JWKS_TIMEOUT' });
        },
      }),
    });
    try {
      const request = {
        method: 'GET' as const,
        url: '/v1/me',
        headers: { authorization: 'Bearer invalid-fixture-token' },
      };
      expect((await invalidApp.inject(request)).statusCode).toBe(401);
      const unavailable = await unavailableApp.inject(request);
      expect(unavailable.statusCode).toBe(503);
      expect(unavailable.body).not.toContain('JWKS');
    } finally {
      await invalidApp.close();
      await unavailableApp.close();
    }
  });
});
