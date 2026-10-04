import { parseRuntimeConfig, type RuntimeConfig } from '@spryxel/config';
import {
  bootstrapIdentity,
  cancelDurableJob,
  createProject,
  createDatabase,
  createSessionRevocationIntent,
  type Database,
  finalizeSessionRevocation,
  getSessionRevocationIntent,
  getProject,
  getDurableJob,
  IdentityRepositoryError,
  listProjects,
  listDurableJobs,
  DurableJobRepositoryError,
  ProjectRepositoryError,
  listIdentityMemberships,
  markSessionRevocationProviderConfirmed,
  markSessionRevocationRetryable,
} from '@spryxel/db';
import {
  canCreateProject,
  type DurableJobRepositoryPort,
  type ProjectRepositoryPort,
} from '@spryxel/domain';
import type {
  AuthenticatedPrincipal,
  IdentityRepositoryPort,
  IdentitySessionProviderPort,
} from '@spryxel/identity';
import {
  idempotencyKeyPattern,
  jobListQuerySchema,
  projectJobListQuerySchema,
  projectCreateRequestSchema,
  projectIdPattern,
  requestIdPattern,
  type ReadinessDependency,
  type ServiceName,
} from '@spryxel/contracts';
import { summarizeReadiness } from '@spryxel/domain';
import { createLogger } from '@spryxel/observability';
import Fastify from 'fastify';
import { createHash, randomUUID } from 'node:crypto';
import { InvalidAccessTokenError } from './auth/jwt.js';
import { createWorkOSAuthenticator, WorkOSSessionProvider } from './adapters/workos-auth.js';
import { DrizzlePostgresReadinessProbe } from './adapters/postgres-readiness.js';
import { RedisTransientReadinessProbe } from './adapters/redis-readiness.js';
import { S3CompatibleStorageProbe } from './adapters/s3-storage.js';

export type ApiServerDependencies = {
  authenticateToken?: ((token: string) => Promise<AuthenticatedPrincipal>) | undefined;
  database?: Database | undefined;
  identityRepository?: IdentityRepositoryPort | undefined;
  logger?: import('fastify').FastifyBaseLogger | undefined;
  projectRepository?: ProjectRepositoryPort | undefined;
  jobRepository?: DurableJobRepositoryPort | undefined;
  sessionProvider?: IdentitySessionProviderPort | undefined;
};

type ProjectRequestContext = {
  subjectId: string;
  tenantId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
};

declare module 'fastify' {
  interface FastifyRequest {
    spryxelPrincipal: AuthenticatedPrincipal | null;
  }
}

export function buildApiServer(config: RuntimeConfig, dependencies: ApiServerDependencies = {}) {
  const logger = createLogger({ level: config.logLevel, name: 'spryxel-api' });
  const app = Fastify({
    loggerInstance: dependencies.logger ?? logger,
    genReqId: (request) => {
      const supplied = request.headers['x-request-id'];
      return typeof supplied === 'string' && requestIdPattern.test(supplied)
        ? supplied
        : randomUUID();
    },
  });
  app.decorateRequest('spryxelPrincipal', null);

  const database =
    dependencies.database ?? (config.databaseUrl ? createDatabase(config.databaseUrl) : undefined);
  if (database) {
    app.addHook('onReady', async () => database.validateRuntimeRole());
    app.addHook('onClose', async () => database.close());
  }

  const authenticateToken = dependencies.authenticateToken ?? createWorkOSAuthenticator(config);
  const identityRepository =
    dependencies.identityRepository ??
    (database
      ? {
          bootstrap: (principal: AuthenticatedPrincipal, requestId: string) =>
            bootstrapIdentity(database, principal, requestId),
          listMemberships: (subjectId: string) => listIdentityMemberships(database, subjectId),
          getSessionRevocationIntent: (input: {
            subjectId: string;
            tenantId: string;
            sessionId: string;
          }) => getSessionRevocationIntent(database, input),
          createSessionRevocationIntent: (input: {
            subjectId: string;
            tenantId: string;
            sessionId: string;
            requestId: string;
          }) => createSessionRevocationIntent(database, input),
          markSessionRevocationRetryable: (input: {
            intentId: string;
            subjectId: string;
            tenantId: string;
            reason: 'provider_unavailable' | 'provider_not_confirmed';
          }) => markSessionRevocationRetryable(database, input),
          markSessionRevocationProviderConfirmed: (input: {
            intentId: string;
            subjectId: string;
            tenantId: string;
          }) => markSessionRevocationProviderConfirmed(database, input),
          finalizeSessionRevocation: (input: {
            intentId: string;
            subjectId: string;
            tenantId: string;
          }) => finalizeSessionRevocation(database, input),
        }
      : undefined);
  const projectRepository =
    dependencies.projectRepository ??
    (database
      ? {
          create: (input: Parameters<ProjectRepositoryPort['create']>[0]) =>
            createProject(database, input),
          list: (input: Parameters<ProjectRepositoryPort['list']>[0]) =>
            listProjects(database, input),
          get: (input: Parameters<ProjectRepositoryPort['get']>[0]) => getProject(database, input),
        }
      : undefined);
  const jobRepository =
    dependencies.jobRepository ??
    (database
      ? {
          list: (input: Parameters<DurableJobRepositoryPort['list']>[0]) =>
            listDurableJobs(database, input),
          get: (input: Parameters<DurableJobRepositoryPort['get']>[0]) =>
            getDurableJob(database, input),
          cancel: (input: Parameters<DurableJobRepositoryPort['cancel']>[0]) =>
            cancelDurableJob(database, input),
        }
      : undefined);
  const sessionProvider =
    dependencies.sessionProvider ??
    (config.workosApiKey && config.workosClientId && config.workosIssuer
      ? new WorkOSSessionProvider(config.workosApiKey, config.workosClientId, config.workosIssuer)
      : undefined);

  app.addHook('onRequest', async (request, reply) => {
    reply.header('x-request-id', request.id);
  });

  app.get('/healthz', async (request) => ({
    service: 'api' satisfies ServiceName,
    status: 'ok' as const,
    requestId: request.id,
  }));

  app.get('/readyz', async (request, reply) => {
    const databaseUrl = config.databaseUrl;
    const redisUrl = config.redisUrl;
    const dependencyResults = await Promise.all([
      runProbe('postgres', databaseUrl, () => {
        if (!databaseUrl) return Promise.resolve();
        if (!database) return Promise.reject(new Error('Database is unavailable'));
        return new DrizzlePostgresReadinessProbe(database).ping();
      }),
      runProbe('redis', redisUrl, () => {
        if (!redisUrl) return Promise.resolve();
        return new RedisTransientReadinessProbe(redisUrl).ping();
      }),
      runProbe('object-storage', config.s3Endpoint, () =>
        new S3CompatibleStorageProbe(config).probe(),
      ),
    ]);
    const status = summarizeReadiness(
      dependencyResults.map((dependency) => ({ name: dependency.name, state: dependency.status })),
    );
    return reply.code(status === 'ready' ? 200 : 503).send({
      service: 'api',
      status,
      dependencies: dependencyResults,
      requestId: request.id,
    });
  });

  app.get('/v1/me', { preHandler: authenticateRequest }, async (request, reply) => {
    if (!identityRepository)
      return unavailableProblem(reply, request.id, 'identity_store_unavailable');
    const principal = request.spryxelPrincipal;
    if (!principal || principal.impersonated) {
      return forbiddenProblem(reply, request.id, 'impersonation_not_supported');
    }
    try {
      const identity = await identityRepository.bootstrap(principal, request.id);
      request.log.info(
        { event: 'identity.bootstrap', subjectId: identity.subjectId, tenantId: identity.tenantId },
        'identity bootstrap resolved',
      );
      return reply.send({
        subjectId: identity.subjectId,
        tenantId: identity.tenantId,
        role: identity.role,
      });
    } catch (error) {
      if (error instanceof IdentityRepositoryError && error.code === 'identity_suspended') {
        return forbiddenProblem(reply, request.id, 'identity_suspended');
      }
      request.log.error(
        { event: 'identity.bootstrap_failed', requestId: request.id },
        'identity bootstrap failed',
      );
      return unavailableProblem(reply, request.id, 'identity_store_unavailable');
    }
  });

  app.get('/v1/me/memberships', { preHandler: authenticateRequest }, async (request, reply) => {
    if (!identityRepository)
      return unavailableProblem(reply, request.id, 'identity_store_unavailable');
    const principal = request.spryxelPrincipal;
    if (!principal || principal.impersonated) {
      return forbiddenProblem(reply, request.id, 'impersonation_not_supported');
    }
    try {
      const identity = await identityRepository.bootstrap(principal, request.id);
      const memberships = await identityRepository.listMemberships(identity.subjectId);
      return reply.send({ memberships });
    } catch {
      return unavailableProblem(reply, request.id, 'identity_store_unavailable');
    }
  });

  app.get('/api/v1/projects', { preHandler: authenticateRequest }, async (request, reply) => {
    if (!identityRepository || !projectRepository) {
      return projectProblem(
        reply,
        503,
        'project_store_unavailable',
        'Projects are unavailable',
        request.id,
      );
    }
    const context = await resolveProjectContext(request, reply);
    if (!context) return;
    try {
      const projects = await projectRepository.list({
        subjectId: context.subjectId,
        tenantId: context.tenantId,
      });
      return reply.send({ tenantId: context.tenantId, role: context.role, projects });
    } catch (error) {
      return handleProjectRepositoryError(request, reply, error);
    }
  });

  app.post('/api/v1/projects', { preHandler: authenticateRequest }, async (request, reply) => {
    if (!identityRepository || !projectRepository) {
      return projectProblem(
        reply,
        503,
        'project_store_unavailable',
        'Projects are unavailable',
        request.id,
      );
    }
    const context = await resolveProjectContext(request, reply);
    if (!context) return;
    if (!canCreateProject(context.role)) {
      return projectProblem(
        reply,
        403,
        'project_creation_forbidden',
        'Workspace Owners and Admins can create projects',
        request.id,
      );
    }

    const parsedBody = projectCreateRequestSchema.safeParse(request.body);
    if (!parsedBody.success) {
      return projectProblem(
        reply,
        400,
        'invalid_project_request',
        'Provide a project name between 1 and 120 characters',
        request.id,
      );
    }
    const idempotencyKey = request.headers['idempotency-key'];
    if (typeof idempotencyKey !== 'string' || !idempotencyKeyPattern.test(idempotencyKey)) {
      return projectProblem(
        reply,
        400,
        'idempotency_key_required',
        'Provide a valid Idempotency-Key header',
        request.id,
      );
    }
    const name = parsedBody.data.name;
    const requestHash = createHash('sha256').update(JSON.stringify({ name })).digest('hex');
    const idempotencyKeyHash = createHash('sha256').update(idempotencyKey).digest('hex');
    try {
      const project = await projectRepository.create({
        idempotencyKeyHash,
        requestHash,
        subjectId: context.subjectId,
        tenantId: context.tenantId,
        requestId: request.id,
        name,
      });
      return reply.code(201).send({ tenantId: context.tenantId, role: context.role, project });
    } catch (error) {
      return handleProjectRepositoryError(request, reply, error);
    }
  });

  app.get<{ Params: { projectId: string } }>(
    '/api/v1/projects/:projectId',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      if (!identityRepository || !projectRepository) {
        return projectProblem(
          reply,
          503,
          'project_store_unavailable',
          'Projects are unavailable',
          request.id,
        );
      }
      if (!projectIdPattern.test(request.params.projectId)) {
        return projectProblem(reply, 404, 'project_not_found', 'Project not found', request.id);
      }
      const context = await resolveProjectContext(request, reply);
      if (!context) return;
      try {
        const project = await projectRepository.get({
          subjectId: context.subjectId,
          tenantId: context.tenantId,
          projectId: request.params.projectId,
        });
        if (!project) {
          return projectProblem(reply, 404, 'project_not_found', 'Project not found', request.id);
        }
        return reply.send({ tenantId: context.tenantId, role: context.role, project });
      } catch (error) {
        return handleProjectRepositoryError(request, reply, error);
      }
    },
  );

  app.get<{ Params: { projectId: string }; Querystring: { limit?: string; cursor?: string } }>(
    '/api/v1/projects/:projectId/jobs',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      if (!jobRepository)
        return jobProblem(reply, 503, 'job_store_unavailable', 'Jobs are unavailable', request.id);
      if (!projectIdPattern.test(request.params.projectId))
        return jobProblem(reply, 404, 'project_not_found', 'Project not found', request.id);
      const context = await resolveProjectContext(request, reply);
      if (!context) return;
      const query = projectJobListQuerySchema.safeParse(request.query);
      if (!query.success)
        return jobProblem(
          reply,
          400,
          'invalid_job_pagination',
          'Job pagination is invalid',
          request.id,
        );
      try {
        return reply.send(
          await jobRepository.list({
            subjectId: context.subjectId,
            tenantId: context.tenantId,
            projectId: request.params.projectId,
            limit: query.data.limit,
            ...(query.data.cursor ? { cursor: query.data.cursor } : {}),
          }),
        );
      } catch (error) {
        return handleJobRepositoryError(request, reply, error);
      }
    },
  );

  app.get<{ Querystring: { limit?: string; cursor?: string; projectId?: string } }>(
    '/api/v1/jobs',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      if (!jobRepository)
        return jobProblem(reply, 503, 'job_store_unavailable', 'Jobs are unavailable', request.id);
      const context = await resolveProjectContext(request, reply);
      if (!context) return;
      const query = jobListQuerySchema.safeParse(request.query);
      if (!query.success)
        return jobProblem(
          reply,
          400,
          'invalid_job_pagination',
          'Job pagination is invalid',
          request.id,
        );
      try {
        return reply.send(
          await jobRepository.list({
            subjectId: context.subjectId,
            tenantId: context.tenantId,
            limit: query.data.limit,
            ...(query.data.cursor ? { cursor: query.data.cursor } : {}),
            ...(query.data.projectId ? { projectId: query.data.projectId } : {}),
          }),
        );
      } catch (error) {
        return handleJobRepositoryError(request, reply, error);
      }
    },
  );

  app.get<{ Params: { projectId: string; jobId: string } }>(
    '/api/v1/projects/:projectId/jobs/:jobId',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      if (!jobRepository)
        return jobProblem(reply, 503, 'job_store_unavailable', 'Jobs are unavailable', request.id);
      if (
        !projectIdPattern.test(request.params.projectId) ||
        !projectIdPattern.test(request.params.jobId)
      ) {
        return jobProblem(reply, 404, 'job_not_found', 'Job not found', request.id);
      }
      const context = await resolveProjectContext(request, reply);
      if (!context) return;
      try {
        const job = await jobRepository.get({
          subjectId: context.subjectId,
          tenantId: context.tenantId,
          projectId: request.params.projectId,
          jobId: request.params.jobId,
        });
        if (!job) return jobProblem(reply, 404, 'job_not_found', 'Job not found', request.id);
        return reply.send({ job });
      } catch (error) {
        return handleJobRepositoryError(request, reply, error);
      }
    },
  );

  app.post<{ Params: { projectId: string; jobId: string } }>(
    '/api/v1/projects/:projectId/jobs/:jobId/cancel',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      if (!jobRepository)
        return jobProblem(reply, 503, 'job_store_unavailable', 'Jobs are unavailable', request.id);
      if (
        !projectIdPattern.test(request.params.projectId) ||
        !projectIdPattern.test(request.params.jobId)
      ) {
        return jobProblem(reply, 404, 'job_not_found', 'Job not found', request.id);
      }
      const context = await resolveProjectContext(request, reply);
      if (!context) return;
      try {
        const job = await jobRepository.cancel({
          subjectId: context.subjectId,
          tenantId: context.tenantId,
          projectId: request.params.projectId,
          jobId: request.params.jobId,
        });
        if (!job) return jobProblem(reply, 404, 'job_not_found', 'Job not found', request.id);
        return reply.send({ job });
      } catch (error) {
        return handleJobRepositoryError(request, reply, error);
      }
    },
  );

  app.get('/v1/me/sessions', { preHandler: authenticateRequest }, async (request, reply) => {
    const principal = request.spryxelPrincipal;
    if (!principal || principal.impersonated) {
      return forbiddenProblem(reply, request.id, 'impersonation_not_supported');
    }
    if (!sessionProvider)
      return unavailableProblem(reply, request.id, 'session_management_unavailable');
    try {
      const sessions = await sessionProvider.listSessions(
        principal.externalSubject,
        principal.externalSession.session,
      );
      return reply.send({ sessions });
    } catch {
      return unavailableProblem(reply, request.id, 'session_management_unavailable');
    }
  });

  app.delete<{ Params: { sessionId: string } }>(
    '/v1/me/sessions/:sessionId',
    { preHandler: authenticateRequest },
    async (request, reply) => {
      const principal = request.spryxelPrincipal;
      if (!principal || principal.impersonated) {
        return forbiddenProblem(reply, request.id, 'impersonation_not_supported');
      }
      if (!sessionProvider || !identityRepository) {
        return unavailableProblem(reply, request.id, 'session_management_unavailable');
      }
      const sessionId = request.params.sessionId;
      if (!sessionId || sessionId.length > 255) {
        return notFoundProblem(reply, request.id);
      }
      let identity: Awaited<ReturnType<IdentityRepositoryPort['bootstrap']>>;
      try {
        identity = await identityRepository.bootstrap(principal, request.id);
      } catch (error) {
        if (error instanceof IdentityRepositoryError && error.code === 'identity_suspended') {
          return forbiddenProblem(reply, request.id, 'identity_suspended');
        }
        request.log.error(
          { event: 'session.revocation_identity_validation_failed', requestId: request.id },
          'session revocation identity validation failed',
        );
        return unavailableProblem(reply, request.id, 'session_management_unavailable');
      }

      const scope = {
        subjectId: identity.subjectId,
        tenantId: identity.tenantId,
        sessionId,
      };
      let intent: Awaited<ReturnType<IdentityRepositoryPort['getSessionRevocationIntent']>>;
      let reconcilingExistingIntent = false;
      try {
        intent = await identityRepository.getSessionRevocationIntent(scope);
        reconcilingExistingIntent = intent !== undefined;
      } catch (error) {
        request.log.error(
          {
            event: 'session.revocation_intent_lookup_failed',
            requestId: request.id,
            subjectId: identity.subjectId,
            tenantId: identity.tenantId,
            errorType: safeErrorType(error),
          },
          'session revocation intent lookup failed',
        );
        return unavailableProblem(reply, request.id, 'session_management_unavailable');
      }

      if (!intent) {
        try {
          const sessions = await sessionProvider.listSessions(
            principal.externalSubject,
            principal.externalSession.session,
          );
          if (
            !sessions.some((session) => session.id === sessionId && session.status === 'active')
          ) {
            return notFoundProblem(reply, request.id);
          }
        } catch {
          return unavailableProblem(reply, request.id, 'session_management_unavailable');
        }

        try {
          intent = await identityRepository.createSessionRevocationIntent({
            ...scope,
            requestId: request.id,
          });
        } catch (error) {
          request.log.error(
            {
              event: 'session.revocation_intent_persistence_failed',
              requestId: request.id,
              subjectId: identity.subjectId,
              tenantId: identity.tenantId,
              errorType: safeErrorType(error),
            },
            'session revocation stopped because its repair intent was not persisted',
          );
          return unavailableProblem(reply, request.id, 'session_management_unavailable');
        }
      }

      const intentScope = {
        intentId: intent.id,
        subjectId: identity.subjectId,
        tenantId: identity.tenantId,
      };
      if (intent.status === 'finalized') return reply.code(204).send();

      if (intent.status === 'provider_confirmed') {
        try {
          await identityRepository.finalizeSessionRevocation(intentScope);
        } catch (error) {
          logRevocationReconciliationRequired(request, identity, error);
        }
        return reply.code(204).send();
      }

      if (reconcilingExistingIntent) {
        let providerEventConfirmed = false;
        try {
          providerEventConfirmed = await sessionProvider.reconcileSessionRevocation(
            principal.externalSubject,
            sessionId,
            intent.createdAt,
          );
        } catch (error) {
          request.log.error(
            {
              event: 'session.revocation_provider_outcome_reconciliation_failed',
              requestId: request.id,
              subjectId: identity.subjectId,
              tenantId: identity.tenantId,
              errorType: safeErrorType(error),
            },
            'provider session revocation outcome could not be reconciled',
          );
          return unavailableProblem(reply, request.id, 'session_management_unavailable');
        }

        if (providerEventConfirmed) {
          try {
            await identityRepository.markSessionRevocationProviderConfirmed(intentScope);
          } catch (error) {
            logRevocationReconciliationRequired(request, identity, error);
            return reply.code(204).send();
          }
          try {
            await identityRepository.finalizeSessionRevocation(intentScope);
          } catch (error) {
            logRevocationReconciliationRequired(request, identity, error);
          }
          return reply.code(204).send();
        }

        // A pending intent may represent a successful provider revoke whose local
        // confirmation write failed. Never infer success by replaying that revoke.
        if (intent.status === 'pending') {
          return unavailableProblem(reply, request.id, 'session_management_unavailable');
        }
      }

      try {
        const providerConfirmed = reconcilingExistingIntent
          ? await sessionProvider.retrySessionRevocation(principal.externalSubject, sessionId)
          : await sessionProvider.revokeSession(principal.externalSubject, sessionId);
        if (!providerConfirmed) {
          try {
            await identityRepository.markSessionRevocationRetryable({
              ...intentScope,
              reason: 'provider_not_confirmed',
            });
          } catch {
            // The original durable intent remains pending if this state update is unavailable.
          }
          return reconcilingExistingIntent
            ? unavailableProblem(reply, request.id, 'session_management_unavailable')
            : notFoundProblem(reply, request.id);
        }
      } catch {
        try {
          await identityRepository.markSessionRevocationRetryable({
            ...intentScope,
            reason: 'provider_unavailable',
          });
        } catch {
          // The original durable intent remains pending if this state update is unavailable.
        }
        return unavailableProblem(reply, request.id, 'session_management_unavailable');
      }

      try {
        await identityRepository.markSessionRevocationProviderConfirmed(intentScope);
      } catch (error) {
        logRevocationReconciliationRequired(request, identity, error);
        return reply.code(204).send();
      }

      try {
        await identityRepository.finalizeSessionRevocation(intentScope);
      } catch (error) {
        logRevocationReconciliationRequired(request, identity, error);
        return reply.code(204).send();
      }
      request.log.info(
        { event: 'session.revoked', subjectId: identity.subjectId, tenantId: identity.tenantId },
        'provider session revoked',
      );
      return reply.code(204).send();
    },
  );

  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error, requestId: request.id }, 'request failed');
    reply.code(500).send({ error: 'internal_error', requestId: request.id });
  });

  return app;

  async function authenticateRequest(
    request: import('fastify').FastifyRequest,
    reply: import('fastify').FastifyReply,
  ) {
    const token = extractBearerToken(request.headers.authorization);
    if (!token) return unauthorizedProblem(reply, request.id, 'authentication_required');
    if (!authenticateToken)
      return unavailableProblem(reply, request.id, 'authentication_unavailable');
    try {
      request.spryxelPrincipal = await authenticateToken(token);
    } catch (error) {
      if (error instanceof InvalidAccessTokenError) {
        return unauthorizedProblem(reply, request.id, 'invalid_access_token');
      }
      return unavailableProblem(reply, request.id, 'authentication_unavailable');
    }
  }

  async function resolveProjectContext(
    request: import('fastify').FastifyRequest,
    reply: import('fastify').FastifyReply,
  ): Promise<ProjectRequestContext | null> {
    const principal = request.spryxelPrincipal;
    if (!principal || principal.impersonated) {
      projectProblem(
        reply,
        403,
        'impersonation_not_supported',
        'Project access is unavailable',
        request.id,
      );
      return null;
    }
    if (!identityRepository) {
      projectProblem(
        reply,
        503,
        'project_store_unavailable',
        'Projects are unavailable',
        request.id,
      );
      return null;
    }
    try {
      const identity = await identityRepository.bootstrap(principal, request.id);
      const memberships = await identityRepository.listMemberships(identity.subjectId);
      const requestedTenantId = request.headers['x-tenant-id'];
      if (typeof requestedTenantId === 'string' && !projectIdPattern.test(requestedTenantId)) {
        projectProblem(reply, 404, 'workspace_not_found', 'Workspace not found', request.id);
        return null;
      }
      const membership = memberships.find(
        (candidate) =>
          candidate.active &&
          candidate.tenantId ===
            (typeof requestedTenantId === 'string' ? requestedTenantId : identity.tenantId),
      );
      if (!membership) {
        projectProblem(reply, 404, 'workspace_not_found', 'Workspace not found', request.id);
        return null;
      }
      return {
        subjectId: identity.subjectId,
        tenantId: membership.tenantId,
        role: membership.role,
      };
    } catch (error) {
      if (error instanceof IdentityRepositoryError && error.code === 'identity_suspended') {
        projectProblem(
          reply,
          403,
          'identity_suspended',
          'Project access is unavailable',
          request.id,
        );
        return null;
      }
      request.log.error(
        {
          event: 'projects.identity_resolution_failed',
          requestId: request.id,
          errorType: safeErrorType(error),
        },
        'project identity resolution failed',
      );
      projectProblem(
        reply,
        503,
        'project_store_unavailable',
        'Projects are unavailable',
        request.id,
      );
      return null;
    }
  }

  function handleProjectRepositoryError(
    request: import('fastify').FastifyRequest,
    reply: import('fastify').FastifyReply,
    error: unknown,
  ) {
    if (error instanceof ProjectRepositoryError) {
      switch (error.code) {
        case 'membership_required':
        case 'project_not_found':
          return projectProblem(reply, 404, 'project_not_found', 'Project not found', request.id);
        case 'insufficient_role':
          return projectProblem(
            reply,
            403,
            'project_creation_forbidden',
            'Workspace Owners and Admins can create projects',
            request.id,
          );
        case 'idempotency_conflict':
          return projectProblem(
            reply,
            409,
            'idempotency_conflict',
            'This request key was already used for different project details',
            request.id,
          );
      }
    }
    request.log.error(
      {
        event: 'projects.repository_unavailable',
        requestId: request.id,
        errorType: safeErrorType(error),
      },
      'project repository request failed',
    );
    return projectProblem(
      reply,
      503,
      'project_store_unavailable',
      'Projects are unavailable',
      request.id,
    );
  }

  function handleJobRepositoryError(
    request: import('fastify').FastifyRequest,
    reply: import('fastify').FastifyReply,
    error: unknown,
  ) {
    if (error instanceof DurableJobRepositoryError && error.code === 'job_not_found') {
      return jobProblem(reply, 404, 'job_not_found', 'Job not found', request.id);
    }
    request.log.error(
      {
        event: 'jobs.repository_unavailable',
        requestId: request.id,
        errorType: safeErrorType(error),
      },
      'durable Job request failed',
    );
    return jobProblem(reply, 503, 'job_store_unavailable', 'Jobs are unavailable', request.id);
  }
}

function logRevocationReconciliationRequired(
  request: import('fastify').FastifyRequest,
  identity: { subjectId: string; tenantId: string },
  error: unknown,
): void {
  request.log.error(
    {
      event: 'session.revocation_audit_reconciliation_required',
      requestId: request.id,
      subjectId: identity.subjectId,
      tenantId: identity.tenantId,
      errorType: safeErrorType(error),
    },
    'provider session revoked but durable security-event finalization is pending',
  );
}

async function runProbe(
  name: ReadinessDependency['name'],
  configuredValue: string | undefined,
  probe: () => Promise<void>,
): Promise<ReadinessDependency> {
  if (!configuredValue) return { name, status: 'disabled' };
  try {
    await withTimeout(probe(), 2_500);
    return { name, status: 'ready' };
  } catch {
    return { name, status: 'unavailable' };
  }
}

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Readiness probe timed out')), timeoutMs);
    operation.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export function readApiConfig(source: NodeJS.ProcessEnv = process.env): RuntimeConfig {
  return parseRuntimeConfig(source, 'api');
}

function extractBearerToken(header: string | string[] | undefined): string | undefined {
  if (typeof header !== 'string' || header.length > 16_400) return undefined;
  const match = /^Bearer ([A-Za-z0-9._~-]{1,16384})$/i.exec(header);
  return match?.[1];
}

function safeErrorType(error: unknown): string {
  const name = error instanceof Error ? error.name : 'Error';
  return /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(name) ? name : 'Error';
}

function unauthorizedProblem(
  reply: import('fastify').FastifyReply,
  requestId: string,
  detail: string,
) {
  reply.header('www-authenticate', 'Bearer realm="spryxel-api"');
  return problem(reply, 401, 'Authentication required', detail, requestId);
}

function forbiddenProblem(
  reply: import('fastify').FastifyReply,
  requestId: string,
  detail: string,
) {
  return problem(reply, 403, 'Forbidden', detail, requestId);
}

function notFoundProblem(reply: import('fastify').FastifyReply, requestId: string) {
  return problem(reply, 404, 'Not found', 'The requested session is unavailable', requestId);
}

function unavailableProblem(
  reply: import('fastify').FastifyReply,
  requestId: string,
  detail: string,
) {
  return problem(reply, 503, 'Service unavailable', detail, requestId);
}

function problem(
  reply: import('fastify').FastifyReply,
  status: number,
  title: string,
  detail: string,
  requestId: string,
) {
  return reply.code(status).type('application/problem+json').send({
    type: 'about:blank',
    title,
    status,
    detail,
    instance: requestId,
    requestId,
  });
}

function projectProblem(
  reply: import('fastify').FastifyReply,
  status: number,
  code: string,
  detail: string,
  requestId: string,
) {
  return reply
    .code(status)
    .type('application/problem+json')
    .send({
      type: 'about:blank',
      title:
        status === 400
          ? 'Invalid request'
          : status === 403
            ? 'Forbidden'
            : status === 404
              ? 'Not found'
              : status === 409
                ? 'Conflict'
                : 'Service unavailable',
      status,
      code,
      detail,
      instance: requestId,
      requestId,
    });
}

function jobProblem(
  reply: import('fastify').FastifyReply,
  status: number,
  code: string,
  detail: string,
  requestId: string,
) {
  return reply
    .code(status)
    .type('application/problem+json')
    .send({
      type: 'about:blank',
      title:
        status === 400 ? 'Invalid request' : status === 404 ? 'Not found' : 'Service unavailable',
      status,
      code,
      detail,
      instance: requestId,
      requestId,
    });
}
