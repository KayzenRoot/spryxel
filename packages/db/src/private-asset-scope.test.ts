import type { Pool, PoolClient } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import {
  PrivateAssetScopeRepositoryError,
  resolvePrivateAssetScope,
  type PrivateAssetScopeDatabase,
} from './private-asset-scope.js';

const request = {
  subjectId: '018f47b2-3b1e-7cc3-8f4b-0c5940b7a334',
  tenantId: '018f47b2-3b1e-7cc3-8f4b-0c5940b7a335',
  projectId: '018f47b2-3b1e-7cc3-8f4b-0c5940b7a336',
  assetVersionId: '018f47b2-3b1e-7cc3-8f4b-0c5940b7a337',
};

const row = {
  transaction_read_only: 'on',
  subject_id: request.subjectId,
  subject_status: 'active',
  tenant_id: request.tenantId,
  tenant_status: 'active',
  membership_status: 'active',
  membership_role: 'OWNER',
  project_id: request.projectId,
  asset_version_id: request.assetVersionId,
  version_status: 'draft',
};

function makeDatabase(
  options: { rows?: unknown[]; failOn?: string; rollbackFails?: boolean } = {},
) {
  const calls: Array<{ sql: string; values?: unknown[] }> = [];
  const client = {
    query: vi.fn(async (sql: string, values?: unknown[]) => {
      calls.push({ sql, ...(values ? { values } : {}) });
      if (options.failOn === sql) throw new Error('sensitive database diagnostic');
      if (sql.includes('FROM platform.identity_subject')) return { rows: options.rows ?? [row] };
      if (sql === 'ROLLBACK' && options.rollbackFails) throw new Error('rollback failed');
      return { rows: [] };
    }),
    release: vi.fn(),
  } as unknown as PoolClient;
  const validateRuntimeRole = vi.fn(async () => undefined);
  const connect = vi.fn(async () => client);
  const database: PrivateAssetScopeDatabase = {
    pool: { connect } as unknown as Pool,
    validateRuntimeRole,
  };
  return { database, calls, client, connect, validateRuntimeRole };
}

describe('private asset scope repository', () => {
  it('resolves only a fresh RLS-scoped read snapshot and rolls back the transaction', async () => {
    const mock = makeDatabase();

    const result = await resolvePrivateAssetScope(mock.database, request);

    expect(result).toEqual({
      allowed: true,
      scope: {
        tenantId: request.tenantId,
        projectId: request.projectId,
        assetVersionId: request.assetVersionId,
        versionStatus: 'draft',
        assetReadAllowed: true,
        uploadAttempt: null,
        membership: {
          subjectId: request.subjectId,
          tenantId: request.tenantId,
          projectId: request.projectId,
          role: 'OWNER',
          active: true,
        },
      },
    });
    expect(mock.validateRuntimeRole).toHaveBeenCalledOnce();
    expect(mock.calls.map(({ sql }) => sql)).toContain('BEGIN READ ONLY');
    expect(mock.calls.map(({ sql }) => sql)).toContain('ROLLBACK');
    expect(mock.calls.map(({ sql }) => sql)).not.toContain('COMMIT');
    expect(
      mock.calls.find(({ sql }) => sql.includes('FROM platform.identity_subject'))?.sql,
    ).toContain("current_setting('transaction_read_only')");
    expect(
      mock.calls
        .filter(({ sql }) => sql.includes('set_config'))
        .every(({ sql }) => sql.endsWith(', true)')),
    ).toBe(true);
    expect(mock.calls.at(-2)?.values).toEqual([
      request.subjectId,
      request.tenantId,
      request.projectId,
      request.assetVersionId,
    ]);
    expect(mock.client.release).toHaveBeenCalledWith(false);
  });

  it('rejects malformed, extended, accessor-backed and non-v7 requests before touching the database', async () => {
    const mock = makeDatabase();
    const withExtra = { ...request, membership: { role: 'OWNER' } };
    const nonV7 = { ...request, assetVersionId: '018f47b2-3b1e-4cc3-8f4b-0c5940b7a337' };
    const accessor = Object.defineProperty({ ...request }, 'subjectId', {
      enumerable: true,
      get: () => request.subjectId,
    });

    await expect(resolvePrivateAssetScope(mock.database, null)).resolves.toEqual({
      allowed: false,
      reason: 'invalid_request',
    });
    await expect(resolvePrivateAssetScope(mock.database, withExtra)).resolves.toEqual({
      allowed: false,
      reason: 'invalid_request',
    });
    await expect(resolvePrivateAssetScope(mock.database, nonV7)).resolves.toEqual({
      allowed: false,
      reason: 'invalid_request',
    });
    await expect(resolvePrivateAssetScope(mock.database, accessor)).resolves.toEqual({
      allowed: false,
      reason: 'invalid_request',
    });
    expect(mock.connect).not.toHaveBeenCalled();
    expect(mock.validateRuntimeRole).not.toHaveBeenCalled();
  });

  it('denies incomplete or mismatched snapshots without returning identifiers', async () => {
    const negativeRows: unknown[][] = [
      [{ ...row, subject_status: 'suspended' }],
      [{ ...row, tenant_status: 'suspended' }],
      [{ ...row, membership_status: 'revoked' }],
      [{ ...row, membership_role: 'UNKNOWN' }],
      [{ ...row, version_status: 'deleted' }],
      [{ ...row, project_id: request.tenantId }],
      [{ ...row, asset_version_id: request.tenantId }],
      [],
    ];

    for (const rows of negativeRows) {
      const mock = makeDatabase({ rows });
      await expect(resolvePrivateAssetScope(mock.database, request)).resolves.toEqual({
        allowed: false,
        reason: 'not_authorized',
      });
      expect(mock.client.release).toHaveBeenCalledWith(false);
    }
  });

  it('sanitizes query failures and discards a connection whose rollback fails', async () => {
    const queryFailure = makeDatabase({ failOn: 'BEGIN READ ONLY' });
    let failure: unknown;
    try {
      await resolvePrivateAssetScope(queryFailure.database, request);
    } catch (error) {
      failure = error;
    }
    expect(failure).toBeInstanceOf(PrivateAssetScopeRepositoryError);
    expect((failure as Error).message).not.toContain('sensitive database diagnostic');
    expect(queryFailure.client.release).toHaveBeenCalledWith(false);

    const rollbackFailure = makeDatabase({
      failOn: "SELECT set_config('spryxel.project_id', $1, true)",
      rollbackFails: true,
    });
    await expect(
      resolvePrivateAssetScope(rollbackFailure.database, request),
    ).rejects.toBeInstanceOf(PrivateAssetScopeRepositoryError);
    expect(rollbackFailure.client.release).toHaveBeenCalledWith(true);
  });
});
