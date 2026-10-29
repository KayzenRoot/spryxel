import type { Pool, PoolClient } from 'pg';
import type { PrivateAssetResolvedScope } from '@spryxel/domain';

export type PrivateAssetScopeRequest = Readonly<{
  subjectId: string;
  tenantId: string;
  projectId: string;
  assetVersionId: string;
}>;

export type PrivateAssetScopeResolution =
  | Readonly<{ allowed: true; scope: PrivateAssetResolvedScope }>
  | Readonly<{ allowed: false; reason: 'invalid_request' | 'not_authorized' }>;

export type PrivateAssetScopeRepositoryPort = Readonly<{
  resolve(input: PrivateAssetScopeRequest): Promise<PrivateAssetScopeResolution>;
}>;

export type PrivateAssetScopeDatabase = Readonly<{
  pool: Pool;
  validateRuntimeRole(): Promise<void>;
}>;

export class PrivateAssetScopeRepositoryError extends Error {
  constructor() {
    super('Private asset scope could not be resolved');
    this.name = 'PrivateAssetScopeRepositoryError';
  }
}

type ScopeRow = {
  transaction_read_only: string;
  subject_id: string;
  subject_status: string;
  tenant_id: string;
  tenant_status: string;
  membership_status: string;
  membership_role: string;
  project_id: string;
  asset_version_id: string;
  version_status: string | null;
};

const requestKeys = ['subjectId', 'tenantId', 'projectId', 'assetVersionId'] as const;
const uuidV7Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const membershipRoles = new Set(['OWNER', 'ADMIN', 'MEMBER']);
const versionStatuses = new Set(['draft', 'published', 'archived']);

/**
 * Create a repository that resolves only server-verified identifiers. Callers
 * must source subjectId from the authenticated principal, never request data.
 */
export function createPrivateAssetScopeRepository(
  database: PrivateAssetScopeDatabase,
): PrivateAssetScopeRepositoryPort {
  return {
    resolve: (input) => resolvePrivateAssetScope(database, input),
  };
}

/**
 * Resolve a fresh scope inside a transaction-local PostgreSQL FORCE RLS context.
 * Upload attempts stay unresolved until a durable repository exists.
 */
export async function resolvePrivateAssetScope(
  database: PrivateAssetScopeDatabase,
  input: unknown,
): Promise<PrivateAssetScopeResolution> {
  const request = parseRequest(input);
  if (!request) return { allowed: false, reason: 'invalid_request' };

  const row = await withReadOnlyScopeTransaction(database, request, async (client) => {
    const result = await client.query<ScopeRow>(
      `SELECT current_setting('transaction_read_only') AS transaction_read_only,
              subject.id::text AS subject_id,
              subject.status AS subject_status,
              tenant.id::text AS tenant_id,
              tenant.status AS tenant_status,
              membership.status AS membership_status,
              membership.role AS membership_role,
              project.id::text AS project_id,
              asset_version.version_id::text AS asset_version_id,
              asset_version.payload->>'status' AS version_status
         FROM platform.identity_subject AS subject
         JOIN platform.tenant AS tenant ON tenant.id = $2::uuid
         JOIN platform.tenant_membership AS membership
           ON membership.tenant_id = tenant.id AND membership.subject_id = subject.id
         JOIN platform.project AS project
           ON project.id = $3::uuid AND project.tenant_id = tenant.id
         JOIN platform.asset_version AS asset_version
           ON asset_version.version_id = $4::uuid
          AND asset_version.tenant_id = tenant.id
          AND asset_version.project_id = project.id
        WHERE subject.id = $1::uuid`,
      [request.subjectId, request.tenantId, request.projectId, request.assetVersionId],
    );
    return result.rows[0] ?? null;
  });

  if (
    row?.transaction_read_only !== 'on' ||
    row.subject_id !== request.subjectId ||
    row.subject_status !== 'active' ||
    row.tenant_id !== request.tenantId ||
    row.tenant_status !== 'active' ||
    row.membership_status !== 'active' ||
    !membershipRoles.has(row.membership_role) ||
    row.project_id !== request.projectId ||
    row.asset_version_id !== request.assetVersionId ||
    !row.version_status ||
    !versionStatuses.has(row.version_status)
  ) {
    return { allowed: false, reason: 'not_authorized' };
  }

  return {
    allowed: true,
    scope: {
      tenantId: request.tenantId,
      projectId: request.projectId,
      assetVersionId: request.assetVersionId,
      versionStatus: row.version_status as PrivateAssetResolvedScope['versionStatus'],
      // The existing asset_version SELECT policy grants active tenant members
      // access within this exact tenant/project RLS context.
      assetReadAllowed: true,
      uploadAttempt: null,
      membership: {
        subjectId: request.subjectId,
        tenantId: request.tenantId,
        projectId: request.projectId,
        role: row.membership_role as 'OWNER' | 'ADMIN' | 'MEMBER',
        active: true,
      },
    },
  };
}

function parseRequest(input: unknown): PrivateAssetScopeRequest | null {
  try {
    if (typeof input !== 'object' || input === null || Array.isArray(input)) return null;
    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) return null;

    const keys = Reflect.ownKeys(input);
    if (
      keys.length !== requestKeys.length ||
      keys.some(
        (key) =>
          typeof key !== 'string' || !requestKeys.includes(key as (typeof requestKeys)[number]),
      )
    ) {
      return null;
    }

    const values = new Map<string, string>();
    for (const key of requestKeys) {
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      if (!descriptor?.enumerable || !('value' in descriptor)) return null;
      if (typeof descriptor.value !== 'string' || !uuidV7Pattern.test(descriptor.value))
        return null;
      values.set(key, descriptor.value.toLowerCase());
    }

    const subjectId = values.get('subjectId');
    const tenantId = values.get('tenantId');
    const projectId = values.get('projectId');
    const assetVersionId = values.get('assetVersionId');
    if (!subjectId || !tenantId || !projectId || !assetVersionId) return null;

    return {
      subjectId,
      tenantId,
      projectId,
      assetVersionId,
    };
  } catch {
    return null;
  }
}

async function withReadOnlyScopeTransaction<T>(
  database: PrivateAssetScopeDatabase,
  request: PrivateAssetScopeRequest,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  let client: PoolClient;
  try {
    await database.validateRuntimeRole();
    client = await database.pool.connect();
  } catch {
    throw new PrivateAssetScopeRepositoryError();
  }

  let transactionOpen = false;
  let discardClient = false;
  let operationFailed = false;
  let result: T | undefined;
  try {
    await client.query('BEGIN READ ONLY');
    transactionOpen = true;
    await client.query("SELECT set_config('spryxel.subject_id', $1, true)", [request.subjectId]);
    await client.query("SELECT set_config('spryxel.tenant_id', $1, true)", [request.tenantId]);
    await client.query("SELECT set_config('spryxel.project_id', $1, true)", [request.projectId]);
    result = await operation(client);
  } catch {
    operationFailed = true;
  } finally {
    if (transactionOpen) {
      try {
        await client.query('ROLLBACK');
        transactionOpen = false;
      } catch {
        transactionOpen = false;
        discardClient = true;
      }
    }
    try {
      client.release(discardClient || transactionOpen);
    } catch {
      operationFailed = true;
    }
  }

  if (operationFailed || discardClient || transactionOpen) {
    throw new PrivateAssetScopeRepositoryError();
  }
  return result as T;
}
