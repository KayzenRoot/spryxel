import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';
import type { Database } from './index.js';

export type CreditAmount = bigint | string;

export type CreditSummaryContext = {
  subjectId: string;
  tenantId: string;
};

export type CreditLedgerContext = CreditSummaryContext & {
  projectId: string;
};

export type CreditCostGuardMetadata = Readonly<{
  skuId: string;
  policyId: string;
  policyVersion: string;
  decision: 'allow_fixture';
  reasonCode: 'fixture_policy_passed';
  estimatedInternalCost: CreditAmount;
  maxInternalCost: CreditAmount;
}>;

type CreditTransactionContext = CreditSummaryContext & { projectId?: string };

export type CreditSummary = {
  tenantId: string;
  asOf: string;
  balances: {
    availableCredits: string;
    reservedCredits: string;
    committedCredits: string;
  };
  counters: {
    openReservations: number;
    ledgerEntries: number;
  };
};

export type CreditReservationStatus = 'reserved' | 'partially_committed' | 'settled';

export type CreditReservationResult = {
  reservationId: string;
  entryId: string;
  status: CreditReservationStatus;
  reservedCredits: string;
  committedCredits: string;
  releasedCredits: string;
  remainingCredits: string;
  replayed: boolean;
};

export type CreditLedgerErrorCode =
  | 'invalid_request'
  | 'cost_guard_denied'
  | 'insufficient_credits'
  | 'idempotency_conflict'
  | 'amount_exceeded'
  | 'job_already_reserved'
  | 'not_found'
  | 'not_authorized'
  | 'operation_failed';

export class CreditLedgerError extends Error {
  constructor(readonly code: CreditLedgerErrorCode) {
    super(code);
    this.name = 'CreditLedgerError';
  }
}

type ReservationRow = {
  reservation_id: string;
  entry_id: string;
  status: string;
  reserved_credits: string | bigint;
  committed_credits: string | bigint;
  released_credits: string | bigint;
  remaining_credits: string | bigint;
  replayed: boolean;
};

type SummaryRow = {
  tenant_id: string;
  as_of: Date | string;
  available_credits: string | bigint;
  reserved_credits: string | bigint;
  committed_credits: string | bigint;
  open_reservations: string | bigint;
  ledger_entries: string | bigint;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const decimalPattern = /^(0|[1-9][0-9]*)$/;
const skuPattern = /^[A-Z0-9][A-Z0-9_-]{0,63}$/;
const policyIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const policyVersionPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;
const idempotencyKeyMinLength = 1;
const idempotencyKeyMaxLength = 200;
const postgresInt8Max = 9_223_372_036_854_775_807n;

function fail(code: CreditLedgerErrorCode): never {
  throw new CreditLedgerError(code);
}

function validateContext(context: CreditTransactionContext, requiresProject: boolean): void {
  const projectId = context && 'projectId' in context ? context.projectId : undefined;
  if (
    !context ||
    !uuidPattern.test(context.subjectId) ||
    !uuidPattern.test(context.tenantId) ||
    (requiresProject && (!projectId || !uuidPattern.test(projectId))) ||
    (projectId !== undefined && !uuidPattern.test(projectId))
  ) {
    fail('invalid_request');
  }
}

function normalizeAmount(amount: CreditAmount): string {
  if (typeof amount === 'bigint') {
    if (amount <= 0n || amount > postgresInt8Max) {
      fail('invalid_request');
    }
    return amount.toString(10);
  }
  if (typeof amount !== 'string' || !decimalPattern.test(amount)) {
    fail('invalid_request');
  }
  const parsed = BigInt(amount);
  if (parsed <= 0n || parsed > postgresInt8Max) {
    fail('invalid_request');
  }
  return parsed.toString(10);
}

function normalizeId(value: string): string {
  if (typeof value !== 'string' || !uuidPattern.test(value)) {
    fail('invalid_request');
  }
  return value.toLowerCase();
}

function validateRequestId(requestId: string): string {
  if (
    typeof requestId !== 'string' ||
    requestId.length < 1 ||
    requestId.length > 128 ||
    !/^[A-Za-z0-9._:-]+$/.test(requestId)
  ) {
    fail('invalid_request');
  }
  return requestId;
}

function idempotencyKeyHash(idempotencyKey: string): string {
  if (
    typeof idempotencyKey !== 'string' ||
    idempotencyKey.length < idempotencyKeyMinLength ||
    idempotencyKey.length > idempotencyKeyMaxLength
  ) {
    fail('invalid_request');
  }
  return createHash('sha256').update(idempotencyKey, 'utf8').digest('hex');
}

function normalizeCostGuardMetadata(metadata: CreditCostGuardMetadata): {
  skuId: string;
  policyId: string;
  policyVersion: string;
  decision: 'allow_fixture';
  reasonCode: 'fixture_policy_passed';
  estimatedInternalCost: string;
  maxInternalCost: string;
} {
  if (!metadata || typeof metadata !== 'object') {
    fail('cost_guard_denied');
  }
  if (
    typeof metadata.skuId !== 'string' ||
    !skuPattern.test(metadata.skuId) ||
    typeof metadata.policyId !== 'string' ||
    !policyIdPattern.test(metadata.policyId) ||
    typeof metadata.policyVersion !== 'string' ||
    !policyVersionPattern.test(metadata.policyVersion)
  ) {
    fail('invalid_request');
  }
  if (metadata.decision !== 'allow_fixture' || metadata.reasonCode !== 'fixture_policy_passed') {
    fail('cost_guard_denied');
  }
  const estimatedInternalCost = normalizeAmount(metadata.estimatedInternalCost);
  const maxInternalCost = normalizeAmount(metadata.maxInternalCost);
  if (BigInt(estimatedInternalCost) > BigInt(maxInternalCost)) {
    fail('cost_guard_denied');
  }
  return {
    skuId: metadata.skuId,
    policyId: metadata.policyId,
    policyVersion: metadata.policyVersion,
    decision: metadata.decision,
    reasonCode: metadata.reasonCode,
    estimatedInternalCost,
    maxInternalCost,
  };
}

function payloadHash(payload: string): string {
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

function safeDatabaseError(error: unknown): CreditLedgerError {
  if (error instanceof CreditLedgerError) {
    return error;
  }

  const detail = error as { code?: unknown; message?: unknown } | null;
  const message = typeof detail?.message === 'string' ? detail.message : '';
  switch (message) {
    case 'credit_invalid_request':
    case 'credit_payload_hash_invalid':
      return new CreditLedgerError('invalid_request');
    case 'credit_cost_guard_denied':
      return new CreditLedgerError('cost_guard_denied');
    case 'credit_insufficient_credits':
      return new CreditLedgerError('insufficient_credits');
    case 'credit_idempotency_conflict':
      return new CreditLedgerError('idempotency_conflict');
    case 'credit_reservation_amount_exceeded':
    case 'credit_compensation_exceeds_committed':
      return new CreditLedgerError('amount_exceeded');
    case 'credit_job_already_reserved':
      return new CreditLedgerError('job_already_reserved');
    case 'credit_job_not_found':
    case 'credit_reservation_not_found':
    case 'credit_compensation_target_invalid':
    case 'credit_wallet_not_found':
      return new CreditLedgerError('not_found');
    case 'credit_context_required':
    case 'credit_membership_required':
    case 'credit_operation_denied':
      return new CreditLedgerError('not_authorized');
    default: {
      if (detail?.code === '42501') {
        return new CreditLedgerError('not_authorized');
      }
      return new CreditLedgerError('operation_failed');
    }
  }
}

function amountString(value: string | bigint): string {
  const normalized = typeof value === 'bigint' ? value.toString(10) : value;
  if (!decimalPattern.test(normalized)) {
    fail('operation_failed');
  }
  return BigInt(normalized).toString(10);
}

function safeCounter(value: string | bigint): number {
  let parsed: bigint;
  try {
    parsed = typeof value === 'bigint' ? value : BigInt(value);
  } catch {
    return fail('operation_failed');
  }
  if (parsed < 0n || parsed > BigInt(Number.MAX_SAFE_INTEGER)) {
    fail('operation_failed');
  }
  return Number(parsed);
}

function parseReservationResult(row: ReservationRow | undefined): CreditReservationResult {
  if (
    !row ||
    !uuidPattern.test(row.reservation_id) ||
    !uuidPattern.test(row.entry_id) ||
    !['reserved', 'partially_committed', 'settled'].includes(row.status) ||
    typeof row.replayed !== 'boolean'
  ) {
    fail('operation_failed');
  }
  return {
    reservationId: row.reservation_id,
    entryId: row.entry_id,
    status: row.status as CreditReservationStatus,
    reservedCredits: amountString(row.reserved_credits),
    committedCredits: amountString(row.committed_credits),
    releasedCredits: amountString(row.released_credits),
    remainingCredits: amountString(row.remaining_credits),
    replayed: row.replayed,
  };
}

async function withCreditTransaction<T>(
  database: Database,
  context: CreditTransactionContext,
  readOnly: boolean,
  requiresProject: boolean,
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  validateContext(context, requiresProject);
  let client: PoolClient | undefined;
  let transactionStarted = false;
  try {
    await database.validateRuntimeRole();
    client = await database.pool.connect();
    await client.query(readOnly ? 'BEGIN READ ONLY' : 'BEGIN');
    transactionStarted = true;
    await client.query(
      `SELECT set_config('spryxel.subject_id', $1, true),
              set_config('spryxel.tenant_id', $2, true),
              set_config('spryxel.project_id', $3, true)`,
      [
        context.subjectId.toLowerCase(),
        context.tenantId.toLowerCase(),
        context.projectId?.toLowerCase() ?? '',
      ],
    );
    const result = await callback(client);
    await client.query('COMMIT');
    transactionStarted = false;
    return result;
  } catch (error) {
    if (client && transactionStarted) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Keep the safe operation error; rollback diagnostics may include database details.
      }
    }
    throw safeDatabaseError(error);
  } finally {
    client?.release();
  }
}

export async function getCreditSummary(
  database: Database,
  context: CreditSummaryContext,
): Promise<CreditSummary> {
  return withCreditTransaction(database, context, true, false, async (client) => {
    const result = await client.query<SummaryRow>(
      `SELECT tenant_id, as_of, available_credits, reserved_credits, committed_credits,
              open_reservations, ledger_entries
         FROM platform.credit_wallet_summary
        WHERE tenant_id = $1`,
      [context.tenantId.toLowerCase()],
    );
    const row = result.rows[0];
    if (!row || row.tenant_id !== context.tenantId.toLowerCase()) {
      fail('not_found');
    }
    const asOf =
      row.as_of instanceof Date ? row.as_of.toISOString() : new Date(row.as_of).toISOString();
    if (Number.isNaN(Date.parse(asOf))) {
      fail('operation_failed');
    }
    return {
      tenantId: row.tenant_id,
      asOf,
      balances: {
        availableCredits: amountString(row.available_credits),
        reservedCredits: amountString(row.reserved_credits),
        committedCredits: amountString(row.committed_credits),
      },
      counters: {
        openReservations: safeCounter(row.open_reservations),
        ledgerEntries: safeCounter(row.ledger_entries),
      },
    };
  });
}

export async function reserveCredits(
  database: Database,
  context: CreditLedgerContext,
  input: {
    jobId: string;
    amountCredits: CreditAmount;
    idempotencyKey: string;
    requestId: string;
    costGuard: CreditCostGuardMetadata;
  },
): Promise<CreditReservationResult> {
  const jobId = normalizeId(input.jobId);
  const amount = normalizeAmount(input.amountCredits);
  const costGuard = normalizeCostGuardMetadata(input.costGuard);
  const requestId = validateRequestId(input.requestId);
  const idempotencyHash = idempotencyKeyHash(input.idempotencyKey);
  const requestHash = payloadHash(
    [
      'reserve',
      jobId,
      amount,
      costGuard.skuId,
      costGuard.policyId,
      costGuard.policyVersion,
      costGuard.decision,
      costGuard.reasonCode,
      costGuard.estimatedInternalCost,
      costGuard.maxInternalCost,
    ].join('\n'),
  );
  return withCreditTransaction(database, context, false, true, async (client) => {
    const result = await client.query<ReservationRow>(
      `SELECT * FROM platform.reserve_credit_ledger(
        $1::uuid, $2::bigint, $3::text, $4::text, $5::text, $6::text,
        $7::text, $8::bigint, $9::bigint, $10::text, $11::text, $12::text
      )`,
      [
        jobId,
        amount,
        costGuard.skuId,
        costGuard.policyId,
        costGuard.policyVersion,
        costGuard.decision,
        costGuard.reasonCode,
        costGuard.estimatedInternalCost,
        costGuard.maxInternalCost,
        idempotencyHash,
        requestHash,
        requestId,
      ],
    );
    return parseReservationResult(result.rows[0]);
  });
}

type ReservationMutationInput = {
  reservationId: string;
  amountCredits: CreditAmount;
  idempotencyKey: string;
  requestId: string;
};

type CompensationMutationInput = ReservationMutationInput & {
  targetEntryId: string;
  reasonCode: string;
};

async function mutateReservation(
  database: Database,
  context: CreditLedgerContext,
  input: ReservationMutationInput | CompensationMutationInput,
  operation: 'commit' | 'release' | 'compensate',
  reasonCode?: string,
): Promise<CreditReservationResult> {
  const reservationId = normalizeId(input.reservationId);
  const amount = normalizeAmount(input.amountCredits);
  const requestId = validateRequestId(input.requestId);
  const idempotencyHash = idempotencyKeyHash(input.idempotencyKey);
  const targetEntryId =
    operation === 'compensate'
      ? normalizeId('targetEntryId' in input ? input.targetEntryId : '')
      : null;
  if (
    operation === 'compensate' &&
    (typeof reasonCode !== 'string' || !/^[a-z][a-z0-9_.:-]{0,63}$/.test(reasonCode))
  ) {
    fail('invalid_request');
  }
  const payload =
    operation === 'compensate'
      ? `compensate\n${targetEntryId}\n${amount}\n${reasonCode}`
      : `${operation}\n${reservationId}\n${amount}`;
  const requestHash = payloadHash(payload);
  return withCreditTransaction(database, context, false, true, async (client) => {
    const result =
      operation === 'compensate'
        ? await client.query<ReservationRow>(
            `SELECT * FROM platform.compensate_credit_ledger(
             $1::uuid, $2::uuid, $3::bigint, $4::text, $5::text, $6::text, $7::text
           )`,
            [
              reservationId,
              targetEntryId,
              amount,
              reasonCode,
              idempotencyHash,
              requestHash,
              requestId,
            ],
          )
        : await client.query<ReservationRow>(
            `SELECT * FROM platform.${operation}_credit_ledger(
             $1::uuid, $2::bigint, $3::text, $4::text, $5::text
           )`,
            [reservationId, amount, idempotencyHash, requestHash, requestId],
          );
    return parseReservationResult(result.rows[0]);
  });
}

export function commitCredits(
  database: Database,
  context: CreditLedgerContext,
  input: ReservationMutationInput,
): Promise<CreditReservationResult> {
  return mutateReservation(database, context, input, 'commit');
}

export function releaseCredits(
  database: Database,
  context: CreditLedgerContext,
  input: ReservationMutationInput,
): Promise<CreditReservationResult> {
  return mutateReservation(database, context, input, 'release');
}

export function compensateCredits(
  database: Database,
  context: CreditLedgerContext,
  input: CompensationMutationInput,
): Promise<CreditReservationResult> {
  return mutateReservation(database, context, input, 'compensate', input.reasonCode);
}
