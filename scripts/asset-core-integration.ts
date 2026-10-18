import { createHash } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { assetMetadataV1Schema, projectDnaV1Schema } from '@spryxel/contracts';
import {
  AssetCoreRepositoryError,
  appendAssetVersion,
  appendProjectDnaVersion,
  createAssetVersion,
  createProjectDnaVersion,
  createDatabase,
  createProject,
  getAssetVersion,
  getProjectDnaVersion,
  listAssetVersions,
  listProjectDnaVersions,
  restoreAssetVersion,
  restoreProjectDnaVersion,
} from '@spryxel/db';
import { createUuidV7, prepareProjectDnaVersion } from '@spryxel/domain';

type Identity = { subjectId: string; tenantId: string };
type Scope = { subjectId: string; tenantId: string; projectId: string };

export async function runAssetCoreIntegration(input: {
  databaseUrl: string;
  appDatabaseUrl: string;
  workerDatabaseUrl: string;
  identityA: Identity;
  identityB: Identity;
  projectA: string;
  contractId: string;
  contractVersion: number;
}): Promise<void> {
  const database = createDatabase(input.appDatabaseUrl, { max: 5 });
  const scopeDatabase = createDatabase(input.appDatabaseUrl, { max: 1 });
  const workerDatabase = createDatabase(input.workerDatabaseUrl, { max: 1 }, 'worker');
  const ownerPool = new Pool({ connectionString: input.databaseUrl, max: 1 });
  try {
    await Promise.all([
      database.validateRuntimeRole(),
      scopeDatabase.validateRuntimeRole(),
      workerDatabase.validateRuntimeRole(),
    ]);

    const projectA2 = await createProject(database, {
      idempotencyKeyHash: hash('wo010-asset-core-project-a2-key'),
      requestHash: hash('wo010-asset-core-project-a2-request'),
      subjectId: input.identityA.subjectId,
      tenantId: input.identityA.tenantId,
      requestId: 'wo010-asset-core-project-a2',
      name: 'WO-010 Asset Core Project A2',
    });
    const projectB = await createProject(database, {
      idempotencyKeyHash: hash('wo010-asset-core-project-b-key'),
      requestHash: hash('wo010-asset-core-project-b-request'),
      subjectId: input.identityB.subjectId,
      tenantId: input.identityB.tenantId,
      requestId: 'wo010-asset-core-project-b',
      name: 'WO-010 Asset Core Project B',
    });

    const scopeA: Scope = {
      subjectId: input.identityA.subjectId,
      tenantId: input.identityA.tenantId,
      projectId: input.projectA,
    };
    const scopeA2: Scope = { ...scopeA, projectId: projectA2.id };
    const scopeB: Scope = {
      subjectId: input.identityB.subjectId,
      tenantId: input.identityB.tenantId,
      projectId: projectB.id,
    };

    const dnaPayload = projectDnaPayload('A canonical pixel style');
    const dnaConcurrent = await Promise.all(
      Array.from({ length: 6 }, () =>
        createProjectDnaVersion(database, {
          ...scopeA,
          idempotencyKey: 'wo010-dna-create-same-key',
          payload: dnaPayload,
          provenance: provenance(scopeA.subjectId),
          payloadSchema: projectDnaV1Schema,
        }),
      ),
    );
    const dna = dnaConcurrent[0];
    if (
      !dna ||
      new Set(dnaConcurrent.map((entry) => entry.projectDnaId)).size !== 1 ||
      new Set(dnaConcurrent.map((entry) => entry.versionId)).size !== 1 ||
      dnaConcurrent.filter((entry) => entry.replayed).length !== 5 ||
      dnaConcurrent.some((entry) => entry.payloadSha256 !== dna.payloadSha256)
    ) {
      throw new Error('Concurrent DNA replay did not return one stable version identity');
    }

    await assertDirectRpcRejectsMalformedPayloadAndProvenance(database, scopeA);

    const reorderedDnaPayload = {
      rules: dnaPayload.rules,
      constraints: dnaPayload.constraints,
      visualReferenceIds: dnaPayload.visualReferenceIds,
      palette: dnaPayload.palette,
      styleIdentity: dnaPayload.styleIdentity,
      status: dnaPayload.status,
      schemaVersion: dnaPayload.schemaVersion,
    };
    const canonicalReplay = await createProjectDnaVersion(database, {
      ...scopeA,
      idempotencyKey: 'wo010-dna-create-same-key',
      payload: reorderedDnaPayload,
      provenance: provenance(scopeA.subjectId),
      payloadSchema: projectDnaV1Schema,
    });
    if (canonicalReplay.versionId !== dna.versionId || !canonicalReplay.replayed) {
      throw new Error('Equivalent DNA key ordering did not preserve the canonical digest');
    }

    await expectAssetCoreError(
      createProjectDnaVersion(database, {
        ...scopeA,
        idempotencyKey: 'wo010-dna-create-same-key',
        payload: projectDnaPayload('conflicting DNA content'),
        provenance: provenance(scopeA.subjectId),
        payloadSchema: projectDnaV1Schema,
      }),
      'idempotency_conflict',
    );

    await expectValidationFailure(
      createProjectDnaVersion(database, {
        ...scopeA,
        idempotencyKey: 'wo010-dna-invalid-strict-payload',
        payload: { ...dnaPayload, unexpected: true },
        provenance: provenance(scopeA.subjectId),
        payloadSchema: projectDnaV1Schema,
      }),
    );
    await expectValidationFailure(
      createProjectDnaVersion(database, {
        ...scopeA,
        idempotencyKey: 'wo010-dna-invalid-oversized-payload',
        payload: projectDnaPayload('x'.repeat(70_000)),
        provenance: provenance(scopeA.subjectId),
        payloadSchema: projectDnaV1Schema,
      }),
    );

    const dnaV2 = await appendProjectDnaVersion(database, {
      ...scopeA,
      projectDnaId: dna.projectDnaId,
      idempotencyKey: 'wo010-dna-append-v2',
      payload: projectDnaPayload('A canonical pixel style v2'),
      provenance: provenance(scopeA.subjectId),
      payloadSchema: projectDnaV1Schema,
    });
    await expectAssetCoreError(
      appendProjectDnaVersion(database, {
        ...scopeA,
        projectDnaId: dna.projectDnaId,
        idempotencyKey: 'wo010-dna-invalid-status-transition',
        payload: { ...projectDnaPayload('illegal published-to-draft'), status: 'draft' },
        provenance: provenance(scopeA.subjectId),
        payloadSchema: projectDnaV1Schema,
      }),
      'invalid_payload',
    );
    const dnaRestore = await restoreProjectDnaVersion(database, {
      ...scopeA,
      projectDnaId: dna.projectDnaId,
      sourceVersion: 1,
      idempotencyKey: 'wo010-dna-restore-v1',
      actorSubjectId: scopeA.subjectId,
      recordedAt: new Date().toISOString(),
      payloadSchema: projectDnaV1Schema,
    });
    const dnaRestoreReplay = await restoreProjectDnaVersion(database, {
      ...scopeA,
      projectDnaId: dna.projectDnaId,
      sourceVersion: 1,
      idempotencyKey: 'wo010-dna-restore-v1',
      actorSubjectId: scopeA.subjectId,
      recordedAt: new Date().toISOString(),
      payloadSchema: projectDnaV1Schema,
    });
    const dnaHistory = await listProjectDnaVersions(database, {
      ...scopeA,
      projectDnaId: dna.projectDnaId,
    });
    if (
      dnaV2.version !== 2 ||
      dnaRestore.version !== 3 ||
      dnaRestore.provenance.source !== 'restore' ||
      dnaRestore.provenance.sourceVersionId !== dna.versionId ||
      dnaRestore.payload.status !== 'draft' ||
      dnaRestoreReplay.versionId !== dnaRestore.versionId ||
      !dnaRestoreReplay.replayed ||
      dnaHistory.length !== 3 ||
      dnaHistory.find((entry) => entry.version === 1)?.payload.styleIdentity !==
        'A canonical pixel style'
    ) {
      throw new Error('DNA append-only history or restore-as-new invariant failed');
    }

    const assetPayload = (name: string, overrides: Record<string, unknown> = {}) => ({
      schemaVersion: 'asset-metadata.v1' as const,
      assetType: 'image',
      assetSubtype: 'sprite',
      name,
      description: null,
      tags: ['wo010', 'integration'],
      status: 'draft' as const,
      lineage: [] as Array<{
        relation: 'derived_from' | 'variant_of' | 'component_of' | 'frame_of' | 'source';
        assetId: string;
        assetVersionId: string | null;
      }>,
      assetContract: { id: input.contractId, version: input.contractVersion },
      projectDna: { id: dna.projectDnaId, version: 1 },
      dimensions: { width: 32, height: 32, frameCount: 1, fps: null },
      paletteId: null,
      attributes: {},
      ...overrides,
    });

    const baseAsset = await createAssetVersion(database, {
      ...scopeA,
      idempotencyKey: 'wo010-asset-base-v1',
      payload: assetPayload('WO-010 base asset'),
      provenance: provenance(scopeA.subjectId),
      payloadSchema: assetMetadataV1Schema,
    });
    await expectAssetCoreError(
      appendAssetVersion(database, {
        ...scopeA,
        assetId: baseAsset.assetId,
        idempotencyKey: 'wo010-asset-invalid-status-transition',
        payload: assetPayload('illegal draft-to-archived', { status: 'archived' }),
        provenance: provenance(scopeA.subjectId),
        payloadSchema: assetMetadataV1Schema,
      }),
      'invalid_payload',
    );
    const derivedPayload = assetPayload('WO-010 derived asset', {
      lineage: [
        {
          relation: 'derived_from',
          assetId: baseAsset.assetId,
          assetVersionId: baseAsset.versionId,
        },
      ],
    });
    const derivedAsset = await createAssetVersion(database, {
      ...scopeA,
      idempotencyKey: 'wo010-asset-derived-v1',
      payload: derivedPayload,
      provenance: provenance(scopeA.subjectId),
      payloadSchema: assetMetadataV1Schema,
    });
    const assetV2 = await appendAssetVersion(database, {
      ...scopeA,
      assetId: baseAsset.assetId,
      idempotencyKey: 'wo010-asset-base-v2',
      payload: assetPayload('WO-010 base asset v2'),
      provenance: provenance(scopeA.subjectId),
      payloadSchema: assetMetadataV1Schema,
    });
    const assetRestore = await restoreAssetVersion(database, {
      ...scopeA,
      assetId: baseAsset.assetId,
      sourceVersion: 1,
      idempotencyKey: 'wo010-asset-restore-v1',
      actorSubjectId: scopeA.subjectId,
      recordedAt: new Date().toISOString(),
      payloadSchema: assetMetadataV1Schema,
    });
    const assetRestoreReplay = await restoreAssetVersion(database, {
      ...scopeA,
      assetId: baseAsset.assetId,
      sourceVersion: 1,
      idempotencyKey: 'wo010-asset-restore-v1',
      actorSubjectId: scopeA.subjectId,
      recordedAt: new Date().toISOString(),
      payloadSchema: assetMetadataV1Schema,
    });
    const assetHistory = await listAssetVersions(database, {
      ...scopeA,
      assetId: baseAsset.assetId,
    });
    const derivedRead = await getAssetVersion(database, {
      ...scopeA,
      assetId: derivedAsset.assetId,
      version: 1,
    });
    if (
      baseAsset.payload.assetContract?.id !== input.contractId ||
      baseAsset.payload.projectDna?.id !== dna.projectDnaId ||
      derivedRead?.lineage.length !== 1 ||
      derivedRead.lineage[0]?.assetId !== baseAsset.assetId ||
      derivedRead.lineage[0]?.assetVersionId !== baseAsset.versionId ||
      assetV2.version !== 2 ||
      assetRestore.version !== 3 ||
      assetRestore.provenance.sourceVersionId !== baseAsset.versionId ||
      assetRestore.payload.status !== 'draft' ||
      assetRestoreReplay.versionId !== assetRestore.versionId ||
      !assetRestoreReplay.replayed ||
      assetHistory.length !== 3 ||
      assetHistory.find((entry) => entry.version === 1)?.payload.name !== 'WO-010 base asset'
    ) {
      throw new Error('Asset Contract/DNA references, lineage or immutable restore history failed');
    }

    await expectValidationFailure(
      createAssetVersion(database, {
        ...scopeA,
        idempotencyKey: 'wo010-asset-invalid-strict-payload',
        payload: { ...assetPayload('invalid'), unexpected: true },
        provenance: provenance(scopeA.subjectId),
        payloadSchema: assetMetadataV1Schema,
      }),
    );

    const dnaOtherProject = await createProjectDnaVersion(database, {
      ...scopeA2,
      idempotencyKey: 'wo010-dna-other-project',
      payload: projectDnaPayload('A2 private DNA'),
      provenance: provenance(scopeA2.subjectId),
      payloadSchema: projectDnaV1Schema,
    });
    const assetOtherProject = await createAssetVersion(database, {
      ...scopeA2,
      idempotencyKey: 'wo010-asset-other-project',
      payload: assetPayload('A2 private asset', {
        assetContract: null,
        projectDna: { id: dnaOtherProject.projectDnaId, version: 1 },
      }),
      provenance: provenance(scopeA2.subjectId),
      payloadSchema: assetMetadataV1Schema,
    });
    const dnaB = await createProjectDnaVersion(database, {
      ...scopeB,
      idempotencyKey: 'wo010-dna-tenant-b',
      payload: projectDnaPayload('Tenant B private DNA'),
      provenance: provenance(scopeB.subjectId),
      payloadSchema: projectDnaV1Schema,
    });
    const assetB = await createAssetVersion(database, {
      ...scopeB,
      idempotencyKey: 'wo010-asset-tenant-b',
      payload: assetPayload('Tenant B private asset', { assetContract: null, projectDna: null }),
      provenance: provenance(scopeB.subjectId),
      payloadSchema: assetMetadataV1Schema,
    });

    await expectAssetCoreError(
      createAssetVersion(database, {
        ...scopeA,
        idempotencyKey: 'wo010-asset-cross-project-dna',
        payload: assetPayload('cross-project DNA', {
          assetContract: null,
          projectDna: { id: dnaOtherProject.projectDnaId, version: 1 },
        }),
        provenance: provenance(scopeA.subjectId),
        payloadSchema: assetMetadataV1Schema,
      }),
      'invalid_reference',
    );
    await expectAssetCoreError(
      createAssetVersion(database, {
        ...scopeA,
        idempotencyKey: 'wo010-asset-cross-project-lineage',
        payload: assetPayload('cross-project lineage', {
          assetContract: null,
          projectDna: null,
          lineage: [
            {
              relation: 'derived_from',
              assetId: assetOtherProject.assetId,
              assetVersionId: assetOtherProject.versionId,
            },
          ],
        }),
        provenance: provenance(scopeA.subjectId),
        payloadSchema: assetMetadataV1Schema,
      }),
      'invalid_reference',
    );

    const beforeCrossTenantFailure = await assetCoreCounts(
      ownerPool,
      scopeA.tenantId,
      scopeA.projectId,
    );
    await expectAssetCoreError(
      createAssetVersion(database, {
        ...scopeA,
        idempotencyKey: 'wo010-asset-cross-tenant-lineage',
        payload: assetPayload('cross-tenant lineage', {
          assetContract: null,
          projectDna: null,
          lineage: [
            { relation: 'derived_from', assetId: assetB.assetId, assetVersionId: assetB.versionId },
          ],
        }),
        provenance: provenance(scopeA.subjectId),
        payloadSchema: assetMetadataV1Schema,
      }),
      'invalid_reference',
    );
    const afterCrossTenantFailure = await assetCoreCounts(
      ownerPool,
      scopeA.tenantId,
      scopeA.projectId,
    );
    if (JSON.stringify(afterCrossTenantFailure) !== JSON.stringify(beforeCrossTenantFailure)) {
      throw new Error('Failed cross-tenant lineage write left partial Asset Core rows behind');
    }

    if (
      (await getProjectDnaVersion(database, {
        ...scopeB,
        projectDnaId: dna.projectDnaId,
        version: 1,
      })) !== null ||
      (await listProjectDnaVersions(database, { ...scopeB, projectDnaId: dna.projectDnaId }))
        .length !== 0 ||
      (await getAssetVersion(database, {
        ...scopeB,
        assetId: baseAsset.assetId,
        version: 1,
      })) !== null ||
      (await listAssetVersions(database, { ...scopeB, assetId: baseAsset.assetId })).length !== 0 ||
      (await getProjectDnaVersion(database, {
        ...scopeA2,
        projectDnaId: dna.projectDnaId,
        version: 1,
      })) !== null ||
      (await getAssetVersion(database, {
        ...scopeA2,
        assetId: baseAsset.assetId,
        version: 1,
      })) !== null
    ) {
      throw new Error('Tenant or same-tenant project isolation leaked a guessed ID/version');
    }

    await assertAssetCoreRolePrivileges(ownerPool);
    await assertWorkerAssetCoreDenied(workerDatabase);
    await assertRlsIsolationAndContextReset(scopeDatabase, scopeA, scopeA2, scopeB, dna, dnaB);
    await assertPrivilegedImmutability(ownerPool, scopeA, dna, baseAsset);

    process.stdout.write(
      'Asset Core integration: PASS (A01-A04; B01-B06; tenant/project guessed-ID isolation; cross-scope lineage and FK denial; transaction rollback; forced RLS; immutable history; no stale pooled context).\n',
    );
  } finally {
    await Promise.all([
      database.close(),
      scopeDatabase.close(),
      workerDatabase.close(),
      ownerPool.end(),
    ]);
  }
}

async function assertAssetCoreRolePrivileges(pool: Pool): Promise<void> {
  const tableNames = [
    'project_dna',
    'project_dna_version',
    'asset',
    'asset_version',
    'asset_version_lineage',
  ];
  const tableResult = await pool.query<{
    relname: string;
    row_security: boolean;
    force_row_security: boolean;
    app_select: boolean;
    app_insert: boolean;
    app_update: boolean;
    app_delete: boolean;
    app_truncate: boolean;
    app_references: boolean;
    app_trigger: boolean;
    worker_any: boolean;
  }>(
    `SELECT relation.relname,
            relation.relrowsecurity AS row_security,
            relation.relforcerowsecurity AS force_row_security,
            has_table_privilege('spryxel_app', relation.oid, 'SELECT') AS app_select,
            has_table_privilege('spryxel_app', relation.oid, 'INSERT') AS app_insert,
            has_table_privilege('spryxel_app', relation.oid, 'UPDATE') AS app_update,
            has_table_privilege('spryxel_app', relation.oid, 'DELETE') AS app_delete,
            has_table_privilege('spryxel_app', relation.oid, 'TRUNCATE') AS app_truncate,
            has_table_privilege('spryxel_app', relation.oid, 'REFERENCES') AS app_references,
            has_table_privilege('spryxel_app', relation.oid, 'TRIGGER') AS app_trigger,
            has_any_column_privilege('spryxel_worker', relation.oid, 'SELECT') OR
            has_any_column_privilege('spryxel_worker', relation.oid, 'INSERT') OR
            has_any_column_privilege('spryxel_worker', relation.oid, 'UPDATE') OR
            has_any_column_privilege('spryxel_worker', relation.oid, 'REFERENCES') OR
            has_table_privilege('spryxel_worker', relation.oid, 'DELETE') OR
            has_table_privilege('spryxel_worker', relation.oid, 'TRUNCATE') OR
            has_table_privilege('spryxel_worker', relation.oid, 'TRIGGER') AS worker_any
       FROM pg_catalog.pg_class relation
       JOIN pg_catalog.pg_namespace namespace ON namespace.oid = relation.relnamespace
      WHERE namespace.nspname = 'platform' AND relation.relname = ANY($1::text[])
      ORDER BY relation.relname`,
    [tableNames],
  );
  if (
    tableResult.rows.length !== tableNames.length ||
    tableResult.rows.some(
      (row) =>
        !row.row_security ||
        !row.force_row_security ||
        !row.app_select ||
        row.app_insert ||
        row.app_update ||
        row.app_delete ||
        row.app_truncate ||
        row.app_references ||
        row.app_trigger ||
        row.worker_any,
    )
  ) {
    throw new Error('Asset Core tables did not have FORCE RLS and the exact app/worker grants');
  }

  const signatures = [
    'platform.create_project_dna_version(uuid,uuid,text,text,text,text)',
    'platform.append_project_dna_version(uuid,uuid,text,text,text,text)',
    'platform.create_asset_version(uuid,uuid,text,text,text,text)',
    'platform.append_asset_version(uuid,uuid,text,text,text,text)',
  ];
  const functionResult = await pool.query<{
    signature: string;
    app_executes: boolean;
    worker_executes: boolean;
  }>(
    `SELECT signature,
            has_function_privilege('spryxel_app', to_regprocedure(signature), 'EXECUTE') AS app_executes,
            has_function_privilege('spryxel_worker', to_regprocedure(signature), 'EXECUTE') AS worker_executes
       FROM unnest($1::text[]) AS functions(signature)`,
    [signatures],
  );
  if (
    functionResult.rows.length !== signatures.length ||
    functionResult.rows.some((row) => !row.app_executes || row.worker_executes)
  ) {
    throw new Error('Asset Core write function privileges differed from app-only allowlist');
  }

  const helperNames = [
    'platform.assert_asset_core_write_context()',
    'platform.parse_asset_core_payload(text,text,text)',
    'platform.parse_asset_core_provenance(text,uuid)',
    'platform.lock_asset_core_idempotency(text,text,uuid,uuid,uuid)',
  ];
  const helperResult = await pool.query<{ has_exec: boolean }>(
    `SELECT has_function_privilege('spryxel_app', to_regprocedure(signature), 'EXECUTE') AS has_exec
       FROM unnest($1::text[]) AS functions(signature)`,
    [helperNames],
  );
  if (
    helperResult.rows.length !== helperNames.length ||
    helperResult.rows.some((row) => row.has_exec)
  ) {
    throw new Error('Internal Asset Core helper functions were executable by the app role');
  }
}

async function assertWorkerAssetCoreDenied(
  database: ReturnType<typeof createDatabase>,
): Promise<void> {
  for (const table of [
    'project_dna',
    'project_dna_version',
    'asset',
    'asset_version',
    'asset_version_lineage',
  ]) {
    let denied = false;
    try {
      await database.pool.query(`SELECT * FROM platform.${table}`);
    } catch (error) {
      denied = sqlState(error) === '42501';
    }
    if (!denied) throw new Error(`Worker unexpectedly read platform.${table}`);
  }
}

async function assertDirectRpcRejectsMalformedPayloadAndProvenance(
  database: ReturnType<typeof createDatabase>,
  scope: Scope,
): Promise<void> {
  const prepared = prepareProjectDnaVersion({
    id: createUuidV7(),
    tenantId: scope.tenantId,
    projectId: scope.projectId,
    versionId: createUuidV7(),
    version: 1,
    idempotencyKeySha256: hash('wo010-direct-rpc-null-provenance-key'),
    payload: projectDnaPayload('direct RPC provenance validation'),
    provenance: provenance(scope.subjectId),
    payloadSchema: projectDnaV1Schema,
  });
  const schemaVersionMissing = { ...prepared.payload } as Record<string, unknown>;
  delete schemaVersionMissing.schemaVersion;
  const schemaVersionNull = { ...prepared.payload, schemaVersion: null };
  const cases = [
    ...(['source', 'recordedAt'] as const).map((field) => ({
      label: `null provenance ${field}`,
      payload: prepared.payload,
      provenance: { ...prepared.provenance, [field]: null },
    })),
    {
      label: 'missing schemaVersion',
      payload: schemaVersionMissing,
      provenance: prepared.provenance,
    },
    {
      label: 'null schemaVersion',
      payload: schemaVersionNull,
      provenance: prepared.provenance,
    },
    {
      label: 'non-ISO infinity recordedAt',
      payload: prepared.payload,
      provenance: { ...prepared.provenance, recordedAt: 'infinity' },
    },
  ];
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setContext(client, scope);
    for (const testCase of cases) {
      await client.query('SAVEPOINT asset_core_null_provenance');
      let rejected = false;
      const canonicalPayload = JSON.stringify(testCase.payload);
      try {
        await client.query('SELECT * FROM platform.create_project_dna_version($1,$2,$3,$4,$5,$6)', [
          prepared.id,
          prepared.versionId,
          prepared.idempotencyKeySha256,
          canonicalPayload,
          hash(canonicalPayload),
          JSON.stringify(testCase.provenance),
        ]);
      } catch (error) {
        if (sqlState(error) !== '22023') throw error;
        rejected = true;
      }
      await client.query('ROLLBACK TO SAVEPOINT asset_core_null_provenance');
      await client.query('RELEASE SAVEPOINT asset_core_null_provenance');
      if (!rejected) {
        throw new Error(`Direct Asset Core RPC accepted malformed input: ${testCase.label}`);
      }
    }
    await client.query('ROLLBACK');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function assertRlsIsolationAndContextReset(
  database: ReturnType<typeof createDatabase>,
  scopeA: Scope,
  scopeA2: Scope,
  scopeB: Scope,
  dnaA: { projectDnaId: string },
  dnaB: { projectDnaId: string },
): Promise<void> {
  const client = await database.pool.connect();
  try {
    const noContext = await client.query<{ dna_count: string; asset_count: string }>(
      `SELECT (SELECT count(*) FROM platform.project_dna)::text AS dna_count,
              (SELECT count(*) FROM platform.asset)::text AS asset_count`,
    );
    if (noContext.rows[0]?.dna_count !== '0' || noContext.rows[0]?.asset_count !== '0') {
      throw new Error('Asset Core RLS exposed rows without transaction-scoped context');
    }

    await verifyScopedDnaRead(client, scopeA, dnaA.projectDnaId, true);
    await verifyScopedDnaRead(client, scopeB, dnaA.projectDnaId, false);
    await verifyScopedDnaRead(client, scopeB, dnaB.projectDnaId, true);
    await verifyScopedDnaRead(client, scopeA2, dnaA.projectDnaId, false);

    const reset = await client.query<{ dna_count: string }>(
      'SELECT count(*)::text AS dna_count FROM platform.project_dna',
    );
    if (reset.rows[0]?.dna_count !== '0') {
      throw new Error('Transaction-local principal context leaked across pooled transactions');
    }
  } finally {
    client.release();
  }
}

async function verifyScopedDnaRead(
  client: PoolClient,
  scope: Scope,
  projectDnaId: string,
  expected: boolean,
): Promise<void> {
  await client.query('BEGIN');
  try {
    await setContext(client, scope);
    const selected = await client.query('SELECT id FROM platform.project_dna WHERE id = $1', [
      projectDnaId,
    ]);
    if ((selected.rowCount === 1) !== expected) {
      throw new Error('Asset Core FORCE RLS returned a row outside the tenant/project context');
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }
}

async function assertPrivilegedImmutability(
  pool: Pool,
  scope: Scope,
  dna: { projectDnaId: string },
  asset: { assetId: string },
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await setContext(client, scope);
    await expectMutationDenied(
      client,
      'UPDATE platform.project_dna_version SET payload = payload WHERE project_dna_id = $1',
      [dna.projectDnaId],
    );
    await expectMutationDenied(client, 'DELETE FROM platform.asset WHERE id = $1', [asset.assetId]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function expectMutationDenied(
  client: PoolClient,
  statement: string,
  values: string[],
): Promise<void> {
  await client.query('SAVEPOINT asset_core_immutable_mutation');
  let denied = false;
  try {
    await client.query(statement, values);
  } catch (error) {
    denied = sqlState(error) === '42501';
    await client.query('ROLLBACK TO SAVEPOINT asset_core_immutable_mutation');
    if (!denied) throw error;
  }
  if (!denied) {
    await client.query('ROLLBACK TO SAVEPOINT asset_core_immutable_mutation');
    throw new Error('Privileged UPDATE or DELETE changed immutable Asset Core history');
  }
  await client.query('RELEASE SAVEPOINT asset_core_immutable_mutation');
}

async function assetCoreCounts(pool: Pool, tenantId: string, projectId: string): Promise<string[]> {
  const result = await pool.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM platform.project_dna WHERE tenant_id = $1 AND project_id = $2
     UNION ALL SELECT count(*)::text FROM platform.project_dna_version WHERE tenant_id = $1 AND project_id = $2
     UNION ALL SELECT count(*)::text FROM platform.asset WHERE tenant_id = $1 AND project_id = $2
     UNION ALL SELECT count(*)::text FROM platform.asset_version WHERE tenant_id = $1 AND project_id = $2
     UNION ALL SELECT count(*)::text FROM platform.asset_version_lineage WHERE tenant_id = $1 AND project_id = $2`,
    [tenantId, projectId],
  );
  return result.rows.map((row) => row.count);
}

function projectDnaPayload(styleIdentity: string) {
  return {
    schemaVersion: 'project-dna.v1' as const,
    status: 'published' as const,
    styleIdentity,
    palette: [{ name: 'Primary', colors: ['#369'] }],
    visualReferenceIds: [] as string[],
    constraints: { avoidPublicUrls: true },
    rules: ['Preserve silhouette'],
  };
}

function provenance(actorSubjectId: string) {
  return {
    source: 'manual' as const,
    actorSubjectId,
    recordedAt: new Date().toISOString(),
    sourceVersionId: null,
  };
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

async function setContext(client: PoolClient, scope: Scope): Promise<void> {
  await client.query(
    `SELECT set_config('spryxel.subject_id', $1, true),
            set_config('spryxel.tenant_id', $2, true),
            set_config('spryxel.project_id', $3, true)`,
    [scope.subjectId, scope.tenantId, scope.projectId],
  );
}

async function expectAssetCoreError(
  operation: Promise<unknown>,
  expectedCode: AssetCoreRepositoryError['code'],
): Promise<void> {
  try {
    await operation;
  } catch (error) {
    if (error instanceof AssetCoreRepositoryError && error.code === expectedCode) return;
    throw error;
  }
  throw new Error(`Expected Asset Core repository rejection: ${expectedCode}`);
}

async function expectValidationFailure(operation: Promise<unknown>): Promise<void> {
  try {
    await operation;
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error.code === 'invalid_payload' || error.code === 'payload_too_large')
    ) {
      return;
    }
    throw error;
  }
  throw new Error('Strict Asset Core schema validation accepted an invalid payload');
}

function sqlState(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined;
}
