import { createHash } from 'node:crypto';
import type { Pool, PoolClient } from 'pg';
import { v7 as uuidv7 } from 'uuid';
import {
  assertIdempotentPayloadReplay,
  prepareAssetVersion,
  prepareProjectDnaVersion,
  restoreAssetVersionAsNew as prepareAssetRestore,
  restoreProjectDnaVersionAsNew as prepareProjectDnaRestore,
  type AssetMetadataPayload,
  type PreparedAssetVersion,
  type PreparedProjectDnaVersion,
  type ProjectDnaPayload,
  type VersionedPayloadSchema as DomainVersionedPayloadSchema,
} from '@spryxel/domain';

export type AssetCoreDatabase = {
  pool: Pool;
  validateRuntimeRole(): Promise<void>;
};

type AssetLineageRelation = 'derived_from' | 'variant_of' | 'component_of' | 'frame_of' | 'source';

// SQL owns the canonical payload contract at the persistence boundary.
const databaseValidatedPayloadSchema: DomainVersionedPayloadSchema = {
  parse(value) {
    return value;
  },
};

export type AssetCoreProvenance = {
  source: 'manual' | 'import' | 'generation' | 'restore' | 'system';
  actorSubjectId: string | null;
  recordedAt: string;
  sourceVersionId: string | null;
};

export type AssetCoreScope = {
  subjectId: string;
  tenantId: string;
  projectId: string;
};

export type ProjectDnaVersionRecord = {
  projectDnaId: string;
  tenantId: string;
  projectId: string;
  versionId: string;
  version: number;
  schemaVersion: 'project-dna.v1';
  payload: ProjectDnaPayload;
  payloadSha256: string;
  idempotencyKeySha256: string;
  provenance: AssetCoreProvenance;
  createdBySubjectId: string;
  createdAt: string;
  replayed?: boolean;
};

export type AssetVersionRecord = {
  assetId: string;
  tenantId: string;
  projectId: string;
  versionId: string;
  version: number;
  schemaVersion: 'asset-metadata.v1';
  payload: AssetMetadataPayload;
  payloadSha256: string;
  idempotencyKeySha256: string;
  provenance: AssetCoreProvenance;
  createdBySubjectId: string;
  createdAt: string;
  replayed?: boolean;
  lineage: Array<{
    relation: AssetLineageRelation;
    assetId: string;
    assetVersionId: string | null;
  }>;
};

export class AssetCoreRepositoryError extends Error {
  constructor(
    readonly code:
      | 'idempotency_conflict'
      | 'invalid_payload'
      | 'invalid_reference'
      | 'write_denied',
  ) {
    super('Asset Core repository operation was denied');
    this.name = 'AssetCoreRepositoryError';
  }
}

type PreparedProjectDna = PreparedProjectDnaVersion;
type PreparedAsset = PreparedAssetVersion;
type WriteResult = { version_id: string; version: number; replayed: boolean };

type ProjectDnaSqlRow = {
  project_dna_id: string;
  tenant_id: string;
  project_id: string;
  version_id: string;
  version: number;
  schema_version: 'project-dna.v1';
  payload: ProjectDnaPayload;
  payload_sha256: string;
  idempotency_key_sha256: string;
  provenance: AssetCoreProvenance;
  created_by_subject_id: string;
  created_at: Date;
};

type AssetSqlRow = {
  asset_id: string;
  tenant_id: string;
  project_id: string;
  version_id: string;
  version: number;
  schema_version: 'asset-metadata.v1';
  payload: AssetMetadataPayload;
  payload_sha256: string;
  idempotency_key_sha256: string;
  provenance: AssetCoreProvenance;
  created_by_subject_id: string;
  created_at: Date;
};

export async function createProjectDnaVersion(
  database: AssetCoreDatabase,
  input: AssetCoreScope & {
    idempotencyKey: string;
    payload: unknown;
    provenance: AssetCoreProvenance;
  },
): Promise<ProjectDnaVersionRecord> {
  const prepared = prepareProjectDnaVersion({
    id: uuidv7(),
    tenantId: input.tenantId,
    projectId: input.projectId,
    versionId: uuidv7(),
    version: 1,
    idempotencyKeySha256: hashIdempotencyKey(input.idempotencyKey),
    payload: input.payload as ProjectDnaPayload,
    provenance: input.provenance,
    payloadSchema: databaseValidatedPayloadSchema,
  });
  return executeProjectDnaWrite(database, input, prepared, 'create_project_dna_version');
}

export async function appendProjectDnaVersion(
  database: AssetCoreDatabase,
  input: AssetCoreScope & {
    projectDnaId: string;
    idempotencyKey: string;
    payload: unknown;
    provenance: AssetCoreProvenance;
  },
): Promise<ProjectDnaVersionRecord> {
  const prepared = prepareProjectDnaVersion({
    id: input.projectDnaId,
    tenantId: input.tenantId,
    projectId: input.projectId,
    versionId: uuidv7(),
    version: 1,
    idempotencyKeySha256: hashIdempotencyKey(input.idempotencyKey),
    payload: input.payload as ProjectDnaPayload,
    provenance: input.provenance,
    payloadSchema: databaseValidatedPayloadSchema,
  });
  return executeProjectDnaWrite(database, input, prepared, 'append_project_dna_version');
}

export async function createAssetVersion(
  database: AssetCoreDatabase,
  input: AssetCoreScope & {
    idempotencyKey: string;
    payload: unknown;
    provenance: AssetCoreProvenance;
  },
): Promise<AssetVersionRecord> {
  const prepared = prepareAssetVersion({
    assetId: uuidv7(),
    tenantId: input.tenantId,
    projectId: input.projectId,
    versionId: uuidv7(),
    version: 1,
    idempotencyKeySha256: hashIdempotencyKey(input.idempotencyKey),
    payload: input.payload as AssetMetadataPayload,
    provenance: input.provenance,
    payloadSchema: databaseValidatedPayloadSchema,
  });
  return executeAssetWrite(database, input, prepared, 'create_asset_version');
}

export async function appendAssetVersion(
  database: AssetCoreDatabase,
  input: AssetCoreScope & {
    assetId: string;
    idempotencyKey: string;
    payload: unknown;
    provenance: AssetCoreProvenance;
  },
): Promise<AssetVersionRecord> {
  const prepared = prepareAssetVersion({
    assetId: input.assetId,
    tenantId: input.tenantId,
    projectId: input.projectId,
    versionId: uuidv7(),
    version: 1,
    idempotencyKeySha256: hashIdempotencyKey(input.idempotencyKey),
    payload: input.payload as AssetMetadataPayload,
    provenance: input.provenance,
    payloadSchema: databaseValidatedPayloadSchema,
  });
  return executeAssetWrite(database, input, prepared, 'append_asset_version');
}

export async function restoreProjectDnaVersion(
  database: AssetCoreDatabase,
  input: AssetCoreScope & {
    projectDnaId: string;
    sourceVersion: number;
    idempotencyKey: string;
    actorSubjectId: string | null;
    recordedAt: string;
  },
): Promise<ProjectDnaVersionRecord> {
  const source = await getProjectDnaVersion(database, {
    ...input,
    version: input.sourceVersion,
  });
  if (!source) throw new AssetCoreRepositoryError('write_denied');
  const preparedSource = prepareProjectDnaVersion({
    id: source.projectDnaId,
    tenantId: source.tenantId,
    projectId: source.projectId,
    versionId: source.versionId,
    version: source.version,
    idempotencyKeySha256: source.idempotencyKeySha256,
    payload: source.payload,
    provenance: source.provenance,
    payloadSchema: databaseValidatedPayloadSchema,
  });
  const prepared = prepareProjectDnaRestore({
    source: preparedSource,
    versionId: uuidv7(),
    version: source.version + 1,
    idempotencyKeySha256: hashIdempotencyKey(input.idempotencyKey),
    actorSubjectId: input.actorSubjectId,
    recordedAt: input.recordedAt,
    payloadSchema: databaseValidatedPayloadSchema,
  });
  return executeProjectDnaWrite(database, input, prepared, 'append_project_dna_version');
}

export async function restoreAssetVersion(
  database: AssetCoreDatabase,
  input: AssetCoreScope & {
    assetId: string;
    sourceVersion: number;
    idempotencyKey: string;
    actorSubjectId: string | null;
    recordedAt: string;
  },
): Promise<AssetVersionRecord> {
  const source = await getAssetVersion(database, {
    ...input,
    version: input.sourceVersion,
  });
  if (!source) throw new AssetCoreRepositoryError('write_denied');
  const preparedSource = prepareAssetVersion({
    assetId: source.assetId,
    tenantId: source.tenantId,
    projectId: source.projectId,
    versionId: source.versionId,
    version: source.version,
    idempotencyKeySha256: source.idempotencyKeySha256,
    payload: source.payload,
    provenance: source.provenance,
    payloadSchema: databaseValidatedPayloadSchema,
  });
  const prepared = prepareAssetRestore({
    source: preparedSource,
    versionId: uuidv7(),
    version: source.version + 1,
    idempotencyKeySha256: hashIdempotencyKey(input.idempotencyKey),
    actorSubjectId: input.actorSubjectId,
    recordedAt: input.recordedAt,
    payloadSchema: databaseValidatedPayloadSchema,
  });
  return executeAssetWrite(database, input, prepared, 'append_asset_version');
}

export async function getProjectDnaVersion(
  database: AssetCoreDatabase,
  input: AssetCoreScope & { projectDnaId: string; version: number },
): Promise<ProjectDnaVersionRecord | null> {
  return withAssetCoreTransaction(database, input, true, async (client) => {
    const result = await client.query<ProjectDnaSqlRow>(
      `SELECT project_dna_id, tenant_id, project_id, version_id, version, schema_version, payload,
              payload_sha256, idempotency_key_sha256, provenance, created_by_subject_id, created_at
         FROM platform.project_dna_version
        WHERE project_dna_id = $1 AND version = $2 AND tenant_id = $3 AND project_id = $4`,
      [input.projectDnaId, input.version, input.tenantId, input.projectId],
    );
    const row = result.rows[0];
    return row ? toProjectDnaRecord(row) : null;
  });
}

export async function listProjectDnaVersions(
  database: AssetCoreDatabase,
  input: AssetCoreScope & { projectDnaId: string },
): Promise<ProjectDnaVersionRecord[]> {
  return withAssetCoreTransaction(database, input, true, async (client) => {
    const result = await client.query<ProjectDnaSqlRow>(
      `SELECT project_dna_id, tenant_id, project_id, version_id, version, schema_version, payload,
              payload_sha256, idempotency_key_sha256, provenance, created_by_subject_id, created_at
         FROM platform.project_dna_version
        WHERE project_dna_id = $1 AND tenant_id = $2 AND project_id = $3
        ORDER BY version ASC`,
      [input.projectDnaId, input.tenantId, input.projectId],
    );
    return result.rows.map(toProjectDnaRecord);
  });
}

export async function getAssetVersion(
  database: AssetCoreDatabase,
  input: AssetCoreScope & { assetId: string; version: number },
): Promise<AssetVersionRecord | null> {
  return withAssetCoreTransaction(database, input, true, async (client) => {
    const result = await client.query<AssetSqlRow>(
      `SELECT asset_id, tenant_id, project_id, version_id, version, schema_version, payload,
              payload_sha256, idempotency_key_sha256, provenance, created_by_subject_id, created_at
         FROM platform.asset_version
        WHERE asset_id = $1 AND version = $2 AND tenant_id = $3 AND project_id = $4`,
      [input.assetId, input.version, input.tenantId, input.projectId],
    );
    const row = result.rows[0];
    return row ? toAssetRecord(client, row) : null;
  });
}

export async function listAssetVersions(
  database: AssetCoreDatabase,
  input: AssetCoreScope & { assetId: string },
): Promise<AssetVersionRecord[]> {
  return withAssetCoreTransaction(database, input, true, async (client) => {
    const result = await client.query<AssetSqlRow>(
      `SELECT asset_id, tenant_id, project_id, version_id, version, schema_version, payload,
              payload_sha256, idempotency_key_sha256, provenance, created_by_subject_id, created_at
         FROM platform.asset_version
        WHERE asset_id = $1 AND tenant_id = $2 AND project_id = $3
        ORDER BY version ASC`,
      [input.assetId, input.tenantId, input.projectId],
    );
    return Promise.all(result.rows.map((row) => toAssetRecord(client, row)));
  });
}

async function executeProjectDnaWrite(
  database: AssetCoreDatabase,
  scope: AssetCoreScope & { projectDnaId?: string },
  prepared: PreparedProjectDna,
  operation: 'create_project_dna_version' | 'append_project_dna_version',
): Promise<ProjectDnaVersionRecord> {
  return withAssetCoreTransaction(database, scope, false, async (client) => {
    const result = await client.query<WriteResult>(
      `SELECT version_id, version, replayed
         FROM platform.${operation}($1, $2, $3, $4, $5, $6)`,
      [
        prepared.id,
        prepared.versionId,
        prepared.idempotencyKeySha256,
        prepared.canonicalPayload,
        prepared.payloadSha256,
        JSON.stringify(prepared.provenance),
      ],
    );
    const written = result.rows[0];
    if (!written) throw new AssetCoreRepositoryError('write_denied');
    const stored = await client.query<ProjectDnaSqlRow>(
      `SELECT project_dna_id, tenant_id, project_id, version_id, version, schema_version, payload,
              payload_sha256, idempotency_key_sha256, provenance, created_by_subject_id, created_at
         FROM platform.project_dna_version
        WHERE version_id = $1 AND tenant_id = $2 AND project_id = $3`,
      [written.version_id, scope.tenantId, scope.projectId],
    );
    const row = stored.rows[0];
    if (!row) throw new AssetCoreRepositoryError('write_denied');
    assertIdempotentPayloadReplay(
      { payloadSha256: row.payload_sha256, value: row },
      prepared.payloadSha256,
    );
    return { ...toProjectDnaRecord(row), replayed: written.replayed };
  });
}

async function executeAssetWrite(
  database: AssetCoreDatabase,
  scope: AssetCoreScope & { assetId?: string },
  prepared: PreparedAsset,
  operation: 'create_asset_version' | 'append_asset_version',
): Promise<AssetVersionRecord> {
  return withAssetCoreTransaction(database, scope, false, async (client) => {
    const result = await client.query<WriteResult>(
      `SELECT version_id, version, replayed
         FROM platform.${operation}($1, $2, $3, $4, $5, $6)`,
      [
        prepared.assetId,
        prepared.versionId,
        prepared.idempotencyKeySha256,
        prepared.canonicalPayload,
        prepared.payloadSha256,
        JSON.stringify(prepared.provenance),
      ],
    );
    const written = result.rows[0];
    if (!written) throw new AssetCoreRepositoryError('write_denied');
    const stored = await client.query<AssetSqlRow>(
      `SELECT asset_id, tenant_id, project_id, version_id, version, schema_version, payload,
              payload_sha256, idempotency_key_sha256, provenance, created_by_subject_id, created_at
         FROM platform.asset_version
        WHERE version_id = $1 AND tenant_id = $2 AND project_id = $3`,
      [written.version_id, scope.tenantId, scope.projectId],
    );
    const row = stored.rows[0];
    if (!row) throw new AssetCoreRepositoryError('write_denied');
    assertIdempotentPayloadReplay(
      { payloadSha256: row.payload_sha256, value: row },
      prepared.payloadSha256,
    );
    return { ...(await toAssetRecord(client, row)), replayed: written.replayed };
  });
}

async function withAssetCoreTransaction<T>(
  database: AssetCoreDatabase,
  scope: AssetCoreScope,
  readOnly: boolean,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  await database.validateRuntimeRole();
  const client = await database.pool.connect();
  let transactionOpen = false;
  let discardClient = false;
  try {
    await client.query(readOnly ? 'BEGIN READ ONLY' : 'BEGIN');
    transactionOpen = true;
    await client.query("SELECT set_config('spryxel.subject_id', $1, true)", [scope.subjectId]);
    await client.query("SELECT set_config('spryxel.tenant_id', $1, true)", [scope.tenantId]);
    await client.query("SELECT set_config('spryxel.project_id', $1, true)", [scope.projectId]);
    const membership = await client.query(
      `SELECT 1 FROM platform.tenant_membership
        WHERE tenant_id = $1 AND subject_id = $2 AND status = 'active'`,
      [scope.tenantId, scope.subjectId],
    );
    const project = await client.query(
      `SELECT 1 FROM platform.project WHERE id = $1 AND tenant_id = $2`,
      [scope.projectId, scope.tenantId],
    );
    if (membership.rowCount !== 1 || project.rowCount !== 1)
      throw new AssetCoreRepositoryError('write_denied');
    const value = await operation(client);
    await client.query('COMMIT');
    transactionOpen = false;
    return value;
  } catch (error) {
    if (transactionOpen) {
      try {
        await client.query('ROLLBACK');
        transactionOpen = false;
      } catch {
        transactionOpen = false;
        discardClient = true;
      }
    }
    throw mapAssetCoreError(error);
  } finally {
    client.release(discardClient || transactionOpen);
  }
}

async function toAssetRecord(client: PoolClient, row: AssetSqlRow): Promise<AssetVersionRecord> {
  const lineage = await client.query<{
    relation: AssetLineageRelation;
    source_asset_id: string;
    source_asset_version_id: string | null;
  }>(
    `SELECT relation, source_asset_id, source_asset_version_id
       FROM platform.asset_version_lineage
      WHERE asset_version_id = $1 AND tenant_id = $2 AND project_id = $3
      ORDER BY relation, source_asset_id, source_asset_version_id NULLS FIRST`,
    [row.version_id, row.tenant_id, row.project_id],
  );
  return {
    assetId: row.asset_id,
    tenantId: row.tenant_id,
    projectId: row.project_id,
    versionId: row.version_id,
    version: row.version,
    schemaVersion: row.schema_version,
    payload: row.payload,
    payloadSha256: row.payload_sha256,
    idempotencyKeySha256: row.idempotency_key_sha256,
    provenance: row.provenance,
    createdBySubjectId: row.created_by_subject_id,
    createdAt: row.created_at.toISOString(),
    lineage: lineage.rows.map((item) => ({
      relation: item.relation,
      assetId: item.source_asset_id,
      assetVersionId: item.source_asset_version_id,
    })),
  };
}

function toProjectDnaRecord(row: ProjectDnaSqlRow): ProjectDnaVersionRecord {
  return {
    projectDnaId: row.project_dna_id,
    tenantId: row.tenant_id,
    projectId: row.project_id,
    versionId: row.version_id,
    version: row.version,
    schemaVersion: row.schema_version,
    payload: row.payload,
    payloadSha256: row.payload_sha256,
    idempotencyKeySha256: row.idempotency_key_sha256,
    provenance: row.provenance,
    createdBySubjectId: row.created_by_subject_id,
    createdAt: row.created_at.toISOString(),
  };
}

function hashIdempotencyKey(key: string): string {
  if (!/^[A-Za-z0-9._:-]{1,128}$/.test(key)) throw new AssetCoreRepositoryError('invalid_payload');
  return createHash('sha256').update(key, 'utf8').digest('hex');
}

function mapAssetCoreError(error: unknown): AssetCoreRepositoryError | unknown {
  const code =
    typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
  if (code === 'P0001') return new AssetCoreRepositoryError('idempotency_conflict');
  if (code === '42501') return new AssetCoreRepositoryError('write_denied');
  if (code === '22023') return new AssetCoreRepositoryError('invalid_payload');
  if (code === '23503') return new AssetCoreRepositoryError('invalid_reference');
  if (code === '23505') return new AssetCoreRepositoryError('idempotency_conflict');
  return error;
}
