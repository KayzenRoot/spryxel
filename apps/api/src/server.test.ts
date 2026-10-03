import { describe, expect, it, vi } from 'vitest';
import { parseRuntimeConfig } from '@spryxel/config';
import { IdentityRepositoryError, type Database } from '@spryxel/db';
import type {
  AuthenticatedPrincipal,
  IdentityRepositoryPort,
  IdentitySessionProviderPort,
} from '@spryxel/identity';
import { createLogger } from '@spryxel/observability';
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

  it('validates the shared database before readiness and closes it once with the server', async () => {
    const database = {
      validateRuntimeRole: vi.fn(async () => undefined),
      ping: vi.fn(async () => undefined),
      close: vi.fn(async () => undefined),
    } as unknown as Database;
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), { database });

    await app.ready();
    expect(database.validateRuntimeRole).toHaveBeenCalledOnce();
    expect(app.server.listening).toBe(false);
    await app.close();
    expect(database.close).toHaveBeenCalledOnce();
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
      logger?: import('fastify').FastifyBaseLogger;
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
      getSessionRevocationIntent: async () => undefined,
      createSessionRevocationIntent: async () => ({
        id: 'intent_fixture',
        status: 'pending',
        createdAt: '2026-10-03T11:00:00.000Z',
      }),
      markSessionRevocationRetryable: async () => undefined,
      markSessionRevocationProviderConfirmed: async () => undefined,
      finalizeSessionRevocation: async () => undefined,
      ...overrides.identityRepository,
    };
    return {
      authenticateToken: overrides.authenticateToken ?? (async () => principal),
      identityRepository,
      logger: overrides.logger,
      sessionProvider: overrides.sessionProvider,
    };
  }

  it('returns safe RFC 9457-style 401 for a missing bearer and does not call storage', async () => {
    const identityRepository = {
      bootstrap: async () => bootstrap,
      listMemberships: async () => [],
      getSessionRevocationIntent: async () => undefined,
      createSessionRevocationIntent: async () => ({
        id: 'intent_fixture',
        status: 'pending',
        createdAt: '2026-10-03T11:00:00.000Z',
      }),
      markSessionRevocationRetryable: async () => undefined,
      markSessionRevocationProviderConfirmed: async () => undefined,
      finalizeSessionRevocation: async () => undefined,
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

  it('persists a durable intent only after ownership is verified and before provider revocation', async () => {
    const order: string[] = [];
    const provider = {
      listSessions: async () => {
        order.push('provider-list');
        return [
          {
            id: 'session_fixture',
            status: 'active' as const,
            authMethod: 'password',
            createdAt: '2026-10-02T11:00:00.000Z',
            expiresAt: '2026-10-03T11:00:00.000Z',
            current: true,
            impersonated: false,
          },
        ];
      },
      revokeSession: vi.fn(async (_external, sessionId) => {
        order.push('provider-revoke');
        return sessionId === 'session_fixture';
      }),
      reconcileSessionRevocation: async () => false,
      retrySessionRevocation: async () => true,
    } satisfies IdentitySessionProviderPort;
    const getSessionRevocationIntent = vi.fn(async () => {
      order.push('find-intent');
      return undefined;
    });
    const createSessionRevocationIntent = vi.fn(async () => {
      order.push('persist-intent');
      return {
        id: 'intent_fixture',
        status: 'pending' as const,
        createdAt: '2026-10-03T11:00:00.000Z',
      };
    });
    const markSessionRevocationProviderConfirmed = vi.fn(async () => {
      order.push('provider-confirmed');
    });
    const finalizeSessionRevocation = vi.fn(async () => {
      order.push('finalize');
    });
    const identityRepository = {
      ...dependencies().identityRepository,
      getSessionRevocationIntent,
      createSessionRevocationIntent,
      markSessionRevocationProviderConfirmed,
      finalizeSessionRevocation,
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
      expect(createSessionRevocationIntent).not.toHaveBeenCalled();
      expect(provider.revokeSession).not.toHaveBeenCalled();
      order.length = 0;
      const revoked = await app.inject({
        method: 'DELETE',
        url: '/v1/me/sessions/session_fixture',
        headers: { authorization: 'Bearer valid-fixture-token' },
      });
      expect(revoked.statusCode).toBe(204);
      expect(createSessionRevocationIntent).toHaveBeenCalledOnce();
      expect(order).toEqual([
        'find-intent',
        'provider-list',
        'persist-intent',
        'provider-revoke',
        'provider-confirmed',
        'finalize',
      ]);
    } finally {
      await app.close();
    }
  });

  it('checks local suspension before attempting provider session revocation', async () => {
    const order: string[] = [];
    const identityRepository = {
      ...dependencies().identityRepository,
      bootstrap: async () => {
        order.push('identity');
        throw new IdentityRepositoryError('identity_suspended');
      },
    };
    const sessionProvider = {
      listSessions: async () => {
        order.push('provider-list');
        return [];
      },
      revokeSession: async () => {
        order.push('provider-revoke');
        return true;
      },
      reconcileSessionRevocation: async () => false,
      retrySessionRevocation: async () => true,
    } satisfies IdentitySessionProviderPort;
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
      ...dependencies({ identityRepository, sessionProvider }),
    });
    try {
      const response = await app.inject({
        method: 'DELETE',
        url: '/v1/me/sessions/session_fixture',
        headers: { authorization: 'Bearer valid-fixture-token' },
      });
      expect(response.statusCode).toBe(403);
      expect(response.json()).toMatchObject({ status: 403, detail: 'identity_suspended' });
      expect(order).toEqual(['identity']);
    } finally {
      await app.close();
    }
  });

  it('does not revoke when the durable repair handle cannot be persisted', async () => {
    const provider = {
      listSessions: vi.fn(async () => [
        {
          id: 'session_fixture',
          status: 'active' as const,
          authMethod: 'password',
          createdAt: '2026-10-02T11:00:00.000Z',
          expiresAt: '2026-10-03T11:00:00.000Z',
          current: true,
          impersonated: false,
        },
      ]),
      revokeSession: vi.fn(async () => true),
      reconcileSessionRevocation: async () => false,
      retrySessionRevocation: vi.fn(async () => true),
    } satisfies IdentitySessionProviderPort;
    const identityRepository = {
      ...dependencies().identityRepository,
      createSessionRevocationIntent: async () => {
        throw new Error('postgres://private database password');
      },
    };
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
      ...dependencies({ identityRepository, sessionProvider: provider }),
    });
    try {
      const response = await app.inject({
        method: 'DELETE',
        url: '/v1/me/sessions/session_fixture',
        headers: { authorization: 'Bearer valid-fixture-token' },
      });
      expect(response.statusCode).toBe(503);
      expect(response.body).not.toContain('private database password');
      expect(provider.revokeSession).not.toHaveBeenCalled();
      expect(provider.retrySessionRevocation).not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  it('preserves a retryable intent without a false event when the provider fails', async () => {
    const lines: string[] = [];
    const logger = createLogger({ level: 'error' }, { write: (line) => lines.push(line) });
    const markSessionRevocationRetryable = vi.fn(async () => undefined);
    const finalizeSessionRevocation = vi.fn(async () => undefined);
    const identityRepository = {
      ...dependencies().identityRepository,
      markSessionRevocationRetryable,
      finalizeSessionRevocation,
    };
    const sessionProvider = {
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
      revokeSession: async () => {
        throw new Error('provider token and secret');
      },
      reconcileSessionRevocation: async () => false,
      retrySessionRevocation: async () => true,
    } satisfies IdentitySessionProviderPort;
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
      ...dependencies({ identityRepository, sessionProvider, logger }),
    });
    try {
      const response = await app.inject({
        method: 'DELETE',
        url: '/v1/me/sessions/session_fixture',
        headers: { authorization: 'Bearer valid-fixture-token' },
      });
      expect(response.statusCode).toBe(503);
      expect(response.body).not.toContain('provider token');
      expect(lines.join('')).not.toContain('provider token and secret');
      expect(markSessionRevocationRetryable).toHaveBeenCalledWith(
        expect.objectContaining({ reason: 'provider_unavailable' }),
      );
      expect(finalizeSessionRevocation).not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  it('keeps provider revocation successful when audit finalization fails with a durable confirmed intent', async () => {
    const lines: string[] = [];
    const logger = createLogger({ level: 'error' }, { write: (line) => lines.push(line) });
    let status: 'pending' | 'provider_confirmed' | 'finalized' = 'pending';
    const identityRepository = {
      ...dependencies().identityRepository,
      createSessionRevocationIntent: async () => ({
        id: 'intent_fixture',
        status: 'pending' as const,
        createdAt: '2026-10-03T11:00:00.000Z',
      }),
      markSessionRevocationProviderConfirmed: async () => {
        status = 'provider_confirmed';
      },
      finalizeSessionRevocation: async () => {
        throw new Error('database URL and provider credential must not be logged');
      },
    };
    const sessionProvider = {
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
      revokeSession: async () => true,
      reconcileSessionRevocation: async () => false,
      retrySessionRevocation: async () => true,
    } satisfies IdentitySessionProviderPort;
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'error' }, 'api'), {
      ...dependencies({ identityRepository, sessionProvider, logger }),
    });
    try {
      const response = await app.inject({
        method: 'DELETE',
        url: '/v1/me/sessions/session_fixture',
        headers: { authorization: 'Bearer valid-fixture-token' },
      });
      expect(response.statusCode).toBe(204);
      expect(lines.join('')).toContain('session.revocation_audit_reconciliation_required');
      expect(lines.join('')).not.toContain('database URL and provider credential');
      expect(status).toBe('provider_confirmed');
    } finally {
      await app.close();
    }
  });

  it('recovers a provider-confirmed current-session revoke from a WorkOS event without replaying revoke', async () => {
    const lines: string[] = [];
    const logger = createLogger({ level: 'error' }, { write: (line) => lines.push(line) });
    let intentExists = false;
    let status: 'pending' | 'provider_confirmed' | 'finalized' = 'pending';
    let confirmationWrites = 0;
    let securityEvents = 0;
    const durableIntent = {
      id: 'intent_current_session_fixture',
      status,
      createdAt: '2026-10-03T11:00:00.000Z',
    };
    const identityRepository = {
      ...dependencies().identityRepository,
      getSessionRevocationIntent: async () =>
        intentExists ? { ...durableIntent, status } : undefined,
      createSessionRevocationIntent: async () => {
        intentExists = true;
        return { ...durableIntent, status };
      },
      markSessionRevocationProviderConfirmed: async () => {
        confirmationWrites += 1;
        if (confirmationWrites === 1) {
          throw new Error('postgres password must not be exposed');
        }
        status = 'provider_confirmed';
      },
      finalizeSessionRevocation: async () => {
        if (status !== 'finalized') securityEvents += 1;
        status = 'finalized';
      },
    };
    const sessionProviderDouble = {
      listSessions: vi.fn(async () => [
        {
          id: 'session_fixture',
          status: 'active' as const,
          authMethod: 'password',
          createdAt: '2026-10-03T10:00:00.000Z',
          expiresAt: '2026-10-04T10:00:00.000Z',
          current: true,
          impersonated: false,
        },
      ]),
      revokeSession: vi.fn(async () => true),
      reconcileSessionRevocation: vi.fn(async () => true),
      retrySessionRevocation: vi.fn(async () => true),
    };
    const sessionProvider = sessionProviderDouble as unknown as IdentitySessionProviderPort;
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'error' }, 'api'), {
      ...dependencies({
        authenticateToken: async (token) =>
          token === 'initial-session-token'
            ? principal
            : {
                ...principal,
                externalSession: { provider: 'workos', session: 'fresh_recovery_session' },
              },
        identityRepository,
        sessionProvider,
        logger,
      }),
    });
    try {
      const originalRequest = {
        method: 'DELETE' as const,
        url: '/v1/me/sessions/session_fixture',
        headers: { authorization: 'Bearer initial-session-token' },
      };
      const first = await app.inject(originalRequest);
      expect(first.statusCode).toBe(204);
      expect(first.body).toBe('');
      expect(lines.join('')).not.toContain('postgres password');
      expect(status).toBe('pending');
      expect(securityEvents).toBe(0);

      const recovery = await app.inject({
        ...originalRequest,
        headers: { authorization: 'Bearer fresh-session-token' },
      });
      const repeatedRecovery = await app.inject({
        ...originalRequest,
        headers: { authorization: 'Bearer fresh-session-token' },
      });

      expect(recovery.statusCode).toBe(204);
      expect(repeatedRecovery.statusCode).toBe(204);
      expect(status).toBe('finalized');
      expect(sessionProviderDouble.reconcileSessionRevocation).toHaveBeenCalledWith(
        principal.externalSubject,
        'session_fixture',
        '2026-10-03T11:00:00.000Z',
      );
      expect(sessionProviderDouble.reconcileSessionRevocation).toHaveBeenCalledOnce();
      expect(sessionProviderDouble.revokeSession).toHaveBeenCalledOnce();
      expect(sessionProviderDouble.retrySessionRevocation).not.toHaveBeenCalled();
      expect(sessionProviderDouble.listSessions).toHaveBeenCalledOnce();
      expect(securityEvents).toBe(1);
    } finally {
      await app.close();
    }
  });

  it('fails closed for a pending intent when the provider event does not confirm revocation', async () => {
    const identityRepository = {
      ...dependencies().identityRepository,
      getSessionRevocationIntent: async () => ({
        id: 'intent_unconfirmed_fixture',
        status: 'pending' as const,
        createdAt: '2026-10-03T11:00:00.000Z',
      }),
      markSessionRevocationProviderConfirmed: vi.fn(async () => undefined),
      finalizeSessionRevocation: vi.fn(async () => undefined),
    };
    const sessionProvider = {
      listSessions: vi.fn(async () => []),
      revokeSession: vi.fn(async () => true),
      reconcileSessionRevocation: vi.fn(async () => false),
      retrySessionRevocation: vi.fn(async () => true),
    };
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
      ...dependencies({
        identityRepository,
        sessionProvider: sessionProvider as unknown as IdentitySessionProviderPort,
      }),
    });
    try {
      const response = await app.inject({
        method: 'DELETE',
        url: '/v1/me/sessions/session_fixture',
        headers: { authorization: 'Bearer valid-fixture-token' },
      });

      expect(response.statusCode).toBe(503);
      expect(response.body).not.toContain('intent_unconfirmed_fixture');
      expect(sessionProvider.reconcileSessionRevocation).toHaveBeenCalledOnce();
      expect(sessionProvider.revokeSession).not.toHaveBeenCalled();
      expect(sessionProvider.retrySessionRevocation).not.toHaveBeenCalled();
      expect(identityRepository.markSessionRevocationProviderConfirmed).not.toHaveBeenCalled();
      expect(identityRepository.finalizeSessionRevocation).not.toHaveBeenCalled();
    } finally {
      await app.close();
    }
  });

  it('reconciles a retryable intent on replay and returns one event idempotently', async () => {
    const lines: string[] = [];
    const logger = createLogger({ level: 'error' }, { write: (line) => lines.push(line) });
    let status: 'pending' | 'retryable' | 'provider_confirmed' | 'finalized' = 'pending';
    let events = 0;
    const identityRepository = {
      ...dependencies().identityRepository,
      getSessionRevocationIntent: async () =>
        status === 'pending'
          ? undefined
          : { id: 'intent_fixture', status, createdAt: '2026-10-03T11:00:00.000Z' },
      createSessionRevocationIntent: async () => ({
        id: 'intent_fixture',
        status,
        createdAt: '2026-10-03T11:00:00.000Z',
      }),
      markSessionRevocationRetryable: async () => {
        status = 'retryable';
      },
      markSessionRevocationProviderConfirmed: async () => {
        status = 'provider_confirmed';
      },
      finalizeSessionRevocation: async () => {
        if (status !== 'finalized') events += 1;
        status = 'finalized';
      },
    };
    const listSessions = vi.fn<IdentitySessionProviderPort['listSessions']>(async () => [
      {
        id: 'session_fixture',
        status: 'active' as const,
        authMethod: 'password',
        createdAt: '2026-10-02T11:00:00.000Z',
        expiresAt: '2026-10-03T11:00:00.000Z',
        current: true,
        impersonated: false,
      },
    ]);
    const sessionProvider = {
      listSessions,
      revokeSession: vi
        .fn<IdentitySessionProviderPort['revokeSession']>()
        .mockRejectedValueOnce(new Error('transient provider credential failure'))
        .mockResolvedValue(true),
      reconcileSessionRevocation: vi
        .fn<IdentitySessionProviderPort['reconcileSessionRevocation']>()
        .mockResolvedValue(false),
      retrySessionRevocation: vi.fn(
        async (
          externalSubject: Parameters<IdentitySessionProviderPort['retrySessionRevocation']>[0],
          sessionId: string,
        ) => {
          const sessions = await listSessions(externalSubject, '');
          return sessions.some(
            (session) => session.id === sessionId && session.status === 'active',
          );
        },
      ),
    } satisfies IdentitySessionProviderPort;
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'error' }, 'api'), {
      ...dependencies({ identityRepository, sessionProvider, logger }),
    });
    try {
      const request = {
        method: 'DELETE' as const,
        url: '/v1/me/sessions/session_fixture',
        headers: { authorization: 'Bearer valid-fixture-token' },
      };
      const first = await app.inject(request);
      expect(first.statusCode).toBe(503);
      const retry = await app.inject(request);
      expect(retry.statusCode).toBe(204);
      const repeated = await app.inject(request);
      expect(repeated.statusCode).toBe(204);
      expect(sessionProvider.retrySessionRevocation).toHaveBeenCalledTimes(1);
      expect(listSessions).toHaveBeenCalledTimes(2);
      expect(events).toBe(1);
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
    const resolverOutageApp = buildApiServer(config, {
      ...dependencies({
        authenticateToken: async () => {
          throw new Error('provider hostname and credential details');
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
      const resolverOutage = await resolverOutageApp.inject(request);
      expect(resolverOutage.statusCode).toBe(503);
      expect(resolverOutage.body).not.toContain('provider hostname');
      expect(resolverOutage.body).not.toContain('credential');
    } finally {
      await invalidApp.close();
      await unavailableApp.close();
      await resolverOutageApp.close();
    }
  });
});
