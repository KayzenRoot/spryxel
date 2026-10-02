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
  private readonly workos: WorkOS;

  constructor(apiKey: string, clientId: string, issuer: string) {
    this.workos = new WorkOS(apiKey, { clientId, issuer });
  }

  async listSessions(
    externalSubject: ExternalSubjectReference,
    currentSessionId: string,
  ): Promise<ExternalSession[]> {
    const page = await this.workos.userManagement.listSessions(externalSubject.subject, {
      limit: 100,
    });
    return page.data.map((session) => mapWorkOSSession(session, currentSessionId));
  }

  async revokeSession(
    externalSubject: ExternalSubjectReference,
    sessionId: string,
  ): Promise<boolean> {
    const sessions = await this.listSessions(externalSubject, '');
    if (!sessions.some((session) => session.id === sessionId && session.status === 'active')) {
      return false;
    }
    await this.workos.userManagement.revokeSession({ sessionId });
    return true;
  }
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
