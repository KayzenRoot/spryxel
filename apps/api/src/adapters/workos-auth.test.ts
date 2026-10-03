import { describe, expect, it, vi } from 'vitest';
import {
  mapWorkOSSession,
  WorkOSSessionListingUnavailableError,
  WorkOSSessionReconciliationUnavailableError,
  WorkOSSessionProvider,
  type WorkOSSessionApi,
} from './workos-auth.js';

function session(id: string): Parameters<typeof mapWorkOSSession>[0] {
  return {
    object: 'session',
    id,
    userId: 'user_fixture',
    ipAddress: null,
    userAgent: null,
    authMethod: 'password',
    status: 'active',
    expiresAt: '2026-10-03T11:00:00.000Z',
    endedAt: null,
    createdAt: '2026-10-02T11:00:00.000Z',
    updatedAt: '2026-10-02T11:00:00.000Z',
  };
}

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

  it('follows documented after cursors when listing and verifying an owned session', async () => {
    const listSessions = vi.fn(async (_userId: string, options: { after?: string | null }) => {
      if (options.after === 'cursor_second') {
        return { data: [session('session_on_second_page')], listMetadata: {} };
      }
      return {
        data: [session('session_first_page')],
        listMetadata: { after: 'cursor_second' },
      };
    });
    const revokeSession = vi.fn(async () => undefined);
    const provider = new WorkOSSessionProvider('test-key', 'test-client', 'https://issuer.test', {
      api: { listSessions, revokeSession } as unknown as WorkOSSessionApi,
    });

    const listed = await provider.listSessions(
      { provider: 'workos', subject: 'user_fixture' },
      'session_first_page',
    );
    expect(listed.map((item) => item.id)).toEqual(['session_first_page', 'session_on_second_page']);
    expect(listSessions).toHaveBeenNthCalledWith(1, 'user_fixture', { limit: 100 });
    expect(listSessions).toHaveBeenNthCalledWith(2, 'user_fixture', {
      limit: 100,
      after: 'cursor_second',
    });

    await expect(
      provider.revokeSession(
        { provider: 'workos', subject: 'user_fixture' },
        'session_on_second_page',
      ),
    ).resolves.toBe(true);
    expect(revokeSession).toHaveBeenCalledOnce();
  });

  it('fails closed at the page cap and never revokes a partially enumerated session list', async () => {
    const listSessions = vi.fn(async (_userId: string, options: { after?: string | null }) => ({
      data: [session(options.after ? 'session_second_page' : 'session_first_page')],
      listMetadata: { after: options.after ? 'cursor_third' : 'cursor_second' },
    }));
    const revokeSession = vi.fn(async () => undefined);
    const provider = new WorkOSSessionProvider('test-key', 'test-client', 'https://issuer.test', {
      api: { listSessions, revokeSession } as unknown as WorkOSSessionApi,
      maxSessionPages: 2,
    });

    await expect(
      provider.revokeSession({ provider: 'workos', subject: 'user_fixture' }, 'session_first_page'),
    ).rejects.toBeInstanceOf(WorkOSSessionListingUnavailableError);
    expect(listSessions).toHaveBeenCalledTimes(2);
    expect(revokeSession).not.toHaveBeenCalled();
  });

  it('fails closed when the provider page request exceeds the global deadline', async () => {
    const listSessions = vi.fn(() => new Promise<never>(() => undefined));
    const provider = new WorkOSSessionProvider('test-key', 'test-client', 'https://issuer.test', {
      api: {
        listSessions,
        revokeSession: vi.fn(async () => undefined),
      } as unknown as WorkOSSessionApi,
      sessionDeadlineMs: 10,
    });

    await expect(
      provider.listSessions({ provider: 'workos', subject: 'user_fixture' }, ''),
    ).rejects.toBeInstanceOf(WorkOSSessionListingUnavailableError);
  });

  it('confirms revocation only from a matching user session event within the durable intent window', async () => {
    const intentCreatedAt = new Date(Date.now() - 30_000).toISOString();
    const expectedRangeStart = new Date(Date.parse(intentCreatedAt) - 60_000).toISOString();
    const listEvents = vi.fn(
      async (_options: { after?: string; rangeStart?: string; rangeEnd?: string }) => {
        if (_options.after === 'event_cursor') {
          return {
            data: [
              {
                id: 'event_exact_session',
                event: 'session.revoked',
                createdAt: new Date(Date.parse(intentCreatedAt) + 3_000).toISOString(),
                context: {},
                data: {
                  object: 'session',
                  id: 'session_target',
                  userId: 'user_target',
                  status: 'revoked',
                },
              },
            ],
            listMetadata: {},
          };
        }
        return {
          data: [
            {
              id: 'event_other_user',
              event: 'session.revoked',
              createdAt: new Date(Date.parse(intentCreatedAt) + 2_000).toISOString(),
              context: {},
              data: {
                object: 'session',
                id: 'session_target',
                userId: 'user_other',
                status: 'revoked',
              },
            },
            {
              id: 'event_other_type',
              event: 'session.created',
              createdAt: new Date(Date.parse(intentCreatedAt) + 2_500).toISOString(),
              context: {},
              data: {
                object: 'session',
                id: 'session_target',
                userId: 'user_target',
                status: 'active',
              },
            },
          ],
          listMetadata: { after: 'event_cursor' },
        };
      },
    );
    const revokeSession = vi.fn(async () => undefined);
    const provider = new WorkOSSessionProvider('test-key', 'test-client', 'https://issuer.test', {
      api: {
        listSessions: vi.fn(async () => ({ data: [], listMetadata: {} })),
        revokeSession,
      } as unknown as WorkOSSessionApi,
      eventsApi: { listEvents } as never,
    });

    await expect(
      provider.reconcileSessionRevocation(
        { provider: 'workos', subject: 'user_target' },
        'session_target',
        intentCreatedAt,
      ),
    ).resolves.toBe(true);
    expect(listEvents).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        events: ['session.revoked'],
        rangeStart: expectedRangeStart,
        limit: 100,
        order: 'asc',
      }),
    );
    expect(listEvents).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ after: 'event_cursor' }),
    );
    expect(revokeSession).not.toHaveBeenCalled();
  });

  it('fails closed when session-event reconciliation reaches its page bound without a match', async () => {
    const listEvents = vi.fn(async () => ({
      data: [],
      listMetadata: { after: 'next_event_page' },
    }));
    const revokeSession = vi.fn(async () => undefined);
    const provider = new WorkOSSessionProvider('test-key', 'test-client', 'https://issuer.test', {
      api: {
        listSessions: vi.fn(async () => ({ data: [], listMetadata: {} })),
        revokeSession,
      } as unknown as WorkOSSessionApi,
      eventsApi: { listEvents } as never,
      maxSessionEventPages: 1,
    });

    await expect(
      provider.reconcileSessionRevocation(
        { provider: 'workos', subject: 'user_target' },
        'session_target',
        new Date(Date.now() - 30_000).toISOString(),
      ),
    ).rejects.toBeInstanceOf(WorkOSSessionReconciliationUnavailableError);
    expect(listEvents).toHaveBeenCalledOnce();
    expect(revokeSession).not.toHaveBeenCalled();
  });

  it('keeps each WorkOS event query within the documented maximum range', async () => {
    const intentCreatedAt = new Date(Date.now() - 45 * 24 * 60 * 60 * 1_000).toISOString();
    let eventQueries = 0;
    const listEvents = vi.fn(async (_options: { rangeStart?: string; rangeEnd?: string }) => {
      eventQueries += 1;
      if (eventQueries === 1) return { data: [], listMetadata: {} };
      return {
        data: [
          {
            id: 'event_old_intent_session',
            event: 'session.revoked',
            createdAt: new Date().toISOString(),
            context: {},
            data: {
              object: 'session',
              id: 'session_target',
              userId: 'user_target',
              status: 'revoked',
            },
          },
        ],
        listMetadata: {},
      };
    });
    const provider = new WorkOSSessionProvider('test-key', 'test-client', 'https://issuer.test', {
      api: {
        listSessions: vi.fn(async () => ({ data: [], listMetadata: {} })),
        revokeSession: vi.fn(async () => undefined),
      } as unknown as WorkOSSessionApi,
      eventsApi: { listEvents } as never,
    });

    await expect(
      provider.reconcileSessionRevocation(
        { provider: 'workos', subject: 'user_target' },
        'session_target',
        intentCreatedAt,
      ),
    ).resolves.toBe(true);
    const firstRange = listEvents.mock.calls[0]?.[0];
    const secondRange = listEvents.mock.calls[1]?.[0];
    if (
      !firstRange?.rangeStart ||
      !firstRange.rangeEnd ||
      !secondRange?.rangeStart ||
      !secondRange.rangeEnd
    ) {
      throw new Error('WorkOS event request omitted a bounded range');
    }
    expect(listEvents).toHaveBeenCalledTimes(2);
    expect(Date.parse(firstRange.rangeEnd) - Date.parse(firstRange.rangeStart)).toBeLessThanOrEqual(
      30 * 24 * 60 * 60 * 1_000,
    );
    expect(
      Date.parse(secondRange.rangeEnd) - Date.parse(secondRange.rangeStart),
    ).toBeLessThanOrEqual(30 * 24 * 60 * 60 * 1_000);
    expect(secondRange.rangeStart).toBe(firstRange.rangeEnd);
  });

  it('replays a revoke only through the durable-intent recovery operation', async () => {
    const listSessions = vi.fn(async () => ({ data: [], listMetadata: {} }));
    const revokeSession = vi.fn(async () => undefined);
    const provider = new WorkOSSessionProvider('test-key', 'test-client', 'https://issuer.test', {
      api: { listSessions, revokeSession } as unknown as WorkOSSessionApi,
    });

    await expect(
      provider.retrySessionRevocation(
        { provider: 'workos', subject: 'user_fixture' },
        'session_with_durable_intent',
      ),
    ).resolves.toBe(true);
    expect(revokeSession).toHaveBeenCalledWith({ sessionId: 'session_with_durable_intent' });
    expect(listSessions).not.toHaveBeenCalled();
  });
});
