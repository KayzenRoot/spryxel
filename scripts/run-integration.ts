import { randomBytes, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { parseRuntimeConfig } from '@spryxel/config';
import {
  bootstrapIdentity,
  createSessionRevocationIntent,
  createDatabase,
  finalizeSessionRevocation,
  getSessionRevocationIntent,
  getMigrationStatus,
  listIdentityMemberships,
  markSessionRevocationRetryable,
  probePostgres,
  runMigrations,
} from '@spryxel/db';
import type { AuthenticatedPrincipal, IdentitySessionProviderPort } from '@spryxel/identity';
import { createRunId, waitFor } from '@spryxel/testkit';
import { BullMqTechnicalQueueProbe } from '@spryxel/worker/queue-probe';
import { buildApiServer } from '../apps/api/src/server.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const composePath = resolve(root, 'infra/compose.yml');
const tempDirectory = await mkdtemp(resolve(tmpdir(), 'spryxel-wo007-imp003-'));
const envPath = resolve(tempDirectory, 'test.env');
const projectName = createRunId('spryxel-wo007-test');
const composeWaitTimeoutSeconds = 90;
const composeCommandTimeoutMs = 105_000;
const composeCleanupTimeoutMs = 30_000;
const diagnosticCommandTimeoutMs = 10_000;
const maxCapturedOutputCharacters = 8_000;
const maxFailureDiagnosticsCharacters = 16_000;
const secrets = {
  postgres: randomBytes(24).toString('hex'),
  databaseApp: randomBytes(24).toString('hex'),
  redis: randomBytes(24).toString('hex'),
  accessKey: randomBytes(16).toString('hex'),
  secretKey: randomBytes(32).toString('hex'),
};
const ports = {
  postgres: await availablePort(),
  redis: await availablePort(),
  s3: await availablePort(),
};
const databaseUrl = `postgresql://spryxel:${secrets.postgres}@127.0.0.1:${ports.postgres}/spryxel_test`;
const appDatabaseUrl = `postgresql://spryxel_app:${secrets.databaseApp}@127.0.0.1:${ports.postgres}/spryxel_test`;
const redisUrl = `redis://:${secrets.redis}@127.0.0.1:${ports.redis}/0`;
const s3Endpoint = `http://127.0.0.1:${ports.s3}`;
const bucket = `spryxel-${randomBytes(8).toString('hex')}`;
const envContent = [
  'POSTGRES_DB=spryxel_test',
  'POSTGRES_USER=spryxel',
  `POSTGRES_PASSWORD=${secrets.postgres}`,
  `DATABASE_APP_PASSWORD=${secrets.databaseApp}`,
  `REDIS_PASSWORD=${secrets.redis}`,
  `S3_ACCESS_KEY_ID=${secrets.accessKey}`,
  `S3_SECRET_ACCESS_KEY=${secrets.secretKey}`,
  `PG_PORT=${ports.postgres}`,
  `REDIS_PORT=${ports.redis}`,
  `S3_PORT=${ports.s3}`,
].join('\n');

const allSecrets = Object.values(secrets);
const s3 = new S3Client({
  endpoint: s3Endpoint,
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: { accessKeyId: secrets.accessKey, secretAccessKey: secrets.secretKey },
});
let primaryError: unknown;
let runtimeDatabase: ReturnType<typeof createDatabase> | undefined;

try {
  await writeFile(envPath, `${envContent}\n`, { mode: 0o600, flag: 'wx' });
  await chmodBestEffort(envPath);
  await runCompose(['config', '--quiet'], 30_000);
  await runCompose(
    [
      'up',
      '--detach',
      '--build',
      '--wait',
      '--wait-timeout',
      String(composeWaitTimeoutSeconds),
      'postgres-test',
    ],
    composeCommandTimeoutMs,
  );
  await assertPostgresUsesEphemeralTmpfs();
  await runCompose(
    [
      'up',
      '--detach',
      '--build',
      '--wait',
      '--wait-timeout',
      String(composeWaitTimeoutSeconds),
      'redis',
      'seaweedfs',
    ],
    composeCommandTimeoutMs,
  );

  let lastS3ProbeFailure = 'no S3 error details captured';
  await Promise.all([
    waitFor(() => probePostgres(appDatabaseUrl).then(() => true), Boolean, {
      label: 'PostgreSQL/Drizzle handshake',
      timeoutMs: 90_000,
      intervalMs: 1_000,
    }),
    waitFor(
      async () => {
        try {
          await s3.send(new ListBucketsCommand({}));
          return true;
        } catch (error) {
          const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
          lastS3ProbeFailure = redact(detail, allSecrets);
          throw error;
        }
      },
      Boolean,
      {
        label: 'SeaweedFS authenticated S3 ListBuckets',
        timeoutMs: 30_000,
        intervalMs: 500,
      },
    ).catch((error: unknown) => {
      throw new Error(`${String(error)}; last S3 failure: ${lastS3ProbeFailure}`);
    }),
  ]);

  const pristineMigrationStatus = await getMigrationStatus(databaseUrl);
  if (
    pristineMigrationStatus.length !== 4 ||
    pristineMigrationStatus.some((migration) => migration.applied)
  ) {
    throw new Error('Pristine PostgreSQL did not report all migrations as unapplied');
  }

  const migrationStatus = await runMigrations(databaseUrl);
  if (migrationStatus.length !== 4 || migrationStatus.some((migration) => !migration.applied)) {
    throw new Error(
      'Disposable PostgreSQL migrations did not apply the technical and identity schemas',
    );
  }
  const repeatStatus = await runMigrations(databaseUrl);
  if (!repeatStatus.every((migration) => migration.applied)) {
    throw new Error('Migration runner was not idempotent');
  }
  const readStatus = await getMigrationStatus(databaseUrl);
  if (readStatus.length !== 4 || readStatus.some((migration) => !migration.applied)) {
    throw new Error('Migration status did not report every applied migration');
  }

  const database = createDatabase(databaseUrl, { max: 1 });
  try {
    const tables = await database.pool.query<{ table_schema: string; table_name: string }>(
      `select table_schema, table_name
       from information_schema.tables
       where table_schema in ('public', 'platform') and table_type = 'BASE TABLE'
       order by table_schema, table_name`,
    );
    const observed = tables.rows.map((row) => `${row.table_schema}.${row.table_name}`);
    const expectedTables = [
      'platform.external_auth_identity',
      'platform.identity_subject',
      'platform.project',
      'platform.project_create_idempotency',
      'platform.security_event',
      'platform.session_revocation_intent',
      'platform.tenant',
      'platform.tenant_membership',
      'public._spryxel_schema_migrations',
    ];
    if (JSON.stringify(observed) !== JSON.stringify(expectedTables)) {
      throw new Error('Disposable PostgreSQL did not contain exactly the admitted identity tables');
    }
  } finally {
    await database.close();
  }

  runtimeDatabase = createDatabase(appDatabaseUrl, { max: 2 });
  const appRuntimeDatabase = runtimeDatabase;
  await appRuntimeDatabase.validateRuntimeRole();
  const runtimeRole = await appRuntimeDatabase.pool.query<{
    current_user: string;
    rolsuper: boolean;
    rolbypassrls: boolean;
  }>(
    `SELECT current_user, role.rolsuper, role.rolbypassrls
     FROM pg_catalog.pg_roles role WHERE role.rolname = current_user`,
  );
  if (
    runtimeRole.rows[0]?.current_user !== 'spryxel_app' ||
    runtimeRole.rows[0].rolsuper ||
    runtimeRole.rows[0].rolbypassrls
  ) {
    throw new Error('Normal API connection did not use the restricted NOBYPASSRLS role');
  }
  await assertApiStartupRejected(await availablePort());

  const principalA: AuthenticatedPrincipal = {
    externalSubject: { provider: 'workos', subject: 'user_integration_a' },
    externalSession: { provider: 'workos', session: 'session_integration_a' },
    authTimeSeconds: Math.floor(Date.now() / 1000) - 30,
    verifiedAuthenticationMethods: ['pwd'],
    impersonated: false,
  };
  const principalB: AuthenticatedPrincipal = {
    externalSubject: { provider: 'workos', subject: 'user_integration_b' },
    externalSession: { provider: 'workos', session: 'session_integration_b' },
    authTimeSeconds: Math.floor(Date.now() / 1000) - 30,
    verifiedAuthenticationMethods: ['pwd'],
    impersonated: false,
  };
  const concurrent = await Promise.all(
    Array.from({ length: 8 }, () =>
      bootstrapIdentity(appRuntimeDatabase, principalA, 'integration-bootstrap'),
    ),
  );
  const [identityA, identityB] = await Promise.all([
    bootstrapIdentity(appRuntimeDatabase, principalA, 'integration-bootstrap'),
    bootstrapIdentity(appRuntimeDatabase, principalB, 'integration-bootstrap'),
  ]);
  if (
    new Set(concurrent.map((result) => result.subjectId)).size !== 1 ||
    new Set(concurrent.map((result) => result.tenantId)).size !== 1 ||
    new Set(concurrent.map((result) => result.role)).size !== 1 ||
    concurrent.some(
      (result) =>
        result.subjectId !== identityA.subjectId || result.tenantId !== identityA.tenantId,
    ) ||
    identityA.subjectId === identityB.subjectId ||
    identityA.tenantId === identityB.tenantId ||
    identityA.role !== 'OWNER' ||
    identityB.role !== 'OWNER'
  ) {
    throw new Error(
      'Concurrent/replayed identity bootstrap did not resolve stable isolated identities',
    );
  }
  const membershipsA = await listIdentityMemberships(appRuntimeDatabase, identityA.subjectId);
  const membershipsB = await listIdentityMemberships(appRuntimeDatabase, identityB.subjectId);
  if (
    membershipsA.length !== 1 ||
    membershipsA[0]?.tenantId !== identityA.tenantId ||
    membershipsA[0]?.role !== 'OWNER' ||
    membershipsB.length !== 1 ||
    membershipsB[0]?.tenantId !== identityB.tenantId
  ) {
    throw new Error('Identity bootstrap did not create one local OWNER membership per subject');
  }

  const memberPrincipal: AuthenticatedPrincipal = {
    externalSubject: { provider: 'workos', subject: 'user_integration_project_member' },
    externalSession: { provider: 'workos', session: 'session_integration_project_member' },
    authTimeSeconds: Math.floor(Date.now() / 1000) - 30,
    verifiedAuthenticationMethods: ['pwd'],
    impersonated: false,
  };
  const suspendedPrincipal: AuthenticatedPrincipal = {
    externalSubject: { provider: 'workos', subject: 'user_integration_project_suspended' },
    externalSession: { provider: 'workos', session: 'session_integration_project_suspended' },
    authTimeSeconds: Math.floor(Date.now() / 1000) - 30,
    verifiedAuthenticationMethods: ['pwd'],
    impersonated: false,
  };
  const [memberIdentity, suspendedIdentity] = await Promise.all([
    bootstrapIdentity(appRuntimeDatabase, memberPrincipal, 'integration-project-member'),
    bootstrapIdentity(appRuntimeDatabase, suspendedPrincipal, 'integration-project-suspended'),
  ]);
  const projectAdminDatabase = createDatabase(databaseUrl, { max: 1 });
  let mainProjectId = '';
  try {
    await projectAdminDatabase.pool.query(
      `INSERT INTO platform.tenant_membership (tenant_id, subject_id, role, status)
       VALUES ($1, $2, 'MEMBER', 'active')
       ON CONFLICT (tenant_id, subject_id)
       DO UPDATE SET role = 'MEMBER', status = 'active'`,
      [identityA.tenantId, memberIdentity.subjectId],
    );
    await projectAdminDatabase.pool.query(
      `UPDATE platform.identity_subject SET status = 'suspended' WHERE id = $1`,
      [suspendedIdentity.subjectId],
    );

    const projectApiDatabase = createDatabase(appDatabaseUrl, { max: 2 });
    const projectServer = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
      database: projectApiDatabase,
      authenticateToken: async (token) => {
        const principalByToken: Record<string, AuthenticatedPrincipal> = {
          'integration-project-owner': principalA,
          'integration-project-other-tenant': principalB,
          'integration-project-member': memberPrincipal,
          'integration-project-suspended': suspendedPrincipal,
        };
        const principal = principalByToken[token];
        if (!principal) throw new Error('Unknown integration token');
        return principal;
      },
    });
    try {
      await projectServer.ready();
      const projectRequest = (
        token: string,
        tenantId: string,
        method: 'GET' | 'POST',
        url: string,
        body?: unknown,
        idempotencyKey?: string,
      ) =>
        projectServer.inject({
          method,
          url,
          headers: {
            authorization: `Bearer ${token}`,
            'x-tenant-id': tenantId,
            ...(idempotencyKey ? { 'idempotency-key': idempotencyKey } : {}),
          },
          ...(body === undefined ? {} : { payload: body }),
        });

      const firstCreate = await projectRequest(
        'integration-project-owner',
        identityA.tenantId,
        'POST',
        '/api/v1/projects',
        { name: '  Integration   Project  ' },
        'project-create-once',
      );
      if (firstCreate.statusCode !== 201) {
        throw new Error(`Owner project creation failed with HTTP ${firstCreate.statusCode}`);
      }
      const createdProject = firstCreate.json<{ project: { id: string; name: string } }>().project;
      mainProjectId = createdProject.id;
      if (createdProject.name !== 'Integration Project') {
        throw new Error('Project name was not normalized before persistence');
      }

      const [sameKeyReplayA, sameKeyReplayB] = await Promise.all([
        projectRequest(
          'integration-project-owner',
          identityA.tenantId,
          'POST',
          '/api/v1/projects',
          { name: 'Integration Project' },
          'project-create-concurrent',
        ),
        projectRequest(
          'integration-project-owner',
          identityA.tenantId,
          'POST',
          '/api/v1/projects',
          { name: ' Integration   Project ' },
          'project-create-concurrent',
        ),
      ]);
      if (
        sameKeyReplayA.statusCode !== 201 ||
        sameKeyReplayB.statusCode !== 201 ||
        sameKeyReplayA.json<{ project: { id: string } }>().project.id !==
          sameKeyReplayB.json<{ project: { id: string } }>().project.id
      ) {
        throw new Error('Concurrent project creation replay did not resolve one durable project');
      }

      const conflictingReplay = await projectRequest(
        'integration-project-owner',
        identityA.tenantId,
        'POST',
        '/api/v1/projects',
        { name: 'Different Project' },
        'project-create-once',
      );
      if (conflictingReplay.statusCode !== 409) {
        throw new Error('Reusing a project idempotency key with a different name was not rejected');
      }

      const ownerList = await projectRequest(
        'integration-project-owner',
        identityA.tenantId,
        'GET',
        '/api/v1/projects',
      );
      if (
        ownerList.statusCode !== 200 ||
        ownerList.json<{ projects: unknown[] }>().projects.length !== 2
      ) {
        throw new Error('Owner project list did not return only the two durable projects');
      }

      const memberList = await projectRequest(
        'integration-project-member',
        identityA.tenantId,
        'GET',
        '/api/v1/projects',
      );
      const memberOpen = await projectRequest(
        'integration-project-member',
        identityA.tenantId,
        'GET',
        `/api/v1/projects/${mainProjectId}`,
      );
      const memberCreate = await projectRequest(
        'integration-project-member',
        identityA.tenantId,
        'POST',
        '/api/v1/projects',
        { name: 'Member Cannot Create' },
        'member-cannot-create',
      );
      if (
        memberList.statusCode !== 200 ||
        memberList.json<{ projects: unknown[] }>().projects.length !== 2 ||
        memberOpen.statusCode !== 200 ||
        memberCreate.statusCode !== 403
      ) {
        throw new Error('Project MEMBER list/read/create authorization matrix failed');
      }

      await projectAdminDatabase.pool.query(
        `UPDATE platform.tenant_membership SET role = 'ADMIN'
         WHERE tenant_id = $1 AND subject_id = $2`,
        [identityA.tenantId, memberIdentity.subjectId],
      );
      const adminCreate = await projectRequest(
        'integration-project-member',
        identityA.tenantId,
        'POST',
        '/api/v1/projects',
        { name: 'Admin Project' },
        'admin-project-create',
      );
      if (adminCreate.statusCode !== 201) {
        throw new Error('Active tenant ADMIN could not create a project');
      }

      const otherTenantList = await projectRequest(
        'integration-project-other-tenant',
        identityB.tenantId,
        'GET',
        '/api/v1/projects',
      );
      const directCrossTenantRead = await projectRequest(
        'integration-project-other-tenant',
        identityB.tenantId,
        'GET',
        `/api/v1/projects/${mainProjectId}`,
      );
      const unjoinedTenantRead = await projectRequest(
        'integration-project-other-tenant',
        identityA.tenantId,
        'GET',
        `/api/v1/projects/${mainProjectId}`,
      );
      if (
        otherTenantList.statusCode !== 200 ||
        otherTenantList.json<{ projects: unknown[] }>().projects.length !== 0 ||
        directCrossTenantRead.statusCode !== 404 ||
        unjoinedTenantRead.statusCode !== 404 ||
        directCrossTenantRead.body.includes(mainProjectId)
      ) {
        throw new Error('Project API exposed a cross-tenant row or confirmed its existence');
      }

      const suspendedRead = await projectRequest(
        'integration-project-suspended',
        suspendedIdentity.tenantId,
        'GET',
        '/api/v1/projects',
      );
      if (suspendedRead.statusCode !== 403) {
        throw new Error('Suspended identity was not denied project access');
      }
    } finally {
      await projectServer.close();
    }

    const projectRlsDatabase = createDatabase(appDatabaseUrl, { max: 1 });
    const projectRlsClient = await projectRlsDatabase.pool.connect();
    try {
      await projectRlsClient.query('BEGIN');
      const absentProjectContext = await projectRlsClient.query('SELECT id FROM platform.project');
      const absentIdempotencyContext = await projectRlsClient.query(
        'SELECT project_id FROM platform.project_create_idempotency',
      );
      await projectRlsClient.query('COMMIT');
      if (absentProjectContext.rowCount !== 0 || absentIdempotencyContext.rowCount !== 0) {
        throw new Error('Project RLS exposed rows without transaction subject/tenant context');
      }

      await projectRlsClient.query('BEGIN');
      await projectRlsClient.query(
        "SELECT set_config('spryxel.subject_id', $1, true), set_config('spryxel.tenant_id', $2, true)",
        [identityB.subjectId, identityB.tenantId],
      );
      const hiddenProject = await projectRlsClient.query(
        'SELECT id FROM platform.project WHERE id = $1',
        [mainProjectId],
      );
      await projectRlsClient.query('SAVEPOINT cross_tenant_project_insert');
      let crossTenantInsertDenied = false;
      try {
        await projectRlsClient.query(
          `INSERT INTO platform.project (id, tenant_id, created_by_subject_id, name)
           VALUES ($1, $2, $3, 'Unauthorized project')`,
          [randomUUID(), identityA.tenantId, identityA.subjectId],
        );
      } catch (error) {
        const code =
          typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
        crossTenantInsertDenied = code === '42501';
        await projectRlsClient.query('ROLLBACK TO SAVEPOINT cross_tenant_project_insert');
      }
      await projectRlsClient.query('COMMIT');
      if (hiddenProject.rowCount !== 0 || !crossTenantInsertDenied) {
        throw new Error('PostgreSQL RLS allowed direct cross-tenant project read or insert');
      }
    } catch (error) {
      await projectRlsClient.query('ROLLBACK');
      throw error;
    } finally {
      projectRlsClient.release();
      await projectRlsDatabase.close();
    }

    const auditProof = await appRuntimeDatabase.pool.connect();
    try {
      await auditProof.query('BEGIN READ ONLY');
      await auditProof.query(
        "SELECT set_config('spryxel.subject_id', $1, true), set_config('spryxel.tenant_id', $2, true)",
        [identityA.subjectId, identityA.tenantId],
      );
      const createdEvents = await auditProof.query<{ count: string; row: string }>(
        `SELECT count(*)::text AS count, min(to_jsonb(event)::text) AS row
         FROM platform.security_event event
         WHERE event.event_type = 'project.created' AND event.project_id = $1`,
        [mainProjectId],
      );
      await auditProof.query('COMMIT');
      const eventRow = createdEvents.rows[0]?.row ?? '';
      if (
        createdEvents.rows[0]?.count !== '1' ||
        /access.?token|refresh.?token|cookie|secret|authorization/i.test(eventRow)
      ) {
        throw new Error(
          'Project creation audit was missing, duplicated or contained credential data',
        );
      }
    } catch (error) {
      await auditProof.query('ROLLBACK');
      throw error;
    } finally {
      auditProof.release();
    }
  } finally {
    await projectAdminDatabase.close();
  }

  const identityRlsDatabase = createDatabase(appDatabaseUrl, { max: 1 });
  try {
    await identityRlsDatabase.pool.query('BEGIN');
    const absentContextSubjects = await identityRlsDatabase.pool.query(
      'SELECT id FROM platform.identity_subject',
    );
    const absentContextMappings = await identityRlsDatabase.pool.query(
      'SELECT provider, external_subject FROM platform.external_auth_identity',
    );
    await identityRlsDatabase.pool.query('COMMIT');

    await identityRlsDatabase.pool.query('BEGIN');
    await identityRlsDatabase.pool.query(
      `SELECT set_config('spryxel.subject_id', $1, true),
              set_config('spryxel.external_provider', $2, true),
              set_config('spryxel.external_subject', $3, true)`,
      [
        identityA.subjectId,
        principalA.externalSubject.provider,
        principalA.externalSubject.subject,
      ],
    );
    const ownSubject = await identityRlsDatabase.pool.query(
      'SELECT id FROM platform.identity_subject WHERE id = $1',
      [identityA.subjectId],
    );
    const otherSubject = await identityRlsDatabase.pool.query(
      'SELECT id FROM platform.identity_subject WHERE id = $1',
      [identityB.subjectId],
    );
    const ownMapping = await identityRlsDatabase.pool.query(
      'SELECT subject_id FROM platform.external_auth_identity WHERE provider = $1 AND external_subject = $2',
      [principalA.externalSubject.provider, principalA.externalSubject.subject],
    );
    const otherMapping = await identityRlsDatabase.pool.query(
      'SELECT subject_id FROM platform.external_auth_identity WHERE provider = $1 AND external_subject = $2',
      [principalB.externalSubject.provider, principalB.externalSubject.subject],
    );
    await identityRlsDatabase.pool.query('COMMIT');

    if (
      absentContextSubjects.rowCount !== 0 ||
      absentContextMappings.rowCount !== 0 ||
      ownSubject.rowCount !== 1 ||
      otherSubject.rowCount !== 0 ||
      ownMapping.rowCount !== 1 ||
      otherMapping.rowCount !== 0
    ) {
      throw new Error('PostgreSQL RLS exposed identity data without matching transaction context');
    }
  } catch (error) {
    await identityRlsDatabase.pool.query('ROLLBACK');
    throw error;
  } finally {
    await identityRlsDatabase.close();
  }

  const retryableRevocationInput = {
    subjectId: identityA.subjectId,
    tenantId: identityA.tenantId,
    sessionId: 'session_retryable_integration_a',
    requestId: 'integration-session-revoke-retry',
  };
  const retryableIntent = await createSessionRevocationIntent(
    appRuntimeDatabase,
    retryableRevocationInput,
  );
  if (retryableIntent.status !== 'pending') {
    throw new Error('New PostgreSQL revocation intent did not begin in pending state');
  }
  await markSessionRevocationRetryable(appRuntimeDatabase, {
    intentId: retryableIntent.id,
    subjectId: identityA.subjectId,
    tenantId: identityA.tenantId,
    reason: 'provider_unavailable',
  });
  const retryableState = await getSessionRevocationIntent(
    appRuntimeDatabase,
    retryableRevocationInput,
  );
  const beforeProviderConfirmation = await appRuntimeDatabase.pool.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM platform.security_event
     WHERE event_type = 'session.revoked' AND external_session_ref = $1`,
    [retryableRevocationInput.sessionId],
  );
  if (retryableState?.status !== 'retryable' || beforeProviderConfirmation.rows[0]?.count !== '0') {
    throw new Error('Provider failure did not remain retryable without a false revoked event');
  }
  let rawProviderErrorRejected = false;
  const intentPrivacyClient = await appRuntimeDatabase.pool.connect();
  try {
    await intentPrivacyClient.query('BEGIN');
    await intentPrivacyClient.query(
      "SELECT set_config('spryxel.subject_id', $1, true), set_config('spryxel.tenant_id', $2, true)",
      [identityA.subjectId, identityA.tenantId],
    );
    await intentPrivacyClient.query('SAVEPOINT raw_provider_error');
    try {
      await intentPrivacyClient.query(
        `UPDATE platform.session_revocation_intent
         SET failure_code = 'provider token secret raw error'
         WHERE id = $1`,
        [retryableIntent.id],
      );
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
      rawProviderErrorRejected = code === '23514';
      await intentPrivacyClient.query('ROLLBACK TO SAVEPOINT raw_provider_error');
    }
    const safeRow = await intentPrivacyClient.query<{ row: string }>(
      `SELECT to_jsonb(intent)::text AS row
       FROM platform.session_revocation_intent intent WHERE id = $1`,
      [retryableIntent.id],
    );
    await intentPrivacyClient.query('COMMIT');
    if (
      !rawProviderErrorRejected ||
      safeRow.rows[0]?.row.includes('provider token secret raw error')
    ) {
      throw new Error('Revocation intent persisted an unsafe raw provider error');
    }
  } catch (error) {
    await intentPrivacyClient.query('ROLLBACK');
    throw error;
  } finally {
    intentPrivacyClient.release();
  }
  let crossTenantIntentDenied = false;
  let crossTenantIntentWriteDenied = false;
  let crossTenantEventLinkDenied = false;
  const intentRlsClient = await appRuntimeDatabase.pool.connect();
  try {
    await intentRlsClient.query('BEGIN');
    await intentRlsClient.query(
      "SELECT set_config('spryxel.subject_id', $1, true), set_config('spryxel.tenant_id', $2, true)",
      [identityB.subjectId, identityB.tenantId],
    );
    const hiddenIntent = await intentRlsClient.query(
      'SELECT id FROM platform.session_revocation_intent WHERE id = $1',
      [retryableIntent.id],
    );
    const crossTenantIntentUpdate = await intentRlsClient.query(
      `UPDATE platform.session_revocation_intent SET status = 'retryable'
       WHERE id = $1`,
      [retryableIntent.id],
    );
    await intentRlsClient.query('SAVEPOINT cross_tenant_revocation_intent');
    try {
      await intentRlsClient.query(
        `INSERT INTO platform.session_revocation_intent
          (id, subject_id, tenant_id, external_session_ref, request_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          randomUUID(),
          identityA.subjectId,
          identityA.tenantId,
          'session_cross_tenant_attempt',
          'integration-cross-tenant',
        ],
      );
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
      crossTenantIntentWriteDenied = code === '42501';
      await intentRlsClient.query('ROLLBACK TO SAVEPOINT cross_tenant_revocation_intent');
    }
    await intentRlsClient.query('SAVEPOINT cross_tenant_revocation_event_link');
    try {
      await intentRlsClient.query(
        `INSERT INTO platform.security_event
          (id, subject_id, tenant_id, event_type, external_session_ref, request_id,
           session_revocation_intent_id)
         VALUES ($1, $2, $3, 'session.revoked', $4, $5, $6)`,
        [
          randomUUID(),
          identityB.subjectId,
          identityB.tenantId,
          'session_cross_tenant_link_attempt',
          'integration-cross-tenant-link',
          retryableIntent.id,
        ],
      );
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
      crossTenantEventLinkDenied = code === '23503';
      await intentRlsClient.query('ROLLBACK TO SAVEPOINT cross_tenant_revocation_event_link');
    }
    await intentRlsClient.query('COMMIT');
    crossTenantIntentDenied = hiddenIntent.rowCount === 0 && crossTenantIntentUpdate.rowCount === 0;
  } catch (error) {
    await intentRlsClient.query('ROLLBACK');
    throw error;
  } finally {
    intentRlsClient.release();
  }
  let crossTenantFinalizationDenied = false;
  try {
    await finalizeSessionRevocation(appRuntimeDatabase, {
      intentId: retryableIntent.id,
      subjectId: identityB.subjectId,
      tenantId: identityB.tenantId,
    });
  } catch (error) {
    crossTenantFinalizationDenied =
      error instanceof Error && error.message === 'Identity repository operation was denied';
  }
  if (
    !crossTenantIntentDenied ||
    !crossTenantIntentWriteDenied ||
    !crossTenantEventLinkDenied ||
    !crossTenantFinalizationDenied
  ) {
    throw new Error(
      'PostgreSQL RLS did not deny cross-tenant revocation intent access/finalization',
    );
  }

  const revocationPoolIsolation = createDatabase(appDatabaseUrl, { max: 1 });
  try {
    await getSessionRevocationIntent(revocationPoolIsolation, retryableRevocationInput);
    await revocationPoolIsolation.pool.query('BEGIN READ ONLY');
    const unscopedIntent = await revocationPoolIsolation.pool.query(
      'SELECT id FROM platform.session_revocation_intent WHERE id = $1',
      [retryableIntent.id],
    );
    const leakedContext = await revocationPoolIsolation.pool.query<{
      subject_id: string | null;
      tenant_id: string | null;
    }>(
      `SELECT NULLIF(current_setting('spryxel.subject_id', true), '') AS subject_id,
              NULLIF(current_setting('spryxel.tenant_id', true), '') AS tenant_id`,
    );
    await revocationPoolIsolation.pool.query('COMMIT');
    if (
      unscopedIntent.rowCount !== 0 ||
      leakedContext.rows[0]?.subject_id ||
      leakedContext.rows[0]?.tenant_id
    ) {
      throw new Error('Reused pooled connection leaked session-revocation RLS context');
    }
  } catch (error) {
    await revocationPoolIsolation.pool.query('ROLLBACK');
    throw error;
  } finally {
    await revocationPoolIsolation.close();
  }

  const revocationInput = {
    subjectId: identityA.subjectId,
    tenantId: identityA.tenantId,
    sessionId: 'session_revoked_integration_a',
    requestId: 'integration-session-revoke',
  };
  const failingSessionRef = revocationInput.sessionId;
  const finalizationFaultDatabase = createDatabase(databaseUrl, { max: 1 });
  const apiRouteDatabase = createDatabase(appDatabaseUrl, { max: 1 });
  let listCalls = 0;
  let revokeCalls = 0;
  let retryCalls = 0;
  const routeApi = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
    database: apiRouteDatabase,
    authenticateToken: async () => principalA,
    sessionProvider: {
      listSessions: async (_subject, currentSessionId) => {
        listCalls += 1;
        return [
          {
            id: failingSessionRef,
            status: 'active' as const,
            authMethod: 'password',
            createdAt: '2026-10-02T11:00:00.000Z',
            expiresAt: '2026-10-03T11:00:00.000Z',
            current: currentSessionId === principalA.externalSession.session,
            impersonated: false,
          },
        ];
      },
      revokeSession: async () => {
        revokeCalls += 1;
        return true;
      },
      reconcileSessionRevocation: async () => false,
      retrySessionRevocation: async () => {
        retryCalls += 1;
        return true;
      },
    },
  });
  let auditTriggerInstalled = false;
  try {
    await finalizationFaultDatabase.pool.query(`
      CREATE FUNCTION public.fail_one_session_revocation_audit() RETURNS trigger
      LANGUAGE plpgsql AS $$
      BEGIN
        IF NEW.external_session_ref = '${failingSessionRef}' THEN
          RAISE EXCEPTION 'transient revocation audit storage fault';
        END IF;
        RETURN NEW;
      END;
      $$
    `);
    await finalizationFaultDatabase.pool.query(`
      CREATE TRIGGER fail_one_session_revocation_audit
      BEFORE INSERT ON platform.security_event
      FOR EACH ROW EXECUTE FUNCTION public.fail_one_session_revocation_audit()
    `);
    auditTriggerInstalled = true;
    await routeApi.ready();
    const request = {
      method: 'DELETE' as const,
      url: `/v1/me/sessions/${failingSessionRef}`,
      headers: {
        authorization: 'Bearer integration-token',
        'x-request-id': revocationInput.requestId,
      },
    };
    const firstRevocation = await routeApi.inject(request);
    const durableRepairHandle = await getSessionRevocationIntent(apiRouteDatabase, revocationInput);
    if (
      firstRevocation.statusCode !== 204 ||
      durableRepairHandle?.status !== 'provider_confirmed'
    ) {
      throw new Error('Confirmed provider revoke did not return 204 with a durable repair handle');
    }
    await finalizationFaultDatabase.pool.query(
      'DROP TRIGGER IF EXISTS fail_one_session_revocation_audit ON platform.security_event',
    );
    await finalizationFaultDatabase.pool.query(
      'DROP FUNCTION IF EXISTS public.fail_one_session_revocation_audit()',
    );
    auditTriggerInstalled = false;

    const reconciled = await routeApi.inject(request);
    const repeatedReconciliation = await routeApi.inject(request);
    const finalIntent = await getSessionRevocationIntent(apiRouteDatabase, revocationInput);
    if (
      reconciled.statusCode !== 204 ||
      repeatedReconciliation.statusCode !== 204 ||
      finalIntent?.status !== 'finalized' ||
      listCalls !== 1 ||
      revokeCalls !== 1 ||
      retryCalls !== 0
    ) {
      throw new Error('Explicit HTTP reconciliation was not deterministic and idempotent');
    }
  } finally {
    await routeApi.close();
    if (auditTriggerInstalled) {
      await finalizationFaultDatabase.pool.query(
        'DROP TRIGGER IF EXISTS fail_one_session_revocation_audit ON platform.security_event',
      );
      await finalizationFaultDatabase.pool.query(
        'DROP FUNCTION IF EXISTS public.fail_one_session_revocation_audit()',
      );
    }
    await finalizationFaultDatabase.close();
  }

  const providerOutcomeSessionRef = 'session_current_revoked_integration';
  const providerOutcomeInput = {
    subjectId: identityA.subjectId,
    tenantId: identityA.tenantId,
    sessionId: providerOutcomeSessionRef,
    requestId: 'integration-c10-session-revoke',
  };
  const providerOutcomeFaultDatabase = createDatabase(databaseUrl, { max: 1 });
  const providerOutcomeApiDatabase = createDatabase(appDatabaseUrl, { max: 1 });
  let outcomeListCalls = 0;
  let outcomeRevokeCalls = 0;
  let outcomeEventCalls = 0;
  let outcomeRetryCalls = 0;
  const initialCurrentSessionPrincipal: AuthenticatedPrincipal = {
    ...principalA,
    externalSession: { provider: 'workos', session: providerOutcomeSessionRef },
  };
  const freshRecoveryPrincipal: AuthenticatedPrincipal = {
    ...principalA,
    externalSession: { provider: 'workos', session: 'session_fresh_recovery_integration' },
  };
  const providerOutcomeApi = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
    database: providerOutcomeApiDatabase,
    authenticateToken: async (token) =>
      token === 'integration-original-current-session'
        ? initialCurrentSessionPrincipal
        : freshRecoveryPrincipal,
    sessionProvider: {
      listSessions: async (_subject, currentSessionId) => {
        outcomeListCalls += 1;
        return [
          {
            id: providerOutcomeSessionRef,
            status: 'active' as const,
            authMethod: 'password',
            createdAt: new Date(Date.now() - 60_000).toISOString(),
            expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
            current: currentSessionId === providerOutcomeSessionRef,
            impersonated: false,
          },
        ];
      },
      revokeSession: async () => {
        outcomeRevokeCalls += 1;
        return true;
      },
      reconcileSessionRevocation: async (externalSubject, sessionId, intentCreatedAt) => {
        outcomeEventCalls += 1;
        return (
          externalSubject.subject === principalA.externalSubject.subject &&
          sessionId === providerOutcomeSessionRef &&
          Number.isFinite(Date.parse(intentCreatedAt))
        );
      },
      retrySessionRevocation: async () => {
        outcomeRetryCalls += 1;
        return true;
      },
    },
  });
  let providerOutcomeTriggerInstalled = false;
  try {
    await providerOutcomeFaultDatabase.pool.query(
      'CREATE SEQUENCE public.fail_one_session_revocation_confirmation_seq START WITH 1',
    );
    await providerOutcomeFaultDatabase.pool.query(`
      CREATE FUNCTION public.fail_one_session_revocation_confirmation() RETURNS trigger
      LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
      BEGIN
        IF NEW.external_session_ref = '${providerOutcomeSessionRef}'
           AND OLD.status = 'pending' AND NEW.status = 'provider_confirmed'
           AND nextval('public.fail_one_session_revocation_confirmation_seq') = 1 THEN
          RAISE EXCEPTION 'transient provider confirmation persistence fault';
        END IF;
        RETURN NEW;
      END;
      $$
    `);
    await providerOutcomeFaultDatabase.pool.query(`
      CREATE TRIGGER fail_one_session_revocation_confirmation
      BEFORE UPDATE OF status ON platform.session_revocation_intent
      FOR EACH ROW EXECUTE FUNCTION public.fail_one_session_revocation_confirmation()
    `);
    providerOutcomeTriggerInstalled = true;
    await providerOutcomeApi.ready();
    const currentSessionRequest = {
      method: 'DELETE' as const,
      url: `/v1/me/sessions/${providerOutcomeSessionRef}`,
      headers: {
        authorization: 'Bearer integration-original-current-session',
        'x-request-id': providerOutcomeInput.requestId,
      },
    };
    const initialOutcome = await providerOutcomeApi.inject(currentSessionRequest);
    const pendingIntent = await getSessionRevocationIntent(
      providerOutcomeApiDatabase,
      providerOutcomeInput,
    );
    const preRecoveryEventCount = await providerOutcomeFaultDatabase.pool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM platform.security_event
       WHERE event_type = 'session.revoked' AND external_session_ref = $1`,
      [providerOutcomeSessionRef],
    );
    if (
      initialOutcome.statusCode !== 204 ||
      initialOutcome.body !== '' ||
      pendingIntent?.status !== 'pending' ||
      preRecoveryEventCount.rows[0]?.count !== '0'
    ) {
      throw new Error(
        'Provider success with failed confirmation write did not preserve a truthful durable pending intent',
      );
    }

    const recoveryRequest = {
      ...currentSessionRequest,
      headers: { authorization: 'Bearer integration-fresh-recovery-session' },
    };
    const recoveredOutcome = await providerOutcomeApi.inject(recoveryRequest);
    const repeatedOutcomeRecovery = await providerOutcomeApi.inject(recoveryRequest);
    const finalizedIntent = await getSessionRevocationIntent(
      providerOutcomeApiDatabase,
      providerOutcomeInput,
    );
    const postRecoveryEventCount = await providerOutcomeFaultDatabase.pool.query<{
      count: string;
    }>(
      `SELECT count(*)::text AS count FROM platform.security_event
       WHERE event_type = 'session.revoked' AND external_session_ref = $1`,
      [providerOutcomeSessionRef],
    );
    if (
      recoveredOutcome.statusCode !== 204 ||
      repeatedOutcomeRecovery.statusCode !== 204 ||
      finalizedIntent?.status !== 'finalized' ||
      postRecoveryEventCount.rows[0]?.count !== '1' ||
      outcomeListCalls !== 1 ||
      outcomeRevokeCalls !== 1 ||
      outcomeEventCalls !== 1 ||
      outcomeRetryCalls !== 0
    ) {
      throw new Error(
        'WorkOS event reconciliation after current-session revoke was not durable and idempotent',
      );
    }
  } finally {
    await providerOutcomeApi.close();
    if (providerOutcomeTriggerInstalled) {
      await providerOutcomeFaultDatabase.pool.query(
        'DROP TRIGGER IF EXISTS fail_one_session_revocation_confirmation ON platform.session_revocation_intent',
      );
      await providerOutcomeFaultDatabase.pool.query(
        'DROP FUNCTION IF EXISTS public.fail_one_session_revocation_confirmation()',
      );
    }
    await providerOutcomeFaultDatabase.pool.query(
      'DROP SEQUENCE IF EXISTS public.fail_one_session_revocation_confirmation_seq',
    );
    await providerOutcomeFaultDatabase.close();
  }

  const ambiguousSessionRef = 'session_ambiguous_retryable_integration_a';
  const ambiguousInput = {
    subjectId: identityA.subjectId,
    tenantId: identityA.tenantId,
    sessionId: ambiguousSessionRef,
    requestId: 'integration-c11-session-revoke',
  };
  const ambiguousApiDatabase = createDatabase(appDatabaseUrl, { max: 1 });
  const ambiguousInspectDatabase = createDatabase(databaseUrl, { max: 1 });
  const ambiguousInitialPrincipal: AuthenticatedPrincipal = {
    ...principalA,
    externalSession: { provider: 'workos', session: ambiguousSessionRef },
  };
  const ambiguousFreshPrincipal: AuthenticatedPrincipal = {
    ...principalA,
    externalSession: { provider: 'workos', session: 'session_c11_fresh_recovery' },
  };
  const ambiguousInitialToken = `integration-c11-initial-${createRunId()}`;
  const ambiguousFreshToken = `integration-c11-fresh-${createRunId()}`;
  let ambiguousListCalls = 0;
  let ambiguousInitialRevokeCalls = 0;
  let ambiguousRetryChecks = 0;
  let ambiguousPermittedRetryCalls = 0;
  let ambiguousEventCalls = 0;
  let ambiguousEventAvailable = false;
  const listAmbiguousSessions: IdentitySessionProviderPort['listSessions'] = async (
    _subject,
    currentSessionId,
  ) => {
    ambiguousListCalls += 1;
    if (ambiguousListCalls !== 1) return [];
    return [
      {
        id: ambiguousSessionRef,
        status: 'active',
        authMethod: 'password',
        createdAt: new Date(Date.now() - 60_000).toISOString(),
        expiresAt: new Date(Date.now() + 60 * 60_000).toISOString(),
        current: currentSessionId === ambiguousSessionRef,
        impersonated: false,
      },
    ];
  };
  const ambiguousSessionProvider: IdentitySessionProviderPort = {
    listSessions: listAmbiguousSessions,
    revokeSession: async () => {
      ambiguousInitialRevokeCalls += 1;
      throw new Error('simulated ambiguous transport failure after delivery');
    },
    reconcileSessionRevocation: async (externalSubject, sessionId, intentCreatedAt) => {
      ambiguousEventCalls += 1;
      return (
        ambiguousEventAvailable &&
        externalSubject.subject === principalA.externalSubject.subject &&
        sessionId === ambiguousSessionRef &&
        Number.isFinite(Date.parse(intentCreatedAt))
      );
    },
    retrySessionRevocation: async (externalSubject, sessionId) => {
      ambiguousRetryChecks += 1;
      const activeSessions = await listAmbiguousSessions(externalSubject, '');
      if (
        !activeSessions.some((session) => session.id === sessionId && session.status === 'active')
      ) {
        return false;
      }
      ambiguousPermittedRetryCalls += 1;
      return true;
    },
  };
  const ambiguousApi = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
    database: ambiguousApiDatabase,
    authenticateToken: async (token) =>
      token === ambiguousInitialToken ? ambiguousInitialPrincipal : ambiguousFreshPrincipal,
    sessionProvider: ambiguousSessionProvider,
  });
  try {
    await ambiguousApi.ready();
    const originalRequest = {
      method: 'DELETE' as const,
      url: `/v1/me/sessions/${ambiguousSessionRef}`,
      headers: {
        authorization: `Bearer ${ambiguousInitialToken}`,
        'x-request-id': ambiguousInput.requestId,
      },
    };
    const originalOutcome = await ambiguousApi.inject(originalRequest);
    const retryableAfterAmbiguity = await getSessionRevocationIntent(
      ambiguousApiDatabase,
      ambiguousInput,
    );
    const eventCountBeforeRecovery = await ambiguousInspectDatabase.pool.query<{ count: string }>(
      `SELECT count(*)::text AS count FROM platform.security_event
       WHERE event_type = 'session.revoked' AND external_session_ref = $1`,
      [ambiguousSessionRef],
    );
    if (
      originalOutcome.statusCode !== 503 ||
      originalOutcome.body.includes('simulated ambiguous transport failure') ||
      retryableAfterAmbiguity?.status !== 'retryable' ||
      eventCountBeforeRecovery.rows[0]?.count !== '0' ||
      ambiguousInitialRevokeCalls !== 1
    ) {
      throw new Error(
        'Ambiguous initial revoke did not preserve a retryable intent without a false event',
      );
    }

    const recoveryRequest = {
      ...originalRequest,
      headers: { authorization: `Bearer ${ambiguousFreshToken}` },
    };
    const absentSessionRecovery = await ambiguousApi.inject(recoveryRequest);
    const retryableAfterAbsentSession = await getSessionRevocationIntent(
      ambiguousApiDatabase,
      ambiguousInput,
    );
    const eventCountAfterAbsentSession = await ambiguousInspectDatabase.pool.query<{
      count: string;
    }>(
      `SELECT count(*)::text AS count FROM platform.security_event
       WHERE event_type = 'session.revoked' AND external_session_ref = $1`,
      [ambiguousSessionRef],
    );
    if (
      absentSessionRecovery.statusCode !== 503 ||
      retryableAfterAbsentSession?.status !== 'retryable' ||
      eventCountAfterAbsentSession.rows[0]?.count !== '0' ||
      ambiguousRetryChecks !== 1 ||
      ambiguousPermittedRetryCalls !== 0 ||
      ambiguousInitialRevokeCalls !== 1
    ) {
      throw new Error(
        'Absent active session replayed an ambiguous revoke or created a false event',
      );
    }

    ambiguousEventAvailable = true;
    const delayedEventRecovery = await ambiguousApi.inject(recoveryRequest);
    const repeatedDelayedEventRecovery = await ambiguousApi.inject(recoveryRequest);
    const finalizedAmbiguousIntent = await getSessionRevocationIntent(
      ambiguousApiDatabase,
      ambiguousInput,
    );
    const finalAmbiguousEventCount = await ambiguousInspectDatabase.pool.query<{
      count: string;
    }>(
      `SELECT count(*)::text AS count FROM platform.security_event
       WHERE event_type = 'session.revoked' AND external_session_ref = $1`,
      [ambiguousSessionRef],
    );
    if (
      delayedEventRecovery.statusCode !== 204 ||
      repeatedDelayedEventRecovery.statusCode !== 204 ||
      finalizedAmbiguousIntent?.status !== 'finalized' ||
      finalAmbiguousEventCount.rows[0]?.count !== '1' ||
      ambiguousInitialRevokeCalls !== 1 ||
      ambiguousRetryChecks !== 1 ||
      ambiguousPermittedRetryCalls !== 0 ||
      ambiguousEventCalls !== 2
    ) {
      throw new Error(
        'Delayed revoke event did not finalize the durable intent exactly once without replay',
      );
    }
  } finally {
    await ambiguousApi.close();
    await ambiguousApiDatabase.close();
    await ambiguousInspectDatabase.close();
  }

  const eventDatabase = createDatabase(appDatabaseUrl, { max: 1 });
  const eventClient = await eventDatabase.pool.connect();
  try {
    await eventClient.query('BEGIN READ ONLY');
    await eventClient.query(
      "SELECT set_config('spryxel.subject_id', $1, true), set_config('spryxel.tenant_id', $2, true)",
      [identityA.subjectId, identityA.tenantId],
    );
    const events = await eventClient.query<{
      event_type: string;
      external_session_ref: string | null;
      request_id: string;
    }>(
      `SELECT event_type, external_session_ref, request_id
       FROM platform.security_event
       WHERE subject_id = $1 AND tenant_id = $2 AND event_type <> 'project.created'
       ORDER BY created_at, event_type`,
      [identityA.subjectId, identityA.tenantId],
    );
    const credentialColumns = await eventClient.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'platform' AND table_name = 'security_event'
         AND column_name ~* '(token|cookie|secret|password|credential)'`,
    );
    if (
      events.rowCount !== 4 ||
      !events.rows.some(
        (row) =>
          row.event_type === 'identity.bootstrap' &&
          row.external_session_ref === principalA.externalSession.session &&
          row.request_id === 'integration-bootstrap',
      ) ||
      !events.rows.some(
        (row) =>
          row.event_type === 'session.revoked' &&
          row.external_session_ref === 'session_revoked_integration_a' &&
          row.request_id === 'integration-session-revoke',
      ) ||
      !events.rows.some(
        (row) =>
          row.event_type === 'session.revoked' &&
          row.external_session_ref === 'session_current_revoked_integration' &&
          row.request_id === 'integration-c10-session-revoke',
      ) ||
      !events.rows.some(
        (row) =>
          row.event_type === 'session.revoked' &&
          row.external_session_ref === 'session_ambiguous_retryable_integration_a' &&
          row.request_id === 'integration-c11-session-revoke',
      ) ||
      credentialColumns.rowCount !== 0
    ) {
      throw new Error(
        'Identity/session security events contain unexpected or credential-bearing fields',
      );
    }
    await eventClient.query('COMMIT');
  } catch (error) {
    await eventClient.query('ROLLBACK');
    throw error;
  } finally {
    eventClient.release();
    await eventDatabase.close();
  }

  const rlsDatabase = createDatabase(appDatabaseUrl, { max: 2 });
  const rlsClient = await rlsDatabase.pool.connect();
  let missingContextDenied = false;
  let crossTenantWriteDenied = false;
  try {
    await rlsClient.query('BEGIN');
    await rlsClient.query(
      "SELECT set_config('spryxel.subject_id', '', true), set_config('spryxel.tenant_id', '', true)",
    );
    const noContext = await rlsClient.query('SELECT id FROM platform.tenant');
    const noContextUpdate = await rlsClient.query(
      'UPDATE platform.tenant SET display_name = $1 WHERE id = $2',
      ['No context write', identityA.tenantId],
    );
    missingContextDenied = noContext.rowCount === 0 && noContextUpdate.rowCount === 0;
    await rlsClient.query('COMMIT');

    await rlsClient.query('BEGIN');
    await rlsClient.query(
      "SELECT set_config('spryxel.subject_id', $1, true), set_config('spryxel.tenant_id', $2, true)",
      [identityA.subjectId, identityA.tenantId],
    );
    const ownTenant = await rlsClient.query('SELECT id FROM platform.tenant WHERE id = $1', [
      identityA.tenantId,
    ]);
    const otherTenant = await rlsClient.query('SELECT id FROM platform.tenant WHERE id = $1', [
      identityB.tenantId,
    ]);
    const crossTenantUpdate = await rlsClient.query(
      'UPDATE platform.tenant SET display_name = $1 WHERE id = $2',
      ['Unauthorized change', identityB.tenantId],
    );
    await rlsClient.query('SAVEPOINT cross_tenant_event');
    try {
      await rlsClient.query(
        `INSERT INTO platform.security_event
          (id, subject_id, tenant_id, event_type, external_session_ref, request_id)
         VALUES ($1, $2, $3, 'session.revoked', $4, $5)`,
        [
          randomUUID(),
          identityA.subjectId,
          identityB.tenantId,
          'session_other_tenant',
          'integration-rls',
        ],
      );
    } catch (error) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
      crossTenantWriteDenied = code === '42501';
      await rlsClient.query('ROLLBACK TO SAVEPOINT cross_tenant_event');
    }
    const ownTenantUpdate = await rlsClient.query(
      'UPDATE platform.tenant SET display_name = $1 WHERE id = $2',
      ['Authorized workspace rename', identityA.tenantId],
    );
    await rlsClient.query('COMMIT');
    if (
      ownTenant.rowCount !== 1 ||
      otherTenant.rowCount !== 0 ||
      crossTenantUpdate.rowCount !== 0 ||
      ownTenantUpdate.rowCount !== 1 ||
      !crossTenantWriteDenied
    ) {
      throw new Error('PostgreSQL RLS did not enforce the expected tenant read/write matrix');
    }
  } finally {
    await rlsClient.release();
    await rlsDatabase.close();
  }
  if (!missingContextDenied)
    throw new Error('Missing RLS identity/tenant context did not fail closed');

  const pooledClient = await appRuntimeDatabase.pool.connect();
  try {
    await pooledClient.query('BEGIN');
    await pooledClient.query(
      "SELECT set_config('spryxel.subject_id', $1, true), set_config('spryxel.tenant_id', $2, true)",
      [identityA.subjectId, identityA.tenantId],
    );
    await pooledClient.query('COMMIT');
    const clearedContext = await pooledClient.query<{
      subject_id: string | null;
      tenant_id: string | null;
    }>(
      `SELECT NULLIF(current_setting('spryxel.subject_id', true), '') AS subject_id,
              NULLIF(current_setting('spryxel.tenant_id', true), '') AS tenant_id`,
    );
    if (clearedContext.rows[0]?.subject_id || clearedContext.rows[0]?.tenant_id) {
      throw new Error(
        'Transaction-scoped RLS context leaked when the pooled connection was reused',
      );
    }
    await pooledClient.query('BEGIN');
    await pooledClient.query("SELECT set_config('spryxel.subject_id', '', true)");
    const unscopedTenant = await pooledClient.query('SELECT id FROM platform.tenant');
    await pooledClient.query('COMMIT');
    if (unscopedTenant.rowCount !== 0) {
      throw new Error('A reused pooled connection retained tenant context between transactions');
    }
  } catch (error) {
    await pooledClient.query('ROLLBACK');
    throw error;
  } finally {
    pooledClient.release();
  }

  const signedBuckets = await s3.send(new ListBucketsCommand({}));
  if (!Array.isArray(signedBuckets.Buckets))
    throw new Error('Signed S3 ListBuckets handshake failed');
  await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  const key = 'technical-probe.txt';
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: 'authenticated-s3-probe' }));
  const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const objectBody = await object.Body?.transformToString();
  if (objectBody !== 'authenticated-s3-probe') throw new Error('Authenticated S3 read-back failed');
  const anonymous = await fetch(`${s3Endpoint}/`);
  if (anonymous.status !== 401 && anonymous.status !== 403) {
    throw new Error(`Unauthenticated S3 access was not denied (HTTP ${anonymous.status})`);
  }
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

  const queueProbe = new BullMqTechnicalQueueProbe(redisUrl);
  await queueProbe.ping();
  await queueProbe.ping();

  const apiPort = await availablePort();
  const api = await startApi(apiPort);
  try {
    const healthResponse = await fetch(`http://127.0.0.1:${apiPort}/healthz`, {
      headers: { 'x-request-id': 'wo006-imp002-integration' },
    });
    const health = (await healthResponse.json()) as { status?: string; requestId?: string };
    if (
      healthResponse.status !== 200 ||
      health.status !== 'ok' ||
      health.requestId !== 'wo006-imp002-integration' ||
      healthResponse.headers.get('x-request-id') !== 'wo006-imp002-integration'
    ) {
      throw new Error('API liveness endpoint contract failed');
    }

    const readinessResponse = await fetch(`http://127.0.0.1:${apiPort}/readyz`);
    const readinessText = await readinessResponse.text();
    if (readinessResponse.status !== 200) throw new Error('API readiness did not become healthy');
    for (const secret of allSecrets) {
      if (readinessText.includes(secret)) throw new Error('API readiness leaked a credential');
    }
    const readiness = JSON.parse(readinessText) as {
      status?: string;
      dependencies?: Array<{ name: string; status: string }>;
    };
    if (
      readiness.status !== 'ready' ||
      readiness.dependencies?.length !== 3 ||
      readiness.dependencies.some((dependency) => dependency.status !== 'ready')
    ) {
      throw new Error('API readiness did not report all configured adapters healthy');
    }
  } finally {
    await api.stop();
  }
  await s3.send(new DeleteBucketCommand({ Bucket: bucket }));
} catch (error) {
  const diagnostics = await collectIntegrationDiagnostics();
  primaryError = new Error(
    `${String(error)}; infrastructure diagnostics before cleanup:\n${diagnostics}`,
  );
} finally {
  const cleanupErrors: unknown[] = [];
  try {
    await runtimeDatabase?.close();
  } catch (error) {
    cleanupErrors.push(error);
  }
  s3.destroy();
  try {
    await runCompose(['down', '--volumes', '--remove-orphans'], composeCleanupTimeoutMs);
  } catch (error) {
    cleanupErrors.push(error);
  }
  try {
    await assertNoResidualTestResources();
  } catch (error) {
    cleanupErrors.push(error);
  }
  try {
    await removeTemporaryDirectory(tempDirectory);
  } catch (error) {
    cleanupErrors.push(error);
  }
  if (cleanupErrors.length > 0) {
    const cleanupFailure = cleanupErrors.map(String).join('; ');
    primaryError = primaryError
      ? new Error(`${String(primaryError)}; isolated test cleanup failed: ${cleanupFailure}`)
      : new Error(`Isolated test cleanup failed: ${cleanupFailure}`);
  }
}

if (primaryError) throw new Error(redact(String(primaryError), allSecrets));
process.stdout.write(
  'Real-service integration: PASS (PostgreSQL migrations/idempotency, privileged API startup refused before bind, spryxel_app NOBYPASSRLS API startup allowed, shared API runtime pool with transaction-scoped RLS context isolation, concurrent identity bootstrap, cross-tenant intent/finalization RLS, C-11 ambiguous revoke fail-closed recovery with delayed event finalization exactly once, HTTP audit recovery after injected PostgreSQL finalization fault with duplicate prevention, authenticated Redis/BullMQ, authenticated SeaweedFS S3 and API health/readiness).\n',
);
process.stdout.write(
  'Migration/queue regressions: PASS (pristine PostgreSQL reports unapplied; two BullMQ probes leave no disposable queue keys).\n',
);
process.stdout.write(
  'PostgreSQL PGDATA storage: PASS (Docker confirmed Linux tmpfs; no volume or bind mount covers PGDATA).\n',
);
process.stdout.write(
  'Disposable Compose teardown: PASS (isolated containers, volumes and networks removed).\n',
);

function composeArgs(args: string[]): string[] {
  return [
    'compose',
    '--env-file',
    envPath,
    '--project-name',
    projectName,
    '--file',
    composePath,
    '--profile',
    'test',
    ...args,
  ];
}

function runCompose(args: string[], timeoutMs = composeCommandTimeoutMs): Promise<void> {
  return run('docker', composeArgs(args), timeoutMs);
}

interface CapturedOutput {
  output: string;
  exitCode: number | null;
  timedOut: boolean;
}

function captureOutput(
  command: string,
  args: string[],
  timeoutMs = diagnosticCommandTimeoutMs,
): Promise<CapturedOutput> {
  return new Promise((resolveOutput) => {
    const child = spawn(command, args, {
      cwd: root,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    let settled = false;
    let timedOut = false;
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
    let killTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = (result: CapturedOutput): void => {
      if (settled) return;
      settled = true;
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (killTimer) clearTimeout(killTimer);
      resolveOutput(result);
    };
    const append = (chunk: string): void => {
      output = `${output}${chunk}`.slice(-maxCapturedOutputCharacters);
    };
    child.stdout.setEncoding('utf8').on('data', append);
    child.stderr.setEncoding('utf8').on('data', append);
    timeoutTimer = setTimeout(() => {
      timedOut = true;
      child.kill();
      killTimer = setTimeout(() => finish({ output, exitCode: null, timedOut }), 5_000);
    }, timeoutMs);
    child.once('error', (error) =>
      finish({ output: `${error.name}: diagnostic command unavailable`, exitCode: null, timedOut }),
    );
    child.once('close', (exitCode) => finish({ output, exitCode, timedOut }));
  });
}

function describeCapture(capture: CapturedOutput): string {
  const status = capture.timedOut
    ? 'timed out'
    : capture.exitCode === 0
      ? 'exit 0'
      : `exit ${String(capture.exitCode)}`;
  return `${status}: ${capture.output.trim() || '[no output]'}`;
}

async function assertPostgresUsesEphemeralTmpfs(): Promise<void> {
  const containerList = await captureOutput(
    'docker',
    composeArgs(['ps', '--all', '--quiet', 'postgres-test']),
  );
  const containerId = requireSuccessfulCapture('PostgreSQL container lookup', containerList).split(
    /\s+/,
  )[0];
  if (!containerId) throw new Error('Disposable PostgreSQL container was not found after startup');

  const [tmpfsConfig, dockerMounts, linuxMount] = await Promise.all([
    captureOutput('docker', ['inspect', '--format', '{{json .HostConfig.Tmpfs}}', containerId]),
    captureOutput('docker', ['inspect', '--format', '{{json .Mounts}}', containerId]),
    captureOutput('docker', [
      'exec',
      containerId,
      'sh',
      '-c',
      "grep ' /var/lib/postgresql tmpfs ' /proc/mounts",
    ]),
  ]);
  const configuredTmpfs = JSON.parse(
    requireSuccessfulCapture('PostgreSQL tmpfs inspect', tmpfsConfig),
  ) as Record<string, string> | null;
  const mountedPaths = JSON.parse(
    requireSuccessfulCapture('PostgreSQL volume inspect', dockerMounts),
  ) as Array<{ Destination?: string; Type?: string }>;
  const options = configuredTmpfs?.['/var/lib/postgresql'];
  const expectedOptions = ['rw', 'noexec', 'nosuid', 'size=384m', 'uid=70', 'gid=70', 'mode=0700'];
  const linuxMountLine = requireSuccessfulCapture('PostgreSQL Linux tmpfs mount', linuxMount);
  if (
    !options ||
    expectedOptions.some((option) => !options.split(',').includes(option)) ||
    !linuxMountLine
      .split(/\s+/)
      .some(
        (field, index, fields) => field === '/var/lib/postgresql' && fields[index + 1] === 'tmpfs',
      )
  ) {
    throw new Error('Disposable PostgreSQL PGDATA is not backed by the expected Linux tmpfs mount');
  }
  if (
    mountedPaths.some(
      ({ Destination }) =>
        Destination === '/var/lib/postgresql' || Destination?.startsWith('/var/lib/postgresql/'),
    )
  ) {
    throw new Error('Disposable PostgreSQL PGDATA is covered by a Docker volume or bind mount');
  }
}

function requireSuccessfulCapture(label: string, capture: CapturedOutput): string {
  if (capture.exitCode !== 0 || capture.timedOut) {
    throw new Error(`${label} failed: ${describeCapture(capture)}`);
  }
  return capture.output.trim();
}

async function collectIntegrationDiagnostics(): Promise<string> {
  const [serviceStatus, containerIds, postgresLogs, seaweedLogs] = await Promise.all([
    captureOutput('docker', composeArgs(['ps', '--all'])),
    captureOutput('docker', composeArgs(['ps', '--all', '--quiet', 'postgres-test'])),
    captureOutput('docker', composeArgs(['logs', '--no-color', '--tail=80', 'postgres-test'])),
    captureOutput('docker', composeArgs(['logs', '--no-color', '--tail=80', 'seaweedfs'])),
  ]);
  const containerId = containerIds.output.trim().split(/\s+/)[0];
  const [inspection, processes] = containerId
    ? await Promise.all([
        captureOutput('docker', [
          'inspect',
          '--format',
          '{{.Name}} image={{.Config.Image}} state={{json .State}} tmpfs={{json .HostConfig.Tmpfs}} mounts={{json .Mounts}}',
          containerId,
        ]),
        captureOutput('docker', ['top', containerId, '-eo', 'pid,ppid,stat,comm,args']),
      ])
    : [
        { output: 'no test PostgreSQL container found', exitCode: 0, timedOut: false },
        { output: 'no test PostgreSQL container found', exitCode: 0, timedOut: false },
      ];
  return redact(
    [
      `compose ps: ${describeCapture(serviceStatus)}`,
      `container inspect: ${describeCapture(inspection)}`,
      `process state: ${describeCapture(processes)}`,
      `PostgreSQL startup logs: ${describeCapture(postgresLogs)}`,
      `SeaweedFS startup logs: ${describeCapture(seaweedLogs)}`,
    ].join('\n'),
    allSecrets,
  ).slice(-maxFailureDiagnosticsCharacters);
}

async function assertNoResidualTestResources(): Promise<void> {
  const projectFilter = `label=com.docker.compose.project=${projectName}`;
  const [containers, volumes, networks] = await Promise.all([
    captureOutput('docker', ['ps', '--all', '--quiet', '--filter', projectFilter]),
    captureOutput('docker', ['volume', 'ls', '--quiet', '--filter', projectFilter]),
    captureOutput('docker', ['network', 'ls', '--quiet', '--filter', projectFilter]),
  ]);
  const results = { containers, volumes, networks };
  const verificationFailure = Object.entries(results).filter(
    ([, result]) => result.exitCode !== 0 || result.timedOut,
  );
  if (verificationFailure.length > 0) {
    throw new Error(
      `Could not verify isolated Docker cleanup: ${verificationFailure
        .map(([resource, result]) => `${resource} ${describeCapture(result)}`)
        .join('; ')}`,
    );
  }
  const leftovers = Object.entries(results).filter(([, result]) => result.output.trim());
  if (leftovers.length > 0) {
    throw new Error(
      `Isolated test Compose resources remain after cleanup: ${leftovers
        .map(([resource, result]) => `${resource}=${result.output.trim()}`)
        .join('; ')}`,
    );
  }
}

function run(command: string, args: string[], timeoutMs: number): Promise<void> {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    let timedOut = false;
    let settled = false;
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
    let killTimer: ReturnType<typeof setTimeout> | undefined;
    const append = (chunk: string): void => {
      output = `${output}${chunk}`.slice(-maxCapturedOutputCharacters);
    };
    const clearTimers = (): void => {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (killTimer) clearTimeout(killTimer);
    };
    const finish = (error?: Error): void => {
      if (settled) return;
      settled = true;
      clearTimers();
      if (error) reject(error);
      else resolveRun();
    };
    child.stdout.setEncoding('utf8').on('data', append);
    child.stderr.setEncoding('utf8').on('data', append);
    timeoutTimer = setTimeout(() => {
      timedOut = true;
      child.kill();
      killTimer = setTimeout(() => {
        child.kill('SIGKILL');
        finish(
          new Error(
            `${command} ${args[0]} timed out after ${timeoutMs}ms: ${redact(output.slice(-2_000), allSecrets)}`,
          ),
        );
      }, 5_000);
    }, timeoutMs);
    child.once('error', (error) => {
      finish(new Error(`${command} could not start: ${error.name}`));
    });
    child.once('close', (code) => {
      if (timedOut) {
        finish(
          new Error(
            `${command} ${args[0]} timed out after ${timeoutMs}ms: ${redact(output.slice(-2_000), allSecrets)}`,
          ),
        );
        return;
      }
      if (code === 0) finish();
      else
        finish(
          new Error(
            `${command} ${args[0]} failed (${code}): ${redact(output.slice(-1_200), allSecrets)}`,
          ),
        );
    });
  });
}

async function availablePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Unable to allocate an ephemeral port');
  const port = address.port;
  await new Promise<void>((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
  return port;
}

async function assertApiStartupRejected(port: number): Promise<void> {
  const child = spawn(process.execPath, [resolve(root, 'apps/api/dist/main.js')], {
    cwd: root,
    windowsHide: true,
    env: {
      NODE_ENV: 'test',
      HOST: '127.0.0.1',
      PORT: String(port),
      LOG_LEVEL: 'error',
      DATABASE_URL: databaseUrl,
      PATH: process.env.PATH ?? '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
  child.stderr.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));

  let timer: ReturnType<typeof setTimeout> | undefined;
  const exitCode = await Promise.race([
    new Promise<number | null>((resolveExit, rejectExit) => {
      child.once('error', rejectExit);
      child.once('close', resolveExit);
    }),
    new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error('Privileged API startup did not fail promptly')),
        10_000,
      );
    }),
  ])
    .finally(() => {
      if (timer) clearTimeout(timer);
    })
    .catch(async (error: unknown) => {
      child.kill();
      throw error;
    });

  if (exitCode !== 1) {
    throw new Error(`Privileged DATABASE_URL API startup returned exit code ${String(exitCode)}`);
  }
  if (!output.includes('RuntimeDatabaseRoleError')) {
    throw new Error('Privileged DATABASE_URL startup did not fail on the runtime-role proof');
  }
  let served = false;
  try {
    await fetch(`http://127.0.0.1:${port}/healthz`);
    served = true;
  } catch {
    served = false;
  }
  if (served) throw new Error('API served health requests with a privileged DATABASE_URL');
  if (allSecrets.some((secret) => output.includes(secret))) {
    throw new Error('Privileged startup diagnostics exposed a database credential');
  }
}

async function startApi(port: number): Promise<{ stop(): Promise<void> }> {
  const child = spawn(process.execPath, [resolve(root, 'apps/api/dist/main.js')], {
    cwd: root,
    windowsHide: true,
    env: {
      NODE_ENV: 'test',
      HOST: '127.0.0.1',
      PORT: String(port),
      LOG_LEVEL: 'silent',
      DATABASE_URL: appDatabaseUrl,
      REDIS_URL: redisUrl,
      S3_ENDPOINT: s3Endpoint,
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY_ID: secrets.accessKey,
      S3_SECRET_ACCESS_KEY: secrets.secretKey,
      S3_BUCKET: bucket,
      PATH: process.env.PATH ?? '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  let lastReadinessObservation = 'no API response captured';
  child.stdout.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
  child.stderr.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
  child.once('error', (error) => {
    output += `${error.name}: ${error.message}`;
  });

  try {
    await waitFor(
      async () => {
        if (child.exitCode !== null) {
          lastReadinessObservation = `API process exited with code ${child.exitCode}`;
          throw new Error('API process exited before readiness');
        }
        try {
          const response = await fetch(`http://127.0.0.1:${port}/readyz`);
          const text = await response.text();
          lastReadinessObservation = `HTTP ${response.status}: ${redact(text.slice(0, 500), allSecrets)}`;
          return { response };
        } catch (error) {
          const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
          lastReadinessObservation = redact(detail, allSecrets);
          throw error;
        }
      },
      (result) => result.response.status === 200,
      { label: 'API readiness with all real adapters', timeoutMs: 30_000, intervalMs: 300 },
    );
  } catch (error) {
    child.kill();
    throw new Error(
      `${String(error)}; last API readiness: ${lastReadinessObservation}; ${redact(output.slice(-1_000), allSecrets)}`,
    );
  }

  return {
    async stop() {
      if (child.exitCode !== null) return;
      const exited = new Promise<void>((resolveExit) => child.once('exit', () => resolveExit()));
      child.kill();
      await Promise.race([exited, new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000))]);
      if (child.exitCode === null) child.kill('SIGKILL');
    },
  };
}

async function chmodBestEffort(path: string): Promise<void> {
  try {
    const { chmod } = await import('node:fs/promises');
    await chmod(path, 0o600);
  } catch {
    // The temp directory uses the current user's OS ACL; chmod is an additional POSIX restriction.
  }
}

async function removeTemporaryDirectory(path: string): Promise<void> {
  const relativePath = relative(tmpdir(), path);
  if (isAbsolute(relativePath) || relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw new Error('Refusing to remove integration temp files outside the OS temp directory');
  }
  await rm(path, { recursive: true, force: true });
}

function redact(value: string, values: string[]): string {
  return values.reduce((text, secret) => text.split(secret).join('[REDACTED]'), value);
}
