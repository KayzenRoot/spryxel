import { createHash } from 'node:crypto';
import { parseRuntimeConfig } from '@spryxel/config';
import type {
  DurableJobRepositoryPort,
  Project,
  ProjectRepositoryPort,
  SafeJob,
} from '@spryxel/domain';
import type {
  AuthenticatedPrincipal,
  IdentityRepositoryPort,
  IdentitySessionProviderPort,
} from '@spryxel/identity';
import { ProjectRepositoryError } from '@spryxel/db';
import { browserTestAccessToken } from '../apps/web/src/auth/test-session.js';
import { InvalidAccessTokenError } from '../apps/api/src/auth/jwt.js';
import { buildApiServer } from '../apps/api/src/server.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('The deterministic browser API fixture cannot run in production');
}

const identities = new Map<string, { subjectId: string; tenantId: string }>();
const identityScopes = new Map<string, string>();
const projects = new Map<string, Project>();
const jobs = new Map<string, { tenantId: string; job: SafeJob }>();
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
    identityScopes.set(identity.subjectId, scope);
  }
  return identity;
}

function invalidFixtureProject(tenantId: string, subjectId: string): Project {
  return {
    id: 'invalid-project-id',
    tenantId,
    createdBySubjectId: subjectId,
    name: 'Fixture private project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function ensureJobsProject(scope: string, tenantId: string, subjectId: string): Project {
  const id = uuidV7From(`project:${scope}:durable-jobs`);
  const existing = projects.get(id);
  if (existing) return existing;
  const project: Project = {
    id,
    tenantId,
    createdBySubjectId: subjectId,
    name: 'Jobs demo project',
    createdAt: new Date('2026-10-01T12:00:00.000Z').toISOString(),
    updatedAt: new Date('2026-10-01T12:00:00.000Z').toISOString(),
  };
  projects.set(id, project);
  return project;
}

function ensureJobsFixture(
  scope: string,
  tenantId: string,
  projectId: string,
): SafeJob | undefined {
  const fixtureStatus =
    scope === 'jobs-populated' ||
    scope === 'jobs-mobile' ||
    scope === 'jobs-cancel-raced' ||
    scope === 'jobs-cancel-unavailable'
      ? 'queued'
      : scope.startsWith('jobs-')
        ? scope.slice(5).replaceAll('-', '_')
        : '';
  if (
    !['queued', 'running', 'cancel_requested', 'succeeded', 'failed', 'cancelled'].includes(
      fixtureStatus,
    )
  )
    return undefined;
  const id = uuidV7From(`job:${scope}`);
  const existing = jobs.get(id)?.job;
  if (existing) return existing;
  const attemptCount = ['running', 'cancel_requested', 'succeeded', 'failed', 'cancelled'].includes(
    fixtureStatus,
  )
    ? 1
    : 0;
  const job: SafeJob = {
    id,
    projectId,
    operationType: 'asset_contract.integrity_check.v1',
    status: fixtureStatus as SafeJob['status'],
    retryable: fixtureStatus === 'queued',
    cancelEligible: fixtureStatus === 'queued' || fixtureStatus === 'running',
    attemptCount,
    maxAttempts: 3,
    resultCode: fixtureStatus === 'succeeded' ? 'integrity_passed' : null,
    failureCode: fixtureStatus === 'failed' ? 'contract_integrity_mismatch' : null,
    createdAt: '2026-10-01T12:00:00.000Z',
    updatedAt: '2026-10-01T12:01:00.000Z',
    contract: {
      id: uuidV7From(`contract:${scope}`),
      version: 1,
      schemaVersion: 'asset-contract.v1',
      skuId: 'SKU-001',
      specificationSha256: 'a'.repeat(64),
      executionBounds: {
        maxCandidates: 1,
        maxRetries: 2,
        maxRepairs: 0,
        maxWallTimeMs: 5_000,
      },
    },
    attempts:
      attemptCount > 0
        ? [
            {
              id: uuidV7From(`attempt:${scope}`),
              executorKind: 'spryxel.asset_contract.integrity_worker',
              executorVersion: 'v1',
              attemptNumber: 1,
              status:
                fixtureStatus === 'running' || fixtureStatus === 'cancel_requested'
                  ? 'running'
                  : (fixtureStatus as SafeJob['attempts'][number]['status']),
              startedAt: '2026-10-01T12:00:30.000Z',
              completedAt:
                fixtureStatus === 'running' || fixtureStatus === 'cancel_requested'
                  ? null
                  : '2026-10-01T12:01:00.000Z',
              failureCode: fixtureStatus === 'failed' ? 'contract_integrity_mismatch' : null,
            },
          ]
        : [],
  };
  jobs.set(id, { tenantId, job });
  return job;
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
    const scope = identityScopes.get(input.subjectId);
    if (scope === 'workspace-403') throw new ProjectRepositoryError('insufficient_role');
    if (scope === 'workspace-502') {
      return [invalidFixtureProject(input.tenantId, input.subjectId)];
    }
    if (scope === 'workspace-503') throw new Error('Browser fixture dependency failure');
    if (scope?.startsWith('jobs-')) ensureJobsProject(scope, input.tenantId, input.subjectId);
    return [...projects.values()].filter((project) => project.tenantId === input.tenantId);
  },
  async get(input) {
    const scope = identityScopes.get(input.subjectId);
    if (scope === 'project-403') throw new ProjectRepositoryError('insufficient_role');
    if (scope === 'project-502') return invalidFixtureProject(input.tenantId, input.subjectId);
    if (scope === 'project-503') throw new Error('Browser fixture dependency failure');
    const project = projects.get(input.projectId);
    return project?.tenantId === input.tenantId ? project : null;
  },
};

const jobRepository: DurableJobRepositoryPort = {
  async list(input) {
    const scope = identityScopes.get(input.subjectId) ?? '';
    if (!scope.startsWith('jobs-')) return { jobs: [] };
    const project = ensureJobsProject(scope, input.tenantId, input.subjectId);
    const fixture = ensureJobsFixture(scope, input.tenantId, project.id);
    const matching = [...jobs.values()]
      .filter(
        (entry) =>
          entry.tenantId === input.tenantId &&
          (!input.projectId || entry.job.projectId === input.projectId),
      )
      .map((entry) => entry.job)
      .filter(
        (job) =>
          scope.startsWith('jobs-') && (scope !== 'jobs-populated' || job.id === fixture?.id),
      )
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, input.limit);
    return { jobs: matching };
  },
  async get(input) {
    const entry = jobs.get(input.jobId);
    return entry?.tenantId === input.tenantId && entry.job.projectId === input.projectId
      ? entry.job
      : null;
  },
  async cancel(input) {
    const entry = jobs.get(input.jobId);
    if (identityScopes.get(input.subjectId) === 'jobs-cancel-unavailable') {
      throw new Error('Fixture Job store is temporarily unavailable');
    }
    if (
      identityScopes.get(input.subjectId) === 'jobs-cancel-raced' &&
      entry?.tenantId === input.tenantId &&
      entry.job.projectId === input.projectId
    ) {
      jobs.set(input.jobId, {
        ...entry,
        job: {
          ...entry.job,
          status: 'cancelled',
          cancelEligible: false,
          retryable: false,
          updatedAt: new Date().toISOString(),
        },
      });
      return null;
    }
    if (
      !entry ||
      entry.tenantId !== input.tenantId ||
      entry.job.projectId !== input.projectId ||
      !entry.job.cancelEligible
    )
      return null;
    const status = entry.job.status === 'running' ? 'cancel_requested' : 'cancelled';
    const job: SafeJob = {
      ...entry.job,
      status,
      retryable: false,
      cancelEligible: false,
      updatedAt: new Date().toISOString(),
    };
    jobs.set(input.jobId, { ...entry, job });
    return job;
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
    if (scope === 'workspace-401' || scope === 'project-401') {
      throw new InvalidAccessTokenError();
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
  jobRepository,
  sessionProvider,
});

const port = 3201;
await app.listen({ host: '127.0.0.1', port });
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void app.close().finally(() => process.exit(0));
  });
}
