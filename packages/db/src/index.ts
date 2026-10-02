import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sql } from 'drizzle-orm';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool, type PoolConfig } from 'pg';

const migrationTable = 'public._spryxel_schema_migrations';

export type Database = {
  pool: Pool;
  orm: NodePgDatabase;
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
  return {
    pool,
    orm: drizzle(pool),
    close: () => pool.end(),
  };
}

export async function probePostgres(databaseUrl: string): Promise<void> {
  const database = createDatabase(databaseUrl, { max: 1, idleTimeoutMillis: 1_000 });
  try {
    await database.orm.execute(sql`select 1`);
  } finally {
    await database.close();
  }
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
    const result = await pool.query<{ id: string; checksum: string }>(
      `SELECT id, checksum FROM ${migrationTable}`,
    );
    const applied = new Map(result.rows.map((row) => [row.id, row.checksum]));
    return migrations.map((migration) => {
      const checksum = applied.get(migration.id);
      if (checksum && checksum !== migration.checksum) {
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
