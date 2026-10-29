import { createHash } from 'node:crypto';
import { Pool, type PoolClient } from 'pg';
import { assetMetadataV1Schema, projectDnaV1Schema } from '@spryxel/contracts';
import {
  AssetCoreRepositoryError,
  appendAssetVersion,
  appendProjectDnaVersion,
  createPrivateAssetScopeRepository,
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
import {
  createUuidV7,
  prepareAssetVersion,
  prepareProjectDnaVersion,
  type AssetMetadataPayload,
  type PrivateAssetResolvedScope,
  canAccessPrivateAsset,
} from '@spryxel/domain';

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
    const payloadValidation = await ownerPool.query<Record<string, boolean>>(
      `SELECT platform.asset_core_payload_matches_schema($1::jsonb, 'project-dna.v1') AS payload_matches,
              platform.asset_core_bounded_json_object($1::jsonb) AS bounded_root,
              platform.asset_core_has_exact_keys(
                $1::jsonb,
                ARRAY['schemaVersion', 'status', 'styleIdentity', 'palette', 'visualReferenceIds', 'constraints', 'rules']
              ) AS exact_root,
              platform.asset_core_jsonb_is_bounded_text($1::jsonb->'styleIdentity', 1, 256) AS bounded_style,
              platform.asset_core_bounded_json_object($1::jsonb->'constraints') AS bounded_constraints,
              platform.asset_core_has_exact_keys($1::jsonb->'palette'->0, ARRAY['name', 'colors']) AS exact_palette_item,
              platform.asset_core_jsonb_is_bounded_text($1::jsonb->'palette'->0->'name', 1, 80) AS bounded_palette_name`,
      [JSON.stringify(dnaPayload)],
    );
    if (payloadValidation.rows[0]?.payload_matches !== true) {
      throw new Error(
        `SQL rejected its canonical DNA fixture: ${JSON.stringify(payloadValidation.rows[0])}`,
      );
    }
    const dnaConcurrent = await Promise.all(
      Array.from({ length: 6 }, () =>
        createProjectDnaVersion(database, {
          ...scopeA,
          idempotencyKey: 'wo010-dna-create-same-key',
          payload: dnaPayload,
          provenance: provenance(scopeA.subjectId),
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
      }),
      'idempotency_conflict',
    );

    await expectValidationFailure(
      createProjectDnaVersion(database, {
        ...scopeA,
        idempotencyKey: 'wo010-dna-invalid-strict-payload',
        payload: { ...dnaPayload, unexpected: true },
        provenance: provenance(scopeA.subjectId),
      }),
    );
    await expectValidationFailure(
      createProjectDnaVersion(database, {
        ...scopeA,
        idempotencyKey: 'wo010-dna-invalid-oversized-payload',
        payload: projectDnaPayload('x'.repeat(70_000)),
        provenance: provenance(scopeA.subjectId),
      }),
    );

    const dnaV2 = await appendProjectDnaVersion(database, {
      ...scopeA,
      projectDnaId: dna.projectDnaId,
      idempotencyKey: 'wo010-dna-append-v2',
      payload: projectDnaPayload('A canonical pixel style v2'),
      provenance: provenance(scopeA.subjectId),
    });
    await expectAssetCoreError(
      appendProjectDnaVersion(database, {
        ...scopeA,
        projectDnaId: dna.projectDnaId,
        idempotencyKey: 'wo010-dna-invalid-status-transition',
        payload: { ...projectDnaPayload('illegal published-to-draft'), status: 'draft' },
        provenance: provenance(scopeA.subjectId),
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
    });
    const dnaRestoreReplay = await restoreProjectDnaVersion(database, {
      ...scopeA,
      projectDnaId: dna.projectDnaId,
      sourceVersion: 1,
      idempotencyKey: 'wo010-dna-restore-v1',
      actorSubjectId: scopeA.subjectId,
      recordedAt: new Date().toISOString(),
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

    const directAsset = prepareAssetVersion({
      assetId: createUuidV7(),
      tenantId: scopeA.tenantId,
      projectId: scopeA.projectId,
      versionId: createUuidV7(),
      version: 1,
      idempotencyKeySha256: hash('wo010-r4-canonical-asset-preflight'),
      payload: assetPayload('R4 canonical direct asset preflight'),
      provenance: provenance(scopeA.subjectId),
      payloadSchema: assetMetadataV1Schema,
    });
    const assetCanonicalizerProbe = await ownerPool.query<{ canonical: string }>(
      'SELECT platform.asset_core_canonical_jsonb($1::jsonb) AS canonical',
      [directAsset.canonicalPayload],
    );
    const sqlCanonicalPayload = assetCanonicalizerProbe.rows[0]?.canonical;
    if (sqlCanonicalPayload !== directAsset.canonicalPayload) {
      throw new Error(
        `R4 Asset canonicalizer mismatch; expected=${directAsset.canonicalPayload}; actual=${sqlCanonicalPayload ?? 'missing'}`,
      );
    }
    await assertDirectAssetCreateReturnsCanonicalHash(database, scopeA, directAsset);
    const baseAsset = await createAssetVersion(database, {
      ...scopeA,
      idempotencyKey: 'wo010-asset-base-v1',
      payload: assetPayload('WO-010 base asset'),
      provenance: provenance(scopeA.subjectId),
    });
    const publishAssetDraft = await createAssetVersion(database, {
      ...scopeA,
      idempotencyKey: 'phase-c-scope-publish-draft',
      payload: assetPayload('Phase C resolver publish fixture'),
      provenance: provenance(scopeA.subjectId),
    });
    const publishedAsset = await appendAssetVersion(database, {
      ...scopeA,
      assetId: publishAssetDraft.assetId,
      idempotencyKey: 'phase-c-scope-publish-v2',
      payload: assetPayload('Phase C resolver published fixture', { status: 'published' }),
      provenance: provenance(scopeA.subjectId),
    });
    await assertDirectRpcRejectsMalformedPayloadAndProvenance(
      database,
      scopeA,
      projectDnaPayload('direct SQL canonical DNA'),
      assetPayload('direct SQL canonical asset') as AssetMetadataPayload,
      { assetId: baseAsset.assetId, versionId: baseAsset.versionId },
      assetPayload,
    );
    await expectAssetCoreError(
      appendAssetVersion(database, {
        ...scopeA,
        assetId: baseAsset.assetId,
        idempotencyKey: 'wo010-asset-invalid-status-transition',
        payload: assetPayload('illegal draft-to-archived', { status: 'archived' }),
        provenance: provenance(scopeA.subjectId),
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
    });
    const assetV2 = await appendAssetVersion(database, {
      ...scopeA,
      assetId: baseAsset.assetId,
      idempotencyKey: 'wo010-asset-base-v2',
      payload: assetPayload('WO-010 base asset v2'),
      provenance: provenance(scopeA.subjectId),
    });
    const assetRestore = await restoreAssetVersion(database, {
      ...scopeA,
      assetId: baseAsset.assetId,
      sourceVersion: 1,
      idempotencyKey: 'wo010-asset-restore-v1',
      actorSubjectId: scopeA.subjectId,
      recordedAt: new Date().toISOString(),
    });
    const assetRestoreReplay = await restoreAssetVersion(database, {
      ...scopeA,
      assetId: baseAsset.assetId,
      sourceVersion: 1,
      idempotencyKey: 'wo010-asset-restore-v1',
      actorSubjectId: scopeA.subjectId,
      recordedAt: new Date().toISOString(),
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
      }),
    );

    const dnaOtherProject = await createProjectDnaVersion(database, {
      ...scopeA2,
      idempotencyKey: 'wo010-dna-other-project',
      payload: projectDnaPayload('A2 private DNA'),
      provenance: provenance(scopeA2.subjectId),
    });
    const assetOtherProject = await createAssetVersion(database, {
      ...scopeA2,
      idempotencyKey: 'wo010-asset-other-project',
      payload: assetPayload('A2 private asset', {
        assetContract: null,
        projectDna: { id: dnaOtherProject.projectDnaId, version: 1 },
      }),
      provenance: provenance(scopeA2.subjectId),
    });
    const dnaB = await createProjectDnaVersion(database, {
      ...scopeB,
      idempotencyKey: 'wo010-dna-tenant-b',
      payload: projectDnaPayload('Tenant B private DNA'),
      provenance: provenance(scopeB.subjectId),
    });
    const assetB = await createAssetVersion(database, {
      ...scopeB,
      idempotencyKey: 'wo010-asset-tenant-b',
      payload: assetPayload('Tenant B private asset', { assetContract: null, projectDna: null }),
      provenance: provenance(scopeB.subjectId),
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
    await assertPrivateAssetScopeResolver({
      database: scopeDatabase,
      ownerPool,
      scopeA,
      scopeA2,
      scopeB,
      draftAssetVersionId: baseAsset.versionId,
      publishedAssetVersionId: publishedAsset.versionId,
      otherTenantAssetVersionId: assetB.versionId,
    });
    await assertPrivilegedImmutability(ownerPool, scopeA, dna, baseAsset);

    process.stdout.write(
      'Asset Core integration: PASS (A01-A04; B01-B06; tenant/project guessed-ID isolation; cross-scope lineage and FK denial; transaction rollback; forced RLS; immutable history; Phase C OWNER/ADMIN/MEMBER read scope, revoked/suspended/non-member denial, unresolved upload denial, and pool context reset after allow/deny/abort).\n',
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

async function assertPrivateAssetScopeResolver(input: {
  database: ReturnType<typeof createDatabase>;
  ownerPool: Pool;
  scopeA: Scope;
  scopeA2: Scope;
  scopeB: Scope;
  draftAssetVersionId: string;
  publishedAssetVersionId: string;
  otherTenantAssetVersionId: string;
}): Promise<void> {
  const repository = createPrivateAssetScopeRepository(input.database);
  await assertPrivateAssetPoolContextReset(input.database);

  const ownerDraftResolution = await repository.resolve({
    ...input.scopeA,
    assetVersionId: input.draftAssetVersionId,
  });
  const ownerDraft = assertResolvedPrivateAssetScope(ownerDraftResolution, 'OWNER', 'draft');
  if (
    !canAccessPrivateAsset(
      privateAssetPolicyInput(input.scopeA, input.draftAssetVersionId, 'read', ownerDraft),
    )
  ) {
    throw new Error('OWNER could not read its RLS-resolved draft asset');
  }
  if (
    !canAccessPrivateAsset(
      privateAssetPolicyInput(input.scopeA, input.draftAssetVersionId, 'begin', ownerDraft),
    )
  ) {
    throw new Error('OWNER draft begin policy unexpectedly denied the pure decision');
  }
  await assertPrivateAssetPoolContextReset(input.database);

  const ownerPublishedResolution = await repository.resolve({
    ...input.scopeA,
    assetVersionId: input.publishedAssetVersionId,
  });
  assertResolvedPrivateAssetScope(ownerPublishedResolution, 'OWNER', 'published');

  const admin = await createResolverPrincipal(input.ownerPool, input.scopeA.tenantId, {
    role: 'ADMIN',
  });
  const adminScope: Scope = { ...input.scopeA, subjectId: admin.subjectId };
  const adminResolution = await repository.resolve({
    ...adminScope,
    assetVersionId: input.publishedAssetVersionId,
  });
  const adminPublished = assertResolvedPrivateAssetScope(adminResolution, 'ADMIN', 'published');

  const member = await createResolverPrincipal(input.ownerPool, input.scopeA.tenantId, {
    role: 'MEMBER',
  });
  const memberScope: Scope = { ...input.scopeA, subjectId: member.subjectId };
  const memberResolution = await repository.resolve({
    ...memberScope,
    assetVersionId: input.draftAssetVersionId,
  });
  const memberDraft = assertResolvedPrivateAssetScope(memberResolution, 'MEMBER', 'draft');
  if (
    !canAccessPrivateAsset(
      privateAssetPolicyInput(memberScope, input.draftAssetVersionId, 'read', memberDraft),
    ) ||
    canAccessPrivateAsset(
      privateAssetPolicyInput(memberScope, input.draftAssetVersionId, 'begin', memberDraft),
    )
  ) {
    throw new Error('MEMBER read-only policy did not preserve the project-scoped boundary');
  }
  if (
    !canAccessPrivateAsset(
      privateAssetPolicyInput(adminScope, input.publishedAssetVersionId, 'read', adminPublished),
    )
  ) {
    throw new Error('ADMIN could not read its RLS-resolved published asset');
  }

  for (const operation of ['finalize', 'abort'] as const) {
    const attemptId = createUuidV7();
    if (
      canAccessPrivateAsset({
        ...privateAssetPolicyInput(input.scopeA, input.draftAssetVersionId, operation, ownerDraft),
        requestedUploadAttemptId: attemptId,
      })
    ) {
      throw new Error(`Unresolved upload attempt unexpectedly allowed ${operation}`);
    }
  }

  const noMembership = await createResolverPrincipal(input.ownerPool, input.scopeA.tenantId);
  await assertPrivateAssetResolutionDenied(repository, input.database, {
    ...input.scopeA,
    subjectId: noMembership.subjectId,
    assetVersionId: input.draftAssetVersionId,
  });
  await assertPrivateAssetResolutionDenied(repository, input.database, {
    ...input.scopeA,
    assetVersionId: input.otherTenantAssetVersionId,
  });
  await assertPrivateAssetResolutionDenied(repository, input.database, {
    ...input.scopeA2,
    assetVersionId: input.draftAssetVersionId,
  });
  await assertPrivateAssetResolutionDenied(repository, input.database, {
    ...input.scopeA,
    tenantId: input.scopeB.tenantId,
    projectId: input.scopeB.projectId,
    assetVersionId: input.otherTenantAssetVersionId,
  });
  await assertPrivateAssetResolutionDenied(repository, input.database, {
    ...input.scopeA,
    assetVersionId: createUuidV7(),
  });
  const invalidUuid = await repository.resolve({
    ...input.scopeA,
    assetVersionId: '018f47b2-3b1e-4cc3-8f4b-0c5940b7a337',
  });
  if (invalidUuid.allowed || invalidUuid.reason !== 'invalid_request') {
    throw new Error('Private asset resolver did not reject a non-v7 identifier before PostgreSQL');
  }
  await assertPrivateAssetPoolContextReset(input.database);

  const revokedMember = await createResolverPrincipal(input.ownerPool, input.scopeA.tenantId, {
    role: 'MEMBER',
    membershipStatus: 'revoked',
  });
  await assertPrivateAssetResolutionDenied(repository, input.database, {
    ...input.scopeA,
    subjectId: revokedMember.subjectId,
    assetVersionId: input.draftAssetVersionId,
  });

  const suspendedSubject = await createResolverPrincipal(input.ownerPool, input.scopeA.tenantId, {
    role: 'MEMBER',
    subjectStatus: 'suspended',
  });
  await assertPrivateAssetResolutionDenied(repository, input.database, {
    ...input.scopeA,
    subjectId: suspendedSubject.subjectId,
    assetVersionId: input.draftAssetVersionId,
  });

  await input.ownerPool.query(
    `UPDATE platform.tenant_membership SET status = 'revoked'
      WHERE tenant_id = $1 AND subject_id = $2`,
    [input.scopeA.tenantId, member.subjectId],
  );
  try {
    await assertPrivateAssetResolutionDenied(repository, input.database, {
      ...memberScope,
      assetVersionId: input.draftAssetVersionId,
    });
  } finally {
    await input.ownerPool.query(
      `UPDATE platform.tenant_membership SET status = 'active'
        WHERE tenant_id = $1 AND subject_id = $2`,
      [input.scopeA.tenantId, member.subjectId],
    );
  }

  await input.ownerPool.query(`UPDATE platform.tenant SET status = 'suspended' WHERE id = $1`, [
    input.scopeA.tenantId,
  ]);
  try {
    await assertPrivateAssetResolutionDenied(repository, input.database, {
      ...input.scopeA,
      assetVersionId: input.draftAssetVersionId,
    });
  } finally {
    await input.ownerPool.query(`UPDATE platform.tenant SET status = 'active' WHERE id = $1`, [
      input.scopeA.tenantId,
    ]);
  }

  await assertAbortedPrivateAssetTransactionDoesNotLeakContext(input.database, input.scopeA);
  await assertPrivateAssetPoolContextReset(input.database);
}

function assertResolvedPrivateAssetScope(
  result: Awaited<ReturnType<ReturnType<typeof createPrivateAssetScopeRepository>['resolve']>>,
  role: 'OWNER' | 'ADMIN' | 'MEMBER',
  versionStatus: 'draft' | 'published' | 'archived',
): PrivateAssetResolvedScope {
  if (
    !result.allowed ||
    result.scope.versionStatus !== versionStatus ||
    !result.scope.assetReadAllowed ||
    result.scope.uploadAttempt !== null ||
    result.scope.membership?.active !== true ||
    result.scope.membership.role !== role
  ) {
    throw new Error(`Expected an active RLS-resolved ${role} ${versionStatus} snapshot`);
  }
  return result.scope;
}

function privateAssetPolicyInput(
  scope: Scope,
  assetVersionId: string,
  operation: 'read' | 'begin' | 'finalize' | 'abort',
  resolved: PrivateAssetResolvedScope,
) {
  return {
    operation,
    principal: { subjectId: scope.subjectId, tenantId: scope.tenantId },
    requestedProjectId: scope.projectId,
    requestedAssetVersionId: assetVersionId,
    requestedUploadAttemptId: null,
    resolved,
  } as const;
}

async function assertPrivateAssetResolutionDenied(
  repository: ReturnType<typeof createPrivateAssetScopeRepository>,
  database: ReturnType<typeof createDatabase>,
  request: Parameters<typeof repository.resolve>[0],
): Promise<void> {
  const result = await repository.resolve(request);
  if (result.allowed || result.reason !== 'not_authorized') {
    throw new Error('Private asset resolver allowed or misclassified an unauthorized scope');
  }
  await assertPrivateAssetPoolContextReset(database);
}

async function assertPrivateAssetPoolContextReset(
  database: ReturnType<typeof createDatabase>,
): Promise<void> {
  const result = await database.pool.query<{
    subject_id: string | null;
    tenant_id: string | null;
    project_id: string | null;
    asset_version_count: string;
  }>(
    `SELECT current_setting('spryxel.subject_id', true) AS subject_id,
            current_setting('spryxel.tenant_id', true) AS tenant_id,
            current_setting('spryxel.project_id', true) AS project_id,
            (SELECT count(*)::text FROM platform.asset_version) AS asset_version_count`,
  );
  const row = result.rows[0];
  if (
    !row ||
    [row.subject_id, row.tenant_id, row.project_id].some(
      (value) => value !== null && value !== '',
    ) ||
    row.asset_version_count !== '0'
  ) {
    throw new Error('Private asset scope or transaction-local RLS context leaked through the pool');
  }
}

async function assertAbortedPrivateAssetTransactionDoesNotLeakContext(
  database: ReturnType<typeof createDatabase>,
  scope: Scope,
): Promise<void> {
  const client = await database.pool.connect();
  let transactionOpen = false;
  let discardClient = false;
  try {
    await client.query('BEGIN');
    transactionOpen = true;
    await client.query("SELECT set_config('spryxel.subject_id', $1, true)", [scope.subjectId]);
    await client.query("SELECT set_config('spryxel.tenant_id', $1, true)", [scope.tenantId]);
    await client.query("SELECT set_config('spryxel.project_id', $1, true)", [scope.projectId]);
    let aborted = false;
    try {
      await client.query('SELECT 1 / 0');
    } catch {
      aborted = true;
    }
    if (!aborted)
      throw new Error('PostgreSQL did not abort the deliberate integration transaction');
    await client.query('ROLLBACK');
    transactionOpen = false;
  } catch (error) {
    if (transactionOpen) {
      try {
        await client.query('ROLLBACK');
        transactionOpen = false;
      } catch {
        discardClient = true;
      }
    }
    throw error;
  } finally {
    client.release(discardClient || transactionOpen);
  }
}

async function createResolverPrincipal(
  pool: Pool,
  tenantId: string,
  options: {
    role?: 'ADMIN' | 'MEMBER';
    subjectStatus?: 'active' | 'suspended';
    membershipStatus?: 'active' | 'revoked';
  } = {},
): Promise<Identity> {
  const subjectId = createUuidV7();
  await pool.query('INSERT INTO platform.identity_subject (id, status) VALUES ($1, $2)', [
    subjectId,
    options.subjectStatus ?? 'active',
  ]);
  if (options.role) {
    await pool.query(
      `INSERT INTO platform.tenant_membership (tenant_id, subject_id, role, status)
       VALUES ($1, $2, $3, $4)`,
      [tenantId, subjectId, options.role, options.membershipStatus ?? 'active'],
    );
  }
  return { subjectId, tenantId };
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
    'platform.asset_core_constants()',
    'platform.parse_asset_core_payload(text,text,text)',
    'platform.parse_asset_core_provenance(text,uuid)',
    'platform.lock_asset_core_idempotency(text,text,uuid,uuid,uuid)',
    'platform.asset_core_has_exact_keys(jsonb,text[])',
    'platform.asset_core_jsonb_is_uuid_v7(jsonb)',
    'platform.asset_core_jsonb_is_nullable_uuid_v7(jsonb)',
    'platform.asset_core_utf16_length(text)',
    'platform.asset_core_jsonb_is_bounded_text(jsonb,integer,integer)',
    'platform.asset_core_jsonb_is_integer_in_range(jsonb,numeric,numeric)',
    'platform.asset_core_jsonb_is_number_in_range(jsonb,numeric,numeric)',
    'platform.asset_core_jsonb_is_finite_number(jsonb)',
    'platform.asset_core_jsonb_array_within_size(jsonb,integer,integer)',
    'platform.asset_core_bounded_json_object(jsonb)',
    'platform.asset_core_payload_matches_schema(jsonb,text)',
    'platform.asset_core_utf16_sort_key(text)',
    'platform.asset_core_json_string(text)',
    'platform.asset_core_ecmascript_number(jsonb)',
    'platform.asset_core_canonical_jsonb(jsonb)',
    'platform.asset_core_provenance_matches_schema(jsonb)',
    'platform.prepare_asset_core_write(text,uuid,uuid,text,text,text,text)',
    'platform.resolve_asset_core_replay(text,uuid,uuid,uuid,uuid,text,text,boolean)',
    'platform.assert_asset_core_version_transition(text,uuid,uuid,uuid,integer,text,text,uuid)',
    'platform.parse_asset_core_references(jsonb)',
    'platform.insert_asset_core_lineage(uuid,uuid,integer,uuid,uuid,uuid,jsonb)',
  ];
  const helperResult = await pool.query<{ app_executes: boolean; worker_executes: boolean }>(
    `SELECT has_function_privilege('spryxel_app', to_regprocedure(signature), 'EXECUTE') AS app_executes,
            has_function_privilege('spryxel_worker', to_regprocedure(signature), 'EXECUTE') AS worker_executes
       FROM unnest($1::text[]) AS functions(signature)`,
    [helperNames],
  );
  if (
    helperResult.rows.length !== helperNames.length ||
    helperResult.rows.some((row) => row.app_executes || row.worker_executes)
  ) {
    throw new Error('Internal Asset Core helper functions were executable by app or worker role');
  }

  const constantTypeResult = await pool.query<{ app_usage: boolean; worker_usage: boolean }>(
    `SELECT has_type_privilege('spryxel_app', 'platform.asset_core_constant_set', 'USAGE') AS app_usage,
            has_type_privilege('spryxel_worker', 'platform.asset_core_constant_set', 'USAGE') AS worker_usage`,
  );
  if (constantTypeResult.rows[0]?.app_usage || constantTypeResult.rows[0]?.worker_usage) {
    throw new Error('Internal Asset Core constant type was usable by app or worker role');
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

type DirectRpc =
  | 'create_project_dna_version'
  | 'append_project_dna_version'
  | 'create_asset_version'
  | 'append_asset_version';
type DirectResult = {
  version_id: string;
  version: number;
  payload_sha256: string;
  replayed: boolean;
};
type DirectPayloadCase = { label: string; mutate(payload: Record<string, unknown>): void };
type DirectPreparedVersion = {
  versionId: string;
  idempotencyKeySha256: string;
  canonicalPayload: string;
  payloadSha256: string;
  provenance: unknown;
  payload: object;
};

async function assertDirectRpcRejectsMalformedPayloadAndProvenance(
  database: ReturnType<typeof createDatabase>,
  scope: Scope,
  dnaPayload: ReturnType<typeof projectDnaPayload>,
  assetPayload: AssetMetadataPayload,
  lineageSource: { assetId: string; versionId: string },
  assetPayloadFactory: (name: string, overrides?: Record<string, unknown>) => AssetMetadataPayload,
): Promise<void> {
  const dnaCreate = prepareProjectDnaVersion({
    id: createUuidV7(),
    tenantId: scope.tenantId,
    projectId: scope.projectId,
    versionId: createUuidV7(),
    version: 1,
    idempotencyKeySha256: hash('wo010-direct-sql-dna-create-key'),
    payload: dnaPayload,
    provenance: provenance(scope.subjectId),
    payloadSchema: projectDnaV1Schema,
  });
  const dnaAppend = prepareProjectDnaVersion({
    id: dnaCreate.id,
    tenantId: scope.tenantId,
    projectId: scope.projectId,
    versionId: createUuidV7(),
    version: 2,
    idempotencyKeySha256: hash('wo010-direct-sql-dna-append-key'),
    payload: { ...dnaPayload, styleIdentity: `${dnaPayload.styleIdentity} append` },
    provenance: provenance(scope.subjectId),
    payloadSchema: projectDnaV1Schema,
  });
  const assetCreate = prepareAssetVersion({
    assetId: createUuidV7(),
    tenantId: scope.tenantId,
    projectId: scope.projectId,
    versionId: createUuidV7(),
    version: 1,
    idempotencyKeySha256: hash('wo010-direct-sql-asset-create-key'),
    payload: assetPayload,
    provenance: provenance(scope.subjectId),
    payloadSchema: assetMetadataV1Schema,
  });
  const assetAppend = prepareAssetVersion({
    assetId: assetCreate.assetId,
    tenantId: scope.tenantId,
    projectId: scope.projectId,
    versionId: createUuidV7(),
    version: 2,
    idempotencyKeySha256: hash('wo010-direct-sql-asset-append-key'),
    payload: { ...assetPayload, name: `${assetPayload.name} append` },
    provenance: provenance(scope.subjectId),
    payloadSchema: assetMetadataV1Schema,
  });
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setContext(client, scope);
    await assertDirectRpcPositiveControls(client, dnaCreate, dnaAppend, assetCreate, assetAppend);
    await assertR4CanonicalDigestVectors(client, scope, assetPayloadFactory);
    await assertDirectRestoreStatusEnforcement(client, scope.subjectId, dnaCreate, assetCreate);
    await assertDirectPayloadCases(
      client,
      dnaCreate,
      assetCreate,
      dnaCases(),
      assetCases(lineageSource),
    );
    await assertDirectProvenanceCases(client, dnaCreate, dnaAppend, assetCreate, assetAppend);
    await client.query('ROLLBACK');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function dnaCases(): DirectPayloadCase[] {
  return [
    {
      label: 'DNA unknown root field',
      mutate: (payload) => {
        payload.unexpected = true;
      },
    },
    {
      label: 'DNA missing required styleIdentity',
      mutate: (payload) => {
        delete payload.styleIdentity;
      },
    },
    {
      label: 'DNA wrong status type',
      mutate: (payload) => {
        payload.status = 7;
      },
    },
    {
      label: 'DNA unknown nested palette field',
      mutate: (payload) => {
        payload.palette = [{ name: 'Primary', colors: ['#369'], hidden: true }];
      },
    },
    {
      label: 'DNA missing nested palette name',
      mutate: (payload) => {
        payload.palette = [{ colors: ['#369'] }];
      },
    },
    {
      label: 'DNA wrong nested palette color type',
      mutate: (payload) => {
        payload.palette = [{ name: 'Primary', colors: [369] }];
      },
    },
    {
      label: 'DNA constraints must be an object',
      mutate: (payload) => {
        payload.constraints = [];
      },
    },
    {
      label: 'DNA wrong visualReferenceIds item type',
      mutate: (payload) => {
        payload.visualReferenceIds = ['not-a-uuid'];
      },
    },
  ];
}

function assetCases(lineageSource: { assetId: string; versionId: string }): DirectPayloadCase[] {
  return [
    {
      label: 'Asset unknown root field',
      mutate: (payload) => {
        payload.unexpected = true;
      },
    },
    {
      label: 'Asset missing required name',
      mutate: (payload) => {
        delete payload.name;
      },
    },
    {
      label: 'Asset wrong tags type',
      mutate: (payload) => {
        payload.tags = 'not-an-array';
      },
    },
    {
      label: 'Asset unknown nested lineage field',
      mutate: (payload) => {
        payload.lineage = [
          {
            relation: 'derived_from',
            assetId: lineageSource.assetId,
            assetVersionId: lineageSource.versionId,
            unexpected: true,
          },
        ];
      },
    },
    {
      label: 'Asset missing nested lineage version field',
      mutate: (payload) => {
        payload.lineage = [{ relation: 'derived_from', assetId: lineageSource.assetId }];
      },
    },
    {
      label: 'Asset wrong nested contract version type',
      mutate: (payload) => {
        payload.assetContract = { id: lineageSource.assetId, version: '1' };
      },
    },
    {
      label: 'Asset missing nested dimensions width',
      mutate: (payload) => {
        payload.dimensions = { height: 32, frameCount: 1, fps: null };
      },
    },
    {
      label: 'Asset wrong nested dimensions fps type',
      mutate: (payload) => {
        payload.dimensions = { width: 32, height: 32, frameCount: 1, fps: '24' };
      },
    },
  ];
}

async function callDirectRpc(
  client: PoolClient,
  rpc: DirectRpc,
  entityId: string,
  prepared: DirectPreparedVersion,
): Promise<DirectResult> {
  const result = await client.query<DirectResult>(
    `SELECT * FROM platform.${rpc}($1,$2,$3,$4,$5,$6)`,
    [
      entityId,
      prepared.versionId,
      prepared.idempotencyKeySha256,
      prepared.canonicalPayload,
      prepared.payloadSha256,
      JSON.stringify(prepared.provenance),
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error(`Direct PostgreSQL RPC returned no row: ${rpc}`);
  return row;
}

async function assertDirectRestoreStatusEnforcement(
  client: PoolClient,
  subjectId: string,
  dnaCreate: DirectPreparedVersion & { id: string },
  assetCreate: DirectPreparedVersion & { assetId: string },
): Promise<void> {
  const targets: Array<{ rpc: DirectRpc; entityId: string; source: DirectPreparedVersion }> = [
    { rpc: 'append_project_dna_version', entityId: dnaCreate.id, source: dnaCreate },
    { rpc: 'append_asset_version', entityId: assetCreate.assetId, source: assetCreate },
  ];
  for (const target of targets) {
    const prepareRestore = (status: 'draft' | 'published' | 'archived'): DirectPreparedVersion => {
      const payload = { ...target.source.payload, status };
      const canonicalPayload = JSON.stringify(payload);
      return {
        ...target.source,
        payload,
        canonicalPayload,
        payloadSha256: hash(canonicalPayload),
        versionId: createUuidV7(),
        idempotencyKeySha256: hash(`wo010-direct-restore-${target.rpc}-${status}`),
        provenance: {
          source: 'restore',
          actorSubjectId: subjectId,
          recordedAt: new Date().toISOString(),
          sourceVersionId: target.source.versionId,
        },
      };
    };
    for (const status of ['published', 'archived'] as const) {
      await assertDirectRpcRejected(
        client,
        target.rpc,
        target.entityId,
        prepareRestore(status),
        'asset_core_invalid_restore_status',
        `restore of ${target.rpc} directly to ${status}`,
        'invalid_asset_core_status_transition',
      );
    }
    const candidate = prepareRestore('draft');
    const restored = await callDirectRpc(client, target.rpc, target.entityId, candidate);
    const replayed = await callDirectRpc(client, target.rpc, target.entityId, candidate);
    if (
      restored.version !== 3 ||
      restored.replayed ||
      replayed.version !== 3 ||
      replayed.version_id !== restored.version_id ||
      !replayed.replayed
    ) {
      throw new Error(
        `Direct PostgreSQL draft-only restore or idempotent replay failed: ${target.rpc}`,
      );
    }
  }
}

async function assertDirectRpcPositiveControls(
  client: PoolClient,
  dnaCreate: DirectPreparedVersion & { id: string },
  dnaAppend: DirectPreparedVersion & { id: string },
  assetCreate: DirectPreparedVersion & { assetId: string },
  assetAppend: DirectPreparedVersion & { assetId: string },
): Promise<void> {
  await assertDirectRpcReplayPair(
    client,
    'create_project_dna_version',
    dnaCreate.id,
    dnaCreate,
    1,
    'DNA create',
  );
  await assertDirectRpcReplayPair(
    client,
    'append_project_dna_version',
    dnaAppend.id,
    dnaAppend,
    2,
    'DNA append',
  );
  await assertDirectRpcReplayPair(
    client,
    'create_asset_version',
    assetCreate.assetId,
    assetCreate,
    1,
    'Asset create',
  );
  await assertDirectRpcReplayPair(
    client,
    'append_asset_version',
    assetAppend.assetId,
    assetAppend,
    2,
    'Asset append',
  );
}

async function assertR4CanonicalDigestVectors(
  client: PoolClient,
  scope: Scope,
  assetPayloadFactory: (name: string, overrides?: Record<string, unknown>) => AssetMetadataPayload,
): Promise<void> {
  const dnaPayload = { ...projectDnaPayload('Pixel'), status: 'draft' as const };
  const dnaExpected =
    '{"constraints":{"avoidPublicUrls":true},"palette":[{"colors":["#369"],"name":"Primary"}],"rules":["Preserve silhouette"],"schemaVersion":"project-dna.v1","status":"draft","styleIdentity":"Pixel","visualReferenceIds":[]}';
  const dna = prepareProjectDnaVersion({
    id: createUuidV7(),
    tenantId: scope.tenantId,
    projectId: scope.projectId,
    versionId: createUuidV7(),
    version: 1,
    idempotencyKeySha256: hash('wo010-r4-vector-dna-create'),
    payload: dnaPayload,
    provenance: provenance(scope.subjectId),
    payloadSchema: projectDnaV1Schema,
  });
  if (
    dna.canonicalPayload !== dnaExpected ||
    dna.payloadSha256 !== '4fc07797075f5d83242ccd804d1a81296915508baccb87de06e0d81832c29dbf'
  ) {
    throw new Error('R4 supplied canonical Project DNA vector differs from the domain SHA-256');
  }

  const assetVectorPayload: AssetMetadataPayload = {
    assetContract: null,
    assetSubtype: 'sprite',
    assetType: 'image',
    attributes: { a: 1 },
    description: null,
    dimensions: null,
    lineage: [],
    name: 'Sprite 01',
    paletteId: null,
    projectDna: null,
    schemaVersion: 'asset-metadata.v1',
    status: 'draft',
    tags: ['wo010'],
  };
  const assetExpected =
    '{"assetContract":null,"assetSubtype":"sprite","assetType":"image","attributes":{"a":1},"description":null,"dimensions":null,"lineage":[],"name":"Sprite 01","paletteId":null,"projectDna":null,"schemaVersion":"asset-metadata.v1","status":"draft","tags":["wo010"]}';
  const asset = prepareAssetVersion({
    assetId: createUuidV7(),
    tenantId: scope.tenantId,
    projectId: scope.projectId,
    versionId: createUuidV7(),
    version: 1,
    idempotencyKeySha256: hash('wo010-r4-vector-asset-create'),
    payload: assetVectorPayload,
    provenance: provenance(scope.subjectId),
    payloadSchema: assetMetadataV1Schema,
  });
  if (
    asset.canonicalPayload !== assetExpected ||
    asset.payloadSha256 !== 'baf966928ef856dae4275825a92eb4a2d2dce0921a7956fe186f1d93f464b4ad'
  ) {
    throw new Error('R4 supplied canonical Asset vector differs from the domain SHA-256');
  }

  await assertDirectCanonicalCreateAndAppend(client, 'DNA', dna, 'create_project_dna_version');
  await assertDirectCanonicalCreateAndAppend(client, 'Asset', asset, 'create_asset_version');

  const edgeValues = {
    '\u{10000}': { z: 'quote " slash \\ line\n tab\t backspace\b', a: true },
    '\uE000': 'BMP key',
    nested: { z: 1e21, a: 1e-7 },
    numbers: {
      smallExponent: 1e-7,
      smallFixed: 1e-6,
      largeFixed: 1e20,
      largeExponent: 1e21,
      rounded: 1.0000000000000002,
      negativeZero: -0,
      roundedInteger: Number('9007199254740993'),
      smallestSubnormal: 5e-324,
      maximumFinite: 1.7976931348623157e308,
    },
  };
  const edgeDna = prepareProjectDnaVersion({
    id: createUuidV7(),
    tenantId: scope.tenantId,
    projectId: scope.projectId,
    versionId: createUuidV7(),
    version: 1,
    idempotencyKeySha256: hash('wo010-r4-edge-dna-create'),
    payload: {
      ...projectDnaPayload('Café "Pixel"\n\\ path'),
      constraints: edgeValues,
    },
    provenance: provenance(scope.subjectId),
    payloadSchema: projectDnaV1Schema,
  });
  const edgeAsset = prepareAssetVersion({
    assetId: createUuidV7(),
    tenantId: scope.tenantId,
    projectId: scope.projectId,
    versionId: createUuidV7(),
    version: 1,
    idempotencyKeySha256: hash('wo010-r4-edge-asset-create'),
    payload: assetPayloadFactory('Café "Sprite"\n\\ path', { attributes: edgeValues }),
    provenance: provenance(scope.subjectId),
    payloadSchema: assetMetadataV1Schema,
  });
  const edgeDnaAppend = await assertDirectCanonicalCreateAndAppend(
    client,
    'DNA edge',
    edgeDna,
    'create_project_dna_version',
  );
  const edgeAssetAppend = await assertDirectCanonicalCreateAndAppend(
    client,
    'Asset edge',
    edgeAsset,
    'create_asset_version',
  );

  const edgeDnaVariants = withJsonNumberLexicalVariants(edgeDna.canonicalPayload, 'styleIdentity');
  const edgeAssetVariants = withJsonNumberLexicalVariants(edgeAsset.canonicalPayload, 'name');
  await assertDirectRpcRejectsNoncanonicalDigest(
    client,
    'create_project_dna_version',
    edgeDna.id,
    edgeDna,
    'DNA edge create numeric lexemes',
    edgeDnaVariants,
  );
  await assertDirectRpcRejectsNoncanonicalDigest(
    client,
    'append_project_dna_version',
    edgeDna.id,
    edgeDnaAppend,
    'DNA edge append numeric lexemes',
    edgeDnaVariants,
  );
  await assertDirectRpcRejectsNoncanonicalDigest(
    client,
    'create_asset_version',
    edgeAsset.assetId,
    edgeAsset,
    'Asset edge create numeric lexemes',
    edgeAssetVariants,
  );
  await assertDirectRpcRejectsNoncanonicalDigest(
    client,
    'append_asset_version',
    edgeAsset.assetId,
    edgeAssetAppend,
    'Asset edge append numeric lexemes',
    edgeAssetVariants,
  );
  console.log(
    'R4 canonical digest vectors: PASS (supplied SHA vectors, UTF-16 key ordering, NFC/NFD, JSON escapes, numeric edges, create/append/replay, and 2 idempotency-key rejection modes).',
  );
}

async function assertDirectCanonicalCreateAndAppend(
  client: PoolClient,
  label: string,
  prepared: DirectPreparedVersion & { id?: string; assetId?: string },
  createRpc: 'create_project_dna_version' | 'create_asset_version',
): Promise<DirectPreparedVersion> {
  const entityId = createRpc === 'create_project_dna_version' ? prepared.id : prepared.assetId;
  if (!entityId) throw new Error(`R4 ${label} canonical vector has no entity UUID`);
  await assertDirectRpcReplayPair(client, createRpc, entityId, prepared, 1, `${label} create`);

  const appendRpc =
    createRpc === 'create_project_dna_version'
      ? 'append_project_dna_version'
      : 'append_asset_version';
  const append = {
    ...prepared,
    versionId: createUuidV7(),
    idempotencyKeySha256: hash(`wo010-r4-${label}-canonical-append`),
  };
  await assertDirectRpcReplayPair(client, appendRpc, entityId, append, 2, `${label} append`);
  const textField = createRpc === 'create_project_dna_version' ? 'styleIdentity' : 'name';
  const variants = variantsForPayload(prepared.canonicalPayload, textField);
  await assertDirectRpcRejectsNoncanonicalDigest(
    client,
    createRpc,
    entityId,
    prepared,
    `${label} ${createRpc}`,
    variants,
  );
  await assertDirectRpcRejectsNoncanonicalDigest(
    client,
    appendRpc,
    entityId,
    append,
    `${label} ${appendRpc}`,
    variantsForPayload(append.canonicalPayload, textField),
  );
  return append;
}

function variantsForPayload(canonicalPayload: string, textField: string): CanonicalDigestVariant[] {
  const parsed = JSON.parse(canonicalPayload) as Record<string, unknown>;
  const text = parsed[textField];
  if (typeof text !== 'string') throw new Error(`R4 canonical vector has no ${textField} text`);
  const nfd = { ...parsed, [textField]: text.normalize('NFD') };
  const variants: CanonicalDigestVariant[] = [
    { label: 'one trailing space', canonicalPayload: `${canonicalPayload} ` },
    {
      label: 'root and nested key reordering',
      canonicalPayload: reverseJsonObjectKeys(canonicalPayload),
    },
    {
      label: 'legal Unicode escape spelling',
      canonicalPayload: escapeFieldInitial(textField, canonicalPayload),
    },
  ];
  if (text !== text.normalize('NFD')) {
    variants.push({ label: 'NFD equivalent Unicode text', canonicalPayload: JSON.stringify(nfd) });
  }
  return variants;
}

function withJsonNumberLexicalVariants(
  canonicalPayload: string,
  textField: string,
): CanonicalDigestVariant[] {
  const variants = variantsForPayload(canonicalPayload, textField);
  variants.push(
    {
      label: 'uppercase exponent spelling',
      canonicalPayload: replaceOnce(
        canonicalPayload,
        '"smallExponent":1e-7',
        '"smallExponent":1E-7',
      ),
    },
    {
      label: 'equivalent fixed exponent spelling',
      canonicalPayload: replaceOnce(
        canonicalPayload,
        '"largeFixed":100000000000000000000',
        '"largeFixed":1e+20',
      ),
    },
    {
      label: 'negative zero spelling',
      canonicalPayload: replaceOnce(canonicalPayload, '"negativeZero":0', '"negativeZero":-0'),
    },
    {
      label: 'equivalent decimal scale',
      canonicalPayload: replaceOnce(
        canonicalPayload,
        '"rounded":1.0000000000000002',
        '"rounded":1.0000000000000002000',
      ),
    },
  );
  return variants;
}

function reverseJsonObjectKeys(canonicalPayload: string): string {
  const reverse = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(reverse);
    if (typeof value !== 'object' || value === null) return value;
    const record = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(record)
        .sort((left, right) => {
          if (left < right) return 1;
          if (left > right) return -1;
          return 0;
        })
        .map((key) => [key, reverse(record[key])]),
    );
  };
  return JSON.stringify(reverse(JSON.parse(canonicalPayload)));
}

function escapeFieldInitial(field: string, canonicalPayload: string): string {
  const prefix = `"${field}":"`;
  const valueStart = canonicalPayload.indexOf(prefix) + prefix.length;
  const initialCodePoint = canonicalPayload.codePointAt(valueStart);
  if (initialCodePoint === undefined || initialCodePoint > 0x7f) {
    throw new Error(`R4 ${field} vector must begin with an ASCII character for escape coverage`);
  }
  const initialCharacter = String.fromCodePoint(initialCodePoint);
  const escapedInitial = String.raw`\u${initialCodePoint.toString(16).padStart(4, '0')}`;
  return replaceOnce(
    canonicalPayload,
    `${prefix}${initialCharacter}`,
    `${prefix}${escapedInitial}`,
  );
}

function replaceOnce(value: string, target: string, replacement: string): string {
  if (!value.includes(target))
    throw new Error(`R4 vector did not contain expected fragment: ${target}`);
  return value.replace(target, replacement);
}

type CanonicalDigestVariant = { label: string; canonicalPayload: string };

async function assertDirectRpcRejectsNoncanonicalDigest(
  client: PoolClient,
  rpc: DirectRpc,
  entityId: string,
  canonical: DirectPreparedVersion,
  label: string,
  variants: CanonicalDigestVariant[],
): Promise<void> {
  for (const variant of variants) {
    const noncanonical = {
      ...canonical,
      canonicalPayload: variant.canonicalPayload,
      payloadSha256: hash(variant.canonicalPayload),
    };
    let replayError: unknown;
    await client.query('SAVEPOINT r4_same_key');
    try {
      await callDirectRpc(client, rpc, entityId, noncanonical);
    } catch (error) {
      replayError = error;
    }
    await client.query('ROLLBACK TO SAVEPOINT r4_same_key');
    await client.query('RELEASE SAVEPOINT r4_same_key');

    let newKeyResult: DirectResult | undefined;
    let newKeyError: unknown;
    const newKey = {
      ...noncanonical,
      versionId: createUuidV7(),
      idempotencyKeySha256: hash(`wo010-r4-noncanonical-new-key-${label}-${variant.label}`),
    };
    const newEntityId = rpc.startsWith('create_') ? createUuidV7() : entityId;
    let persistedSha256: string | undefined;
    await client.query('SAVEPOINT r4_new_key');
    try {
      newKeyResult = await callDirectRpc(client, rpc, newEntityId, newKey);
      const versionTable = rpc.includes('project_dna') ? 'project_dna_version' : 'asset_version';
      const stored = await client.query<{ payload_sha256: string }>(
        `SELECT payload_sha256 FROM platform.${versionTable} WHERE version_id = $1`,
        [newKeyResult.version_id],
      );
      persistedSha256 = stored.rows[0]?.payload_sha256;
    } catch (error) {
      newKeyError = error;
    }
    await client.query('ROLLBACK TO SAVEPOINT r4_new_key');
    await client.query('RELEASE SAVEPOINT r4_new_key');

    const rejectedAsNoncanonical = (error: unknown): boolean =>
      sqlState(error) === '22023' &&
      error instanceof Error &&
      error.message === 'invalid_asset_core_payload';
    if (
      !rejectedAsNoncanonical(replayError) ||
      !rejectedAsNoncanonical(newKeyError) ||
      newKeyResult !== undefined ||
      persistedSha256 !== undefined
    ) {
      const describe = (error: unknown): string =>
        error instanceof Error
          ? `${sqlState(error) ?? 'no-sqlstate'}:${error.message}`
          : 'accepted';
      throw new Error(
        `R4 ${label}/${variant.label} noncanonical digest was not rejected: same-key=${describe(replayError)}; new-key=${describe(newKeyError)}; persisted=${persistedSha256 ?? 'none'}`,
      );
    }
  }
}

async function assertDirectAssetCreateReturnsCanonicalHash(
  database: ReturnType<typeof createDatabase>,
  scope: Scope,
  prepared: DirectPreparedVersion & { assetId: string },
): Promise<void> {
  const client = await database.pool.connect();
  try {
    await client.query('BEGIN');
    await setContext(client, scope);
    const created = await callDirectRpc(client, 'create_asset_version', prepared.assetId, prepared);
    if (created.payload_sha256 !== prepared.payloadSha256 || created.version !== 1) {
      throw new Error('R4 direct canonical Asset create returned a different persisted digest');
    }
  } catch (error) {
    throw new Error(
      `R4 direct canonical Asset create failed (${sqlState(error) ?? 'no-sqlstate'}): ${error instanceof Error ? error.message : String(error)}`,
    );
  } finally {
    try {
      await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }
}

async function assertDirectRpcReplayPair(
  client: PoolClient,
  rpc: DirectRpc,
  entityId: string,
  prepared: DirectPreparedVersion,
  version: number,
  label: string,
): Promise<void> {
  for (const replayed of [false, true]) {
    const row = await callDirectRpc(client, rpc, entityId, prepared);
    if (
      row.version !== version ||
      row.replayed !== replayed ||
      row.payload_sha256 !== prepared.payloadSha256
    ) {
      throw new Error(`Direct PostgreSQL canonical positive control failed: ${label}`);
    }
  }
}

async function assertDirectPayloadCases(
  client: PoolClient,
  dnaCreate: DirectPreparedVersion & { id: string },
  assetCreate: DirectPreparedVersion & { assetId: string },
  dnaInvalidCases: DirectPayloadCase[],
  assetInvalidCases: DirectPayloadCase[],
): Promise<void> {
  await rejectDirectPayloadTargets(
    client,
    [
      { rpc: 'create_project_dna_version', entityId: createUuidV7(), prepared: dnaCreate },
      { rpc: 'append_project_dna_version', entityId: dnaCreate.id, prepared: dnaCreate },
    ],
    dnaInvalidCases,
  );
  await rejectDirectPayloadTargets(
    client,
    [
      { rpc: 'create_asset_version', entityId: createUuidV7(), prepared: assetCreate },
      { rpc: 'append_asset_version', entityId: assetCreate.assetId, prepared: assetCreate },
    ],
    assetInvalidCases,
  );
}

async function rejectDirectPayloadTargets(
  client: PoolClient,
  targets: Array<{ rpc: DirectRpc; entityId: string; prepared: DirectPreparedVersion }>,
  cases: DirectPayloadCase[],
): Promise<void> {
  for (const target of targets) {
    for (const testCase of cases) {
      const candidate = JSON.parse(JSON.stringify(target.prepared.payload)) as Record<
        string,
        unknown
      >;
      testCase.mutate(candidate);
      const canonicalPayload = JSON.stringify(candidate);
      const altered = {
        ...target.prepared,
        canonicalPayload,
        payloadSha256: hash(canonicalPayload),
        versionId: createUuidV7(),
        idempotencyKeySha256: hash(`wo010-direct-${target.rpc}-${testCase.label}`),
      };
      await assertDirectRpcRejected(
        client,
        target.rpc,
        target.entityId,
        altered,
        'asset_core_invalid_document',
        `invalid document: ${testCase.label}`,
      );
    }
  }
}

async function assertDirectProvenanceCases(
  client: PoolClient,
  dnaCreate: DirectPreparedVersion & { id: string },
  dnaAppend: DirectPreparedVersion & { id: string },
  assetCreate: DirectPreparedVersion & { assetId: string },
  assetAppend: DirectPreparedVersion & { assetId: string },
): Promise<void> {
  const invalidProvenance = [
    { label: 'null source', value: { ...(dnaCreate.provenance as object), source: null } },
    { label: 'null recordedAt', value: { ...(dnaCreate.provenance as object), recordedAt: null } },
    {
      label: 'unknown provenance key',
      value: { ...(dnaCreate.provenance as object), extra: true },
    },
    {
      label: 'non-ISO infinity recordedAt',
      value: { ...(dnaCreate.provenance as object), recordedAt: 'infinity' },
    },
  ];
  const targets = [
    { rpc: 'create_project_dna_version' as const, entityId: createUuidV7(), prepared: dnaCreate },
    { rpc: 'append_project_dna_version' as const, entityId: dnaCreate.id, prepared: dnaAppend },
    { rpc: 'create_asset_version' as const, entityId: createUuidV7(), prepared: assetCreate },
    { rpc: 'append_asset_version' as const, entityId: assetCreate.assetId, prepared: assetAppend },
  ];
  for (const target of targets) {
    for (const invalid of invalidProvenance) {
      const altered = {
        ...target.prepared,
        versionId: createUuidV7(),
        idempotencyKeySha256: hash(`wo010-direct-${target.rpc}-${invalid.label}`),
        provenance: invalid.value,
      };
      await assertDirectRpcRejected(
        client,
        target.rpc,
        target.entityId,
        altered,
        'asset_core_invalid_provenance',
        `invalid provenance: ${invalid.label}`,
      );
    }
  }
}

async function assertDirectRpcRejected(
  client: PoolClient,
  rpc: DirectRpc,
  entityId: string,
  prepared: DirectPreparedVersion,
  savepoint: string,
  failureLabel: string,
  expectedMessage?: string,
): Promise<void> {
  await client.query(`SAVEPOINT ${savepoint}`);
  let rejected = false;
  try {
    await callDirectRpc(client, rpc, entityId, prepared);
  } catch (error) {
    if (
      sqlState(error) !== '22023' ||
      (expectedMessage && (!(error instanceof Error) || error.message !== expectedMessage))
    ) {
      throw error;
    }
    rejected = true;
  }
  await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
  await client.query(`RELEASE SAVEPOINT ${savepoint}`);
  if (!rejected) throw new Error(`Direct PostgreSQL RPC accepted ${failureLabel}`);
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
