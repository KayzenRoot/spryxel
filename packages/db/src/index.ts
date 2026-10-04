import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import { v7 as uuidv7 } from 'uuid';
import {
  compileAssetContract,
  integrityCheckOperation,
  normalizeProjectName,
  type CreatedDurableJob,
  type Project,
  type ProjectCreateCommand,
  type SafeJob,
} from '@spryxel/domain';
import type {
  AuthenticatedPrincipal,
  IdentityBootstrapResult,
  SessionRevocationFailureReason,
  SessionRevocationIntent,
  SessionRevocationIntentStatus,
  TenantMembership,
} from '@spryxel/identity';

const migrationTable = 'public._spryxel_schema_migrations';

export type Database = {
  pool: Pool;
  orm: NodePgDatabase;
  validateRuntimeRole(): Promise<void>;
  ping(): Promise<void>;
  close(): Promise<void>;
};

export function createDatabase(
  databaseUrl: string,
  options: PoolConfig = {},
  serviceRole: 'app' | 'worker' = 'app',
): Database {
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 2_000,
    idleTimeoutMillis: 30_000,
    max: 4,
    statement_timeout: 3_000,
    ...options,
  });
  let roleValidation: Promise<void> | undefined;
  let closePromise: Promise<void> | undefined;
  return {
    pool,
    orm: drizzle(pool),
    validateRuntimeRole: () => {
      roleValidation ??=
        serviceRole === 'app' ? validateRuntimePoolRole(pool) : validateWorkerPoolRole(pool);
      return roleValidation;
    },
    ping: async () => {
      await pool.query('SELECT 1');
    },
    close: () => {
      closePromise ??= pool.end();
      return closePromise;
    },
  };
}

export async function probePostgres(databaseUrl: string): Promise<void> {
  const database = createDatabase(databaseUrl, { max: 1, idleTimeoutMillis: 1_000 });
  try {
    const role = await database.pool.query<{ rolsuper: boolean; rolbypassrls: boolean }>(
      `SELECT role.rolsuper, role.rolbypassrls
       FROM pg_catalog.pg_roles role
       WHERE role.rolname = current_user`,
    );
    if (!role.rows[0] || role.rows[0].rolsuper || role.rows[0].rolbypassrls) {
      throw new Error('Application database role must not be superuser or bypass RLS');
    }
    await database.orm.execute(sql`select 1`);
  } finally {
    await database.close();
  }
}

export async function bootstrapIdentity(
  database: Database,
  principal: AuthenticatedPrincipal,
  requestId: string,
): Promise<IdentityBootstrapResult> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 0))', [
      `${principal.externalSubject.provider}:${principal.externalSubject.subject}`,
    ]);
    await setExternalIdentityContext(
      client,
      principal.externalSubject.provider,
      principal.externalSubject.subject,
    );

    let subjectId: string;
    const mapping = await client.query<{ subject_id: string }>(
      `SELECT subject_id
       FROM platform.external_auth_identity
       WHERE provider = $1 AND external_subject = $2`,
      [principal.externalSubject.provider, principal.externalSubject.subject],
    );
    if (mapping.rows[0]) {
      subjectId = mapping.rows[0].subject_id;
      await setSecurityContext(client, subjectId, undefined);
      const subject = await client.query<{ status: string }>(
        `SELECT status FROM platform.identity_subject WHERE id = $1`,
        [subjectId],
      );
      if (subject.rows[0]?.status !== 'active') {
        throw new IdentityRepositoryError('identity_suspended');
      }
    } else {
      subjectId = uuidv7();
      await setSecurityContext(client, subjectId, undefined);
      await client.query('INSERT INTO platform.identity_subject (id) VALUES ($1)', [subjectId]);
      await client.query(
        `INSERT INTO platform.external_auth_identity (provider, external_subject, subject_id)
         VALUES ($1, $2, $3)`,
        [principal.externalSubject.provider, principal.externalSubject.subject, subjectId],
      );
    }

    await setSecurityContext(client, subjectId, undefined);
    const memberships = await client.query<{
      tenant_id: string;
      role: TenantMembership['role'];
      status: string;
    }>(
      `SELECT tenant_id, role, status
       FROM platform.tenant_membership
       WHERE subject_id = $1 AND status = 'active'
       ORDER BY created_at, tenant_id
       LIMIT 1`,
      [subjectId],
    );

    let tenantId: string;
    let role: TenantMembership['role'];
    let created = false;
    if (memberships.rows[0]) {
      tenantId = memberships.rows[0].tenant_id;
      role = memberships.rows[0].role;
    } else {
      tenantId = uuidv7();
      role = 'OWNER';
      created = true;
      await setSecurityContext(client, subjectId, tenantId);
      await client.query(
        `INSERT INTO platform.tenant (id, display_name, created_by_subject_id)
         VALUES ($1, 'Personal workspace', $2)`,
        [tenantId, subjectId],
      );
      await client.query(
        `INSERT INTO platform.tenant_membership (tenant_id, subject_id, role)
         VALUES ($1, $2, 'OWNER')`,
        [tenantId, subjectId],
      );
      await client.query(
        `INSERT INTO platform.security_event
          (id, subject_id, tenant_id, event_type, external_session_ref, request_id)
         VALUES ($1, $2, $3, 'identity.bootstrap', $4, $5)`,
        [uuidv7(), subjectId, tenantId, principal.externalSession.session, requestId],
      );
    }

    await setSecurityContext(client, subjectId, tenantId);
    await client.query('COMMIT');
    return { subjectId, tenantId, role, created };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listIdentityMemberships(
  database: Database,
  subjectId: string,
): Promise<TenantMembership[]> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await setSecurityContext(client, subjectId, undefined);
    const result = await client.query<{
      tenant_id: string;
      subject_id: string;
      role: TenantMembership['role'];
      status: string;
    }>(
      `SELECT tenant_id, subject_id, role, status
       FROM platform.tenant_membership
       WHERE subject_id = $1 AND status = 'active'
       ORDER BY created_at, tenant_id`,
      [subjectId],
    );
    await client.query('COMMIT');
    return result.rows.map((row) => ({
      subjectId: row.subject_id,
      tenantId: row.tenant_id,
      role: row.role,
      active: row.status === 'active',
    }));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export class ProjectRepositoryError extends Error {
  constructor(
    readonly code:
      | 'membership_required'
      | 'insufficient_role'
      | 'idempotency_conflict'
      | 'project_not_found',
  ) {
    super('Project repository operation was denied');
    this.name = 'ProjectRepositoryError';
  }
}

export async function createProject(
  database: Database,
  input: ProjectCreateCommand,
): Promise<Project> {
  if (normalizeProjectName(input.name) !== input.name) {
    throw new ProjectRepositoryError('idempotency_conflict');
  }
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setSecurityContext(client, input.subjectId, input.tenantId);
    const role = await getActiveProjectMembership(client, input.subjectId, input.tenantId);
    if (role !== 'OWNER' && role !== 'ADMIN') {
      throw new ProjectRepositoryError('insufficient_role');
    }

    const proposedProjectId = uuidv7();
    const inserted = await client.query<{ project_id: string }>(
      `INSERT INTO platform.project_create_idempotency
        (subject_id, tenant_id, idempotency_key_hash, request_hash, project_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (subject_id, tenant_id, idempotency_key_hash) DO NOTHING
       RETURNING project_id`,
      [
        input.subjectId,
        input.tenantId,
        input.idempotencyKeyHash,
        input.requestHash,
        proposedProjectId,
      ],
    );

    let projectId = inserted.rows[0]?.project_id;
    const isNew = Boolean(projectId);
    if (!projectId) {
      // ON CONFLICT waits for a concurrent insert; immutable mappings need no row lock.
      const existing = await client.query<{ project_id: string; request_hash: string }>(
        `SELECT project_id, request_hash
         FROM platform.project_create_idempotency
         WHERE subject_id = $1 AND tenant_id = $2 AND idempotency_key_hash = $3`,
        [input.subjectId, input.tenantId, input.idempotencyKeyHash],
      );
      const row = existing.rows[0];
      if (!row) throw new ProjectRepositoryError('project_not_found');
      if (row.request_hash !== input.requestHash) {
        throw new ProjectRepositoryError('idempotency_conflict');
      }
      projectId = row.project_id;
    }

    if (isNew) {
      const created = await client.query<ProjectSqlRow>(
        `INSERT INTO platform.project (id, tenant_id, created_by_subject_id, name)
         VALUES ($1, $2, $3, $4)
         RETURNING id, tenant_id, created_by_subject_id, name, created_at, updated_at`,
        [projectId, input.tenantId, input.subjectId, input.name],
      );
      await client.query(
        `INSERT INTO platform.security_event
          (id, subject_id, tenant_id, event_type, request_id, project_id)
         VALUES ($1, $2, $3, 'project.created', $4, $5)`,
        [uuidv7(), input.subjectId, input.tenantId, input.requestId, projectId],
      );
      const row = created.rows[0];
      if (!row) throw new ProjectRepositoryError('project_not_found');
      await client.query('COMMIT');
      return toProject(row);
    }

    const replay = await client.query<ProjectSqlRow>(
      `SELECT id, tenant_id, created_by_subject_id, name, created_at, updated_at
       FROM platform.project WHERE id = $1 AND tenant_id = $2`,
      [projectId, input.tenantId],
    );
    const row = replay.rows[0];
    if (!row) throw new ProjectRepositoryError('project_not_found');
    await client.query('COMMIT');
    return toProject(row);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listProjects(
  database: Database,
  input: { subjectId: string; tenantId: string },
): Promise<Project[]> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await setSecurityContext(client, input.subjectId, input.tenantId);
    await getActiveProjectMembership(client, input.subjectId, input.tenantId);
    const result = await client.query<ProjectSqlRow>(
      `SELECT id, tenant_id, created_by_subject_id, name, created_at, updated_at
       FROM platform.project WHERE tenant_id = $1
       ORDER BY created_at DESC, id DESC`,
      [input.tenantId],
    );
    await client.query('COMMIT');
    return result.rows.map(toProject);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getProject(
  database: Database,
  input: { subjectId: string; tenantId: string; projectId: string },
): Promise<Project | null> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await setSecurityContext(client, input.subjectId, input.tenantId);
    await getActiveProjectMembership(client, input.subjectId, input.tenantId);
    const result = await client.query<ProjectSqlRow>(
      `SELECT id, tenant_id, created_by_subject_id, name, created_at, updated_at
       FROM platform.project WHERE id = $1 AND tenant_id = $2`,
      [input.projectId, input.tenantId],
    );
    await client.query('COMMIT');
    const row = result.rows[0];
    return row ? toProject(row) : null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

type ProjectSqlRow = {
  id: string;
  tenant_id: string;
  created_by_subject_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
};

function toProject(row: ProjectSqlRow): Project {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    createdBySubjectId: row.created_by_subject_id,
    name: row.name,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

async function getActiveProjectMembership(
  client: import('pg').PoolClient,
  subjectId: string,
  tenantId: string,
): Promise<'OWNER' | 'ADMIN' | 'MEMBER'> {
  const result = await client.query<{ role: 'OWNER' | 'ADMIN' | 'MEMBER' }>(
    `SELECT membership.role
     FROM platform.tenant_membership membership
     JOIN platform.tenant tenant ON tenant.id = membership.tenant_id
     WHERE membership.subject_id = $1 AND membership.tenant_id = $2
       AND membership.status = 'active' AND tenant.status = 'active'`,
    [subjectId, tenantId],
  );
  const role = result.rows[0]?.role;
  if (!role) throw new ProjectRepositoryError('membership_required');
  return role;
}

export async function getSessionRevocationIntent(
  database: Database,
  input: { subjectId: string; tenantId: string; sessionId: string },
): Promise<SessionRevocationIntent | undefined> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await setSecurityContext(client, input.subjectId, input.tenantId);
    const result = await client.query<{
      id: string;
      status: SessionRevocationIntentStatus;
      created_at: Date;
    }>(
      `SELECT id, status, created_at FROM platform.session_revocation_intent
       WHERE subject_id = $1 AND tenant_id = $2 AND external_session_ref = $3`,
      [input.subjectId, input.tenantId, input.sessionId],
    );
    await client.query('COMMIT');
    const row = result.rows[0];
    return row
      ? { id: row.id, status: row.status, createdAt: row.created_at.toISOString() }
      : undefined;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function createSessionRevocationIntent(
  database: Database,
  input: { subjectId: string; tenantId: string; sessionId: string; requestId: string },
): Promise<SessionRevocationIntent> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setSecurityContext(client, input.subjectId, input.tenantId);
    await assertActiveMembership(client, input.subjectId, input.tenantId);
    const inserted = await client.query<{
      id: string;
      status: SessionRevocationIntentStatus;
      created_at: Date;
    }>(
      `INSERT INTO platform.session_revocation_intent
        (id, subject_id, tenant_id, external_session_ref, request_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (subject_id, tenant_id, external_session_ref) DO NOTHING
       RETURNING id, status, created_at`,
      [uuidv7(), input.subjectId, input.tenantId, input.sessionId, input.requestId],
    );
    const existing =
      inserted.rows[0] ??
      (
        await client.query<{
          id: string;
          status: SessionRevocationIntentStatus;
          created_at: Date;
        }>(
          `SELECT id, status, created_at FROM platform.session_revocation_intent
           WHERE subject_id = $1 AND tenant_id = $2 AND external_session_ref = $3`,
          [input.subjectId, input.tenantId, input.sessionId],
        )
      ).rows[0];
    if (!existing) throw new IdentityRepositoryError('session_revocation_not_found');
    await client.query('COMMIT');
    return {
      id: existing.id,
      status: existing.status,
      createdAt: existing.created_at.toISOString(),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function markSessionRevocationRetryable(
  database: Database,
  input: {
    intentId: string;
    subjectId: string;
    tenantId: string;
    reason: SessionRevocationFailureReason;
  },
): Promise<void> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setSecurityContext(client, input.subjectId, input.tenantId);
    const current = await getIntentForUpdate(client, input);
    if (current.status === 'pending' || current.status === 'retryable') {
      await assertActiveMembership(client, input.subjectId, input.tenantId);
      await client.query(
        `UPDATE platform.session_revocation_intent
         SET status = 'retryable', failure_code = $4, updated_at = now()
         WHERE id = $1 AND subject_id = $2 AND tenant_id = $3`,
        [input.intentId, input.subjectId, input.tenantId, input.reason],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function markSessionRevocationProviderConfirmed(
  database: Database,
  input: { intentId: string; subjectId: string; tenantId: string },
): Promise<void> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setSecurityContext(client, input.subjectId, input.tenantId);
    const current = await getIntentForUpdate(client, input);
    if (current.status !== 'finalized' && current.status !== 'provider_confirmed') {
      await assertActiveMembership(client, input.subjectId, input.tenantId);
      await client.query(
        `UPDATE platform.session_revocation_intent
         SET status = 'provider_confirmed', failure_code = NULL,
             provider_confirmed_at = COALESCE(provider_confirmed_at, now()), updated_at = now()
         WHERE id = $1 AND subject_id = $2 AND tenant_id = $3`,
        [input.intentId, input.subjectId, input.tenantId],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function finalizeSessionRevocation(
  database: Database,
  input: { intentId: string; subjectId: string; tenantId: string },
): Promise<void> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setSecurityContext(client, input.subjectId, input.tenantId);
    const current = await getIntentForUpdate(client, input, true);
    if (current.status === 'finalized') {
      await client.query('COMMIT');
      return;
    }
    if (current.status !== 'provider_confirmed') {
      throw new IdentityRepositoryError('session_revocation_not_confirmed');
    }
    await assertActiveMembership(client, input.subjectId, input.tenantId);
    await client.query(
      `INSERT INTO platform.security_event
        (id, subject_id, tenant_id, event_type, external_session_ref, request_id,
         session_revocation_intent_id)
       VALUES ($1, $2, $3, 'session.revoked', $4, $5, $6)
       ON CONFLICT (session_revocation_intent_id)
         WHERE session_revocation_intent_id IS NOT NULL DO NOTHING`,
      [
        uuidv7(),
        input.subjectId,
        input.tenantId,
        current.external_session_ref,
        current.request_id,
        input.intentId,
      ],
    );
    const finalized = await client.query(
      `UPDATE platform.session_revocation_intent
       SET status = 'finalized', failure_code = NULL, updated_at = now()
       WHERE id = $1 AND subject_id = $2 AND tenant_id = $3 AND status = 'provider_confirmed'`,
      [input.intentId, input.subjectId, input.tenantId],
    );
    if (finalized.rowCount !== 1) {
      throw new IdentityRepositoryError('session_revocation_not_confirmed');
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export class DurableJobRepositoryError extends Error {
  constructor(readonly code: 'job_not_found' | 'idempotency_conflict' | 'invalid_contract') {
    super('Durable Job repository operation was denied');
    this.name = 'DurableJobRepositoryError';
  }
}

type JobCommandScope = { subjectId: string; tenantId: string; projectId: string };

export async function createDurableIntegrityJob(
  database: Database,
  input: JobCommandScope & { idempotencyKeySha256: string; skuId: string; specification: unknown },
): Promise<CreatedDurableJob> {
  const compiled = compileAssetContract({ skuId: input.skuId, specification: input.specification });
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setSecurityContext(client, input.subjectId, input.tenantId, input.projectId);
    await assertActiveMembership(client, input.subjectId, input.tenantId);
    await requireProjectInScope(client, input.tenantId, input.projectId);
    let created: {
      job_id: string;
      contract_id: string;
      contract_version: number;
      replayed: boolean;
    };
    try {
      const result = await client.query<{
        job_id: string;
        contract_id: string;
        contract_version: number;
        replayed: boolean;
      }>(`SELECT * FROM platform.create_integrity_job($1, $2, $3, $4::jsonb, $5)`, [
        input.idempotencyKeySha256,
        compiled.requestSha256,
        compiled.skuId,
        compiled.canonicalSpecification,
        compiled.specificationSha256,
      ]);
      const row = result.rows[0];
      if (!row) throw new DurableJobRepositoryError('job_not_found');
      created = row;
    } catch (error) {
      if (pgCode(error) === 'P0001') throw new DurableJobRepositoryError('idempotency_conflict');
      if (pgCode(error) === '22023') throw new DurableJobRepositoryError('invalid_contract');
      throw error;
    }
    const job = await readJobInTransaction(client, input, created.job_id);
    if (!job) throw new DurableJobRepositoryError('job_not_found');
    await client.query('COMMIT');
    return { job, replayed: created.replayed };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listDurableJobs(
  database: Database,
  input: Omit<JobCommandScope, 'projectId'> & {
    projectId?: string;
    limit: number;
    cursor?: string;
  },
): Promise<{ jobs: SafeJob[]; nextCursor?: string }> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await setSecurityContext(client, input.subjectId, input.tenantId, input.projectId);
    const role = await getActiveProjectMembership(client, input.subjectId, input.tenantId);
    if (input.projectId) await requireProjectInScope(client, input.tenantId, input.projectId);
    const cursor = decodeJobCursor(input.cursor);
    const result = await client.query<JobSqlRow>(
      `SELECT j.id, j.tenant_id, j.project_id, j.created_by_subject_id, j.operation_type, j.status,
              j.attempt_count, j.max_attempts, j.result_code, j.failure_code, j.created_at, j.updated_at,
              v.contract_id, v.version AS contract_version, v.schema_version, v.sku_id, v.specification_sha256
       FROM platform.durable_job j
       JOIN platform.asset_contract_version v
         ON v.contract_id = j.contract_id AND v.version = j.contract_version
        AND v.tenant_id = j.tenant_id AND v.project_id = j.project_id
       WHERE j.tenant_id = $1 AND ($2::uuid IS NULL OR j.project_id = $2)
         AND ($3::timestamptz IS NULL OR (j.created_at, j.id) < ($3, $4::uuid))
       ORDER BY j.created_at DESC, j.id DESC LIMIT $5`,
      [
        input.tenantId,
        input.projectId ?? null,
        cursor?.createdAt ?? null,
        cursor?.id ?? null,
        input.limit + 1,
      ],
    );
    const hasMore = result.rows.length > input.limit;
    const rows = result.rows.slice(0, input.limit);
    const attempts = await readAttempts(
      client,
      rows.map((row) => row.id),
    );
    const jobs = rows.map((row) =>
      toSafeJob(row, attempts.get(row.id) ?? [], input.subjectId, role),
    );
    await client.query('COMMIT');
    const last = rows.at(-1);
    return {
      jobs,
      ...(hasMore && last
        ? {
            nextCursor: Buffer.from(
              JSON.stringify({ createdAt: last.created_at.toISOString(), id: last.id }),
            ).toString('base64url'),
          }
        : {}),
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getDurableJob(
  database: Database,
  input: JobCommandScope & { jobId: string },
): Promise<SafeJob | null> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await setSecurityContext(client, input.subjectId, input.tenantId, input.projectId);
    await requireProjectInScope(client, input.tenantId, input.projectId);
    const job = await readJobInTransaction(client, input, input.jobId);
    await client.query('COMMIT');
    return job;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function cancelDurableJob(
  database: Database,
  input: JobCommandScope & { jobId: string },
): Promise<SafeJob | null> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setSecurityContext(client, input.subjectId, input.tenantId, input.projectId);
    try {
      await client.query('SELECT platform.request_job_cancel($1)', [input.jobId]);
    } catch (error) {
      if (pgCode(error) === '42501') {
        await client.query('ROLLBACK');
        return null;
      }
      throw error;
    }
    const job = await readJobInTransaction(client, input, input.jobId);
    await client.query('COMMIT');
    return job;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

type JobSqlRow = {
  id: string;
  tenant_id: string;
  project_id: string;
  created_by_subject_id: string;
  operation_type: string;
  status: SafeJob['status'];
  attempt_count: number;
  max_attempts: number;
  result_code: SafeJob['resultCode'];
  failure_code: SafeJob['failureCode'];
  created_at: Date;
  updated_at: Date;
  contract_id: string;
  contract_version: number;
  schema_version: 'asset-contract.v1';
  sku_id: string;
  specification_sha256: string;
};

type AttemptSqlRow = {
  id: string;
  job_id: string;
  attempt_number: number;
  status: SafeJob['attempts'][number]['status'];
  started_at: Date;
  completed_at: Date | null;
  safe_failure_code: string | null;
};

async function readJobInTransaction(
  client: import('pg').PoolClient,
  scope: JobCommandScope,
  jobId: string,
): Promise<SafeJob | null> {
  const result = await client.query<JobSqlRow>(
    `SELECT j.id, j.tenant_id, j.project_id, j.created_by_subject_id, j.operation_type, j.status,
            j.attempt_count, j.max_attempts, j.result_code, j.failure_code, j.created_at, j.updated_at,
            v.contract_id, v.version AS contract_version, v.schema_version, v.sku_id, v.specification_sha256
     FROM platform.durable_job j
     JOIN platform.asset_contract_version v
       ON v.contract_id = j.contract_id AND v.version = j.contract_version
      AND v.tenant_id = j.tenant_id AND v.project_id = j.project_id
     WHERE j.id = $1 AND j.tenant_id = $2 AND j.project_id = $3`,
    [jobId, scope.tenantId, scope.projectId],
  );
  const row = result.rows[0];
  if (!row) return null;
  const attempts = await readAttempts(client, [jobId]);
  const role = await getActiveProjectMembership(client, scope.subjectId, scope.tenantId);
  return toSafeJob(row, attempts.get(jobId) ?? [], scope.subjectId, role);
}

async function readAttempts(
  client: import('pg').PoolClient,
  jobIds: string[],
): Promise<Map<string, SafeJob['attempts']>> {
  if (jobIds.length === 0) return new Map();
  const result = await client.query<AttemptSqlRow>(
    `SELECT id, job_id, attempt_number, status, started_at, completed_at, safe_failure_code
     FROM platform.job_attempt WHERE job_id = ANY($1::uuid[])
     ORDER BY job_id, attempt_number DESC`,
    [jobIds],
  );
  const output = new Map<string, SafeJob['attempts']>();
  for (const row of result.rows) {
    const entries = output.get(row.job_id) ?? [];
    entries.push({
      id: row.id,
      attemptNumber: row.attempt_number,
      status: row.status,
      startedAt: row.started_at.toISOString(),
      completedAt: row.completed_at?.toISOString() ?? null,
      failureCode: row.safe_failure_code,
    });
    output.set(row.job_id, entries);
  }
  return output;
}

function toSafeJob(
  row: JobSqlRow,
  attempts: SafeJob['attempts'],
  subjectId: string,
  role: 'OWNER' | 'ADMIN' | 'MEMBER',
): SafeJob {
  const job: SafeJob = {
    id: row.id,
    projectId: row.project_id,
    operationType: integrityCheckOperation,
    status: row.status,
    retryable: row.status === 'queued' && row.attempt_count < row.max_attempts,
    cancelEligible:
      (row.status === 'queued' || row.status === 'running') &&
      (row.created_by_subject_id === subjectId || role === 'OWNER' || role === 'ADMIN'),
    attemptCount: row.attempt_count,
    maxAttempts: 3,
    resultCode: row.result_code,
    failureCode: row.failure_code,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    contract: {
      id: row.contract_id,
      version: row.contract_version,
      schemaVersion: row.schema_version,
      skuId: row.sku_id,
      specificationSha256: row.specification_sha256,
    },
    attempts,
  };
  return job;
}

function decodeJobCursor(value: string | undefined): { createdAt: string; id: string } | undefined {
  if (!value) return undefined;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Record<
      string,
      unknown
    >;
    if (
      typeof parsed.createdAt !== 'string' ||
      Number.isNaN(Date.parse(parsed.createdAt)) ||
      typeof parsed.id !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(parsed.id)
    ) {
      throw new Error('invalid cursor');
    }
    return { createdAt: parsed.createdAt, id: parsed.id };
  } catch {
    throw new DurableJobRepositoryError('job_not_found');
  }
}

async function requireProjectInScope(
  client: import('pg').PoolClient,
  tenantId: string,
  projectId: string,
): Promise<void> {
  const project = await client.query(
    'SELECT 1 FROM platform.project WHERE id = $1 AND tenant_id = $2',
    [projectId, tenantId],
  );
  if (!project.rowCount) throw new DurableJobRepositoryError('job_not_found');
}

function pgCode(error: unknown): string | undefined {
  return typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
    ? error.code
    : undefined;
}

export type ClaimedDurableJob = {
  jobId: string;
  attemptId: string;
  leaseToken: string;
  attemptNumber: number;
  specification: unknown;
  specificationSha256: string;
  skuId: string;
  contractVersion: number;
  operationType: string;
};

export async function reconcileDurableJobs(database: Database, batch: number): Promise<string[]> {
  await database.validateRuntimeRole();
  const result = await database.pool.query<{ job_id: string }>(
    'SELECT job_id FROM platform.reconcile_jobs($1)',
    [batch],
  );
  return result.rows.map((row) => row.job_id);
}

export async function claimDurableJob(
  database: Database,
  jobId: string,
  workerId: string,
  leaseSeconds = 10,
): Promise<ClaimedDurableJob | null> {
  await database.validateRuntimeRole();
  const result = await database.pool.query<{
    job_id: string;
    attempt_id: string;
    lease_token: string;
    attempt_number: number;
    specification: unknown;
    specification_sha256: string;
    sku_id: string;
    contract_version: number;
    operation_type: string;
  }>('SELECT * FROM platform.claim_job($1, $2, $3)', [jobId, workerId, leaseSeconds]);
  const row = result.rows[0];
  return row
    ? {
        jobId: row.job_id,
        attemptId: row.attempt_id,
        leaseToken: row.lease_token,
        attemptNumber: row.attempt_number,
        specification: row.specification,
        specificationSha256: row.specification_sha256,
        skuId: row.sku_id,
        contractVersion: row.contract_version,
        operationType: row.operation_type,
      }
    : null;
}

export async function finishDurableJob(
  database: Database,
  input: {
    jobId: string;
    attemptId: string;
    leaseToken: string;
    outcome: 'succeeded' | 'failed' | 'cancelled';
    failureCode?: string;
  },
): Promise<boolean> {
  await database.validateRuntimeRole();
  const result = await database.pool.query<{ finish_job: boolean }>(
    'SELECT platform.finish_job($1, $2, $3, $4, $5) AS finish_job',
    [input.jobId, input.attemptId, input.leaseToken, input.outcome, input.failureCode ?? null],
  );
  return result.rows[0]?.finish_job ?? false;
}

function getIntentForUpdate(
  client: import('pg').PoolClient,
  input: { intentId: string; subjectId: string; tenantId: string },
  includeAuditFields: true,
): Promise<{
  id: string;
  status: SessionRevocationIntentStatus;
  external_session_ref: string;
  request_id: string;
}>;
function getIntentForUpdate(
  client: import('pg').PoolClient,
  input: { intentId: string; subjectId: string; tenantId: string },
  includeAuditFields?: false,
): Promise<{ id: string; status: SessionRevocationIntentStatus }>;
async function getIntentForUpdate(
  client: import('pg').PoolClient,
  input: { intentId: string; subjectId: string; tenantId: string },
  includeAuditFields = false,
): Promise<
  | { id: string; status: SessionRevocationIntentStatus }
  | {
      id: string;
      status: SessionRevocationIntentStatus;
      external_session_ref: string;
      request_id: string;
    }
> {
  const result = await client.query<{
    id: string;
    status: SessionRevocationIntentStatus;
    external_session_ref?: string;
    request_id?: string;
  }>(
    `SELECT id, status${includeAuditFields ? ', external_session_ref, request_id' : ''}
     FROM platform.session_revocation_intent
     WHERE id = $1 AND subject_id = $2 AND tenant_id = $3
     FOR UPDATE`,
    [input.intentId, input.subjectId, input.tenantId],
  );
  const row = result.rows[0];
  if (!row) throw new IdentityRepositoryError('session_revocation_not_found');
  if (includeAuditFields) {
    if (!row.external_session_ref || !row.request_id) {
      throw new IdentityRepositoryError('session_revocation_not_found');
    }
    return {
      id: row.id,
      status: row.status,
      external_session_ref: row.external_session_ref,
      request_id: row.request_id,
    };
  }
  return { id: row.id, status: row.status };
}

export class RuntimeDatabaseRoleError extends Error {
  constructor() {
    super('DATABASE_URL must use the restricted Spryxel runtime role');
    this.name = 'RuntimeDatabaseRoleError';
  }
}

export class WorkerRuntimeRoleError extends Error {
  constructor() {
    super('WORKER_DATABASE_URL must use the restricted Spryxel worker role');
    this.name = 'WorkerRuntimeRoleError';
  }
}

async function validateRuntimePoolRole(pool: Pool): Promise<void> {
  const result = await pool.query<{
    is_runtime_role: boolean;
    privileged: boolean;
    has_memberships: boolean;
    owns_migration_or_identity_objects: boolean;
    has_runtime_capabilities: boolean;
  }>(`
    WITH runtime_role AS (
      SELECT role.* FROM pg_catalog.pg_roles role WHERE role.rolname = current_user
    )
    SELECT
      role.rolname = 'spryxel_app' AS is_runtime_role,
      (role.rolsuper OR role.rolbypassrls OR role.rolcreatedb OR role.rolcreaterole OR role.rolreplication) AS privileged,
      EXISTS (
        SELECT 1 FROM pg_catalog.pg_auth_members membership
        WHERE membership.member = role.oid
      ) AS has_memberships,
      (
        EXISTS (
          SELECT 1
          FROM pg_catalog.pg_class relation
          JOIN pg_catalog.pg_namespace namespace ON namespace.oid = relation.relnamespace
          WHERE relation.relowner = role.oid
            AND ((namespace.nspname = 'public' AND relation.relname = '_spryxel_schema_migrations')
              OR namespace.nspname = 'platform')
        )
        OR EXISTS (
          SELECT 1 FROM pg_catalog.pg_namespace namespace
          WHERE namespace.nspname = 'platform' AND namespace.nspowner = role.oid
        )
      ) AS owns_migration_or_identity_objects,
      COALESCE(pg_catalog.has_schema_privilege(role.oid, pg_catalog.to_regnamespace('platform'), 'USAGE'), false)
      AND NOT COALESCE(pg_catalog.has_schema_privilege(role.oid, pg_catalog.to_regnamespace('platform'), 'CREATE'), false)
      AND (
        SELECT count(*) = 8 AND bool_and(
          relation.relrowsecurity AND relation.relforcerowsecurity AND
          CASE relation.relname
            WHEN 'identity_subject' THEN
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'SELECT') AND
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'INSERT') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'UPDATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'DELETE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRUNCATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'REFERENCES') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRIGGER')
            WHEN 'external_auth_identity' THEN
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'SELECT') AND
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'INSERT') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'UPDATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'DELETE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRUNCATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'REFERENCES') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRIGGER')
            WHEN 'tenant' THEN
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'SELECT') AND
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'INSERT') AND
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'UPDATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'DELETE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRUNCATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'REFERENCES') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRIGGER')
            WHEN 'tenant_membership' THEN
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'SELECT') AND
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'INSERT') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'UPDATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'DELETE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRUNCATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'REFERENCES') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRIGGER')
            WHEN 'security_event' THEN
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'SELECT') AND
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'INSERT') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'UPDATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'DELETE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRUNCATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'REFERENCES') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRIGGER')
            WHEN 'session_revocation_intent' THEN
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'SELECT') AND
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'INSERT') AND
              pg_catalog.has_column_privilege(role.oid, relation.oid, 'status', 'UPDATE') AND
              pg_catalog.has_column_privilege(role.oid, relation.oid, 'failure_code', 'UPDATE') AND
              pg_catalog.has_column_privilege(role.oid, relation.oid, 'provider_confirmed_at', 'UPDATE') AND
              pg_catalog.has_column_privilege(role.oid, relation.oid, 'updated_at', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'id', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'subject_id', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'tenant_id', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'external_session_ref', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'request_id', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'created_at', 'UPDATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'DELETE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRUNCATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'REFERENCES') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRIGGER')
            WHEN 'project' THEN
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'SELECT') AND
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'INSERT') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'UPDATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'DELETE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRUNCATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'REFERENCES') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRIGGER')
            WHEN 'project_create_idempotency' THEN
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'SELECT') AND
              pg_catalog.has_table_privilege(role.oid, relation.oid, 'INSERT') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'subject_id', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'tenant_id', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'idempotency_key_hash', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'request_hash', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'project_id', 'UPDATE') AND
              NOT pg_catalog.has_column_privilege(role.oid, relation.oid, 'created_at', 'UPDATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'DELETE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRUNCATE') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'REFERENCES') AND
              NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRIGGER')
            ELSE false
          END
        )
        FROM pg_catalog.pg_class relation
        JOIN pg_catalog.pg_namespace namespace ON namespace.oid = relation.relnamespace
        WHERE namespace.nspname = 'platform'
          AND relation.relname IN (
            'identity_subject', 'external_auth_identity', 'tenant', 'tenant_membership',
            'security_event', 'session_revocation_intent', 'project', 'project_create_idempotency'
          )
      )
      AND (
        SELECT count(*) = 5 AND bool_and(
          relation.relrowsecurity AND relation.relforcerowsecurity
          AND pg_catalog.has_table_privilege(role.oid, relation.oid, 'SELECT')
          AND NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'INSERT')
          AND NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'UPDATE')
          AND NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'DELETE')
          AND NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRUNCATE')
          AND NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'REFERENCES')
          AND NOT pg_catalog.has_table_privilege(role.oid, relation.oid, 'TRIGGER')
        )
        FROM pg_catalog.pg_class relation
        JOIN pg_catalog.pg_namespace namespace ON namespace.oid = relation.relnamespace
        WHERE namespace.nspname = 'platform'
          AND relation.relname IN ('asset_contract', 'asset_contract_version', 'durable_job', 'job_create_idempotency', 'job_attempt')
      )
      AND (
        (
          SELECT count(*) = 8 AND bool_and(
            pg_catalog.has_function_privilege(role.oid, function_name, 'EXECUTE')
          )
          FROM unnest(ARRAY[
            'platform.current_subject_id()',
            'platform.current_tenant_id()',
            'platform.is_active_tenant_member(uuid, uuid)',
            'platform.can_create_project(uuid, uuid)',
            'platform.is_project_created_event(text)',
            'platform.current_project_id()',
            'platform.create_integrity_job(text, text, text, jsonb, text)',
            'platform.request_job_cancel(uuid)'
          ]::text[]) AS runtime_function(function_name)
        )
        AND NOT pg_catalog.has_function_privilege(role.oid, 'platform.reconcile_jobs(integer)', 'EXECUTE')
        AND NOT pg_catalog.has_function_privilege(role.oid, 'platform.claim_job(uuid, text, integer)', 'EXECUTE')
        AND NOT pg_catalog.has_function_privilege(role.oid, 'platform.finish_job(uuid, uuid, uuid, text, text)', 'EXECUTE')
      ) AS has_runtime_capabilities
    FROM runtime_role role
  `);
  const role = result.rows[0];
  if (
    !role?.is_runtime_role ||
    role.privileged ||
    role.has_memberships ||
    role.owns_migration_or_identity_objects ||
    !role.has_runtime_capabilities
  ) {
    throw new RuntimeDatabaseRoleError();
  }
}

async function validateWorkerPoolRole(pool: Pool): Promise<void> {
  const result = await pool.query<{
    is_worker_role: boolean;
    privileged: boolean;
    has_memberships: boolean;
    owns_platform_objects: boolean;
    has_schema_create: boolean;
    has_only_bounded_functions: boolean;
    has_no_table_access: boolean;
  }>(`
    WITH worker_role AS (
      SELECT role.* FROM pg_catalog.pg_roles role WHERE role.rolname = current_user
    ), platform_relations AS (
      SELECT relation.oid FROM pg_catalog.pg_class relation
      JOIN pg_catalog.pg_namespace namespace ON namespace.oid = relation.relnamespace
      WHERE namespace.nspname = 'platform' AND relation.relkind IN ('r','p','v','m','S')
    )
    SELECT role.rolname = 'spryxel_worker' AS is_worker_role,
      (role.rolsuper OR role.rolbypassrls OR role.rolcreatedb OR role.rolcreaterole OR role.rolreplication) AS privileged,
      EXISTS (SELECT 1 FROM pg_catalog.pg_auth_members membership WHERE membership.member = role.oid) AS has_memberships,
      EXISTS (SELECT 1 FROM platform_relations r JOIN pg_catalog.pg_class c ON c.oid=r.oid WHERE c.relowner=role.oid)
        OR EXISTS (SELECT 1 FROM pg_catalog.pg_namespace n WHERE n.nspname='platform' AND n.nspowner=role.oid) AS owns_platform_objects,
      COALESCE(pg_catalog.has_schema_privilege(role.oid, pg_catalog.to_regnamespace('platform'), 'CREATE'), false) AS has_schema_create,
      (
        SELECT count(*) = 3 AND bool_and(pg_catalog.has_function_privilege(role.oid, function_name, 'EXECUTE'))
        FROM unnest(ARRAY[
          'platform.reconcile_jobs(integer)',
          'platform.claim_job(uuid, text, integer)',
          'platform.finish_job(uuid, uuid, uuid, text, text)'
        ]::text[]) AS worker_function(function_name)
      )
      AND NOT pg_catalog.has_function_privilege(role.oid, 'platform.create_integrity_job(text, text, text, jsonb, text)', 'EXECUTE')
      AND NOT pg_catalog.has_function_privilege(role.oid, 'platform.request_job_cancel(uuid)', 'EXECUTE') AS has_only_bounded_functions,
      NOT EXISTS (
        SELECT 1 FROM platform_relations r WHERE
          pg_catalog.has_table_privilege(role.oid,r.oid,'SELECT') OR
          pg_catalog.has_table_privilege(role.oid,r.oid,'INSERT') OR
          pg_catalog.has_table_privilege(role.oid,r.oid,'UPDATE') OR
          pg_catalog.has_table_privilege(role.oid,r.oid,'DELETE') OR
          pg_catalog.has_table_privilege(role.oid,r.oid,'TRUNCATE') OR
          pg_catalog.has_table_privilege(role.oid,r.oid,'REFERENCES') OR
          pg_catalog.has_table_privilege(role.oid,r.oid,'TRIGGER')
      ) AS has_no_table_access
    FROM worker_role role
  `);
  const role = result.rows[0];
  if (
    !role?.is_worker_role ||
    role.privileged ||
    role.has_memberships ||
    role.owns_platform_objects ||
    role.has_schema_create ||
    !role.has_only_bounded_functions ||
    !role.has_no_table_access
  ) {
    throw new WorkerRuntimeRoleError();
  }
}

export class IdentityRepositoryError extends Error {
  constructor(
    readonly code:
      | 'identity_suspended'
      | 'membership_required'
      | 'session_revocation_not_found'
      | 'session_revocation_not_confirmed',
  ) {
    super('Identity repository operation was denied');
    this.name = 'IdentityRepositoryError';
  }
}

async function assertActiveMembership(
  client: import('pg').PoolClient,
  subjectId: string,
  tenantId: string,
): Promise<void> {
  const membership = await client.query(
    `SELECT 1 FROM platform.tenant_membership
     WHERE subject_id = $1 AND tenant_id = $2 AND status = 'active'`,
    [subjectId, tenantId],
  );
  if (!membership.rowCount) throw new IdentityRepositoryError('membership_required');
}

async function setSecurityContext(
  client: import('pg').PoolClient,
  subjectId: string,
  tenantId: string | undefined,
  projectId?: string,
): Promise<void> {
  await client.query("SELECT set_config('spryxel.subject_id', $1, true)", [subjectId]);
  await client.query("SELECT set_config('spryxel.tenant_id', $1, true)", [tenantId ?? '']);
  await client.query("SELECT set_config('spryxel.project_id', $1, true)", [projectId ?? '']);
}

async function setExternalIdentityContext(
  client: import('pg').PoolClient,
  provider: string,
  externalSubject: string,
): Promise<void> {
  await client.query("SELECT set_config('spryxel.external_provider', $1, true)", [provider]);
  await client.query("SELECT set_config('spryxel.external_subject', $1, true)", [externalSubject]);
}

export type MigrationStatus = {
  id: string;
  checksum: string;
  applied: boolean;
};

export async function runMigrations(databaseUrl: string): Promise<MigrationStatus[]> {
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 2_000,
    idleTimeoutMillis: 5_000,
    max: 1,
    statement_timeout: 10_000,
  });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${migrationTable} (
        id text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const migrations = await loadMigrations();
    const status: MigrationStatus[] = [];
    for (const migration of migrations) {
      const applied = await client.query<{ checksum: string }>(
        `SELECT checksum FROM ${migrationTable} WHERE id = $1`,
        [migration.id],
      );
      if (applied.rowCount) {
        const checksum = applied.rows[0]?.checksum;
        if (checksum !== migration.checksum) {
          throw new Error(`Migration checksum mismatch: ${migration.id}`);
        }
        status.push({ id: migration.id, checksum: migration.checksum, applied: true });
        continue;
      }

      await client.query(migration.sql);
      await client.query(`INSERT INTO ${migrationTable} (id, checksum) VALUES ($1, $2)`, [
        migration.id,
        migration.checksum,
      ]);
      status.push({ id: migration.id, checksum: migration.checksum, applied: true });
    }
    await client.query('COMMIT');
    return status;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

export async function getMigrationStatus(databaseUrl: string): Promise<MigrationStatus[]> {
  const pool = new Pool({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 2_000,
    idleTimeoutMillis: 5_000,
    max: 1,
    statement_timeout: 3_000,
  });
  try {
    const migrations = await loadMigrations();
    const tableCheck = await pool.query<{ table_exists: boolean }>(
      'SELECT to_regclass($1) IS NOT NULL AS table_exists',
      [migrationTable],
    );
    if (!tableCheck.rows[0]?.table_exists) {
      return migrations.map((migration) => ({
        id: migration.id,
        checksum: migration.checksum,
        applied: false,
      }));
    }

    const result = await pool.query<{ id: string; checksum: string }>(
      `SELECT id, checksum FROM ${migrationTable}`,
    );
    const applied = new Map(result.rows.map((row) => [row.id, row.checksum]));
    return migrations.map((migration) => {
      const checksum = applied.get(migration.id);
      if (checksum !== undefined && checksum !== migration.checksum) {
        throw new Error(`Migration checksum mismatch: ${migration.id}`);
      }
      return { id: migration.id, checksum: migration.checksum, applied: Boolean(checksum) };
    });
  } finally {
    await pool.end();
  }
}

async function loadMigrations(): Promise<Array<{ id: string; sql: string; checksum: string }>> {
  const currentDirectory = dirname(fileURLToPath(import.meta.url));
  const sourceDirectory = currentDirectory.endsWith(`${join('packages', 'db', 'src')}`)
    ? currentDirectory
    : join(currentDirectory, '..', 'src');
  const migrationDirectory = join(sourceDirectory, 'migrations');
  const files = (await readdir(migrationDirectory)).filter((file) => file.endsWith('.sql')).sort();
  if (files.some((file) => !/^\d{4}_[a-z0-9_]+\.sql$/.test(file))) {
    throw new Error('Migration filenames must use the ordered 0000_description.sql format');
  }
  return Promise.all(
    files.map(async (file) => {
      const sql = await readFile(join(migrationDirectory, file), 'utf8');
      return {
        id: file.slice(0, -4),
        sql,
        checksum: createHash('sha256').update(sql).digest('hex'),
      };
    }),
  );
}
