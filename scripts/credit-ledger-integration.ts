import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { parseRuntimeConfig } from '@spryxel/config';
import {
  type CreditLedgerContext,
  CreditIntegrityIncidentCaptureError,
  CreditLedgerError,
  type CreditReservationResult,
  cancelDurableJob,
  claimDurableJob,
  commitCredits,
  compensateCredits,
  createDatabase,
  finishDurableJob,
  getCreditSummary,
  releaseCredits,
  reserveCredits,
} from '@spryxel/db';
import { type CostGuardInput, evaluateCostGuard } from '@spryxel/domain';
import type { AuthenticatedPrincipal } from '@spryxel/identity';
import type { PoolClient } from 'pg';
import { createCostGuardedCreditReservationService } from '../apps/api/src/credit-ledger.js';
import { buildApiServer } from '../apps/api/src/server.js';

type FixtureIdentity = Readonly<{ subjectId: string; tenantId: string }>;

type CreditLedgerIntegrationInput = Readonly<{
  databaseUrl: string;
  appDatabaseUrl: string;
  workerDatabaseUrl: string;
  identityA: FixtureIdentity;
  identityB: FixtureIdentity;
  memberIdentity: FixtureIdentity;
  projectA: string;
  integrityJobId: string;
  contractId: string;
  contractVersion: number;
}>;

type FixtureScope = Readonly<{
  subjectId: string;
  tenantId: string;
  projectId: string;
  contractId: string;
  contractVersion: number;
  skuId: string;
}>;

type FixtureJob = Readonly<{ id: string; scope: FixtureScope }>;
type DirectSqlReservationResult = Readonly<{
  reservation_id: string;
  entry_id: string;
  status: string;
  reserved_credits: string;
}>;
type FixtureCreditReservationCommand = Readonly<{
  jobId: string;
  amountCredits: bigint;
  idempotencyKey: string;
  requestId: string;
}>;

const fixtureOperation = 'test_fixture.credit_ledger.v1';
const fixtureCreditBalance = 200n;

/**
 * Exercise the credit ledger against the same disposable PostgreSQL instance as the full
 * service integration suite. The owner connection creates isolated fixtures and triggers
 * fixture-only terminal transitions; runtime ledger operations use the restricted app role.
 */
export async function runCreditLedgerIntegration(
  input: CreditLedgerIntegrationInput,
): Promise<void> {
  const ownerDatabase = createDatabase(input.databaseUrl, { max: 1 });
  const appDatabase = createDatabase(input.appDatabaseUrl, { max: 8 });
  const workerDatabase = createDatabase(input.workerDatabaseUrl, { max: 2 }, 'worker');

  try {
    await assertEphemeralOwnerDatabase(ownerDatabase);
    await appDatabase.validateRuntimeRole();
    await workerDatabase.validateRuntimeRole();

    const scopeA: FixtureScope = {
      subjectId: input.identityA.subjectId,
      tenantId: input.identityA.tenantId,
      projectId: input.projectA,
      contractId: input.contractId,
      contractVersion: input.contractVersion,
      skuId: await readContractSku(
        ownerDatabase,
        input.contractId,
        input.contractVersion,
        input.identityA.tenantId,
        input.projectA,
      ),
    };
    assert.equal(
      input.memberIdentity.tenantId,
      scopeA.tenantId,
      'The member summary fixture must belong to tenant A',
    );
    const scopeB = await createTenantBFixture(ownerDatabase, input.identityB);
    const jobsA = await createFixtureJobs(ownerDatabase, scopeA, 4);
    const jobsB = await createFixtureJobs(ownerDatabase, scopeB, 1);
    const firstJobA = jobsA[0];
    assert.ok(firstJobA);
    await assertDurableJobLeaseConstraintRemains(ownerDatabase, firstJobA.id);
    await seedFixtureCredits(ownerDatabase, input.identityA, fixtureCreditBalance);
    await seedFixtureCredits(ownerDatabase, input.identityB, fixtureCreditBalance);

    await assertRoleBoundaries(ownerDatabase, appDatabase, workerDatabase, scopeA, scopeB);
    await assertMemberCannotCancelFixtureJob(
      ownerDatabase,
      appDatabase,
      input.memberIdentity,
      scopeA,
      jobsA[2]?.id,
    );
    assertProductionCostGuardDenies();
    await assertLedgerLifecycle(
      appDatabase,
      workerDatabase,
      ownerDatabase,
      input.databaseUrl,
      input.appDatabaseUrl,
      scopeA,
      scopeB,
      input.memberIdentity,
      input.integrityJobId,
      jobsA,
      jobsB,
    );
    await assertDurableCreditIncidentCapture(
      ownerDatabase,
      appDatabase,
      scopeA,
      scopeB,
      input.memberIdentity,
    );

    const directSqlFixtureJob = jobsA[3];
    assert.ok(
      directSqlFixtureJob,
      'Direct SQL authorization proof requires an isolated fixture Job',
    );
    // The synthetic non-fixture origin is seeded only in this disposable DB and makes the
    // allocator's normal FIFO order prefer a lot that test-fixture Jobs must never consume.
    await seedFixtureCredits(ownerDatabase, input.identityA, 1n);
    const availableFixtureCredits = await readFixtureAvailableCredits(
      ownerDatabase,
      input.identityA.tenantId,
    );
    assert.ok(availableFixtureCredits > 0n);
    await seedFixtureCredits(ownerDatabase, input.identityA, 1n, 'PAID_PACK');
    await assertDirectSqlReserveRemainsFixtureOnly(
      appDatabase,
      ownerDatabase,
      scopeA,
      directSqlFixtureJob.id,
      input.integrityJobId,
      availableFixtureCredits,
    );
  } finally {
    await Promise.all([ownerDatabase.close(), appDatabase.close(), workerDatabase.close()]);
  }
}

async function assertEphemeralOwnerDatabase(
  ownerDatabase: ReturnType<typeof createDatabase>,
): Promise<void> {
  const result = await ownerDatabase.pool.query<{
    database_name: string;
    role_name: string;
    is_superuser: boolean;
  }>(`
    SELECT current_database() AS database_name,
           current_user AS role_name,
           role.rolsuper AS is_superuser
      FROM pg_catalog.pg_roles role
     WHERE role.rolname = current_user
  `);
  assert.deepEqual(
    result.rows[0],
    {
      database_name: 'spryxel_test',
      role_name: 'spryxel',
      is_superuser: true,
    },
    'Fixture minting is restricted to the disposable local integration database owner',
  );
}

async function createTenantBFixture(
  ownerDatabase: ReturnType<typeof createDatabase>,
  identity: FixtureIdentity,
): Promise<FixtureScope> {
  const projectId = randomUUID();
  const contractId = randomUUID();
  const contractVersion = 1;
  const specification = {
    fixture: 'credit-ledger-integration',
    dimensions: { height: 1, width: 1 },
  };
  const canonicalSpecification = JSON.stringify(specification);
  const specificationSha256 = sha256(canonicalSpecification);
  const client = await ownerDatabase.pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO platform.project (id, tenant_id, created_by_subject_id, name)
       VALUES ($1, $2, $3, $4)`,
      [projectId, identity.tenantId, identity.subjectId, `credit-ledger-fixture-${projectId}`],
    );
    await client.query(
      `INSERT INTO platform.asset_contract (id, tenant_id, project_id, created_by_subject_id)
       VALUES ($1, $2, $3, $4)`,
      [contractId, identity.tenantId, projectId, identity.subjectId],
    );
    await client.query(
      `INSERT INTO platform.asset_contract_version
        (contract_id, tenant_id, project_id, version, schema_version, sku_id,
         specification, specification_sha256)
       VALUES ($1, $2, $3, $4, 'asset-contract.v1', 'SKU-009', $5::jsonb, $6)`,
      [
        contractId,
        identity.tenantId,
        projectId,
        contractVersion,
        canonicalSpecification,
        specificationSha256,
      ],
    );
    await client.query('COMMIT');
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  } finally {
    client.release();
  }

  return {
    subjectId: identity.subjectId,
    tenantId: identity.tenantId,
    projectId,
    contractId,
    contractVersion,
    skuId: 'SKU-009',
  };
}

async function readContractSku(
  ownerDatabase: ReturnType<typeof createDatabase>,
  contractId: string,
  contractVersion: number,
  tenantId: string,
  projectId: string,
): Promise<string> {
  const result = await ownerDatabase.pool.query<{ sku_id: string }>(
    `SELECT sku_id
       FROM platform.asset_contract_version
      WHERE contract_id = $1 AND version = $2 AND tenant_id = $3 AND project_id = $4`,
    [contractId, contractVersion, tenantId, projectId],
  );
  const skuId = result.rows[0]?.sku_id;
  assert.ok(skuId, 'Credit Guard fixture must use the SKU from the canonical contract version');
  return skuId;
}

function createFixtureCreditReserver(
  database: ReturnType<typeof createDatabase>,
  context: CreditLedgerContext,
  skuId: string,
): (input: FixtureCreditReservationCommand) => Promise<CreditReservationResult> {
  const reserveWithCostGuard = createCostGuardedCreditReservationService({
    reserve: (authorizedInput) => reserveCredits(database, context, authorizedInput),
  });
  return (command) =>
    reserveWithCostGuard({
      ...command,
      costGuardInput: fixtureCostGuardInput(skuId, command.amountCredits),
    });
}

function fixtureCostGuardInput(skuId: string, amountCredits: bigint): CostGuardInput {
  const nowEpochMs = Date.now();
  const limit = { maxCredits: 1_000n, maxInternalCost: 100n };
  return {
    mode: 'isolated_test_fixture',
    nowEpochMs,
    knownSkuIds: [skuId],
    knownOperations: [fixtureOperation],
    skuId,
    operation: fixtureOperation,
    policy: {
      id: 'credit-ledger-isolated-fixture-policy',
      version: '1',
      status: 'approved',
      mode: 'isolated_test_fixture',
      validUntilEpochMs: nowEpochMs + 60_000,
      skuIds: [skuId],
      operations: [fixtureOperation],
      limits: {
        global: limit,
        tenant: limit,
        project: limit,
        sku: limit,
        operation: limit,
      },
    },
    bounds: {
      requestedCredits: amountCredits,
      maxCredits: 1_000n,
      estimatedInternalCost: 10n,
      maxInternalCost: 100n,
    },
    economics: {
      contributionMargin: 10n,
      availableCash: 1_000n,
      requiredCashReserve: 100n,
      remainingBudget: 15n,
    },
  };
}

async function createFixtureJobs(
  ownerDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
  count: number,
): Promise<readonly FixtureJob[]> {
  const jobs = Array.from({ length: count }, () => ({ id: randomUUID(), scope }));
  const client = await ownerDatabase.pool.connect();

  try {
    await client.query('BEGIN');
    for (const job of jobs) {
      await client.query(
        `INSERT INTO platform.durable_job
          (id, tenant_id, project_id, created_by_subject_id, contract_id, contract_version,
           operation_type, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'queued')`,
        [
          job.id,
          scope.tenantId,
          scope.projectId,
          scope.subjectId,
          scope.contractId,
          scope.contractVersion,
          fixtureOperation,
        ],
      );
    }
    await client.query('COMMIT');
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  } finally {
    client.release();
  }

  return jobs;
}

async function seedFixtureCredits(
  ownerDatabase: ReturnType<typeof createDatabase>,
  identity: FixtureIdentity,
  credits: bigint,
  origin: 'TEST_FIXTURE' | 'PAID_PACK' = 'TEST_FIXTURE',
): Promise<void> {
  const client = await ownerDatabase.pool.connect();

  try {
    await client.query('BEGIN');
    const wallet = await client.query<{ id: string }>(
      'SELECT id FROM platform.credit_wallet WHERE tenant_id = $1',
      [identity.tenantId],
    );
    const walletId = wallet.rows[0]?.id;
    assert.ok(walletId, 'The tenant membership trigger must create a credit wallet');

    const lotId = randomUUID();
    const eventId = randomUUID();
    const grantKeyHash = sha256(`fixture-grant:${identity.tenantId}:${randomUUID()}`);
    const requestHash = sha256(`fixture-grant-request:${identity.tenantId}:${credits}`);
    await client.query(
      `INSERT INTO platform.credit_lot
         (id, tenant_id, wallet_id, origin, issued_credits, expires_at)
       VALUES ($1, $2, $3, $4, $5, NULL)`,
      [lotId, identity.tenantId, walletId, origin, credits.toString()],
    );
    await client.query(
      `INSERT INTO platform.credit_event
        (id, tenant_id, wallet_id, subject_id, operation, idempotency_key_sha256, request_sha256,
         reservation_id, job_id, project_id, amount_credits, reason_code, request_id)
       VALUES ($1, $2, $3, $4, 'fixture_grant', $5, $6, NULL, NULL, NULL, $7, 'test_fixture', $8)`,
      [
        eventId,
        identity.tenantId,
        walletId,
        identity.subjectId,
        grantKeyHash,
        requestHash,
        credits.toString(),
        `credit-ledger-fixture-${randomUUID()}`,
      ],
    );
    await client.query(
      `INSERT INTO platform.credit_ledger_entry
        (id, event_id, tenant_id, wallet_id, lot_id, reservation_id, account, delta_credits)
       VALUES
        ($1, $2, $3, $4, $5, NULL, 'available', $6),
        ($7, $2, $3, $4, $5, NULL, 'issuance_source', $8)`,
      [
        randomUUID(),
        eventId,
        identity.tenantId,
        walletId,
        lotId,
        credits.toString(),
        randomUUID(),
        (-credits).toString(),
      ],
    );
    await client.query('COMMIT');
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  } finally {
    client.release();
  }
}

async function readFixtureAvailableCredits(
  ownerDatabase: ReturnType<typeof createDatabase>,
  tenantId: string,
): Promise<bigint> {
  const result = await ownerDatabase.pool.query<{ available_credits: string }>(
    `SELECT COALESCE(sum(entry.delta_credits), 0)::text AS available_credits
       FROM platform.credit_lot lot
       JOIN platform.credit_ledger_entry entry
         ON entry.lot_id = lot.id AND entry.tenant_id = lot.tenant_id
        AND entry.wallet_id = lot.wallet_id
      WHERE lot.tenant_id = $1 AND lot.origin = 'TEST_FIXTURE'
        AND (lot.expires_at IS NULL OR lot.expires_at > clock_timestamp())
        AND entry.account = 'available'`,
    [tenantId],
  );
  return BigInt(result.rows[0]?.available_credits ?? '0');
}

async function assertDirectSqlReserveRemainsFixtureOnly(
  appDatabase: ReturnType<typeof createDatabase>,
  ownerDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
  fixtureJobId: string,
  integrityJobId: string,
  availableFixtureCredits: bigint,
): Promise<void> {
  const fixtureBefore = await readDirectSqlReservationSnapshot(ownerDatabase, scope, fixtureJobId);
  assert.equal(fixtureBefore.job_status, 'queued');
  assert.equal(fixtureBefore.reservation_count, '0');
  assert.equal(fixtureBefore.reserve_event_count, '0');

  const initialPrivileges = await ownerDatabase.pool.query<{
    can_select_lots: boolean;
    can_select_entries: boolean;
    can_select_reservations: boolean;
    can_execute_terminal_job_matcher: boolean;
    can_insert_durable_jobs: boolean;
  }>(
    `SELECT has_table_privilege('spryxel_app', 'platform.credit_lot', 'SELECT') AS can_select_lots,
            has_table_privilege('spryxel_app', 'platform.credit_ledger_entry', 'SELECT')
              AS can_select_entries,
            has_table_privilege('spryxel_app', 'platform.credit_reservation', 'SELECT')
              AS can_select_reservations,
            has_function_privilege(
              'spryxel_app',
              'platform.credit_terminal_job_matches(uuid, uuid, uuid, uuid)',
              'EXECUTE'
            ) AS can_execute_terminal_job_matcher,
            has_table_privilege('spryxel_app', 'platform.durable_job', 'INSERT')
              AS can_insert_durable_jobs`,
  );
  assert.deepEqual(initialPrivileges.rows[0], {
    can_select_lots: false,
    can_select_entries: false,
    can_select_reservations: false,
    can_execute_terminal_job_matcher: false,
    can_insert_durable_jobs: false,
  });

  const appInsertClient = await appDatabase.pool.connect();
  let appInsertTransactionStarted = false;
  let appJobInsertError: unknown;
  try {
    await appInsertClient.query('BEGIN');
    appInsertTransactionStarted = true;
    const appSession = await appInsertClient.query<{ session_user: string }>('SELECT session_user');
    assert.equal(appSession.rows[0]?.session_user, 'spryxel_app');
    try {
      await appInsertClient.query('INSERT INTO platform.durable_job (id) VALUES ($1::uuid)', [
        randomUUID(),
      ]);
    } catch (caught) {
      appJobInsertError = caught;
    }
  } finally {
    try {
      if (appInsertTransactionStarted) await appInsertClient.query('ROLLBACK');
    } finally {
      appInsertClient.release();
    }
  }
  assert.equal(
    (appJobInsertError as { code?: unknown } | undefined)?.code,
    '42501',
    'The runtime app role must not create a Job that could be presented as an authorized fixture',
  );

  // This probe is confined to the disposable integration database. Its RLS expressions inspect
  // reservations and call the terminal-job matcher, so grant those dependencies temporarily to
  // the restricted app session while it proves fixture-only allocation. The finally block
  // revokes them before later role assertions continue.
  try {
    await ownerDatabase.pool.query(
      'GRANT SELECT ON platform.credit_lot, platform.credit_ledger_entry, platform.credit_reservation TO spryxel_app',
    );
    await ownerDatabase.pool.query(
      'GRANT EXECUTE ON FUNCTION platform.credit_terminal_job_matches(uuid, uuid, uuid, uuid) TO spryxel_app',
    );
    // Bypass the JavaScript CostGuard service and exercise the callable SQL boundary directly.
    const fixtureAttempt = await callDirectSqlReserveAndRollback(appDatabase, scope, fixtureJobId);
    assert.equal(
      fixtureAttempt.error,
      undefined,
      'The SQL boundary must allow only the explicitly labeled fixture operation',
    );
    const fixtureReservation = fixtureAttempt.result;
    assert.ok(fixtureReservation?.reservation_id);
    assert.ok(fixtureReservation.entry_id);
    assert.deepEqual(
      { status: fixtureReservation.status, reserved_credits: fixtureReservation.reserved_credits },
      { status: 'reserved', reserved_credits: '1' },
    );
    assert.deepEqual(
      fixtureAttempt.allocatedLotOrigins,
      ['TEST_FIXTURE'],
      'A direct fixture reservation must not allocate a synthetic non-fixture lot',
    );
    assert.deepEqual(
      await readDirectSqlReservationSnapshot(ownerDatabase, scope, fixtureJobId),
      fixtureBefore,
      'The direct fixture reservation must be rolled back with no owner-visible financial state',
    );

    const mixedOriginAttempt = await callDirectSqlReserveAndRollback(
      appDatabase,
      scope,
      fixtureJobId,
      availableFixtureCredits + 1n,
    );
    const mixedOriginError = mixedOriginAttempt.error as
      | { code?: unknown; message?: unknown }
      | undefined;
    assert.equal(mixedOriginError?.code, 'P0001');
    assert.equal(mixedOriginError?.message, 'credit_insufficient_credits');
    assert.equal(
      mixedOriginAttempt.result,
      undefined,
      'Direct SQL must not supplement fixture credit with non-fixture lots',
    );
    assert.deepEqual(
      await readDirectSqlReservationSnapshot(ownerDatabase, scope, fixtureJobId),
      fixtureBefore,
      'The insufficient fixture-only direct call must not persist financial state',
    );

    const integrityBefore = await readDirectSqlReservationSnapshot(
      ownerDatabase,
      scope,
      integrityJobId,
    );
    const integrityAttempt = await callDirectSqlReserveAndRollback(
      appDatabase,
      scope,
      integrityJobId,
    );
    const integrityError = integrityAttempt.error as
      | { code?: unknown; message?: unknown }
      | undefined;
    assert.equal(integrityError?.code, 'P0001');
    assert.equal(integrityError?.message, 'credit_cost_guard_denied');
    assert.equal(
      integrityAttempt.result,
      undefined,
      'Direct SQL must deny the existing non-costing integrity-check Job',
    );
    assert.deepEqual(
      await readDirectSqlReservationSnapshot(ownerDatabase, scope, integrityJobId),
      integrityBefore,
      'The denied direct SQL call must leave no owner-visible financial state',
    );
  } finally {
    await ownerDatabase.pool.query(
      'REVOKE SELECT ON platform.credit_lot, platform.credit_ledger_entry, platform.credit_reservation FROM spryxel_app',
    );
    await ownerDatabase.pool.query(
      'REVOKE EXECUTE ON FUNCTION platform.credit_terminal_job_matches(uuid, uuid, uuid, uuid) FROM spryxel_app',
    );
    const restoredPrivileges = await ownerDatabase.pool.query<{
      can_select_lots: boolean;
      can_select_entries: boolean;
      can_select_reservations: boolean;
      can_execute_terminal_job_matcher: boolean;
      can_insert_durable_jobs: boolean;
    }>(
      `SELECT has_table_privilege('spryxel_app', 'platform.credit_lot', 'SELECT')
                AS can_select_lots,
              has_table_privilege('spryxel_app', 'platform.credit_ledger_entry', 'SELECT')
                AS can_select_entries,
              has_table_privilege('spryxel_app', 'platform.credit_reservation', 'SELECT')
                AS can_select_reservations,
              has_function_privilege(
                'spryxel_app',
                'platform.credit_terminal_job_matches(uuid, uuid, uuid, uuid)',
                'EXECUTE'
                ) AS can_execute_terminal_job_matcher,
                has_table_privilege('spryxel_app', 'platform.durable_job', 'INSERT')
                  AS can_insert_durable_jobs`,
    );
    assert.deepEqual(restoredPrivileges.rows[0], {
      can_select_lots: false,
      can_select_entries: false,
      can_select_reservations: false,
      can_execute_terminal_job_matcher: false,
      can_insert_durable_jobs: false,
    });
  }
}

async function callDirectSqlReserveAndRollback(
  appDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
  jobId: string,
  amountCredits: bigint = 1n,
): Promise<{
  result?: DirectSqlReservationResult;
  allocatedLotOrigins?: readonly string[];
  error?: unknown;
}> {
  const amount = amountCredits.toString();
  const policyId = 'direct-sql-fixture-policy';
  const policyVersion = '1';
  const decision = 'allow_fixture';
  const reasonCode = 'fixture_policy_passed';
  const estimatedInternalCost = amount;
  const maxInternalCost = amount;
  const idempotencyKey = `direct-sql-idempotency:${randomUUID()}`;
  const requestId = `credit-ledger-direct-sql-${randomUUID()}`;
  const requestHash = sha256(
    [
      'reserve',
      jobId.toLowerCase(),
      amount,
      scope.skuId,
      policyId,
      policyVersion,
      decision,
      reasonCode,
      estimatedInternalCost,
      maxInternalCost,
    ].join('\n'),
  );
  const client = await appDatabase.pool.connect();
  let transactionStarted = false;
  let result: DirectSqlReservationResult | undefined;
  let allocatedLotOrigins: readonly string[] | undefined;
  let error: unknown;

  try {
    await client.query('BEGIN');
    transactionStarted = true;
    const session = await client.query<{ session_user: string }>('SELECT session_user');
    assert.equal(
      session.rows[0]?.session_user,
      'spryxel_app',
      'The direct call must use the restricted runtime app login',
    );
    try {
      await setScope(client, scope);
      const reserved = await client.query<DirectSqlReservationResult>(
        `SELECT reservation_id::text AS reservation_id,
                entry_id::text AS entry_id,
                status,
                reserved_credits::text AS reserved_credits
           FROM platform.reserve_credit_ledger(
             $1::uuid, $2::bigint, $3::text, $4::text, $5::text, $6::text,
             $7::text, $8::bigint, $9::bigint, $10::text, $11::text, $12::text
           )`,
        [
          jobId,
          amount,
          scope.skuId,
          policyId,
          policyVersion,
          decision,
          reasonCode,
          estimatedInternalCost,
          maxInternalCost,
          sha256(idempotencyKey),
          requestHash,
          requestId,
        ],
      );
      result = reserved.rows[0];
      // Exercise deferred ledger constraints before the test-only rollback.
      await client.query('SET CONSTRAINTS ALL IMMEDIATE');
      const allocatedLots = await client.query<{ origin: string }>(
        `SELECT DISTINCT lot.origin
           FROM platform.credit_ledger_entry entry
           JOIN platform.credit_lot lot
             ON lot.id = entry.lot_id AND lot.tenant_id = entry.tenant_id
            AND lot.wallet_id = entry.wallet_id
          WHERE entry.reservation_id = $1 AND entry.account = 'available'
            AND entry.delta_credits < 0
          ORDER BY lot.origin`,
        [result.reservation_id],
      );
      allocatedLotOrigins = allocatedLots.rows.map(({ origin }) => origin);
    } catch (caught) {
      error = caught;
    }

    return {
      ...(result === undefined ? {} : { result }),
      ...(allocatedLotOrigins === undefined ? {} : { allocatedLotOrigins }),
      ...(error === undefined ? {} : { error }),
    };
  } finally {
    try {
      if (transactionStarted) await client.query('ROLLBACK');
    } finally {
      client.release();
    }
  }
}

async function readDirectSqlReservationSnapshot(
  ownerDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
  jobId: string,
): Promise<{
  job_status: string;
  reservation_count: string;
  reserve_event_count: string;
  ledger_entry_count: string;
  available_credits: string;
  reserved_credits: string;
  consumed_credits: string;
}> {
  const snapshot = await ownerDatabase.pool.query<{
    job_status: string;
    reservation_count: string;
    reserve_event_count: string;
    ledger_entry_count: string;
    available_credits: string;
    reserved_credits: string;
    consumed_credits: string;
  }>(
    `SELECT job.status AS job_status,
            (SELECT count(*)::text
               FROM platform.credit_reservation reservation
              WHERE reservation.job_id = job.id AND reservation.tenant_id = job.tenant_id)
              AS reservation_count,
            (SELECT count(*)::text
               FROM platform.credit_event event
              WHERE event.job_id = job.id AND event.tenant_id = job.tenant_id
                AND event.operation = 'reserve') AS reserve_event_count,
            (SELECT count(*)::text
               FROM platform.credit_ledger_entry entry
               JOIN platform.credit_reservation reservation
                 ON reservation.id = entry.reservation_id
                AND reservation.tenant_id = entry.tenant_id
              WHERE reservation.job_id = job.id AND reservation.tenant_id = job.tenant_id)
              AS ledger_entry_count,
            COALESCE((SELECT sum(entry.delta_credits)
                        FROM platform.credit_ledger_entry entry
                       WHERE entry.tenant_id = job.tenant_id AND entry.account = 'available'), 0)::text
              AS available_credits,
            COALESCE((SELECT sum(entry.delta_credits)
                        FROM platform.credit_ledger_entry entry
                       WHERE entry.tenant_id = job.tenant_id AND entry.account = 'reserved'), 0)::text
              AS reserved_credits,
            COALESCE((SELECT sum(entry.delta_credits)
                        FROM platform.credit_ledger_entry entry
                       WHERE entry.tenant_id = job.tenant_id AND entry.account = 'consumed'), 0)::text
              AS consumed_credits
       FROM platform.durable_job job
      WHERE job.id = $1 AND job.tenant_id = $2 AND job.project_id = $3`,
    [jobId, scope.tenantId, scope.projectId],
  );
  assert.equal(snapshot.rowCount, 1, 'The owner snapshot must resolve the scoped fixture Job');
  const row = snapshot.rows[0];
  assert.ok(row);
  return row;
}

async function assertRoleBoundaries(
  ownerDatabase: ReturnType<typeof createDatabase>,
  appDatabase: ReturnType<typeof createDatabase>,
  workerDatabase: ReturnType<typeof createDatabase>,
  scopeA: FixtureScope,
  scopeB: FixtureScope,
): Promise<void> {
  const unscoped = await appDatabase.pool.query<{ count: string }>(
    'SELECT count(*)::text AS count FROM platform.credit_wallet_summary',
  );
  assert.equal(
    unscoped.rows[0]?.count,
    '0',
    'Credit summary must fail closed without tenant context',
  );

  const appClient = await appDatabase.pool.connect();
  try {
    await appClient.query('BEGIN');
    await setScope(appClient, scopeA);
    const ownSummary = await appClient.query<{ tenant_id: string }>(
      'SELECT tenant_id FROM platform.credit_wallet_summary',
    );
    assert.ok(ownSummary.rows.length > 0);
    assert.ok(ownSummary.rows.every((row) => row.tenant_id === scopeA.tenantId));
    const crossTenantSummary = await appClient.query(
      'SELECT tenant_id FROM platform.credit_wallet_summary WHERE tenant_id = $1',
      [scopeB.tenantId],
    );
    assert.equal(crossTenantSummary.rowCount, 0, 'Tenant A must not read Tenant B credit summary');
    await appClient.query('COMMIT');
  } catch (error) {
    await rollbackQuietly(appClient);
    throw error;
  } finally {
    appClient.release();
  }

  await assertAppCannotReadLedgerTables(appDatabase, scopeA);
  await assertRevokedMembershipHidden(ownerDatabase, appDatabase, scopeB);

  const directDml = await appDatabase.pool.connect();
  try {
    await directDml.query('BEGIN');
    await setScope(directDml, scopeA);
    let updateDenied = false;
    try {
      await directDml.query(
        'UPDATE platform.credit_ledger_entry SET delta_credits = 1 WHERE tenant_id = $1',
        [scopeA.tenantId],
      );
    } catch (error) {
      updateDenied = isPermissionDenied(error) || isImmutableViolation(error);
      await directDml.query('ROLLBACK');
      await directDml.query('BEGIN');
      await setScope(directDml, scopeA);
    }
    let deleteDenied = false;
    try {
      await directDml.query('DELETE FROM platform.credit_ledger_entry WHERE tenant_id = $1', [
        scopeA.tenantId,
      ]);
    } catch (error) {
      deleteDenied = isPermissionDenied(error) || isImmutableViolation(error);
    }
    assert.ok(updateDenied, 'Runtime app must not directly update posted ledger entries');
    assert.ok(deleteDenied, 'Runtime app must not directly delete posted ledger entries');
    await directDml.query('ROLLBACK');
  } finally {
    directDml.release();
  }

  for (const query of [
    'SELECT id FROM platform.credit_wallet',
    'SELECT id FROM platform.credit_lot',
    'SELECT id FROM platform.credit_event',
    'SELECT id FROM platform.credit_reservation',
    'SELECT id FROM platform.credit_ledger_entry',
    'SELECT id FROM platform.credit_integrity_incident',
  ]) {
    await expectPermissionDenied(workerDatabase, query);
  }

  const workerFunctionGrants = await workerDatabase.pool.query<{
    can_reserve: boolean;
    can_commit: boolean;
    can_release: boolean;
    can_compensate: boolean;
  }>(`
    SELECT has_function_privilege(current_user,
             'platform.reserve_credit_ledger(uuid,bigint,text,text,text,text,text,bigint,bigint,text,text,text)', 'EXECUTE') AS can_reserve,
           has_function_privilege(current_user,
             'platform.commit_credit_ledger(uuid,bigint,text,text,text)', 'EXECUTE') AS can_commit,
           has_function_privilege(current_user,
             'platform.release_credit_ledger(uuid,bigint,text,text,text)', 'EXECUTE') AS can_release,
           has_function_privilege(current_user,
             'platform.compensate_credit_ledger(uuid,uuid,bigint,text,text,text,text)', 'EXECUTE') AS can_compensate
  `);
  assert.deepEqual(workerFunctionGrants.rows[0], {
    can_reserve: false,
    can_commit: false,
    can_release: false,
    can_compensate: false,
  });

  const ownerClient = await ownerDatabase.pool.connect();
  try {
    const retainedCreditEvents = await ownerClient.query<{ count: string }>(
      'SELECT count(*)::text AS count FROM platform.credit_event WHERE tenant_id = $1',
      [scopeA.tenantId],
    );
    assert.ok(
      Number(retainedCreditEvents.rows[0]?.count ?? '0') > 0,
      'The retention proof requires a durable credit event with an idempotency identity',
    );

    for (const [operation, query] of [
      [
        'UPDATE',
        `UPDATE platform.credit_event
            SET idempotency_key_sha256 = repeat('f', 64)
          WHERE id = (SELECT id FROM platform.credit_event WHERE tenant_id = $1 LIMIT 1)`,
      ],
      [
        'DELETE',
        `DELETE FROM platform.credit_event
          WHERE id = (SELECT id FROM platform.credit_event WHERE tenant_id = $1 LIMIT 1)`,
      ],
    ] as const) {
      let immutable = false;
      try {
        await ownerClient.query(query, [scopeA.tenantId]);
      } catch (error) {
        immutable = isImmutableViolation(error);
      }
      assert.ok(
        immutable,
        `Durable idempotency identities must reject owner-level ${operation} for their ledger-event lifetime`,
      );
    }

    for (const [operation, query] of [
      ['UPDATE', 'UPDATE platform.credit_ledger_entry SET delta_credits = 1 WHERE tenant_id = $1'],
      ['DELETE', 'DELETE FROM platform.credit_ledger_entry WHERE tenant_id = $1'],
    ] as const) {
      let immutable = false;
      try {
        await ownerClient.query(query, [scopeA.tenantId]);
      } catch (error) {
        immutable = isImmutableViolation(error);
      }
      assert.ok(immutable, `Append-only ledger entries must reject owner-level ${operation}`);
    }
  } finally {
    ownerClient.release();
  }
}

async function assertLedgerLifecycle(
  appDatabase: ReturnType<typeof createDatabase>,
  workerDatabase: ReturnType<typeof createDatabase>,
  ownerDatabase: ReturnType<typeof createDatabase>,
  ownerDatabaseUrl: string,
  appDatabaseUrl: string,
  scopeA: FixtureScope,
  scopeB: FixtureScope,
  memberIdentity: FixtureIdentity,
  integrityJobId: string,
  jobsA: readonly FixtureJob[],
  jobsB: readonly FixtureJob[],
): Promise<void> {
  const contextA: CreditLedgerContext = scopeContext(scopeA);
  const contextB: CreditLedgerContext = scopeContext(scopeB);
  const reserveA = createFixtureCreditReserver(appDatabase, contextA, scopeA.skuId);
  const reserveB = createFixtureCreditReserver(appDatabase, contextB, scopeB.skuId);
  const [initialA, initialB] = await Promise.all([
    getCreditSummary(appDatabase, contextA),
    getCreditSummary(appDatabase, contextB),
  ]);
  assert.equal(initialA.balances.availableCredits, fixtureCreditBalance.toString());
  assert.equal(initialB.balances.availableCredits, fixtureCreditBalance.toString());

  const memberSummary = await getCreditSummary(appDatabase, {
    subjectId: memberIdentity.subjectId,
    tenantId: scopeA.tenantId,
  });
  assert.equal(memberSummary.tenantId, scopeA.tenantId);
  assert.equal(
    memberSummary.balances.availableCredits,
    fixtureCreditBalance.toString(),
    'An active tenant MEMBER must be able to read the wallet summary',
  );

  const [jobOne, jobTwo, crossTenantJobA] = jobsA;
  const [crossTenantJobB] = jobsB;
  assert.ok(jobOne && jobTwo && crossTenantJobA && crossTenantJobB);

  const concurrent = await Promise.allSettled([
    reserveA({
      jobId: jobOne.id,
      amountCredits: 120n,
      idempotencyKey: 'credit-ledger-concurrent-a',
      requestId: `credit-ledger-${randomUUID()}`,
    }),
    reserveA({
      jobId: jobTwo.id,
      amountCredits: 120n,
      idempotencyKey: 'credit-ledger-concurrent-b',
      requestId: `credit-ledger-${randomUUID()}`,
    }),
  ]);
  const first = concurrent[0];
  const second = concurrent[1];
  assert.ok(first && second);
  const successfulReservations = [
    ...(first.status === 'fulfilled'
      ? [{ result: first.value, jobId: jobOne.id, key: 'credit-ledger-concurrent-a' }]
      : []),
    ...(second.status === 'fulfilled'
      ? [{ result: second.value, jobId: jobTwo.id, key: 'credit-ledger-concurrent-b' }]
      : []),
  ];
  const failedReservations = [
    ...(first.status === 'rejected' ? [first.reason] : []),
    ...(second.status === 'rejected' ? [second.reason] : []),
  ];
  assert.equal(
    successfulReservations.length,
    1,
    'Only one concurrent reservation may spend a 200-credit wallet',
  );
  assert.equal(
    failedReservations.length,
    1,
    'The competing concurrent reservation must fail closed',
  );
  assert.equal(successfulReservations[0]?.result.reservedCredits, '120');
  assert.ok(isLedgerErrorCode(failedReservations[0], 'insufficient_credits'));

  const winningJobId = successfulReservations[0]?.jobId;
  const winningRequestKey = successfulReservations[0]?.key;
  const winningReservationId = successfulReservations[0]?.result.reservationId;
  assert.ok(winningJobId && winningRequestKey && winningReservationId);

  // Both callers use the same business payload and CostGuard authorization. Distinct request IDs
  // model separate transport attempts; they are correlation metadata, not part of the ledger's
  // idempotency payload hash.
  const sameKeyJobId = winningJobId === jobOne.id ? jobTwo.id : jobOne.id;
  const sameKeyAmount = 10n;
  const sameKeyIdempotencyKey = `credit-ledger-same-key-concurrent:${randomUUID()}`;
  const sameKeyCostGuardInput = fixtureCostGuardInput(scopeA.skuId, sameKeyAmount);
  const reserveSameKey = createCostGuardedCreditReservationService({
    reserve: (authorizedInput) => reserveCredits(appDatabase, contextA, authorizedInput),
  });
  const sameKeyBaseline = await getCreditSummary(appDatabase, contextA);
  assert.deepEqual(sameKeyBaseline.balances, {
    availableCredits: '80',
    reservedCredits: '120',
    committedCredits: '0',
  });
  const sameKeyReservations = new Set<string>();
  try {
    const sameKeyAttempts = await Promise.allSettled([
      reserveSameKey({
        jobId: sameKeyJobId,
        amountCredits: sameKeyAmount,
        idempotencyKey: sameKeyIdempotencyKey,
        requestId: `credit-ledger-same-key-attempt-a-${randomUUID()}`,
        costGuardInput: sameKeyCostGuardInput,
      }),
      reserveSameKey({
        jobId: sameKeyJobId,
        amountCredits: sameKeyAmount,
        idempotencyKey: sameKeyIdempotencyKey,
        requestId: `credit-ledger-same-key-attempt-b-${randomUUID()}`,
        costGuardInput: sameKeyCostGuardInput,
      }),
    ]);
    const sameKeyFulfilled = sameKeyAttempts.flatMap((attempt) =>
      attempt.status === 'fulfilled' ? [attempt.value] : [],
    );
    assert.equal(
      sameKeyFulfilled.length,
      2,
      'Concurrent identical reserve attempts must both resolve through the durable idempotency record',
    );
    const originalSameKeyResult = sameKeyFulfilled.find((result) => !result.replayed);
    const replaySameKeyResult = sameKeyFulfilled.find((result) => result.replayed);
    assert.ok(originalSameKeyResult && replaySameKeyResult);
    sameKeyReservations.add(originalSameKeyResult.reservationId);
    sameKeyReservations.add(replaySameKeyResult.reservationId);
    assertSameReservationSnapshot(
      replaySameKeyResult,
      originalSameKeyResult,
      'Concurrent identical requests must return the same durable reservation/event snapshot',
    );
    assert.equal(sameKeyReservations.size, 1, 'The idempotency key must create one reservation');
    assert.equal(originalSameKeyResult.status, 'reserved');
    assert.equal(originalSameKeyResult.reservedCredits, sameKeyAmount.toString());

    const durableSameKey = await ownerDatabase.pool.query<{
      event_id: string;
      reservation_id: string;
      job_id: string;
      event_count: string;
      reservation_count: string;
      posting_count: string;
      posting_net: string;
      available_postings: string;
      reserved_postings: string;
    }>(
      `WITH matching_events AS (
         SELECT event.id, event.reservation_id, event.job_id
           FROM platform.credit_event event
          WHERE event.tenant_id = $1 AND event.subject_id = $2
            AND event.operation = 'reserve' AND event.idempotency_key_sha256 = $3
       ), matching_entries AS (
         SELECT entry.*
           FROM platform.credit_ledger_entry entry
           JOIN matching_events event ON event.id = entry.event_id
          WHERE entry.tenant_id = $1
       )
       SELECT (SELECT id::text FROM matching_events LIMIT 1) AS event_id,
              (SELECT reservation_id::text FROM matching_events LIMIT 1) AS reservation_id,
              (SELECT job_id::text FROM matching_events LIMIT 1) AS job_id,
              (SELECT count(*)::text FROM matching_events) AS event_count,
              (SELECT count(DISTINCT reservation_id)::text FROM matching_events) AS reservation_count,
              (SELECT count(*)::text FROM matching_entries) AS posting_count,
              coalesce((SELECT sum(delta_credits) FROM matching_entries), 0)::text AS posting_net,
              (SELECT count(*)::text FROM matching_entries
                WHERE account = 'available' AND delta_credits = -$4::bigint) AS available_postings,
              (SELECT count(*)::text FROM matching_entries
                WHERE account = 'reserved' AND delta_credits = $4::bigint) AS reserved_postings`,
      [scopeA.tenantId, scopeA.subjectId, sha256(sameKeyIdempotencyKey), sameKeyAmount.toString()],
    );
    assert.deepEqual(durableSameKey.rows[0], {
      event_id: originalSameKeyResult.entryId,
      reservation_id: originalSameKeyResult.reservationId,
      job_id: sameKeyJobId,
      event_count: '1',
      reservation_count: '1',
      posting_count: '2',
      posting_net: '0',
      available_postings: '1',
      reserved_postings: '1',
    });

    const afterSameKey = await getCreditSummary(appDatabase, contextA);
    assert.deepEqual(
      afterSameKey.balances,
      { availableCredits: '70', reservedCredits: '130', committedCredits: '0' },
      'Concurrent replay must debit the wallet only once',
    );
    assert.equal(
      afterSameKey.counters.openReservations,
      sameKeyBaseline.counters.openReservations + 1,
      'Concurrent replay must open exactly one reservation',
    );

    await assertReleaseRejectedWithoutMutation(
      appDatabase,
      ownerDatabase,
      contextA,
      {
        reservationId: originalSameKeyResult.reservationId,
        amountCredits: sameKeyAmount,
        idempotencyKey: `credit-ledger-same-key-queued-release:${originalSameKeyResult.reservationId}`,
        requestId: `credit-ledger-same-key-queued-release-${randomUUID()}`,
      },
      'An active queued Job must not release reserved credits',
    );
    await assertReleaseRejectedWithoutMutation(
      appDatabase,
      ownerDatabase,
      contextA,
      {
        reservationId: originalSameKeyResult.reservationId,
        amountCredits: 1n,
        idempotencyKey: `credit-ledger-same-key-queued-partial-release:${originalSameKeyResult.reservationId}`,
        requestId: `credit-ledger-same-key-queued-partial-release-${randomUUID()}`,
      },
      'A partial release from an active queued Job must leave all financial state unchanged',
    );
    await transitionFixtureJobToRunningAsOwner(ownerDatabase, sameKeyJobId);
    await assertReleaseRejectedWithoutMutation(
      appDatabase,
      ownerDatabase,
      contextA,
      {
        reservationId: originalSameKeyResult.reservationId,
        amountCredits: sameKeyAmount,
        idempotencyKey: `credit-ledger-same-key-running-release:${originalSameKeyResult.reservationId}`,
        requestId: `credit-ledger-same-key-running-release-${randomUUID()}`,
      },
      'An active running Job must not release reserved credits',
    );
    await assertReleaseRejectedWithoutMutation(
      appDatabase,
      ownerDatabase,
      contextA,
      {
        reservationId: originalSameKeyResult.reservationId,
        amountCredits: 1n,
        idempotencyKey: `credit-ledger-same-key-running-partial-release:${originalSameKeyResult.reservationId}`,
        requestId: `credit-ledger-same-key-running-partial-release-${randomUUID()}`,
      },
      'A partial release from an active running Job must leave all financial state unchanged',
    );
  } finally {
    // Resolve by durable idempotency identity so interrupted responses still get terminal cleanup.
    const persistedSameKeyReservations = await ownerDatabase.pool.query<{
      reservation_id: string;
    }>(
      `SELECT DISTINCT reservation_id::text AS reservation_id
         FROM platform.credit_event
        WHERE tenant_id = $1 AND subject_id = $2 AND operation = 'reserve'
          AND idempotency_key_sha256 = $3`,
      [scopeA.tenantId, scopeA.subjectId, sha256(sameKeyIdempotencyKey)],
    );
    for (const row of persistedSameKeyReservations.rows) {
      sameKeyReservations.add(row.reservation_id);
    }
    if (sameKeyReservations.size > 0) {
      await terminalizeFixtureJobAsOwner(ownerDatabase, sameKeyJobId);
      for (const reservationId of sameKeyReservations) {
        assert.equal(
          await countReservationEvents(
            ownerDatabase,
            scopeA.tenantId,
            reservationId,
            'terminal_release',
          ),
          1,
          'Terminalizing the fixture Job must release the same-key reservation exactly once',
        );
      }
    }
  }
  const sameKeyAfterCleanup = await getCreditSummary(appDatabase, contextA);
  assert.deepEqual(
    sameKeyAfterCleanup.balances,
    sameKeyBaseline.balances,
    'The concurrent idempotency fixture must restore wallet balances after cleanup',
  );
  assert.equal(
    sameKeyAfterCleanup.counters.openReservations,
    sameKeyBaseline.counters.openReservations,
    'The concurrent idempotency fixture must leave no open reservation behind',
  );

  await assertReservationLinkedToFixture(ownerDatabase, scopeA, winningJobId, winningReservationId);
  await assertReservationCostGuardMetadata(ownerDatabase, scopeA, winningReservationId);
  await assertCrossTenantReservationCommandsDenied(appDatabase, contextB, winningReservationId);
  await assertCommitRejectedWithoutMutation(
    appDatabase,
    ownerDatabase,
    contextA,
    {
      reservationId: winningReservationId,
      amountCredits: 121n,
      idempotencyKey: 'credit-ledger-commit-over-reservation',
      requestId: `credit-ledger-commit-over-reservation-${randomUUID()}`,
    },
    'amount_exceeded',
    'A commit above the reservation amount must not mutate the wallet or ledger',
  );

  let integrityJobRejected = false;
  try {
    await reserveA({
      jobId: integrityJobId,
      amountCredits: 1n,
      idempotencyKey: `credit-ledger-integrity-must-not-cost-${randomUUID()}`,
      requestId: `credit-ledger-integrity-${randomUUID()}`,
    });
  } catch (error) {
    integrityJobRejected = isLedgerErrorCode(error, 'cost_guard_denied');
  }
  assert.ok(integrityJobRejected, 'The existing integrity-check Job must remain non-costing');

  const replay = await reserveA({
    jobId: winningJobId,
    amountCredits: 120n,
    idempotencyKey: winningRequestKey,
    requestId: `credit-ledger-replay-${randomUUID()}`,
  });
  assert.equal(replay.reservationId, winningReservationId);
  assert.equal(
    replay.replayed,
    true,
    'Identical request replay must return the original reservation',
  );
  assertSameReservationSnapshot(
    replay,
    successfulReservations[0].result,
    'Reserve replay must preserve the original result snapshot',
  );

  let mismatchedReplayRejected = false;
  try {
    await reserveA({
      jobId: winningJobId,
      amountCredits: 119n,
      idempotencyKey: winningRequestKey,
      requestId: `credit-ledger-conflict-${randomUUID()}`,
    });
  } catch (error) {
    mismatchedReplayRejected = isLedgerErrorCode(error, 'idempotency_conflict');
  }
  assert.ok(mismatchedReplayRejected, 'Reusing a key with a different request must conflict');

  const sharedTenantKey = 'credit-ledger-same-key-two-tenants';
  const [tenantAReservation, tenantBReservation] = await Promise.all([
    reserveA({
      jobId: crossTenantJobA.id,
      amountCredits: 10n,
      idempotencyKey: sharedTenantKey,
      requestId: `credit-ledger-tenant-a-${randomUUID()}`,
    }),
    reserveB({
      jobId: crossTenantJobB.id,
      amountCredits: 10n,
      idempotencyKey: sharedTenantKey,
      requestId: `credit-ledger-tenant-b-${randomUUID()}`,
    }),
  ]);
  assert.notEqual(tenantAReservation.reservationId, tenantBReservation.reservationId);
  assert.equal(tenantAReservation.replayed, false);
  assert.equal(tenantBReservation.replayed, false);
  await assertFixtureJobHiddenOverHttp(
    ownerDatabase,
    appDatabase,
    appDatabaseUrl,
    scopeA,
    crossTenantJobA.id,
    tenantAReservation.reservationId,
  );

  const tenantACommit = await commitCredits(appDatabase, contextA, {
    reservationId: tenantAReservation.reservationId,
    amountCredits: 10n,
    idempotencyKey: 'credit-ledger-secondary-commit-a',
    requestId: `credit-ledger-secondary-commit-a-${randomUUID()}`,
  });
  assert.equal(tenantACommit.status, 'settled');
  assert.equal(tenantACommit.committedCredits, '10');

  const tenantBCommit = await commitCredits(appDatabase, contextB, {
    reservationId: tenantBReservation.reservationId,
    amountCredits: 5n,
    idempotencyKey: 'credit-ledger-secondary-commit-b',
    requestId: `credit-ledger-secondary-commit-b-${randomUUID()}`,
  });
  assert.equal(tenantBCommit.status, 'partially_committed');
  assert.equal(tenantBCommit.committedCredits, '5');
  assert.equal(tenantBCommit.remainingCredits, '5');

  const committedKey = 'credit-ledger-partial-commit';
  const committed = await commitCredits(appDatabase, contextA, {
    reservationId: winningReservationId,
    amountCredits: 40n,
    idempotencyKey: committedKey,
    requestId: `credit-ledger-commit-${randomUUID()}`,
  });
  assert.equal(committed.status, 'partially_committed');
  assert.equal(committed.committedCredits, '40');
  assert.equal(committed.remainingCredits, '80');
  assert.ok(committed.entryId, 'A commit must expose its canonical event ID for provenance');

  const invalidCompensationTargets = [
    {
      targetEntryId: successfulReservations[0].result.entryId,
      idempotencyKey: 'credit-ledger-comp-target-reserve-event',
    },
    {
      targetEntryId: tenantACommit.entryId,
      idempotencyKey: 'credit-ledger-comp-target-other-reservation',
    },
    {
      targetEntryId: tenantBCommit.entryId,
      idempotencyKey: 'credit-ledger-comp-target-other-tenant',
    },
  ] as const;
  for (const invalidTarget of invalidCompensationTargets) {
    await assertCompensationRejectedWithoutMutation(
      appDatabase,
      ownerDatabase,
      contextA,
      {
        reservationId: winningReservationId,
        targetEntryId: invalidTarget.targetEntryId,
        amountCredits: 1n,
        reasonCode: 'test_fixture_compensation',
        idempotencyKey: invalidTarget.idempotencyKey,
        requestId: `${invalidTarget.idempotencyKey}-${randomUUID()}`,
      },
      'not_found',
      `Invalid compensation target ${invalidTarget.idempotencyKey} must stay hidden`,
    );
  }

  await assertCompensationRejectedWithoutMutation(
    appDatabase,
    ownerDatabase,
    contextA,
    {
      reservationId: winningReservationId,
      targetEntryId: committed.entryId,
      amountCredits: 41n,
      reasonCode: 'test_fixture_compensation',
      idempotencyKey: 'credit-ledger-comp-over-target',
      requestId: `credit-ledger-comp-over-target-${randomUUID()}`,
    },
    'amount_exceeded',
    'Compensation cannot exceed the uncompensated amount of its commit target',
  );

  const competingCompensations = [
    {
      reservationId: winningReservationId,
      targetEntryId: committed.entryId,
      amountCredits: 25n,
      reasonCode: 'test_fixture_compensation',
      idempotencyKey: 'credit-ledger-comp-partial-a',
      requestId: `credit-ledger-comp-partial-a-${randomUUID()}`,
    },
    {
      reservationId: winningReservationId,
      targetEntryId: committed.entryId,
      amountCredits: 25n,
      reasonCode: 'test_fixture_compensation',
      idempotencyKey: 'credit-ledger-comp-partial-b',
      requestId: `credit-ledger-comp-partial-b-${randomUUID()}`,
    },
  ] satisfies [Parameters<typeof compensateCredits>[2], Parameters<typeof compensateCredits>[2]];
  const concurrentCompensations = await Promise.allSettled(
    competingCompensations.map((input) => compensateCredits(appDatabase, contextA, input)),
  );
  const successfulCompensations: Array<{
    input: Parameters<typeof compensateCredits>[2];
    result: CreditReservationResult;
  }> = [];
  const failedCompensations: unknown[] = [];
  concurrentCompensations.forEach((result, index) => {
    const request = competingCompensations[index];
    assert.ok(request);
    if (result.status === 'fulfilled') {
      successfulCompensations.push({ input: request, result: result.value });
    } else {
      failedCompensations.push(result.reason);
    }
  });
  assert.equal(successfulCompensations.length, 1);
  assert.equal(failedCompensations.length, 1);
  assert.ok(
    isLedgerErrorCode(failedCompensations[0], 'amount_exceeded'),
    'Concurrent compensations must serialize against the remaining commit target',
  );
  const firstCompensation = successfulCompensations[0];
  assert.ok(firstCompensation);
  assert.notEqual(firstCompensation.result.entryId, committed.entryId);
  assert.equal(firstCompensation.result.status, 'partially_committed');
  assert.equal(firstCompensation.result.committedCredits, '40');
  assert.equal(firstCompensation.result.releasedCredits, '0');
  assert.equal(firstCompensation.result.remainingCredits, '80');

  await assertCompensationRejectedWithoutMutation(
    appDatabase,
    ownerDatabase,
    contextA,
    {
      ...firstCompensation.input,
      targetEntryId: tenantACommit.entryId,
      requestId: `credit-ledger-comp-target-conflict-${randomUUID()}`,
    },
    'idempotency_conflict',
    'Changing the target under a reused compensation key must conflict',
  );

  const secondCompensation = await compensateCredits(appDatabase, contextA, {
    reservationId: winningReservationId,
    targetEntryId: committed.entryId,
    amountCredits: 15n,
    reasonCode: 'test_fixture_compensation',
    idempotencyKey: 'credit-ledger-comp-partial-final',
    requestId: `credit-ledger-comp-partial-final-${randomUUID()}`,
  });
  assert.equal(secondCompensation.status, 'partially_committed');
  assert.equal(secondCompensation.committedCredits, '40');
  assert.equal(secondCompensation.releasedCredits, '0');
  assert.equal(secondCompensation.remainingCredits, '80');
  assert.notEqual(secondCompensation.entryId, firstCompensation.result.entryId);
  await assertReservationAccounting(
    ownerDatabase,
    scopeA.tenantId,
    winningReservationId,
    committed.entryId,
    {
      reservationStatus: 'partially_committed',
      heldCredits: '80',
      grossCommitted: '40',
      grossReleased: '0',
      grossCompensated: '40',
      compensationEvents: '2',
      linkedCompensations: '2',
      targetCommitExists: '1',
      compensationPostingGroups: '2',
      invalidCompensationPostings: '0',
      netConsumed: '0',
    },
  );

  // A real worker and public API cannot claim or cancel this test-only operation. Only this
  // isolated owner harness changes fixture state to exercise the SQL terminal-release trigger.
  assert.equal(
    await claimDurableJob(workerDatabase, winningJobId, 'credit-ledger-fixture-worker', 1),
    null,
    'Worker claim must remain limited to the deterministic integrity-check operation',
  );
  assert.equal(
    await finishDurableJob(workerDatabase, {
      jobId: winningJobId,
      attemptId: randomUUID(),
      leaseToken: randomUUID(),
      outcome: 'cancelled',
    }),
    false,
    'Worker finish_job must not finalize an unclaimed fixture Job',
  );
  const balancesBeforeRejectedCancel = await getCreditSummary(appDatabase, contextA);
  const rejectedAppCancellation = await cancelDurableJob(appDatabase, {
    ...contextA,
    jobId: winningJobId,
  });
  assert.equal(
    rejectedAppCancellation,
    null,
    'The restricted app cancellation path must reject a hidden fixture Job',
  );
  await assertFixtureJobStillQueued(ownerDatabase, scopeA, winningJobId, winningReservationId);
  const balancesAfterRejectedCancel = await getCreditSummary(appDatabase, contextA);
  assert.deepEqual(
    balancesAfterRejectedCancel.balances,
    balancesBeforeRejectedCancel.balances,
    'Rejected application cancellation must leave every wallet balance unchanged',
  );
  await assertReleaseRejectedWithoutMutation(
    appDatabase,
    ownerDatabase,
    contextA,
    {
      reservationId: winningReservationId,
      amountCredits: 1n,
      idempotencyKey: `credit-ledger-winning-queued-release:${winningReservationId}`,
      requestId: `credit-ledger-winning-queued-release-${randomUUID()}`,
    },
    'A queued Job release must leave its event, reservation, postings, and wallet unchanged',
  );
  await terminalizeFixtureJobAsOwner(ownerDatabase, winningJobId);
  await assertTerminalReleaseSnapshot(ownerDatabase, scopeA, winningReservationId);

  const reserveReplayAfterTerminal = await reserveA({
    jobId: winningJobId,
    amountCredits: 120n,
    idempotencyKey: winningRequestKey,
    requestId: `credit-ledger-terminal-replay-${randomUUID()}`,
  });
  assert.equal(reserveReplayAfterTerminal.reservationId, winningReservationId);
  assert.equal(
    reserveReplayAfterTerminal.replayed,
    true,
    'The original reservation key must replay safely after the Job becomes terminal',
  );
  assertSameReservationSnapshot(
    reserveReplayAfterTerminal,
    successfulReservations[0].result,
    'A terminal reserve replay must preserve the original result snapshot',
  );
  assert.equal(
    await countReservationEvents(ownerDatabase, scopeA.tenantId, winningReservationId, 'reserve'),
    1,
    'Terminal replay must not append a second reservation event',
  );

  const commitReplayAfterTerminal = await commitCredits(appDatabase, contextA, {
    reservationId: winningReservationId,
    amountCredits: 40n,
    idempotencyKey: committedKey,
    requestId: `credit-ledger-commit-terminal-replay-${randomUUID()}`,
  });
  assert.equal(commitReplayAfterTerminal.replayed, true);
  assertSameReservationSnapshot(
    commitReplayAfterTerminal,
    committed,
    'A terminal commit replay must preserve the original result snapshot',
  );

  const compensationReplayAfterTerminal = await compensateCredits(appDatabase, contextA, {
    ...firstCompensation.input,
    requestId: `credit-ledger-compensation-terminal-replay-${randomUUID()}`,
  });
  assert.equal(compensationReplayAfterTerminal.replayed, true);
  assertSameReservationSnapshot(
    compensationReplayAfterTerminal,
    firstCompensation.result,
    'A terminal compensation replay must preserve the original result snapshot',
  );

  await terminalizeFixtureJobAsOwner(ownerDatabase, winningJobId);
  assert.equal(
    await countReservationEvents(
      ownerDatabase,
      scopeA.tenantId,
      winningReservationId,
      'terminal_release',
    ),
    1,
    'A repeated terminal status update must not release the reservation twice',
  );

  const terminalSummary = await getCreditSummary(appDatabase, contextA);
  assert.equal(terminalSummary.balances.reservedCredits, '0');
  assert.equal(terminalSummary.balances.committedCredits, '10');
  await assertCommitReplayRecoveryAndDurableReconciliation(
    ownerDatabaseUrl,
    appDatabaseUrl,
    scopeA,
    scopeB,
    tenantBReservation.reservationId,
  );

  const terminalReleaseCountBeforeReplay = await countReservationEvents(
    ownerDatabase,
    scopeA.tenantId,
    winningReservationId,
    'terminal_release',
  );
  assert.equal(
    terminalReleaseCountBeforeReplay,
    1,
    'Terminal transition must post one residual release',
  );

  const ownerClient = await ownerDatabase.pool.connect();
  try {
    const releaseEvents = await ownerClient.query<{ count: string }>(
      `SELECT count(*)::text AS count
       FROM platform.credit_event
       WHERE tenant_id = $1 AND reservation_id = $2 AND operation = 'terminal_release'`,
      [scopeA.tenantId, winningReservationId],
    );
    assert.equal(
      releaseEvents.rows[0]?.count,
      '1',
      'A repeated terminal update must not release twice',
    );

    const ledgerBalance = await ownerClient.query<{
      available: string;
      reserved: string;
      consumed: string;
      unbalanced_groups: string;
    }>(
      `WITH account_balances AS (
         SELECT entry.account, sum(entry.delta_credits)::text AS balance
         FROM platform.credit_ledger_entry entry
         WHERE entry.tenant_id = $1
         GROUP BY entry.account
       ), event_groups AS (
         SELECT entry.event_id, sum(entry.delta_credits) AS net
         FROM platform.credit_ledger_entry entry
         WHERE entry.tenant_id = $1
         GROUP BY entry.event_id
       )
       SELECT coalesce((SELECT balance FROM account_balances WHERE account = 'available'), '0') AS available,
              coalesce((SELECT balance FROM account_balances WHERE account = 'reserved'), '0') AS reserved,
              coalesce((SELECT balance FROM account_balances WHERE account = 'consumed'), '0') AS consumed,
              (SELECT count(*)::text FROM event_groups WHERE net <> 0) AS unbalanced_groups`,
      [scopeA.tenantId],
    );
    assert.equal(ledgerBalance.rows[0]?.unbalanced_groups, '0', 'Every ledger event must balance');
    assert.equal(ledgerBalance.rows[0]?.available, '190');
    assert.equal(ledgerBalance.rows[0]?.reserved, '0');
    assert.equal(ledgerBalance.rows[0]?.consumed, '10');
  } finally {
    ownerClient.release();
  }

  const finalSummary = await getCreditSummary(appDatabase, contextA);
  assert.equal(finalSummary.balances.availableCredits, '190');
  assert.equal(finalSummary.balances.reservedCredits, '0');
  assert.equal(finalSummary.balances.committedCredits, '10');
  const tenantBSummary = await getCreditSummary(appDatabase, contextB);
  assert.equal(tenantBSummary.balances.availableCredits, '193');
  assert.equal(tenantBSummary.balances.reservedCredits, '0');
  assert.equal(tenantBSummary.balances.committedCredits, '7');

  await assertReservationAccounting(
    ownerDatabase,
    scopeA.tenantId,
    winningReservationId,
    committed.entryId,
    {
      reservationStatus: 'settled',
      heldCredits: '0',
      grossCommitted: '40',
      grossReleased: '80',
      grossCompensated: '40',
      compensationEvents: '2',
      linkedCompensations: '2',
      targetCommitExists: '1',
      compensationPostingGroups: '2',
      invalidCompensationPostings: '0',
      netConsumed: '0',
    },
  );
  await assertWalletAccounting(ownerDatabase, scopeA.tenantId, {
    grossCommitted: '50',
    grossCompensated: '40',
    netConsumed: '10',
  });
  await assertWalletAccounting(ownerDatabase, scopeB.tenantId, {
    grossCommitted: '7',
    grossCompensated: '0',
    netConsumed: '7',
  });
  await assertReservationAccounting(
    ownerDatabase,
    scopeB.tenantId,
    tenantBReservation.reservationId,
    tenantBCommit.entryId,
    {
      reservationStatus: 'settled',
      heldCredits: '0',
      grossCommitted: '7',
      grossReleased: '3',
      grossCompensated: '0',
      compensationEvents: '0',
      linkedCompensations: '0',
      targetCommitExists: '1',
      compensationPostingGroups: '0',
      invalidCompensationPostings: '0',
      netConsumed: '7',
    },
  );
}

async function assertDurableJobLeaseConstraintRemains(
  ownerDatabase: ReturnType<typeof createDatabase>,
  fixtureJobId: string,
): Promise<void> {
  const constraint = await ownerDatabase.pool.query<{
    definition: string;
    is_validated: boolean;
  }>(`
    SELECT pg_catalog.pg_get_constraintdef(constraint_row.oid) AS definition,
           constraint_row.convalidated AS is_validated
      FROM pg_catalog.pg_constraint constraint_row
     WHERE constraint_row.conrelid = 'platform.durable_job'::regclass
       AND constraint_row.conname = 'durable_job_active_lease_check'
       AND constraint_row.contype = 'c'
  `);
  assert.equal(constraint.rowCount, 1, 'WO-008 active lease check must survive migration 0009');
  assert.equal(constraint.rows[0]?.is_validated, true);
  assert.match(constraint.rows[0]?.definition ?? '', /lease_expires_at IS NOT NULL/i);

  const client = await ownerDatabase.pool.connect();
  try {
    await client.query('BEGIN');
    let invalidLeaseStateRejected = false;
    try {
      await client.query(
        `UPDATE platform.durable_job
         SET status = 'running', lease_expires_at = NULL
         WHERE id = $1 AND status = 'queued'`,
        [fixtureJobId],
      );
    } catch (error) {
      invalidLeaseStateRejected = hasErrorCode(error, '23514');
    }
    assert.ok(
      invalidLeaseStateRejected,
      'A running durable Job without an active lease must violate its preserved check',
    );
  } finally {
    await rollbackQuietly(client);
    client.release();
  }
}

async function assertAppCannotReadLedgerTables(
  appDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
): Promise<void> {
  for (const table of [
    'platform.credit_wallet',
    'platform.credit_lot',
    'platform.credit_event',
    'platform.credit_reservation',
    'platform.credit_ledger_entry',
    'platform.credit_integrity_incident',
  ]) {
    const client = await appDatabase.pool.connect();
    try {
      await client.query('BEGIN');
      await setScope(client, scope);
      let denied = false;
      try {
        await client.query(`SELECT 1 FROM ${table} LIMIT 1`);
      } catch (error) {
        denied = isPermissionDenied(error);
      }
      assert.ok(denied, `App role unexpectedly read base ledger relation ${table}`);
    } finally {
      await rollbackQuietly(client);
      client.release();
    }
  }
}

async function assertDurableCreditIncidentCapture(
  ownerDatabase: ReturnType<typeof createDatabase>,
  appDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
  foreignScope: FixtureScope,
  activeMember: FixtureIdentity,
): Promise<void> {
  const job = (await createFixtureJobs(ownerDatabase, scope, 1))[0];
  assert.ok(job, 'Durable incident proof requires an isolated fixture Job');
  const context = scopeContext(scope);
  const requestId = `credit-ledger-incident-${randomUUID()}`;
  const reservation = await createFixtureCreditReserver(
    appDatabase,
    context,
    scope.skuId,
  )({
    jobId: job.id,
    amountCredits: 1n,
    idempotencyKey: `credit-ledger-incident-${randomUUID()}`,
    requestId,
  });

  const postingResult = await ownerDatabase.pool.query<{
    id: string;
    event_id: string;
    tenant_id: string;
    wallet_id: string;
    lot_id: string;
    reservation_id: string;
    account: string;
    delta_credits: string;
  }>(
    `SELECT id, event_id, tenant_id, wallet_id, lot_id, reservation_id, account,
            delta_credits::text AS delta_credits
       FROM platform.credit_ledger_entry
      WHERE reservation_id = $1 AND account = 'available' AND delta_credits < 0
      ORDER BY id
      LIMIT 1`,
    [reservation.reservationId],
  );
  const posting = postingResult.rows[0];
  assert.ok(posting, 'Fixture reservation must have a durable reserved posting');

  await ownerDatabase.pool.query(
    'ALTER TABLE platform.credit_ledger_entry DISABLE TRIGGER credit_ledger_entry_immutable',
  );
  let postingRemoved = false;
  try {
    const removed = await ownerDatabase.pool.query(
      'DELETE FROM platform.credit_ledger_entry WHERE id = $1',
      [posting.id],
    );
    assert.equal(removed.rowCount, 1, 'The disposable DB must inject one isolated ledger defect');
    postingRemoved = true;

    const before = await readDurableIncidentFinancialSnapshot(
      ownerDatabase,
      scope.tenantId,
      reservation.reservationId,
      requestId,
    );
    let failure: unknown;
    try {
      await commitCredits(appDatabase, context, {
        reservationId: reservation.reservationId,
        amountCredits: 1n,
        idempotencyKey: `credit-ledger-incident-commit-${randomUUID()}`,
        requestId,
      });
    } catch (error) {
      failure = error;
    }
    assert.ok(failure instanceof CreditLedgerError);
    assert.equal(failure.code, 'operation_failed');

    const after = await readDurableIncidentFinancialSnapshot(
      ownerDatabase,
      scope.tenantId,
      reservation.reservationId,
      requestId,
    );
    assert.deepEqual(
      after.financial,
      before.financial,
      'Failed COMMIT must roll back all ledger effects',
    );
    assert.equal(after.incidentCount, before.incidentCount + 1);
    assert.deepEqual(after.incident, {
      operation: 'commit',
      correlation_id: requestId,
      incident_code: 'credit_lot_issuance_invariant_failed',
      job_id: null,
      attempt_id: null,
      reservation_id: reservation.reservationId,
    });
  } finally {
    try {
      if (postingRemoved) {
        await ownerDatabase.pool.query(
          `INSERT INTO platform.credit_ledger_entry
            (id, event_id, tenant_id, wallet_id, lot_id, reservation_id, account, delta_credits)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            posting.id,
            posting.event_id,
            posting.tenant_id,
            posting.wallet_id,
            posting.lot_id,
            posting.reservation_id,
            posting.account,
            posting.delta_credits,
          ],
        );
      }
    } finally {
      await ownerDatabase.pool.query(
        'ALTER TABLE platform.credit_ledger_entry ENABLE TRIGGER credit_ledger_entry_immutable',
      );
    }
  }

  await assertIncidentReporterRejectsMismatchedSubject(
    appDatabase,
    scope,
    foreignScope,
    activeMember,
    reservation.reservationId,
    requestId,
  );

  const duplicateIncident = await appDatabase.pool.query(
    `SELECT platform.record_credit_integrity_incident(
       $1::uuid, $2::uuid, $3::uuid, 'commit', $4::text,
       'credit_lot_issuance_invariant_failed', NULL, $5::uuid
     )`,
    [scope.tenantId, scope.subjectId, scope.projectId, requestId, reservation.reservationId],
  );
  assert.equal(duplicateIncident.rowCount, 1);
  const deduplicated = await ownerDatabase.pool.query<{ count: string }>(
    `SELECT count(*)::text AS count
       FROM platform.credit_integrity_incident
      WHERE tenant_id = $1 AND operation = 'commit' AND correlation_id = $2`,
    [scope.tenantId, requestId],
  );
  assert.equal(deduplicated.rows[0]?.count, '1', 'Incident replay must deduplicate durably');

  await assertIncidentCaptureFailureIsObservable(ownerDatabase, appDatabase, scope);

  await assertReleaseRejectedWithoutMutation(
    appDatabase,
    ownerDatabase,
    context,
    {
      reservationId: reservation.reservationId,
      amountCredits: 1n,
      idempotencyKey: `credit-ledger-incident-release-before-terminal:${reservation.reservationId}`,
      requestId: `credit-ledger-incident-release-before-terminal-${randomUUID()}`,
    },
    'An active incident fixture Job must not be cleaned up with a direct release',
  );
  await terminalizeFixtureJobAsOwner(ownerDatabase, job.id);
  assert.equal(
    await countReservationEvents(
      ownerDatabase,
      scope.tenantId,
      reservation.reservationId,
      'terminal_release',
    ),
    1,
    'The incident fixture cleanup must release through its terminal Job transition exactly once',
  );
}

async function assertIncidentReporterRejectsMismatchedSubject(
  appDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
  foreignScope: FixtureScope,
  activeMember: FixtureIdentity,
  reservationId: string,
  correlationId: string,
): Promise<void> {
  for (const [candidate, subjectId] of [
    [scope, activeMember.subjectId],
    [foreignScope, foreignScope.subjectId],
  ] as const) {
    let denied = false;
    try {
      await appDatabase.pool.query(
        `SELECT platform.record_credit_integrity_incident(
           $1::uuid, $2::uuid, $3::uuid, 'commit', $4::text,
           'credit_lot_issuance_invariant_failed', NULL, $5::uuid
         )`,
        [
          candidate.tenantId,
          subjectId,
          candidate.projectId,
          `${correlationId}-forged`,
          reservationId,
        ],
      );
    } catch (error) {
      denied = isPermissionDenied(error);
    }
    assert.ok(
      denied,
      'The incident reporter must reject active-member and foreign-tenant tuples that do not own the reservation',
    );
  }
}

async function assertIncidentCaptureFailureIsObservable(
  ownerDatabase: ReturnType<typeof createDatabase>,
  appDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
): Promise<void> {
  const job = (await createFixtureJobs(ownerDatabase, scope, 1))[0];
  assert.ok(job, 'Reporter-failure proof requires an isolated fixture Job');
  const requestId = `credit-ledger-incident-reporter-failure-${randomUUID()}`;
  const reservation = await createFixtureCreditReserver(
    appDatabase,
    scopeContext(scope),
    scope.skuId,
  )({
    jobId: job.id,
    amountCredits: 1n,
    idempotencyKey: `credit-ledger-incident-reporter-failure-${randomUUID()}`,
    requestId,
  });
  const postingResult = await ownerDatabase.pool.query<{
    id: string;
    event_id: string;
    tenant_id: string;
    wallet_id: string;
    lot_id: string;
    reservation_id: string;
    account: string;
    delta_credits: string;
  }>(
    `SELECT id, event_id, tenant_id, wallet_id, lot_id, reservation_id, account,
            delta_credits::text AS delta_credits
       FROM platform.credit_ledger_entry
      WHERE reservation_id = $1 AND account = 'available' AND delta_credits < 0
      ORDER BY id
      LIMIT 1`,
    [reservation.reservationId],
  );
  const posting = postingResult.rows[0];
  assert.ok(posting, 'Reporter-failure fixture must have a durable reserved posting');

  await ownerDatabase.pool.query(
    'ALTER TABLE platform.credit_ledger_entry DISABLE TRIGGER credit_ledger_entry_immutable',
  );
  let postingRemoved = false;
  let reporterPrivilegeRevoked = false;
  try {
    const removed = await ownerDatabase.pool.query(
      'DELETE FROM platform.credit_ledger_entry WHERE id = $1',
      [posting.id],
    );
    assert.equal(removed.rowCount, 1);
    postingRemoved = true;
    await ownerDatabase.pool.query(
      `REVOKE EXECUTE ON FUNCTION platform.record_credit_integrity_incident(
         uuid, uuid, uuid, text, text, text, uuid, uuid
       ) FROM spryxel_app`,
    );
    reporterPrivilegeRevoked = true;
    const before = await readDurableIncidentFinancialSnapshot(
      ownerDatabase,
      scope.tenantId,
      reservation.reservationId,
      requestId,
    );

    let failure: unknown;
    try {
      await commitCredits(appDatabase, scopeContext(scope), {
        reservationId: reservation.reservationId,
        amountCredits: 1n,
        idempotencyKey: `credit-ledger-reporter-failure-commit-${randomUUID()}`,
        requestId,
      });
    } catch (error) {
      failure = error;
    }
    assert.ok(failure instanceof CreditIntegrityIncidentCaptureError);
    assert.equal(failure.code, 'operation_failed');
    assert.equal(failure.message, 'operation_failed');
    const after = await readDurableIncidentFinancialSnapshot(
      ownerDatabase,
      scope.tenantId,
      reservation.reservationId,
      requestId,
    );
    assert.deepEqual(
      after.financial,
      before.financial,
      'A failed incident capture must leave the failed commit fully rolled back',
    );
    assert.equal(after.incidentCount, before.incidentCount);
  } finally {
    try {
      if (reporterPrivilegeRevoked) {
        await ownerDatabase.pool.query(
          `GRANT EXECUTE ON FUNCTION platform.record_credit_integrity_incident(
             uuid, uuid, uuid, text, text, text, uuid, uuid
           ) TO spryxel_app`,
        );
      }
    } finally {
      try {
        if (postingRemoved) {
          await ownerDatabase.pool.query(
            `INSERT INTO platform.credit_ledger_entry
              (id, event_id, tenant_id, wallet_id, lot_id, reservation_id, account, delta_credits)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              posting.id,
              posting.event_id,
              posting.tenant_id,
              posting.wallet_id,
              posting.lot_id,
              posting.reservation_id,
              posting.account,
              posting.delta_credits,
            ],
          );
        }
      } finally {
        await ownerDatabase.pool.query(
          'ALTER TABLE platform.credit_ledger_entry ENABLE TRIGGER credit_ledger_entry_immutable',
        );
      }
    }
  }

  const incidents = await ownerDatabase.pool.query<{ count: string }>(
    `SELECT count(*)::text AS count
       FROM platform.credit_integrity_incident
      WHERE tenant_id = $1 AND operation = 'commit' AND correlation_id = $2`,
    [scope.tenantId, requestId],
  );
  assert.equal(incidents.rows[0]?.count, '0');
}

async function readDurableIncidentFinancialSnapshot(
  ownerDatabase: ReturnType<typeof createDatabase>,
  tenantId: string,
  reservationId: string,
  requestId: string,
): Promise<{
  financial: {
    status: string;
    event_count: string;
    entry_count: string;
    reserved_credits: string;
    available_credits: string;
  };
  incidentCount: number;
  incident: {
    operation: string;
    correlation_id: string;
    incident_code: string;
    job_id: string | null;
    attempt_id: string | null;
    reservation_id: string | null;
  } | null;
}> {
  const financial = await ownerDatabase.pool.query<{
    status: string;
    event_count: string;
    entry_count: string;
    reserved_credits: string;
    available_credits: string;
  }>(
    `SELECT reservation.status,
            (SELECT count(*)::text FROM platform.credit_event event
              WHERE event.reservation_id = reservation.id AND event.tenant_id = reservation.tenant_id)
              AS event_count,
            (SELECT count(*)::text FROM platform.credit_ledger_entry entry
              WHERE entry.reservation_id = reservation.id AND entry.tenant_id = reservation.tenant_id)
              AS entry_count,
            COALESCE((SELECT sum(entry.delta_credits) FROM platform.credit_ledger_entry entry
                       WHERE entry.reservation_id = reservation.id AND entry.tenant_id = reservation.tenant_id
                         AND entry.account = 'reserved'), 0)::text AS reserved_credits,
            COALESCE((SELECT sum(entry.delta_credits) FROM platform.credit_ledger_entry entry
                       WHERE entry.wallet_id = reservation.wallet_id AND entry.tenant_id = reservation.tenant_id
                         AND entry.account = 'available'), 0)::text AS available_credits
       FROM platform.credit_reservation reservation
      WHERE reservation.id = $1 AND reservation.tenant_id = $2`,
    [reservationId, tenantId],
  );
  assert.equal(financial.rowCount, 1);
  const financialRow = financial.rows[0];
  assert.ok(financialRow);
  const incidents = await ownerDatabase.pool.query<{
    operation: string;
    correlation_id: string;
    incident_code: string;
    job_id: string | null;
    attempt_id: string | null;
    reservation_id: string | null;
  }>(
    `SELECT operation, correlation_id, incident_code, job_id, attempt_id, reservation_id
       FROM platform.credit_integrity_incident
      WHERE tenant_id = $1 AND operation = 'commit' AND correlation_id = $2`,
    [tenantId, requestId],
  );
  return {
    financial: financialRow,
    incidentCount: incidents.rowCount ?? 0,
    incident: incidents.rows[0] ?? null,
  };
}

async function assertRevokedMembershipHidden(
  ownerDatabase: ReturnType<typeof createDatabase>,
  appDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
): Promise<void> {
  const ownerClient = await ownerDatabase.pool.connect();
  try {
    await ownerClient.query('BEGIN');
    const revoked = await ownerClient.query(
      `UPDATE platform.tenant_membership SET status = 'revoked'
       WHERE tenant_id = $1 AND subject_id = $2 AND status = 'active'`,
      [scope.tenantId, scope.subjectId],
    );
    assert.equal(revoked.rowCount, 1, 'Fixture identity must be an active tenant member');
    await ownerClient.query('COMMIT');

    const appClient = await appDatabase.pool.connect();
    try {
      await appClient.query('BEGIN');
      await setScope(appClient, scope);
      const hiddenSummary = await appClient.query<{ count: string }>(
        'SELECT count(*)::text AS count FROM platform.credit_wallet_summary',
      );
      assert.equal(
        hiddenSummary.rows[0]?.count,
        '0',
        'Revoked memberships cannot read wallet summary',
      );
      await appClient.query('COMMIT');
    } catch (error) {
      await rollbackQuietly(appClient);
      throw error;
    } finally {
      appClient.release();
    }
  } finally {
    try {
      await rollbackQuietly(ownerClient);
      await ownerClient.query(
        `UPDATE platform.tenant_membership SET status = 'active'
         WHERE tenant_id = $1 AND subject_id = $2 AND status = 'revoked'`,
        [scope.tenantId, scope.subjectId],
      );
    } finally {
      ownerClient.release();
    }
  }
}

async function countReservationEvents(
  ownerDatabase: ReturnType<typeof createDatabase>,
  tenantId: string,
  reservationId: string,
  operation: string,
): Promise<number> {
  const result = await ownerDatabase.pool.query<{ count: string }>(
    `SELECT count(*)::text AS count
     FROM platform.credit_event
     WHERE tenant_id = $1 AND reservation_id = $2 AND operation = $3`,
    [tenantId, reservationId, operation],
  );
  return Number(result.rows[0]?.count ?? '0');
}

async function assertCommitRejectedWithoutMutation(
  appDatabase: ReturnType<typeof createDatabase>,
  ownerDatabase: ReturnType<typeof createDatabase>,
  context: CreditLedgerContext,
  input: Parameters<typeof commitCredits>[2],
  expectedErrorCode: string,
  message: string,
): Promise<void> {
  const beforeSummary = await getCreditSummary(appDatabase, context);
  const beforeWallet = await readCreditLedgerMutationSnapshot(
    ownerDatabase,
    context.tenantId,
    input.reservationId,
  );

  await assert.rejects(
    () => commitCredits(appDatabase, context, input),
    (error: unknown) => isLedgerErrorCode(error, expectedErrorCode),
    message,
  );

  const afterSummary = await getCreditSummary(appDatabase, context);
  const afterWallet = await readCreditLedgerMutationSnapshot(
    ownerDatabase,
    context.tenantId,
    input.reservationId,
  );
  assert.deepEqual(
    {
      balances: afterSummary.balances,
      counters: afterSummary.counters,
    },
    {
      balances: beforeSummary.balances,
      counters: beforeSummary.counters,
    },
    `${message}: the public wallet projection must remain unchanged`,
  );
  assert.deepEqual(
    afterWallet,
    beforeWallet,
    `${message}: no reservation, event, posting, or wallet state may change`,
  );
}

async function assertReleaseRejectedWithoutMutation(
  appDatabase: ReturnType<typeof createDatabase>,
  ownerDatabase: ReturnType<typeof createDatabase>,
  context: CreditLedgerContext,
  input: Parameters<typeof releaseCredits>[2],
  message: string,
): Promise<void> {
  const beforeSummary = await getCreditSummary(appDatabase, context);
  const beforeWallet = await readCreditLedgerMutationSnapshot(
    ownerDatabase,
    context.tenantId,
    input.reservationId,
  );

  await assert.rejects(
    () => releaseCredits(appDatabase, context, input),
    (error: unknown) => isLedgerErrorCode(error, 'not_authorized'),
    message,
  );

  const afterSummary = await getCreditSummary(appDatabase, context);
  const afterWallet = await readCreditLedgerMutationSnapshot(
    ownerDatabase,
    context.tenantId,
    input.reservationId,
  );
  assert.deepEqual(
    {
      balances: afterSummary.balances,
      counters: afterSummary.counters,
    },
    {
      balances: beforeSummary.balances,
      counters: beforeSummary.counters,
    },
    `${message}: the wallet projection must remain unchanged`,
  );
  assert.deepEqual(
    afterWallet,
    beforeWallet,
    `${message}: no reservation, event, posting, or wallet state may change`,
  );
}

async function readCreditLedgerMutationSnapshot(
  ownerDatabase: ReturnType<typeof createDatabase>,
  tenantId: string,
  reservationId: string,
): Promise<{
  wallet_id: string;
  wallet_created_at: string;
  wallet_events: string;
  wallet_entries: string;
  available: string;
  reserved: string;
  consumed: string;
  issuance_source: string;
  reservation_status: string;
  reservation_amount: string;
  reservation_updated_at: string;
  reservation_events: string;
  reservation_entries: string;
}> {
  const result = await ownerDatabase.pool.query<{
    wallet_id: string;
    wallet_created_at: string;
    wallet_events: string;
    wallet_entries: string;
    available: string;
    reserved: string;
    consumed: string;
    issuance_source: string;
    reservation_status: string;
    reservation_amount: string;
    reservation_updated_at: string;
    reservation_events: string;
    reservation_entries: string;
  }>(
    `SELECT wallet.id::text AS wallet_id,
            wallet.created_at::text AS wallet_created_at,
            (SELECT count(*)::text
               FROM platform.credit_event event
              WHERE event.tenant_id = wallet.tenant_id AND event.wallet_id = wallet.id)
              AS wallet_events,
            (SELECT count(*)::text
               FROM platform.credit_ledger_entry entry
              WHERE entry.tenant_id = wallet.tenant_id AND entry.wallet_id = wallet.id)
              AS wallet_entries,
            COALESCE((SELECT sum(entry.delta_credits)
                        FROM platform.credit_ledger_entry entry
                       WHERE entry.tenant_id = wallet.tenant_id AND entry.wallet_id = wallet.id
                         AND entry.account = 'available'), 0)::text AS available,
            COALESCE((SELECT sum(entry.delta_credits)
                        FROM platform.credit_ledger_entry entry
                       WHERE entry.tenant_id = wallet.tenant_id AND entry.wallet_id = wallet.id
                         AND entry.account = 'reserved'), 0)::text AS reserved,
            COALESCE((SELECT sum(entry.delta_credits)
                        FROM platform.credit_ledger_entry entry
                       WHERE entry.tenant_id = wallet.tenant_id AND entry.wallet_id = wallet.id
                         AND entry.account = 'consumed'), 0)::text AS consumed,
            COALESCE((SELECT sum(entry.delta_credits)
                        FROM platform.credit_ledger_entry entry
                       WHERE entry.tenant_id = wallet.tenant_id AND entry.wallet_id = wallet.id
                         AND entry.account = 'issuance_source'), 0)::text AS issuance_source,
            reservation.status AS reservation_status,
            reservation.reserved_credits::text AS reservation_amount,
            reservation.updated_at::text AS reservation_updated_at,
            (SELECT count(*)::text
               FROM platform.credit_event event
              WHERE event.tenant_id = reservation.tenant_id
                AND event.reservation_id = reservation.id) AS reservation_events,
            (SELECT count(*)::text
               FROM platform.credit_ledger_entry entry
              WHERE entry.tenant_id = reservation.tenant_id
                AND entry.reservation_id = reservation.id) AS reservation_entries
       FROM platform.credit_wallet wallet
       JOIN platform.credit_reservation reservation
         ON reservation.tenant_id = wallet.tenant_id AND reservation.wallet_id = wallet.id
      WHERE wallet.tenant_id = $1 AND reservation.id = $2`,
    [tenantId, reservationId],
  );
  assert.equal(result.rowCount, 1, 'The mutation snapshot must identify one wallet reservation');
  const row = result.rows[0];
  assert.ok(row);
  return row;
}

async function assertCommitReplayRecoveryAndDurableReconciliation(
  ownerDatabaseUrl: string,
  appDatabaseUrl: string,
  scopeA: FixtureScope,
  scopeB: FixtureScope,
  reservationId: string,
): Promise<void> {
  const contextB = scopeContext(scopeB);
  const lostResponseDatabase = createDatabase(appDatabaseUrl, { max: 1 });
  let reopenedAppDatabase: ReturnType<typeof createDatabase> | undefined;
  let reopenedOwnerDatabase: ReturnType<typeof createDatabase> | undefined;
  const lostCommitInput = {
    reservationId,
    amountCredits: 2n,
    idempotencyKey: 'credit-ledger-lost-response-commit',
    requestId: `credit-ledger-lost-response-commit-${randomUUID()}`,
  } satisfies Parameters<typeof commitCredits>[2];

  try {
    await lostResponseDatabase.validateRuntimeRole();
    await commitCredits(lostResponseDatabase, contextB, lostCommitInput);
    // The successful database response is deliberately discarded to model a lost response.
    await lostResponseDatabase.close();

    reopenedAppDatabase = createDatabase(appDatabaseUrl, { max: 1 });
    reopenedOwnerDatabase = createDatabase(ownerDatabaseUrl, { max: 1 });
    await reopenedAppDatabase.validateRuntimeRole();

    const committedEvent = await readDurableCreditEventSnapshot(
      reopenedOwnerDatabase,
      scopeB.tenantId,
      scopeB.subjectId,
      reservationId,
      'commit',
      lostCommitInput.idempotencyKey,
    );
    assert.equal(committedEvent.eventCount, '1');
    assert.ok(BigInt(committedEvent.postingCount) > 0n);
    assert.equal(committedEvent.result.status, 'partially_committed');
    assert.equal(committedEvent.result.reservedCredits, '10');
    assert.equal(committedEvent.result.committedCredits, '7');
    assert.equal(committedEvent.result.releasedCredits, '0');
    assert.equal(committedEvent.result.remainingCredits, '3');

    const replayedCommit = await commitCredits(reopenedAppDatabase, contextB, lostCommitInput);
    assert.equal(replayedCommit.replayed, true);
    assertSameReservationSnapshot(
      replayedCommit,
      committedEvent.result,
      'A post-reconnect commit replay must return the persisted event identity and snapshot',
    );
    assert.deepEqual(
      await readDurableCreditEventSnapshot(
        reopenedOwnerDatabase,
        scopeB.tenantId,
        scopeB.subjectId,
        reservationId,
        'commit',
        lostCommitInput.idempotencyKey,
      ),
      committedEvent,
      'Commit replay must not append another event or posting',
    );

    const reopenedReleaseInput = {
      reservationId,
      amountCredits: 3n,
      idempotencyKey: `credit-ledger-reopened-release-before-terminal:${reservationId}`,
      requestId: `credit-ledger-reopened-release-${randomUUID()}`,
    } satisfies Parameters<typeof releaseCredits>[2];
    await assertReleaseRejectedWithoutMutation(
      reopenedAppDatabase,
      reopenedOwnerDatabase,
      contextB,
      reopenedReleaseInput,
      'A reopened active Job release must leave its durable financial state unchanged',
    );

    const reservationJob = await reopenedOwnerDatabase.pool.query<{ job_id: string }>(
      'SELECT job_id::text FROM platform.credit_reservation WHERE id = $1 AND tenant_id = $2',
      [reservationId, scopeB.tenantId],
    );
    const reservationJobId = reservationJob.rows[0]?.job_id;
    assert.ok(reservationJobId, 'The recovered reservation must retain its fixture Job identity');
    await terminalizeFixtureJobAsOwner(reopenedOwnerDatabase, reservationJobId);
    await assertTerminalReleaseSnapshot(reopenedOwnerDatabase, scopeB, reservationId, {
      amountCredits: '3',
      reasonCode: 'terminal_job_cancelled',
      reservedCredits: '10',
      committedCredits: '7',
      releasedCredits: '3',
      remainingCredits: '0',
    });

    const releaseEvent = await readDurableCreditEventSnapshot(
      reopenedOwnerDatabase,
      scopeB.tenantId,
      scopeB.subjectId,
      reservationId,
      'terminal_release',
      `terminal_release:${reservationId}`,
    );
    assert.equal(releaseEvent.eventCount, '1');
    assert.equal(releaseEvent.result.status, 'settled');
    assert.equal(releaseEvent.result.reservedCredits, '10');
    assert.equal(releaseEvent.result.committedCredits, '7');
    assert.equal(releaseEvent.result.releasedCredits, '3');
    assert.equal(releaseEvent.result.remainingCredits, '0');

    const replayedCommitAfterTerminalRelease = await commitCredits(
      reopenedAppDatabase,
      contextB,
      lostCommitInput,
    );
    assert.equal(replayedCommitAfterTerminalRelease.replayed, true);
    assertSameReservationSnapshot(
      replayedCommitAfterTerminalRelease,
      committedEvent.result,
      'A commit replay after terminal release must retain its original result snapshot',
    );
    assert.deepEqual(
      await readDurableCreditEventSnapshot(
        reopenedOwnerDatabase,
        scopeB.tenantId,
        scopeB.subjectId,
        reservationId,
        'commit',
        lostCommitInput.idempotencyKey,
      ),
      committedEvent,
      'Replaying a commit after terminal release must not duplicate its durable postings',
    );

    await terminalizeFixtureJobAsOwner(reopenedOwnerDatabase, reservationJobId);
    assert.equal(
      await countReservationEvents(
        reopenedOwnerDatabase,
        scopeB.tenantId,
        reservationId,
        'terminal_release',
      ),
      1,
      'Repeating a terminal Job transition must not release the reservation twice',
    );
    assert.deepEqual(
      await readDurableCreditEventSnapshot(
        reopenedOwnerDatabase,
        scopeB.tenantId,
        scopeB.subjectId,
        reservationId,
        'terminal_release',
        `terminal_release:${reservationId}`,
      ),
      releaseEvent,
      'Terminal release replay must not add another event or ledger posting',
    );

    await assertDurableLedgerReconciliation(reopenedOwnerDatabase, reopenedAppDatabase, [
      scopeA,
      scopeB,
    ]);
  } finally {
    await Promise.all([
      lostResponseDatabase.close(),
      reopenedAppDatabase?.close(),
      reopenedOwnerDatabase?.close(),
    ]);
  }
}

async function readDurableCreditEventSnapshot(
  ownerDatabase: ReturnType<typeof createDatabase>,
  tenantId: string,
  subjectId: string,
  reservationId: string,
  operation: 'commit' | 'release',
  idempotencyKey: string,
): Promise<{
  result: CreditReservationResult;
  eventCount: string;
  postingCount: string;
}> {
  const result = await ownerDatabase.pool.query<{
    entry_id: string;
    status: string | null;
    reserved_credits: string | null;
    committed_credits: string | null;
    released_credits: string | null;
    remaining_credits: string | null;
    event_count: string;
    posting_count: string;
  }>(
    `SELECT event.id::text AS entry_id,
            event.result_status AS status,
            event.result_reserved_credits::text AS reserved_credits,
            event.result_committed_credits::text AS committed_credits,
            event.result_released_credits::text AS released_credits,
            event.result_remaining_credits::text AS remaining_credits,
            (SELECT count(*)::text
               FROM platform.credit_event matching_event
              WHERE matching_event.tenant_id = event.tenant_id
                AND matching_event.subject_id = event.subject_id
                AND matching_event.reservation_id = event.reservation_id
                AND matching_event.operation = event.operation
                AND matching_event.idempotency_key_sha256 = event.idempotency_key_sha256)
              AS event_count,
            (SELECT count(*)::text
               FROM platform.credit_ledger_entry entry
              WHERE entry.tenant_id = event.tenant_id AND entry.event_id = event.id)
              AS posting_count
       FROM platform.credit_event event
      WHERE event.tenant_id = $1 AND event.subject_id = $2
        AND event.reservation_id = $3 AND event.operation = $4
        AND event.idempotency_key_sha256 = $5`,
    [tenantId, subjectId, reservationId, operation, sha256(idempotencyKey)],
  );
  assert.equal(result.rowCount, 1, 'Exactly one durable event must match the idempotency key');
  const row = result.rows[0];
  assert.ok(row);
  assert.ok(
    row.status && ['reserved', 'partially_committed', 'settled'].includes(row.status),
    'Durable event must contain a valid result status',
  );
  assert.ok(
    row.reserved_credits !== null &&
      row.committed_credits !== null &&
      row.released_credits !== null &&
      row.remaining_credits !== null,
    'Durable event must contain the original result totals',
  );
  return {
    result: {
      reservationId,
      entryId: row.entry_id,
      status: row.status as CreditReservationResult['status'],
      reservedCredits: row.reserved_credits,
      committedCredits: row.committed_credits,
      releasedCredits: row.released_credits,
      remainingCredits: row.remaining_credits,
      replayed: false,
    },
    eventCount: row.event_count,
    postingCount: row.posting_count,
  };
}

async function assertDurableLedgerReconciliation(
  ownerDatabase: ReturnType<typeof createDatabase>,
  appDatabase: ReturnType<typeof createDatabase>,
  scopes: readonly FixtureScope[],
): Promise<void> {
  for (const scope of scopes) {
    const result = await ownerDatabase.pool.query<{
      wallet_count: string;
      available: string;
      reserved: string;
      consumed: string;
      ledger_entries: string;
      open_reservations: string;
      missing_postings: string;
      unbalanced_events: string;
      invalid_lots: string;
      invalid_reservations: string;
    }>(
      `WITH wallet AS (
         SELECT id, tenant_id
           FROM platform.credit_wallet
          WHERE tenant_id = $1
       ), account_totals AS (
         SELECT COALESCE(sum(entry.delta_credits) FILTER (
                  WHERE entry.account = 'available'
                    AND (lot.expires_at IS NULL OR lot.expires_at > clock_timestamp())
                ), 0)::text AS available,
                COALESCE(sum(entry.delta_credits) FILTER (
                  WHERE entry.account = 'reserved'
                ), 0)::text AS reserved,
                COALESCE(sum(entry.delta_credits) FILTER (
                  WHERE entry.account = 'consumed'
                ), 0)::text AS consumed,
                count(entry.id)::text AS ledger_entries
           FROM wallet
           LEFT JOIN platform.credit_ledger_entry entry
             ON entry.tenant_id = wallet.tenant_id AND entry.wallet_id = wallet.id
           LEFT JOIN platform.credit_lot lot
             ON lot.id = entry.lot_id AND lot.tenant_id = entry.tenant_id
            AND lot.wallet_id = entry.wallet_id
       ), event_groups AS (
         SELECT event.id,
                count(entry.id) AS posting_count,
                COALESCE(sum(entry.delta_credits), 0) AS net
           FROM platform.credit_event event
           LEFT JOIN platform.credit_ledger_entry entry
             ON entry.event_id = event.id AND entry.tenant_id = event.tenant_id
          WHERE event.tenant_id = $1
          GROUP BY event.id
       ), event_reconciliation AS (
         SELECT count(*) FILTER (WHERE posting_count = 0)::text AS missing_postings,
                count(*) FILTER (WHERE net <> 0)::text AS unbalanced_events
           FROM event_groups
       ), lot_groups AS (
         SELECT lot.id,
                lot.issued_credits,
                COALESCE(sum(entry.delta_credits) FILTER (
                  WHERE entry.account <> 'issuance_source'
                ), 0) AS lot_balance,
                COALESCE(sum(entry.delta_credits) FILTER (
                  WHERE entry.account = 'issuance_source'
                ), 0) AS source_balance
           FROM platform.credit_lot lot
           LEFT JOIN platform.credit_ledger_entry entry
             ON entry.lot_id = lot.id AND entry.tenant_id = lot.tenant_id
            AND entry.wallet_id = lot.wallet_id
          WHERE lot.tenant_id = $1
          GROUP BY lot.id, lot.issued_credits
       ), lot_reconciliation AS (
         SELECT count(*) FILTER (
                  WHERE lot_balance <> issued_credits OR source_balance <> -issued_credits
                )::text AS invalid_lots
           FROM lot_groups
       ), reservation_groups AS (
         SELECT reservation.id,
                reservation.status,
                COALESCE(sum(entry.delta_credits) FILTER (
                  WHERE entry.account = 'reserved'
                ), 0) AS held_credits
           FROM platform.credit_reservation reservation
           LEFT JOIN platform.credit_ledger_entry entry
             ON entry.reservation_id = reservation.id
            AND entry.tenant_id = reservation.tenant_id
          WHERE reservation.tenant_id = $1
          GROUP BY reservation.id, reservation.status
       ), reservation_reconciliation AS (
         SELECT count(*) FILTER (
                  WHERE (status = 'settled' AND held_credits <> 0)
                     OR (status IN ('reserved', 'partially_committed') AND held_credits <= 0)
                )::text AS invalid_reservations
           FROM reservation_groups
       )
       SELECT (SELECT count(*)::text FROM wallet) AS wallet_count,
              account_totals.available,
              account_totals.reserved,
              account_totals.consumed,
              account_totals.ledger_entries,
              (SELECT count(*) FILTER (
                 WHERE reservation.status IN ('reserved', 'partially_committed')
               )::text
                 FROM platform.credit_reservation reservation
                WHERE reservation.tenant_id = $1) AS open_reservations,
              event_reconciliation.missing_postings,
              event_reconciliation.unbalanced_events,
              lot_reconciliation.invalid_lots,
              reservation_reconciliation.invalid_reservations
         FROM account_totals
         CROSS JOIN event_reconciliation
         CROSS JOIN lot_reconciliation
         CROSS JOIN reservation_reconciliation`,
      [scope.tenantId],
    );
    assert.equal(result.rowCount, 1);
    const ledger = result.rows[0];
    assert.ok(ledger);
    const summary = await getCreditSummary(appDatabase, scopeContext(scope));
    assert.equal(ledger.wallet_count, '1', 'Each tenant must retain exactly one wallet');
    assert.equal(ledger.missing_postings, '0', 'Every durable event must have ledger postings');
    assert.equal(ledger.unbalanced_events, '0', 'Every durable event must balance');
    assert.equal(ledger.invalid_lots, '0', 'Durable lot balances must equal issued credits');
    assert.equal(
      ledger.invalid_reservations,
      '0',
      'Open/settled reservation status must agree with durable reserved postings',
    );
    assert.deepEqual(
      {
        available: summary.balances.availableCredits,
        reserved: summary.balances.reservedCredits,
        consumed: summary.balances.committedCredits,
        ledgerEntries: String(summary.counters.ledgerEntries),
        openReservations: String(summary.counters.openReservations),
      },
      {
        available: ledger.available,
        reserved: ledger.reserved,
        consumed: ledger.consumed,
        ledgerEntries: ledger.ledger_entries,
        openReservations: ledger.open_reservations,
      },
      'Fresh-pool wallet projection must reconcile with durable ledger postings',
    );
  }
}

async function assertCompensationRejectedWithoutMutation(
  appDatabase: ReturnType<typeof createDatabase>,
  ownerDatabase: ReturnType<typeof createDatabase>,
  context: CreditLedgerContext,
  input: Parameters<typeof compensateCredits>[2],
  expectedErrorCode: string,
  message: string,
): Promise<void> {
  const beforeSummary = await getCreditSummary(appDatabase, context);
  const beforeEvents = await countReservationEvents(
    ownerDatabase,
    context.tenantId,
    input.reservationId,
    'compensate',
  );
  await assert.rejects(
    () => compensateCredits(appDatabase, context, input),
    (error: unknown) => isLedgerErrorCode(error, expectedErrorCode),
    message,
  );
  const afterSummary = await getCreditSummary(appDatabase, context);
  const afterEvents = await countReservationEvents(
    ownerDatabase,
    context.tenantId,
    input.reservationId,
    'compensate',
  );
  assert.deepEqual(afterSummary.balances, beforeSummary.balances, message);
  assert.equal(afterEvents, beforeEvents, `${message}: rejected request must not append an event`);
}

async function assertReservationAccounting(
  ownerDatabase: ReturnType<typeof createDatabase>,
  tenantId: string,
  reservationId: string,
  targetEntryId: string,
  expected: {
    reservationStatus: 'reserved' | 'partially_committed' | 'settled';
    heldCredits: string;
    grossCommitted: string;
    grossReleased: string;
    grossCompensated: string;
    compensationEvents: string;
    linkedCompensations: string;
    targetCommitExists: string;
    compensationPostingGroups: string;
    invalidCompensationPostings: string;
    netConsumed: string;
  },
): Promise<void> {
  const accounting = await ownerDatabase.pool.query<{
    reservation_status: string;
    held_credits: string;
    gross_committed: string;
    gross_released: string;
    gross_compensated: string;
    compensation_events: string;
    linked_compensations: string;
    target_commit_exists: string;
    compensation_posting_groups: string;
    invalid_compensation_postings: string;
    net_consumed: string;
  }>(
    `WITH event_totals AS (
       SELECT COALESCE(sum(event.amount_credits) FILTER (WHERE event.operation = 'commit'), 0)::text
                AS gross_committed,
              COALESCE(sum(event.amount_credits) FILTER (
                WHERE event.operation IN ('release', 'terminal_release')
              ), 0)::text AS gross_released,
              COALESCE(sum(event.amount_credits) FILTER (WHERE event.operation = 'compensate'), 0)::text
                AS gross_compensated,
              count(*) FILTER (WHERE event.operation = 'compensate')::text AS compensation_events,
              count(*) FILTER (
                WHERE event.operation = 'compensate' AND event.compensates_entry_id = $3
              )::text AS linked_compensations
         FROM platform.credit_event event
        WHERE event.tenant_id = $1 AND event.reservation_id = $2
     ), account_totals AS (
       SELECT COALESCE(sum(entry.delta_credits) FILTER (WHERE entry.account = 'consumed'), 0)::text
                AS net_consumed,
              COALESCE(sum(entry.delta_credits) FILTER (WHERE entry.account = 'reserved'), 0)::text
                AS held_credits
         FROM platform.credit_ledger_entry entry
        WHERE entry.tenant_id = $1 AND entry.reservation_id = $2
     ), reservation_state AS (
       SELECT reservation.status AS reservation_status
         FROM platform.credit_reservation reservation
        WHERE reservation.id = $2 AND reservation.tenant_id = $1
     ), target_commit AS (
       SELECT count(*)::text AS target_commit_exists
         FROM platform.credit_event event
        WHERE event.id = $3 AND event.tenant_id = $1 AND event.reservation_id = $2
          AND event.operation = 'commit'
     ), target_lots AS (
       SELECT entry.lot_id
         FROM platform.credit_ledger_entry entry
        WHERE entry.event_id = $3 AND entry.tenant_id = $1 AND entry.reservation_id = $2
          AND entry.account = 'consumed' AND entry.delta_credits > 0
        GROUP BY entry.lot_id
     ), compensation_postings AS (
       SELECT event.id AS compensation_id,
              event.amount_credits,
              entry.lot_id,
              COALESCE(sum(entry.delta_credits) FILTER (WHERE entry.account = 'available'), 0)
                AS available_delta,
              COALESCE(sum(entry.delta_credits) FILTER (WHERE entry.account = 'consumed'), 0)
                AS consumed_delta
         FROM platform.credit_event event
         JOIN platform.credit_ledger_entry entry ON entry.event_id = event.id
        WHERE event.tenant_id = $1 AND event.reservation_id = $2 AND event.operation = 'compensate'
        GROUP BY event.id, event.amount_credits, entry.lot_id
     ), posting_totals AS (
       SELECT count(*)::text AS compensation_posting_groups,
              count(*) FILTER (
                WHERE target_lots.lot_id IS NULL
                   OR compensation_postings.available_delta <> compensation_postings.amount_credits
                   OR compensation_postings.consumed_delta <> -compensation_postings.amount_credits
              )::text AS invalid_compensation_postings
         FROM compensation_postings
         LEFT JOIN target_lots ON target_lots.lot_id = compensation_postings.lot_id
     )
     SELECT event_totals.*, account_totals.net_consumed, account_totals.held_credits,
            reservation_state.reservation_status, target_commit.target_commit_exists,
            posting_totals.compensation_posting_groups, posting_totals.invalid_compensation_postings
       FROM event_totals
       CROSS JOIN account_totals
       CROSS JOIN reservation_state
       CROSS JOIN target_commit
       CROSS JOIN posting_totals`,
    [tenantId, reservationId, targetEntryId],
  );
  assert.deepEqual(accounting.rows[0], {
    reservation_status: expected.reservationStatus,
    held_credits: expected.heldCredits,
    gross_committed: expected.grossCommitted,
    gross_released: expected.grossReleased,
    gross_compensated: expected.grossCompensated,
    compensation_events: expected.compensationEvents,
    linked_compensations: expected.linkedCompensations,
    target_commit_exists: expected.targetCommitExists,
    compensation_posting_groups: expected.compensationPostingGroups,
    invalid_compensation_postings: expected.invalidCompensationPostings,
    net_consumed: expected.netConsumed,
  });
}

async function assertWalletAccounting(
  ownerDatabase: ReturnType<typeof createDatabase>,
  tenantId: string,
  expected: { grossCommitted: string; grossCompensated: string; netConsumed: string },
): Promise<void> {
  const accounting = await ownerDatabase.pool.query<{
    gross_committed: string;
    gross_compensated: string;
    net_consumed: string;
  }>(
    `SELECT COALESCE((
              SELECT sum(event.amount_credits)
                FROM platform.credit_event event
               WHERE event.tenant_id = $1 AND event.operation = 'commit'
            ), 0)::text AS gross_committed,
            COALESCE((
              SELECT sum(event.amount_credits)
                FROM platform.credit_event event
               WHERE event.tenant_id = $1 AND event.operation = 'compensate'
            ), 0)::text AS gross_compensated,
            COALESCE((
              SELECT sum(entry.delta_credits)
                FROM platform.credit_ledger_entry entry
               WHERE entry.tenant_id = $1 AND entry.account = 'consumed'
            ), 0)::text AS net_consumed`,
    [tenantId],
  );
  assert.deepEqual(accounting.rows[0], {
    gross_committed: expected.grossCommitted,
    gross_compensated: expected.grossCompensated,
    net_consumed: expected.netConsumed,
  });
}

async function assertTerminalReleaseSnapshot(
  ownerDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
  reservationId: string,
  expected: {
    amountCredits: string;
    reasonCode: string;
    reservedCredits: string;
    committedCredits: string;
    releasedCredits: string;
    remainingCredits: string;
  } = {
    amountCredits: '80',
    reasonCode: 'terminal_job_cancelled',
    reservedCredits: '120',
    committedCredits: '40',
    releasedCredits: '80',
    remainingCredits: '0',
  },
): Promise<void> {
  const result = await ownerDatabase.pool.query<{
    amount_credits: string;
    reason_code: string;
    result_status: string;
    result_reserved_credits: string;
    result_committed_credits: string;
    result_released_credits: string;
    result_remaining_credits: string;
  }>(
    `SELECT amount_credits::text,
            reason_code,
            result_status,
            result_reserved_credits::text,
            result_committed_credits::text,
            result_released_credits::text,
            result_remaining_credits::text
       FROM platform.credit_event
      WHERE tenant_id = $1 AND reservation_id = $2 AND operation = 'terminal_release'`,
    [scope.tenantId, reservationId],
  );
  assert.deepEqual(result.rows, [
    {
      amount_credits: expected.amountCredits,
      reason_code: expected.reasonCode,
      result_status: 'settled',
      result_reserved_credits: expected.reservedCredits,
      result_committed_credits: expected.committedCredits,
      result_released_credits: expected.releasedCredits,
      result_remaining_credits: expected.remainingCredits,
    },
  ]);
}

async function assertReservationLinkedToFixture(
  ownerDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
  jobId: string,
  reservationId: string,
): Promise<void> {
  const result = await ownerDatabase.pool.query<{
    job_id: string;
    contract_id: string;
    contract_version: number;
    operation_type: string;
    version_contract_id: string;
    version: number;
  }>(
    `SELECT reservation.job_id,
            reservation.contract_id,
            reservation.contract_version,
            job.operation_type,
            version.contract_id AS version_contract_id,
            version.version
       FROM platform.credit_reservation reservation
       JOIN platform.durable_job job
         ON job.id = reservation.job_id
        AND job.tenant_id = reservation.tenant_id
        AND job.project_id = reservation.project_id
       JOIN platform.asset_contract_version version
         ON version.contract_id = reservation.contract_id
        AND version.version = reservation.contract_version
        AND version.tenant_id = reservation.tenant_id
        AND version.project_id = reservation.project_id
      WHERE reservation.id = $1
        AND reservation.tenant_id = $2
        AND reservation.project_id = $3`,
    [reservationId, scope.tenantId, scope.projectId],
  );
  assert.deepEqual(result.rows[0], {
    job_id: jobId,
    contract_id: scope.contractId,
    contract_version: scope.contractVersion,
    operation_type: fixtureOperation,
    version_contract_id: scope.contractId,
    version: scope.contractVersion,
  });
}

async function assertReservationCostGuardMetadata(
  ownerDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
  reservationId: string,
): Promise<void> {
  const result = await ownerDatabase.pool.query<{
    reservation_sku_id: string;
    reservation_policy_id: string;
    reservation_policy_version: string;
    reservation_decision: string;
    reservation_reason_code: string;
    reservation_estimated_cost: string;
    reservation_max_cost: string;
    event_sku_id: string;
    event_policy_id: string;
    event_policy_version: string;
    event_decision: string;
    event_reason_code: string;
    event_estimated_cost: string;
    event_max_cost: string;
    result_status: string;
    result_reserved_credits: string;
    result_committed_credits: string;
    result_released_credits: string;
    result_remaining_credits: string;
  }>(
    `SELECT reservation.sku_id AS reservation_sku_id,
            reservation.policy_id AS reservation_policy_id,
            reservation.policy_version AS reservation_policy_version,
            reservation.decision AS reservation_decision,
            reservation.cost_guard_reason_code AS reservation_reason_code,
            reservation.estimated_internal_cost::text AS reservation_estimated_cost,
            reservation.max_internal_cost::text AS reservation_max_cost,
            event.sku_id AS event_sku_id,
            event.policy_id AS event_policy_id,
            event.policy_version AS event_policy_version,
            event.decision AS event_decision,
            event.cost_guard_reason_code AS event_reason_code,
            event.estimated_internal_cost::text AS event_estimated_cost,
            event.max_internal_cost::text AS event_max_cost,
            event.result_status,
            event.result_reserved_credits::text AS result_reserved_credits,
            event.result_committed_credits::text AS result_committed_credits,
            event.result_released_credits::text AS result_released_credits,
            event.result_remaining_credits::text AS result_remaining_credits
       FROM platform.credit_reservation reservation
       JOIN platform.credit_event event
         ON event.reservation_id = reservation.id
        AND event.tenant_id = reservation.tenant_id
        AND event.wallet_id = reservation.wallet_id
        AND event.operation = 'reserve'
      WHERE reservation.id = $1
        AND reservation.tenant_id = $2
        AND reservation.project_id = $3`,
    [reservationId, scope.tenantId, scope.projectId],
  );
  assert.deepEqual(result.rows[0], {
    reservation_sku_id: scope.skuId,
    reservation_policy_id: 'credit-ledger-isolated-fixture-policy',
    reservation_policy_version: '1',
    reservation_decision: 'allow_fixture',
    reservation_reason_code: 'fixture_policy_passed',
    reservation_estimated_cost: '10',
    reservation_max_cost: '15',
    event_sku_id: scope.skuId,
    event_policy_id: 'credit-ledger-isolated-fixture-policy',
    event_policy_version: '1',
    event_decision: 'allow_fixture',
    event_reason_code: 'fixture_policy_passed',
    event_estimated_cost: '10',
    event_max_cost: '15',
    result_status: 'reserved',
    result_reserved_credits: '120',
    result_committed_credits: '0',
    result_released_credits: '0',
    result_remaining_credits: '120',
  });
}

function assertSameReservationSnapshot(
  actual: CreditReservationResult,
  original: CreditReservationResult,
  message: string,
): void {
  assert.deepEqual(
    {
      reservationId: actual.reservationId,
      entryId: actual.entryId,
      status: actual.status,
      reservedCredits: actual.reservedCredits,
      committedCredits: actual.committedCredits,
      releasedCredits: actual.releasedCredits,
      remainingCredits: actual.remainingCredits,
    },
    {
      reservationId: original.reservationId,
      entryId: original.entryId,
      status: original.status,
      reservedCredits: original.reservedCredits,
      committedCredits: original.committedCredits,
      releasedCredits: original.releasedCredits,
      remainingCredits: original.remainingCredits,
    },
    message,
  );
}

async function assertFixtureJobHiddenOverHttp(
  ownerDatabase: ReturnType<typeof createDatabase>,
  appDatabase: ReturnType<typeof createDatabase>,
  appDatabaseUrl: string,
  scope: FixtureScope,
  jobId: string,
  reservationId: string,
): Promise<void> {
  const principalA: AuthenticatedPrincipal = {
    externalSubject: { provider: 'workos', subject: 'user_integration_a' },
    externalSession: { provider: 'workos', session: 'session_integration_a' },
    authTimeSeconds: Math.floor(Date.now() / 1000) - 30,
    verifiedAuthenticationMethods: ['pwd'],
    impersonated: false,
  };
  const apiServerDatabase = createDatabase(appDatabaseUrl, { max: 2 });
  let server: ReturnType<typeof buildApiServer> | undefined;
  const headers = {
    authorization: 'Bearer credit-ledger-integration-owner',
    'x-tenant-id': scope.tenantId,
  };

  try {
    server = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'), {
      database: apiServerDatabase,
      authenticateToken: async (token) => {
        if (token !== 'credit-ledger-integration-owner') {
          throw new Error('Unknown credit-ledger integration identity');
        }
        return principalA;
      },
    });
    await server.ready();
    const jobUrl = `/api/v1/projects/${scope.projectId}/jobs/${jobId}`;
    const getResponse = await server.inject({ method: 'GET', url: jobUrl, headers });
    assert.equal(
      getResponse.statusCode,
      404,
      'Fixture Jobs must remain hidden from the public API',
    );

    const cancelResponse = await server.inject({
      method: 'POST',
      url: `${jobUrl}/cancel`,
      headers,
    });
    assert.equal(
      cancelResponse.statusCode,
      404,
      'The public API must reject cancellation of a hidden fixture Job',
    );
  } finally {
    try {
      if (server) await server.close();
    } finally {
      await apiServerDatabase.close();
    }
  }

  const mainPoolSmoke = await appDatabase.pool.query<{ connected: number }>(
    'SELECT 1 AS connected',
  );
  assert.equal(
    mainPoolSmoke.rows[0]?.connected,
    1,
    'Closing the HTTP test server must leave the ledger app pool available',
  );

  const persistedFixture = await ownerDatabase.pool.query<{
    job_status: string;
    reservation_status: string;
    reserved_credits: string;
    terminal_release_count: string;
  }>(
    `SELECT job.status AS job_status,
            reservation.status AS reservation_status,
            reservation.reserved_credits::text AS reserved_credits,
            (SELECT count(*)::text FROM platform.credit_event event
              WHERE event.reservation_id = reservation.id
                AND event.operation = 'terminal_release') AS terminal_release_count
       FROM platform.durable_job job
       JOIN platform.credit_reservation reservation
         ON reservation.job_id = job.id AND reservation.tenant_id = job.tenant_id
      WHERE job.id = $1 AND job.tenant_id = $2 AND reservation.id = $3`,
    [jobId, scope.tenantId, reservationId],
  );
  assert.deepEqual(persistedFixture.rows[0], {
    job_status: 'queued',
    reservation_status: 'reserved',
    reserved_credits: '10',
    terminal_release_count: '0',
  });
}

async function assertFixtureJobStillQueued(
  ownerDatabase: ReturnType<typeof createDatabase>,
  scope: FixtureScope,
  jobId: string,
  reservationId: string,
): Promise<void> {
  const persisted = await ownerDatabase.pool.query<{
    job_status: string;
    reservation_status: string;
    reserved_credits: string;
    terminal_release_count: string;
  }>(
    `SELECT job.status AS job_status,
            reservation.status AS reservation_status,
            reservation.reserved_credits::text AS reserved_credits,
            (SELECT count(*)::text FROM platform.credit_event event
              WHERE event.reservation_id = reservation.id
                AND event.operation = 'terminal_release') AS terminal_release_count
       FROM platform.durable_job job
       JOIN platform.credit_reservation reservation
         ON reservation.job_id = job.id AND reservation.tenant_id = job.tenant_id
      WHERE job.id = $1 AND job.tenant_id = $2 AND reservation.id = $3`,
    [jobId, scope.tenantId, reservationId],
  );
  assert.equal(persisted.rows[0]?.job_status, 'queued');
  assert.equal(persisted.rows[0]?.reservation_status, 'partially_committed');
  assert.equal(persisted.rows[0]?.reserved_credits, '120');
  assert.equal(
    persisted.rows[0]?.terminal_release_count,
    '0',
    'Rejected application cancellation must not release fixture credits',
  );
}

async function terminalizeFixtureJobAsOwner(
  ownerDatabase: ReturnType<typeof createDatabase>,
  jobId: string,
): Promise<void> {
  const client = await ownerDatabase.pool.connect();
  try {
    await client.query('BEGIN');
    const currentJob = await client.query<{ status: string }>(
      `SELECT status
         FROM platform.durable_job
        WHERE id = $1 AND operation_type = $2
        FOR UPDATE`,
      [jobId, fixtureOperation],
    );
    const currentStatus = currentJob.rows[0]?.status;
    assert.ok(
      currentStatus === 'queued' ||
        currentStatus === 'running' ||
        currentStatus === 'cancel_requested' ||
        currentStatus === 'succeeded' ||
        currentStatus === 'failed' ||
        currentStatus === 'cancelled',
      'Owner harness must terminalize only a fixture Job or verify an already-terminal fixture',
    );
    let terminalStatus: 'failed' | 'cancelled' | 'succeeded';
    if (currentStatus === 'queued') {
      const terminalized = await client.query(
        `UPDATE platform.durable_job
            SET status = 'cancelled', lease_expires_at = NULL
          WHERE id = $1 AND operation_type = $2 AND status = 'queued'`,
        [jobId, fixtureOperation],
      );
      assert.equal(terminalized.rowCount, 1, 'Owner harness must terminalize the queued fixture');
      terminalStatus = 'cancelled';
    } else if (currentStatus === 'running') {
      const terminalized = await client.query(
        `UPDATE platform.durable_job
            SET status = 'failed', lease_expires_at = NULL, failure_code = 'execution_timeout'
          WHERE id = $1 AND operation_type = $2 AND status = 'running'`,
        [jobId, fixtureOperation],
      );
      assert.equal(terminalized.rowCount, 1, 'Owner harness must terminalize the running fixture');
      terminalStatus = 'failed';
    } else if (currentStatus === 'cancel_requested') {
      const terminalized = await client.query(
        `UPDATE platform.durable_job
            SET status = 'cancelled', lease_expires_at = NULL
          WHERE id = $1 AND operation_type = $2 AND status = 'cancel_requested'`,
        [jobId, fixtureOperation],
      );
      assert.equal(
        terminalized.rowCount,
        1,
        'Owner harness must terminalize the cancellation fixture',
      );
      terminalStatus = 'cancelled';
    } else {
      terminalStatus = currentStatus;
    }
    const repeatedTerminalUpdate = await client.query(
      `UPDATE platform.durable_job
          SET status = $3
        WHERE id = $1 AND operation_type = $2 AND status = $3`,
      [jobId, fixtureOperation, terminalStatus],
    );
    assert.equal(repeatedTerminalUpdate.rowCount, 1);
    await client.query('COMMIT');
  } catch (error) {
    await rollbackQuietly(client);
    throw error;
  } finally {
    client.release();
  }
}

async function transitionFixtureJobToRunningAsOwner(
  ownerDatabase: ReturnType<typeof createDatabase>,
  jobId: string,
): Promise<void> {
  const running = await ownerDatabase.pool.query(
    `UPDATE platform.durable_job
        SET status = 'running', attempt_count = attempt_count + 1,
            lease_expires_at = clock_timestamp() + interval '5 minutes'
      WHERE id = $1 AND operation_type = $2 AND status = 'queued'
        AND attempt_count < max_attempts`,
    [jobId, fixtureOperation],
  );
  assert.equal(running.rowCount, 1, 'Owner fixture harness must transition queued Job to running');
}

async function assertCrossTenantReservationCommandsDenied(
  appDatabase: ReturnType<typeof createDatabase>,
  foreignContext: CreditLedgerContext,
  reservationId: string,
): Promise<void> {
  const attempts = [
    {
      operation: 'commit',
      run: () =>
        commitCredits(appDatabase, foreignContext, {
          reservationId,
          amountCredits: 1n,
          idempotencyKey: `credit-ledger-foreign-commit-${randomUUID()}`,
          requestId: `credit-ledger-foreign-commit-${randomUUID()}`,
        }),
    },
    {
      operation: 'release',
      run: () =>
        releaseCredits(appDatabase, foreignContext, {
          reservationId,
          amountCredits: 1n,
          idempotencyKey: `credit-ledger-foreign-release-${randomUUID()}`,
          requestId: `credit-ledger-foreign-release-${randomUUID()}`,
        }),
    },
  ] as const;

  for (const { operation, run } of attempts) {
    let denied = false;
    try {
      await run();
    } catch (error) {
      denied = isLedgerErrorCode(error, 'not_found') || isLedgerErrorCode(error, 'not_authorized');
    }
    assert.ok(denied, `Tenant B must not ${operation} Tenant A reservation by guessed ID`);
  }
}

async function assertMemberCannotCancelFixtureJob(
  ownerDatabase: ReturnType<typeof createDatabase>,
  appDatabase: ReturnType<typeof createDatabase>,
  memberIdentity: FixtureIdentity,
  scope: FixtureScope,
  jobId: string | undefined,
): Promise<void> {
  assert.ok(jobId, 'Fixture job for MEMBER authorization check must exist');
  const result = await cancelDurableJob(appDatabase, {
    subjectId: memberIdentity.subjectId,
    tenantId: scope.tenantId,
    projectId: scope.projectId,
    jobId,
  });
  assert.equal(result, null, "A tenant MEMBER cannot cancel another subject's fixture Job");

  const persistedJob = await ownerDatabase.pool.query<{ status: string }>(
    'SELECT status FROM platform.durable_job WHERE id = $1 AND tenant_id = $2',
    [jobId, scope.tenantId],
  );
  assert.equal(persistedJob.rows[0]?.status, 'queued', 'Rejected cancellation must not mutate Job');
}

function assertProductionCostGuardDenies(): void {
  const nowEpochMs = Date.now();
  const limits = {
    global: { maxCredits: 10n, maxInternalCost: 10n },
    tenant: { maxCredits: 10n, maxInternalCost: 10n },
    project: { maxCredits: 10n, maxInternalCost: 10n },
    sku: { maxCredits: 10n, maxInternalCost: 10n },
    operation: { maxCredits: 10n, maxInternalCost: 10n },
  };
  const validProductionFixture: CostGuardInput = {
    mode: 'production',
    nowEpochMs,
    knownSkuIds: ['SKU-009'],
    knownOperations: ['hypothetical.costed.operation.v1'],
    skuId: 'SKU-009',
    operation: 'hypothetical.costed.operation.v1',
    policy: {
      id: 'integration-approved-policy-fixture',
      version: '1',
      status: 'approved',
      mode: 'production',
      validUntilEpochMs: nowEpochMs + 60_000,
      skuIds: ['SKU-009'],
      operations: ['hypothetical.costed.operation.v1'],
      limits,
    },
    bounds: {
      requestedCredits: 1n,
      maxCredits: 1n,
      estimatedInternalCost: 1n,
      maxInternalCost: 1n,
    },
    economics: {
      contributionMargin: 1n,
      availableCash: 1n,
      requiredCashReserve: 0n,
      remainingBudget: 1n,
    },
  };
  const productionDecision = evaluateCostGuard(validProductionFixture);
  assert.equal(productionDecision.decision, 'deny');
  if (productionDecision.decision === 'deny') {
    assert.equal(productionDecision.reason, 'production_activation_not_authorized');
  }

  const integrityDecision = evaluateCostGuard({
    ...validProductionFixture,
    knownOperations: ['asset_contract.integrity_check.v1'],
    operation: 'asset_contract.integrity_check.v1',
    policy: null,
    bounds: null,
    economics: null,
  });
  assert.equal(integrityDecision.decision, 'deny');
  if (integrityDecision.decision === 'deny') {
    assert.equal(integrityDecision.reason, 'non_costing_operation');
  }
}

function scopeContext(scope: FixtureScope): CreditLedgerContext {
  return {
    subjectId: scope.subjectId,
    tenantId: scope.tenantId,
    projectId: scope.projectId,
  };
}

async function setScope(
  client: PoolClient,
  scope: Pick<FixtureScope, 'subjectId' | 'tenantId' | 'projectId'>,
): Promise<void> {
  await client.query(
    `SELECT set_config('spryxel.subject_id', $1, true),
            set_config('spryxel.tenant_id', $2, true),
            set_config('spryxel.project_id', $3, true)`,
    [scope.subjectId, scope.tenantId, scope.projectId],
  );
}

async function expectPermissionDenied(
  database: ReturnType<typeof createDatabase>,
  query: string,
): Promise<void> {
  let denied = false;
  try {
    await database.pool.query(query);
  } catch (error) {
    denied = isPermissionDenied(error);
  }
  assert.ok(denied, `Restricted worker unexpectedly executed ${query}`);
}

function isLedgerErrorCode(error: unknown, expected: string): boolean {
  return error instanceof CreditLedgerError && error.code === expected;
}

function isPermissionDenied(error: unknown): boolean {
  return hasErrorCode(error, '42501');
}

function isImmutableViolation(error: unknown): boolean {
  return (
    hasErrorCode(error, '42501') &&
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string' &&
    error.message.includes('credit_ledger_immutable')
  );
}

function hasErrorCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

async function rollbackQuietly(client: PoolClient): Promise<void> {
  try {
    await client.query('ROLLBACK');
  } catch {
    // Preserve the assertion or database error that caused rollback.
  }
}
