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
import type { AuthenticatedPrincipal } from '@spryxel/identity';
import { createRunId, waitFor } from '@spryxel/testkit';
import { BullMqTechnicalQueueProbe } from '@spryxel/worker/queue-probe';
import { buildApiServer } from '../apps/api/src/server.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const composePath = resolve(root, 'infra/compose.yml');
const tempDirectory = await mkdtemp(resolve(tmpdir(), 'spryxel-wo006-imp002-'));
const envPath = resolve(tempDirectory, 'test.env');
const projectName = createRunId('spryxel-wo006-test');
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
  await runCompose(['config', '--quiet']);
  await runCompose(['up', '--detach', '--build', '--wait', '--wait-timeout', '90', 'postgres']);
  await runCompose([
    'up',
    '--detach',
    '--build',
    '--wait',
    '--wait-timeout',
    '90',
    'redis',
    'seaweedfs',
  ]);

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
    pristineMigrationStatus.length !== 3 ||
    pristineMigrationStatus.some((migration) => migration.applied)
  ) {
    throw new Error('Pristine PostgreSQL did not report all migrations as unapplied');
  }

  const migrationStatus = await runMigrations(databaseUrl);
  if (migrationStatus.length !== 3 || migrationStatus.some((migration) => !migration.applied)) {
    throw new Error(
      'Disposable PostgreSQL migrations did not apply the technical and identity schemas',
    );
  }
  const repeatStatus = await runMigrations(databaseUrl);
  if (!repeatStatus.every((migration) => migration.applied)) {
    throw new Error('Migration runner was not idempotent');
  }
  const readStatus = await getMigrationStatus(databaseUrl);
  if (readStatus.length !== 3 || readStatus.some((migration) => !migration.applied)) {
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
       WHERE subject_id = $1 AND tenant_id = $2
       ORDER BY created_at, event_type`,
      [identityA.subjectId, identityA.tenantId],
    );
    const credentialColumns = await eventClient.query<{ column_name: string }>(
      `SELECT column_name FROM information_schema.columns
       WHERE table_schema = 'platform' AND table_name = 'security_event'
         AND column_name ~* '(token|cookie|secret|password|credential)'`,
    );
    if (
      events.rowCount !== 3 ||
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
  primaryError = error;
} finally {
  await runtimeDatabase?.close();
  s3.destroy();
  try {
    await runCompose(['down', '--volumes', '--remove-orphans']);
  } catch (error) {
    if (!primaryError) primaryError = error;
  }
  await removeTemporaryDirectory(tempDirectory);
}

if (primaryError) throw new Error(redact(String(primaryError), allSecrets));
process.stdout.write(
  'Real-service integration: PASS (PostgreSQL migrations/idempotency, privileged API startup refused before bind, spryxel_app NOBYPASSRLS API startup allowed, shared API runtime pool with transaction-scoped RLS context isolation, concurrent identity bootstrap, cross-tenant intent/finalization RLS, durable retryable revocation state, HTTP audit recovery after injected PostgreSQL finalization fault with duplicate prevention, authenticated Redis/BullMQ, authenticated SeaweedFS S3 and API health/readiness).\n',
);
process.stdout.write(
  'Migration/queue regressions: PASS (pristine PostgreSQL reports unapplied; two BullMQ probes leave no disposable queue keys).\n',
);
process.stdout.write('Disposable Compose teardown: PASS (containers and named volumes removed).\n');

function runCompose(args: string[]): Promise<void> {
  const composeArgs = [
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
  return run('docker', composeArgs).catch(async (error: unknown) => {
    if (!args.includes('up')) throw error;
    const diagnostics = await captureOutput('docker', [
      'compose',
      '--env-file',
      envPath,
      '--project-name',
      projectName,
      '--file',
      composePath,
      '--profile',
      'test',
      'logs',
      '--tail=80',
      'seaweedfs',
    ]);
    throw new Error(
      `${String(error)}; sanitized SeaweedFS startup log: ${redact(diagnostics.slice(-4_000), allSecrets)}`,
    );
  });
}

function captureOutput(command: string, args: string[]): Promise<string> {
  return new Promise((resolveOutput) => {
    const child = spawn(command, args, {
      cwd: root,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
    child.once('error', (error) => resolveOutput(`${error.name}: service log unavailable`));
    child.once('close', () => resolveOutput(output));
  });
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
    child.once('error', (error) => reject(new Error(`${command} could not start: ${error.name}`)));
    child.once('close', (code) => {
      if (code === 0) resolveRun();
      else
        reject(
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
