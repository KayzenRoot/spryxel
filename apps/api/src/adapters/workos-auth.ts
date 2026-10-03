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

const sessionPageLimit = 100;
const defaultSessionPageCap = 10;
const defaultSessionDeadlineMs = 5_000;

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
  private readonly maxSessionPages: number;
  private readonly sessionDeadlineMs: number;

  constructor(
    apiKey: string,
    clientId: string,
    issuer: string,
    options: {
      api?: WorkOSSessionApi;
      maxSessionPages?: number;
      sessionDeadlineMs?: number;
    } = {},
  ) {
    this.maxSessionPages = options.maxSessionPages ?? defaultSessionPageCap;
    this.sessionDeadlineMs = options.sessionDeadlineMs ?? defaultSessionDeadlineMs;
    this.userManagement =
      options.api ??
      new WorkOS(apiKey, {
        clientId,
        issuer,
        timeout: this.sessionDeadlineMs,
        maxRetries: 0,
      }).userManagement;
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
    _externalSubject: ExternalSubjectReference,
    sessionId: string,
  ): Promise<boolean> {
    await this.userManagement.revokeSession({ sessionId });
    return true;
  }
}

export class WorkOSSessionListingUnavailableError extends Error {
  constructor() {
    super('WorkOS session listing could not be completed within its safety bounds');
    this.name = 'WorkOSSessionListingUnavailableError';
  }
}

function withinDeadline<T>(operation: Promise<T>, deadlineMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([
    operation,
    new Promise<T>((_resolve, reject) => {
      timer = setTimeout(() => reject(new WorkOSSessionListingUnavailableError()), deadlineMs);
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
