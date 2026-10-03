import { createHash } from 'node:crypto';
import { parseRuntimeConfig } from '@spryxel/config';
import type { Project, ProjectRepositoryPort } from '@spryxel/domain';
import type {
  AuthenticatedPrincipal,
  IdentityRepositoryPort,
  IdentitySessionProviderPort,
} from '@spryxel/identity';
import { ProjectRepositoryError } from '@spryxel/db';
import { browserTestAccessToken } from '../apps/web/src/auth/test-session.js';
import { buildApiServer } from '../apps/api/src/server.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('The deterministic browser API fixture cannot run in production');
}

const identities = new Map<string, { subjectId: string; tenantId: string }>();
const projects = new Map<string, Project>();
const idempotency = new Map<string, { requestHash: string; projectId: string }>();
let projectCounter = 0;

function uuidV7From(value: string): string {
  const hex = createHash('sha256').update(value).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-7${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function identityForScope(scope: string) {
  let identity = identities.get(scope);
  if (!identity) {
    identity = {
      subjectId: uuidV7From(`subject:${scope}`),
      tenantId: uuidV7From(`tenant:${scope}`),
    };
    identities.set(scope, identity);
  }
  return identity;
}

const projectRepository: ProjectRepositoryPort = {
  async create(input) {
    const key = `${input.subjectId}:${input.tenantId}:${input.idempotencyKeyHash}`;
    const existing = idempotency.get(key);
    if (existing) {
      if (existing.requestHash !== input.requestHash) {
        throw new ProjectRepositoryError('idempotency_conflict');
      }
      const replay = projects.get(existing.projectId);
      if (!replay) throw new ProjectRepositoryError('project_not_found');
      return replay;
    }
    projectCounter += 1;
    const project: Project = {
      id: uuidV7From(`project:${input.subjectId}:${projectCounter}`),
      tenantId: input.tenantId,
      createdBySubjectId: input.subjectId,
      name: input.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    projects.set(project.id, project);
    idempotency.set(key, { requestHash: input.requestHash, projectId: project.id });
    return project;
  },
  async list(input) {
    return [...projects.values()].filter((project) => project.tenantId === input.tenantId);
  },
  async get(input) {
    const project = projects.get(input.projectId);
    return project?.tenantId === input.tenantId ? project : null;
  },
};

const identityRepository: IdentityRepositoryPort = {
  async bootstrap(authenticatedPrincipal) {
    const scope = authenticatedPrincipal.externalSubject.subject;
    const identity = identityForScope(scope);
    return { ...identity, role: 'OWNER', created: false };
  },
  async listMemberships(requestedSubjectId) {
    const entry = [...identities.entries()].find(
      ([, identity]) => identity.subjectId === requestedSubjectId,
    );
    if (!entry) return [];
    const identity = entry[1];
    return [
      { subjectId: identity.subjectId, tenantId: identity.tenantId, role: 'OWNER', active: true },
    ];
  },
  async getSessionRevocationIntent() {
    return undefined;
  },
  async createSessionRevocationIntent() {
    return { id: 'browser-session-intent', status: 'pending', createdAt: new Date().toISOString() };
  },
  async markSessionRevocationRetryable() {},
  async markSessionRevocationProviderConfirmed() {},
  async finalizeSessionRevocation() {},
};

const sessionProvider: IdentitySessionProviderPort = {
  async listSessions() {
    return [];
  },
  async revokeSession() {
    return false;
  },
  async reconcileSessionRevocation() {
    return false;
  },
  async retrySessionRevocation() {
    return false;
  },
};

const app = buildApiServer(parseRuntimeConfig({ NODE_ENV: 'test', LOG_LEVEL: 'silent' }, 'api'), {
  authenticateToken: async (token) => {
    const prefix = `${browserTestAccessToken}.`;
    const scope = token.startsWith(prefix) ? token.slice(prefix.length) : '';
    if (!/^[A-Za-z0-9_-]{1,48}$/.test(scope)) {
      throw new Error('Browser test identity rejected');
    }
    const identity = identityForScope(scope);
    const principal: AuthenticatedPrincipal = {
      externalSubject: { provider: 'workos', subject: scope },
      externalSession: { provider: 'workos', session: `browser-fixture-${scope}` },
      authTimeSeconds: Math.floor(Date.now() / 1000),
      verifiedAuthenticationMethods: ['pwd'],
      impersonated: false,
    };
    if (!identity.subjectId || !identity.tenantId) throw new Error('Invalid fixture identity');
    return principal;
  },
  identityRepository,
  projectRepository,
  sessionProvider,
});

const port = 3201;
await app.listen({ host: '127.0.0.1', port });
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().finally(() => process.exit(0));
  });
}
