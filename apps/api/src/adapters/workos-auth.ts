import { WorkOS } from '@workos-inc/node';
import type { RuntimeConfig } from '@spryxel/config';
import type { JWTVerifyGetKey } from 'jose';
import type {
  AuthenticatedPrincipal,
  ExternalSession,
  ExternalSubjectReference,
  IdentitySessionProviderPort,
} from '@spryxel/identity';
import type { Session } from '@workos-inc/node';
import { verifyWorkOSAccessToken } from '../auth/jwt.js';

export type WorkOSSessionApi = Pick<WorkOS['userManagement'], 'listSessions' | 'revokeSession'>;
export type WorkOSSessionEventsApi = Pick<WorkOS['events'], 'listEvents'>;

const sessionPageLimit = 100;
const defaultSessionPageCap = 10;
const defaultSessionDeadlineMs = 5_000;
const sessionEventPageLimit = 100;
const defaultSessionEventPageCap = 10;
const sessionEventClockSkewMs = 60_000;
const sessionEventWindowMs = 30 * 24 * 60 * 60 * 1_000;
const sessionEventRetentionMs = 90 * 24 * 60 * 60 * 1_000;

export function createWorkOSAuthenticator(config: RuntimeConfig) {
  if (
    !config.workosApiKey ||
    !config.workosClientId ||
    !config.workosIssuer ||
    !config.workosAudience
  ) {
    return undefined;
  }

  const workos = new WorkOS(config.workosApiKey, {
    clientId: config.workosClientId,
    issuer: config.workosIssuer,
  });
  let jwks: JWTVerifyGetKey | undefined;
  const verification = {
    issuer: config.workosIssuer,
    audience: config.workosAudience,
  };

  return async (token: string): Promise<AuthenticatedPrincipal> => {
    jwks ??= (await workos.userManagement.getJWKS()) ?? undefined;
    if (!jwks) throw new Error('WorkOS JWKS is unavailable');
    return verifyWorkOSAccessToken(token, jwks, verification);
  };
}

export class WorkOSSessionProvider implements IdentitySessionProviderPort {
  private readonly userManagement: WorkOSSessionApi;
  private readonly events: WorkOSSessionEventsApi;
  private readonly maxSessionPages: number;
  private readonly maxSessionEventPages: number;
  private readonly sessionDeadlineMs: number;

  constructor(
    apiKey: string,
    clientId: string,
    issuer: string,
    options: {
      api?: WorkOSSessionApi;
      eventsApi?: WorkOSSessionEventsApi;
      maxSessionPages?: number;
      maxSessionEventPages?: number;
      sessionDeadlineMs?: number;
    } = {},
  ) {
    this.maxSessionPages = options.maxSessionPages ?? defaultSessionPageCap;
    this.maxSessionEventPages = options.maxSessionEventPages ?? defaultSessionEventPageCap;
    this.sessionDeadlineMs = options.sessionDeadlineMs ?? defaultSessionDeadlineMs;
    const workos = new WorkOS(apiKey, {
      clientId,
      issuer,
      timeout: this.sessionDeadlineMs,
      maxRetries: 0,
    });
    this.userManagement = options.api ?? workos.userManagement;
    this.events = options.eventsApi ?? workos.events;
  }

  async listSessions(
    externalSubject: ExternalSubjectReference,
    currentSessionId: string,
  ): Promise<ExternalSession[]> {
    const deadline = Date.now() + this.sessionDeadlineMs;
    const cursors = new Set<string>();
    const sessions: Session[] = [];
    let after: string | undefined;

    for (let pageIndex = 0; pageIndex < this.maxSessionPages; pageIndex += 1) {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) throw new WorkOSSessionListingUnavailableError();
      const page = await withinDeadline(
        this.userManagement.listSessions(externalSubject.subject, {
          limit: sessionPageLimit,
          ...(after ? { after } : {}),
        }),
        remainingMs,
      );
      sessions.push(...page.data);
      const nextCursor = page.listMetadata.after ?? undefined;
      if (!nextCursor) {
        return sessions.map((session) => mapWorkOSSession(session, currentSessionId));
      }
      if (cursors.has(nextCursor)) throw new WorkOSSessionListingUnavailableError();
      cursors.add(nextCursor);
      after = nextCursor;
    }

    throw new WorkOSSessionListingUnavailableError();
  }

  async revokeSession(
    externalSubject: ExternalSubjectReference,
    sessionId: string,
  ): Promise<boolean> {
    const sessions = await this.listSessions(externalSubject, '');
    if (!sessions.some((session) => session.id === sessionId && session.status === 'active')) {
      return false;
    }
    await this.userManagement.revokeSession({ sessionId });
    return true;
  }

  async retrySessionRevocation(
    externalSubject: ExternalSubjectReference,
    sessionId: string,
  ): Promise<boolean> {
    const sessions = await this.listSessions(externalSubject, '');
    if (!sessions.some((session) => session.id === sessionId && session.status === 'active')) {
      return false;
    }
    await this.userManagement.revokeSession({ sessionId });
    return true;
  }

  async reconcileSessionRevocation(
    externalSubject: ExternalSubjectReference,
    sessionId: string,
    intentCreatedAt: string,
  ): Promise<boolean> {
    const createdAt = Date.parse(intentCreatedAt);
    const rangeEnd = Date.now();
    if (
      !Number.isFinite(createdAt) ||
      createdAt > rangeEnd + sessionEventClockSkewMs ||
      createdAt < rangeEnd - sessionEventRetentionMs
    ) {
      throw new WorkOSSessionReconciliationUnavailableError();
    }

    const rangeStart = Math.max(
      createdAt - sessionEventClockSkewMs,
      rangeEnd - sessionEventRetentionMs,
    );
    const deadline = rangeEnd + this.sessionDeadlineMs;
    let pageCount = 0;
    let windowStart = rangeStart;

    while (windowStart <= rangeEnd) {
      const windowEnd = Math.min(windowStart + sessionEventWindowMs, rangeEnd);
      const cursors = new Set<string>();
      let after: string | undefined;

      while (true) {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0 || pageCount >= this.maxSessionEventPages) {
          throw new WorkOSSessionReconciliationUnavailableError();
        }
        pageCount += 1;
        const page = await withinDeadline(
          this.events.listEvents({
            events: ['session.revoked'],
            rangeStart: new Date(windowStart).toISOString(),
            rangeEnd: new Date(windowEnd).toISOString(),
            limit: sessionEventPageLimit,
            order: 'asc',
            ...(after ? { after } : {}),
          }),
          remainingMs,
          () => new WorkOSSessionReconciliationUnavailableError(),
        );
        if (
          page.data.some(
            (event) =>
              event.event === 'session.revoked' &&
              event.data.id === sessionId &&
              event.data.userId === externalSubject.subject,
          )
        ) {
          return true;
        }

        const nextCursor = page.listMetadata.after ?? undefined;
        if (!nextCursor) break;
        if (cursors.has(nextCursor)) throw new WorkOSSessionReconciliationUnavailableError();
        cursors.add(nextCursor);
        after = nextCursor;
      }

      if (windowEnd === rangeEnd) return false;
      windowStart = windowEnd;
    }

    return false;
  }
}

export class WorkOSSessionListingUnavailableError extends Error {
  constructor() {
    super('WorkOS session listing could not be completed within its safety bounds');
    this.name = 'WorkOSSessionListingUnavailableError';
  }
}

export class WorkOSSessionReconciliationUnavailableError extends Error {
  constructor() {
    super('WorkOS session revocation outcome could not be reconciled within its safety bounds');
    this.name = 'WorkOSSessionReconciliationUnavailableError';
  }
}

function withinDeadline<T>(
  operation: Promise<T>,
  deadlineMs: number,
  createTimeoutError: () => Error = () => new WorkOSSessionListingUnavailableError(),
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    operation,
    new Promise<T>((_resolve, reject) => {
      timer = setTimeout(() => reject(createTimeoutError()), deadlineMs);
    }),
  ]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export function mapWorkOSSession(session: Session, currentSessionId: string): ExternalSession {
  return {
    id: session.id,
    status: session.status,
    authMethod: session.authMethod,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    current: session.id === currentSessionId,
    impersonated: Boolean(session.impersonator),
  };
}
