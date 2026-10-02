import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';
import { v7 as uuidv7 } from 'uuid';
import type {
  AuthenticatedPrincipal,
  IdentityBootstrapResult,
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

export function createDatabase(databaseUrl: string, options: PoolConfig = {}): Database {
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
      roleValidation ??= validateRuntimePoolRole(pool);
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

export async function recordSessionRevocation(
  database: Database,
  input: { subjectId: string; tenantId: string; sessionId: string; requestId: string },
): Promise<void> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setSecurityContext(client, input.subjectId, input.tenantId);
    const membership = await client.query(
      `SELECT 1 FROM platform.tenant_membership
       WHERE subject_id = $1 AND tenant_id = $2 AND status = 'active'`,
      [input.subjectId, input.tenantId],
    );
    if (!membership.rowCount) throw new IdentityRepositoryError('membership_required');
    await client.query(
      `INSERT INTO platform.security_event
        (id, subject_id, tenant_id, event_type, external_session_ref, request_id)
       VALUES ($1, $2, $3, 'session.revoked', $4, $5)`,
      [uuidv7(), input.subjectId, input.tenantId, input.sessionId, input.requestId],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export class RuntimeDatabaseRoleError extends Error {
  constructor() {
    super('DATABASE_URL must use the restricted Spryxel runtime role');
    this.name = 'RuntimeDatabaseRoleError';
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
        SELECT count(*) = 5 AND bool_and(
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
            ELSE false
          END
        )
        FROM pg_catalog.pg_class relation
        JOIN pg_catalog.pg_namespace namespace ON namespace.oid = relation.relnamespace
        WHERE namespace.nspname = 'platform'
          AND relation.relname IN (
            'identity_subject', 'external_auth_identity', 'tenant', 'tenant_membership', 'security_event'
          )
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

export class IdentityRepositoryError extends Error {
  constructor(readonly code: 'identity_suspended' | 'membership_required') {
    super('Identity repository operation was denied');
    this.name = 'IdentityRepositoryError';
  }
}

async function setSecurityContext(
  client: import('pg').PoolClient,
  subjectId: string,
  tenantId: string | undefined,
): Promise<void> {
  await client.query("SELECT set_config('spryxel.subject_id', $1, true)", [subjectId]);
  await client.query("SELECT set_config('spryxel.tenant_id', $1, true)", [tenantId ?? '']);
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
