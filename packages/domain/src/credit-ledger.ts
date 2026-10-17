import { createHash } from 'node:crypto';

export const postgresInt8Min = -9_223_372_036_854_775_808n;
export const postgresInt8Max = 9_223_372_036_854_775_807n;
export const creditLedgerFixtureOperation = 'test_fixture.credit_ledger.v1' as const;
export const nonCostingIntegrityOperation = 'asset_contract.integrity_check.v1' as const;

export type CreditUnits = bigint;
export type CostUnits = bigint;

export type CreditSummary = Readonly<{
  tenantId: string;
  asOf: string;
  balances: Readonly<{
    availableCredits: string;
    reservedCredits: string;
    committedCredits: string;
  }>;
  counters: Readonly<{
    openReservations: number;
    ledgerEntries: number;
  }>;
}>;

export function isPostgresInt8(value: unknown): value is bigint {
  return typeof value === 'bigint' && value >= postgresInt8Min && value <= postgresInt8Max;
}

export function isPositiveCreditAmount(value: unknown): value is CreditUnits {
  return isPostgresInt8(value) && value > 0n;
}

export type CostGuardScope = 'global' | 'tenant' | 'project' | 'sku' | 'operation';

export type CostGuardLimit = Readonly<{
  maxCredits: CreditUnits | null;
  maxInternalCost: CostUnits | null;
}>;

export type CostGuardLimits = Readonly<Record<CostGuardScope, CostGuardLimit | null>>;

export type CostGuardPolicy = Readonly<{
  id: string;
  version: string;
  status: 'approved' | 'unapproved';
  mode: 'production' | 'isolated_test_fixture';
  validUntilEpochMs: number | null;
  skuIds: readonly string[];
  operations: readonly string[];
  limits: CostGuardLimits | null;
}>;

export type CostGuardInput = Readonly<{
  mode: 'production' | 'isolated_test_fixture';
  nowEpochMs: number;
  knownSkuIds: readonly string[];
  knownOperations: readonly string[];
  skuId: string | null;
  operation: string | null;
  policy: CostGuardPolicy | null;
  bounds: Readonly<{
    requestedCredits: CreditUnits | null;
    maxCredits: CreditUnits | null;
    estimatedInternalCost: CostUnits | null;
    maxInternalCost: CostUnits | null;
  }> | null;
  economics: Readonly<{
    contributionMargin: CostUnits | null;
    availableCash: CostUnits | null;
    requiredCashReserve: CostUnits | null;
    remainingBudget: CostUnits | null;
  }> | null;
}>;

export type CostGuardDenyReason =
  | 'invalid_context'
  | 'unknown_sku'
  | 'unknown_operation'
  | 'non_costing_operation'
  | 'policy_missing'
  | 'policy_unapproved'
  | 'policy_mode_mismatch'
  | 'policy_stale'
  | 'policy_invalid'
  | 'sku_not_approved'
  | 'operation_not_approved'
  | 'limits_missing'
  | 'limit_invalid'
  | 'bounds_missing'
  | 'bounds_invalid'
  | 'credits_limit_exceeded'
  | 'internal_cost_limit_exceeded'
  | 'economics_missing'
  | 'economics_invalid'
  | 'cash_reserve_unfunded'
  | 'budget_exceeded'
  | 'non_positive_margin'
  | 'production_activation_not_authorized';

declare const fixtureAuthorizationBrand: unique symbol;

export type FixtureCostGuardAuthorization = Readonly<{
  decision: 'allow_fixture';
  mode: 'isolated_test_fixture';
  skuId: string;
  operation: string;
  credits: CreditUnits;
  estimatedInternalCost: CostUnits;
  maxInternalCost: CostUnits;
  policyId: string;
  policyVersion: string;
  evaluatedAtEpochMs: number;
  readonly [fixtureAuthorizationBrand]: true;
}>;

export type CostGuardDecision =
  | Readonly<{ decision: 'deny'; reason: CostGuardDenyReason }>
  | FixtureCostGuardAuthorization;

const issuedFixtureAuthorizations = new WeakSet<object>();

export function evaluateCostGuard(input: CostGuardInput): CostGuardDecision {
  if (
    !input ||
    typeof input !== 'object' ||
    (input.mode !== 'production' && input.mode !== 'isolated_test_fixture') ||
    !Number.isSafeInteger(input.nowEpochMs) ||
    !Array.isArray(input.knownSkuIds) ||
    !Array.isArray(input.knownOperations)
  ) {
    return deny('invalid_context');
  }
  if (!isNonEmptyString(input.skuId) || !input.knownSkuIds.includes(input.skuId)) {
    return deny('unknown_sku');
  }
  if (!isNonEmptyString(input.operation) || !input.knownOperations.includes(input.operation)) {
    return deny('unknown_operation');
  }
  if (input.operation === nonCostingIntegrityOperation) return deny('non_costing_operation');
  if (input.mode === 'isolated_test_fixture' && input.operation !== creditLedgerFixtureOperation) {
    return deny('unknown_operation');
  }
  if (!input.policy) return deny('policy_missing');
  const policy = input.policy;
  if (policy.status !== 'approved') return deny('policy_unapproved');
  if (policy.mode !== input.mode) return deny('policy_mode_mismatch');
  if (
    !isNonEmptyString(policy.id) ||
    !isNonEmptyString(policy.version) ||
    policy.validUntilEpochMs === null ||
    !Number.isSafeInteger(policy.validUntilEpochMs) ||
    policy.validUntilEpochMs <= input.nowEpochMs ||
    !Array.isArray(policy.skuIds) ||
    !Array.isArray(policy.operations)
  ) {
    return deny('policy_stale');
  }
  if (!policy.skuIds.includes(input.skuId)) return deny('sku_not_approved');
  if (!policy.operations.includes(input.operation)) return deny('operation_not_approved');
  if (!policy.limits) return deny('limits_missing');
  if (!input.bounds) return deny('bounds_missing');
  const bounds = input.bounds;
  if (
    !isPositiveCreditAmount(bounds.requestedCredits) ||
    !isPostgresInt8(bounds.maxCredits) ||
    bounds.maxCredits < 0n ||
    !isPositiveCreditAmount(bounds.estimatedInternalCost) ||
    !isPostgresInt8(bounds.maxInternalCost) ||
    bounds.maxInternalCost < 0n
  ) {
    return deny('bounds_invalid');
  }
  if (bounds.requestedCredits > bounds.maxCredits) return deny('credits_limit_exceeded');
  if (bounds.estimatedInternalCost > bounds.maxInternalCost) {
    return deny('internal_cost_limit_exceeded');
  }

  let effectiveMaxInternalCost = bounds.maxInternalCost;
  for (const scope of costGuardScopes) {
    const limit = policy.limits[scope];
    if (!limit) return deny('limits_missing');
    if (
      !isPostgresInt8(limit.maxCredits) ||
      limit.maxCredits < 0n ||
      !isPostgresInt8(limit.maxInternalCost) ||
      limit.maxInternalCost < 0n
    ) {
      return deny('limit_invalid');
    }
    if (bounds.requestedCredits > limit.maxCredits) return deny('credits_limit_exceeded');
    if (bounds.estimatedInternalCost > limit.maxInternalCost) {
      return deny('internal_cost_limit_exceeded');
    }
    if (limit.maxInternalCost < effectiveMaxInternalCost) {
      effectiveMaxInternalCost = limit.maxInternalCost;
    }
  }

  if (!input.economics) return deny('economics_missing');
  const economics = input.economics;
  if (
    !isPostgresInt8(economics.contributionMargin) ||
    !isPostgresInt8(economics.availableCash) ||
    !isPostgresInt8(economics.requiredCashReserve) ||
    !isPostgresInt8(economics.remainingBudget) ||
    economics.availableCash < 0n ||
    economics.requiredCashReserve < 0n ||
    economics.remainingBudget < 0n
  ) {
    return deny('economics_invalid');
  }
  if (economics.contributionMargin <= 0n) return deny('non_positive_margin');
  if (economics.availableCash < economics.requiredCashReserve) {
    return deny('cash_reserve_unfunded');
  }
  if (bounds.estimatedInternalCost > economics.remainingBudget) return deny('budget_exceeded');
  if (economics.remainingBudget < effectiveMaxInternalCost) {
    effectiveMaxInternalCost = economics.remainingBudget;
  }

  // This increment has no production pricing/COGS approval. Only explicitly isolated fixtures
  // may exercise a positive path; a production policy cannot activate spending here.
  if (input.mode !== 'isolated_test_fixture') {
    return deny('production_activation_not_authorized');
  }
  const authorization = Object.freeze({
    decision: 'allow_fixture' as const,
    mode: 'isolated_test_fixture' as const,
    skuId: input.skuId,
    operation: input.operation,
    credits: bounds.requestedCredits,
    estimatedInternalCost: bounds.estimatedInternalCost,
    maxInternalCost: effectiveMaxInternalCost,
    policyId: policy.id,
    policyVersion: policy.version,
    evaluatedAtEpochMs: input.nowEpochMs,
  }) as FixtureCostGuardAuthorization;
  issuedFixtureAuthorizations.add(authorization);
  return authorization;
}

export function isFixtureCostGuardAuthorization(
  value: unknown,
): value is FixtureCostGuardAuthorization {
  return typeof value === 'object' && value !== null && issuedFixtureAuthorizations.has(value);
}

const costGuardScopes: readonly CostGuardScope[] = [
  'global',
  'tenant',
  'project',
  'sku',
  'operation',
];

function deny(reason: CostGuardDenyReason): CostGuardDecision {
  return Object.freeze({ decision: 'deny', reason });
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isNullableNonEmptyString(value: unknown): value is string | null {
  return value === null || isNonEmptyString(value);
}

function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}

function isValidLedgerIdentity(
  value: unknown,
  tenantId: string,
  kind: CreditLedgerCommandKind,
): value is CreditLedgerIdentity {
  if (!value || typeof value !== 'object') return false;
  const identity = value as Partial<CreditLedgerIdentity>;
  return (
    identity.tenantId === tenantId &&
    isNonEmptyString(identity.principalId) &&
    identity.operation === kind &&
    isSha256(identity.idempotencyKeyHash) &&
    isSha256(identity.requestHash)
  );
}

function ledgerOperationKey(
  tenantId: string,
  principalId: string,
  operation: CreditLedgerCommandKind,
  idempotencyKeyHash: string,
): string {
  return JSON.stringify([tenantId, principalId, operation, idempotencyKeyHash]);
}

function compensationLotKey(entryId: string, lotId: string): string {
  return JSON.stringify([entryId, lotId]);
}

export type CreditLotOrigin =
  | 'TRIAL'
  | 'PROMOTIONAL'
  | 'REFERRAL'
  | 'SUBSCRIPTION'
  | 'COMPENSATION'
  | 'PAID_PACK';

export type CreditLot = Readonly<{
  id: string;
  origin: CreditLotOrigin;
  issuedCredits: CreditUnits;
  availableCredits: CreditUnits;
  issuedAtEpochMs: number;
  expiresAtEpochMs: number | null;
}>;

export type CreditLotAllocation = Readonly<{ lotId: string; credits: CreditUnits }>;

export type LotAllocationResult =
  | Readonly<{ status: 'allocated'; allocations: readonly CreditLotAllocation[] }>
  | Readonly<{
      status: 'denied';
      reason: 'invalid_amount' | 'invalid_lot' | 'insufficient_credits';
    }>;

export function allocateCreditLots(
  lots: readonly CreditLot[],
  requestedCredits: CreditUnits,
  nowEpochMs: number,
): LotAllocationResult {
  if (!isPositiveCreditAmount(requestedCredits) || !Number.isSafeInteger(nowEpochMs)) {
    return Object.freeze({ status: 'denied', reason: 'invalid_amount' });
  }
  const seen = new Set<string>();
  for (const lot of lots) {
    if (
      !isNonEmptyString(lot.id) ||
      seen.has(lot.id) ||
      !creditLotOrigins.includes(lot.origin) ||
      !isPostgresInt8(lot.issuedCredits) ||
      lot.issuedCredits <= 0n ||
      !isPostgresInt8(lot.availableCredits) ||
      lot.availableCredits < 0n ||
      lot.availableCredits > lot.issuedCredits ||
      !Number.isSafeInteger(lot.issuedAtEpochMs) ||
      (lot.expiresAtEpochMs !== null && !Number.isSafeInteger(lot.expiresAtEpochMs))
    ) {
      return Object.freeze({ status: 'denied', reason: 'invalid_lot' });
    }
    seen.add(lot.id);
  }

  const ordered = lots
    .filter((lot) => lot.availableCredits > 0n && isLotEligibleForPlannedConsumption(lot))
    .slice()
    .sort(compareLotsForConsumption);
  let remaining = requestedCredits;
  const allocations: CreditLotAllocation[] = [];
  for (const lot of ordered) {
    if (lot.expiresAtEpochMs !== null && lot.expiresAtEpochMs <= nowEpochMs) continue;
    const credits = lot.availableCredits < remaining ? lot.availableCredits : remaining;
    if (credits > 0n) allocations.push(Object.freeze({ lotId: lot.id, credits }));
    remaining -= credits;
    if (remaining === 0n) {
      return Object.freeze({ status: 'allocated', allocations: Object.freeze(allocations) });
    }
  }
  return Object.freeze({ status: 'denied', reason: 'insufficient_credits' });
}

const creditLotOrigins: readonly CreditLotOrigin[] = [
  'TRIAL',
  'PROMOTIONAL',
  'REFERRAL',
  'SUBSCRIPTION',
  'COMPENSATION',
  'PAID_PACK',
];

function isLotEligibleForPlannedConsumption(lot: CreditLot): boolean {
  switch (lot.origin) {
    case 'TRIAL':
    case 'PROMOTIONAL':
    case 'REFERRAL':
      // Billing Economics states priority only for these expiring origins. A non-expiring lot
      // has no approved allocation priority in this increment, so fail closed and skip it.
      return lot.expiresAtEpochMs !== null;
    case 'SUBSCRIPTION':
    case 'PAID_PACK':
      return true;
    case 'COMPENSATION':
      // Compensation restores the original lot; it is not a new spendable origin.
      return false;
  }
}

function compareLotsForConsumption(left: CreditLot, right: CreditLot): number {
  const priority = lotPriority(left) - lotPriority(right);
  if (priority !== 0) return priority;
  if (isExpiringGrant(left) && isExpiringGrant(right)) {
    const expiryOrder = (left.expiresAtEpochMs ?? 0) - (right.expiresAtEpochMs ?? 0);
    if (expiryOrder !== 0) return expiryOrder;
  }
  if (left.issuedAtEpochMs !== right.issuedAtEpochMs) {
    return left.issuedAtEpochMs - right.issuedAtEpochMs;
  }
  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

function isExpiringGrant(lot: CreditLot): boolean {
  return (
    (lot.origin === 'TRIAL' || lot.origin === 'PROMOTIONAL' || lot.origin === 'REFERRAL') &&
    lot.expiresAtEpochMs !== null
  );
}

function lotPriority(lot: CreditLot): number {
  switch (lot.origin) {
    case 'TRIAL':
      return 0;
    case 'PROMOTIONAL':
      return 1;
    case 'REFERRAL':
      return 2;
    case 'SUBSCRIPTION':
      return 3;
    case 'PAID_PACK':
      return 4;
    case 'COMPENSATION':
      return 5;
  }
}

export type CreditLedgerCommandKind =
  | 'fixture_grant'
  | 'reserve'
  | 'commit'
  | 'release'
  | 'compensate';

const creditLedgerCommandKinds: readonly CreditLedgerCommandKind[] = [
  'fixture_grant',
  'reserve',
  'commit',
  'release',
  'compensate',
];

export type CreditLedgerIdentity = Readonly<{
  tenantId: string;
  principalId: string;
  operation: CreditLedgerCommandKind;
  idempotencyKeyHash: string;
  requestHash: string;
}>;

export type CreditPostingAccount = Readonly<
  | { type: 'issuance'; tenantId: string }
  | { type: 'wallet_available'; tenantId: string; walletId: string; lotId: string }
  | {
      type: 'wallet_reserved';
      tenantId: string;
      walletId: string;
      lotId: string;
      reservationId: string;
    }
  | { type: 'credits_consumed'; tenantId: string; walletId: string; lotId: string }
>;

export type CreditPosting = Readonly<{
  account: CreditPostingAccount;
  side: 'debit' | 'credit';
  credits: CreditUnits;
}>;

export type CreditLedgerEntry = Readonly<{
  id: string;
  tenantId: string;
  walletId: string;
  kind: CreditLedgerCommandKind;
  identity: CreditLedgerIdentity;
  postings: readonly CreditPosting[];
  reservationId: string | null;
  compensatesEntryId: string | null;
  reasonCode: string | null;
  policyId: string | null;
  policyVersion: string | null;
}>;

export type CreditReservationAllocation = Readonly<{
  lotId: string;
  reservedCredits: CreditUnits;
  committedCredits: CreditUnits;
  releasedCredits: CreditUnits;
}>;

export type CreditReservation = Readonly<{
  id: string;
  tenantId: string;
  walletId: string;
  principalId: string;
  operation: string;
  jobId: string;
  contractId: string;
  skuId: string;
  policyId: string;
  policyVersion: string;
  requestedCredits: CreditUnits;
  committedCredits: CreditUnits;
  releasedCredits: CreditUnits;
  allocations: readonly CreditReservationAllocation[];
  status: 'reserved' | 'partially_committed' | 'settled';
}>;

export type CreditLedgerOperationRecord = Readonly<{
  tenantId: string;
  principalId: string;
  operation: CreditLedgerCommandKind;
  idempotencyKeyHash: string;
  requestHash: string;
  entryIds: readonly string[];
  reservationId: string | null;
}>;

export type CreditLedgerSnapshot = Readonly<{
  mode: 'isolated_test_fixture';
  tenantId: string;
  walletId: string;
  lots: readonly CreditLot[];
  reservations: readonly CreditReservation[];
  entries: readonly CreditLedgerEntry[];
  operations: readonly CreditLedgerOperationRecord[];
}>;

export function createCreditLedgerSnapshot(input: {
  tenantId: string;
  walletId: string;
}): CreditLedgerSnapshot {
  if (!isNonEmptyString(input.tenantId) || !isNonEmptyString(input.walletId)) {
    throw new TypeError('Credit ledger fixture scope is invalid');
  }
  return freezeSnapshot({
    mode: 'isolated_test_fixture',
    tenantId: input.tenantId,
    walletId: input.walletId,
    lots: [],
    reservations: [],
    entries: [],
    operations: [],
  });
}

type CreditCommandBase = Readonly<{
  tenantId: string;
  principalId: string;
  idempotencyKeyHash: string;
  entryId: string;
}>;

export type CreditLedgerCommand =
  | (CreditCommandBase &
      Readonly<{
        kind: 'fixture_grant';
        lotId: string;
        origin: CreditLotOrigin;
        credits: CreditUnits;
        issuedAtEpochMs: number;
        expiresAtEpochMs: number | null;
      }>)
  | (CreditCommandBase &
      Readonly<{
        kind: 'reserve';
        reservationId: string;
        operation: string;
        jobId: string;
        contractId: string;
        skuId: string;
        credits: CreditUnits;
        authorization: CostGuardDecision;
      }>)
  | (CreditCommandBase & Readonly<{ kind: 'commit'; reservationId: string; credits: CreditUnits }>)
  | (CreditCommandBase & Readonly<{ kind: 'release'; reservationId: string }>)
  | (CreditCommandBase &
      Readonly<{
        kind: 'compensate';
        targetEntryId: string;
        credits: CreditUnits;
        reasonCode: string;
      }>);

export type CreditLedgerTransition =
  | Readonly<{
      status: 'applied' | 'replayed';
      snapshot: CreditLedgerSnapshot;
      operation: CreditLedgerOperationRecord;
    }>
  | Readonly<{
      status: 'conflict' | 'denied';
      reason: CreditLedgerDenyReason;
      snapshot: CreditLedgerSnapshot;
    }>;

export type CreditLedgerDenyReason =
  | 'invalid_command'
  | 'invalid_snapshot'
  | 'idempotency_conflict'
  | 'identity_conflict'
  | 'invalid_amount'
  | 'unknown_lot'
  | 'insufficient_credits'
  | 'authorization_required'
  | 'reservation_not_found'
  | 'reservation_terminal'
  | 'commit_exceeds_reservation'
  | 'compensation_target_invalid'
  | 'compensation_exceeds_original'
  | 'invalid_reason_code'
  | 'integer_overflow';

export type CreditLedgerReconciliation =
  | Readonly<{ ok: true }>
  | Readonly<{
      ok: false;
      reason:
        | 'unbalanced_entry'
        | 'lot_balance_mismatch'
        | 'reservation_balance_mismatch'
        | 'invalid_snapshot';
    }>;

export function applyCreditLedgerCommand(
  snapshot: CreditLedgerSnapshot,
  command: CreditLedgerCommand,
): CreditLedgerTransition {
  if (!reconcileCreditLedgerSnapshot(snapshot).ok) {
    return denied(snapshot, 'invalid_snapshot');
  }
  const commandCheck = validateCommandBase(snapshot, command);
  if (commandCheck) return denied(snapshot, commandCheck);
  let requestHash: string;
  try {
    requestHash = hashCommand(command);
  } catch {
    return denied(snapshot, 'invalid_command');
  }
  const prior = snapshot.operations.find(
    (entry) =>
      entry.tenantId === command.tenantId &&
      entry.principalId === command.principalId &&
      entry.operation === command.kind &&
      entry.idempotencyKeyHash === command.idempotencyKeyHash,
  );
  if (prior) {
    if (prior.requestHash !== requestHash)
      return denied(snapshot, 'idempotency_conflict', 'conflict');
    return Object.freeze({ status: 'replayed', snapshot, operation: prior });
  }
  if (snapshot.entries.some((entry) => entry.id === command.entryId)) {
    return denied(snapshot, 'identity_conflict');
  }

  switch (command.kind) {
    case 'fixture_grant':
      return applyFixtureGrant(snapshot, command, requestHash);
    case 'reserve':
      return applyReserve(snapshot, command, requestHash);
    case 'commit':
      return applyCommit(snapshot, command, requestHash);
    case 'release':
      return applyRelease(snapshot, command, requestHash);
    case 'compensate':
      return applyCompensation(snapshot, command, requestHash);
  }
}

export function reconcileCreditLedgerSnapshot(
  snapshot: CreditLedgerSnapshot,
): CreditLedgerReconciliation {
  if (
    snapshot?.mode !== 'isolated_test_fixture' ||
    !isNonEmptyString(snapshot.tenantId) ||
    !isNonEmptyString(snapshot.walletId) ||
    !Array.isArray(snapshot.lots) ||
    !Array.isArray(snapshot.reservations) ||
    !Array.isArray(snapshot.entries) ||
    !Array.isArray(snapshot.operations)
  ) {
    return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
  }
  const lotIds = new Set<string>();
  for (const lot of snapshot.lots) {
    if (
      !lot ||
      typeof lot !== 'object' ||
      !isNonEmptyString(lot.id) ||
      lotIds.has(lot.id) ||
      !creditLotOrigins.includes(lot.origin) ||
      !isPostgresInt8(lot.issuedCredits) ||
      lot.issuedCredits <= 0n ||
      !isPostgresInt8(lot.availableCredits) ||
      lot.availableCredits < 0n ||
      lot.availableCredits > lot.issuedCredits ||
      !Number.isSafeInteger(lot.issuedAtEpochMs) ||
      (lot.expiresAtEpochMs !== null && !Number.isSafeInteger(lot.expiresAtEpochMs))
    ) {
      return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
    }
    lotIds.add(lot.id);
  }

  const entryIds = new Set<string>();
  const availableBalance = new Map<string, bigint>();
  const reservedBalance = new Map<string, bigint>();
  const reservedByLot = new Map<string, bigint>();
  const consumedBalance = new Map<string, bigint>();
  const issuanceBalance = new Map<string, bigint>();
  const reservedCreatedBalance = new Map<string, bigint>();
  const committedHistory = new Map<string, bigint>();
  const releasedHistory = new Map<string, bigint>();
  const compensatedByTargetLot = new Map<string, bigint>();
  const grantedByLot = new Map<string, bigint>();
  const entryById = new Map<string, CreditLedgerEntry>();
  for (const entry of snapshot.entries) {
    if (
      !entry ||
      typeof entry !== 'object' ||
      !isNonEmptyString(entry.id) ||
      entryIds.has(entry.id) ||
      entry.tenantId !== snapshot.tenantId ||
      entry.walletId !== snapshot.walletId ||
      !creditLedgerCommandKinds.includes(entry.kind) ||
      !isValidLedgerIdentity(entry.identity, snapshot.tenantId, entry.kind) ||
      !isNullableNonEmptyString(entry.reservationId) ||
      !isNullableNonEmptyString(entry.compensatesEntryId) ||
      !isNullableNonEmptyString(entry.reasonCode) ||
      !isNullableNonEmptyString(entry.policyId) ||
      !isNullableNonEmptyString(entry.policyVersion) ||
      !Array.isArray(entry.postings) ||
      !isBalancedCreditPosting(entry.postings) ||
      !isValidLedgerEntryShape(entry)
    ) {
      return Object.freeze({ ok: false, reason: 'unbalanced_entry' });
    }
    entryIds.add(entry.id);
    entryById.set(entry.id, entry);
    if (entry.kind === 'fixture_grant') {
      const grant = entry.postings.find(
        (posting: CreditPosting) =>
          posting.account.type === 'wallet_available' && posting.side === 'credit',
      );
      if (grant?.account.type !== 'wallet_available') {
        return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
      }
      addBalance(grantedByLot, grant.account.lotId, grant.credits);
    }
    for (const posting of entry.postings) {
      if (
        posting.account.tenantId !== snapshot.tenantId ||
        (posting.account.type !== 'issuance' && posting.account.walletId !== snapshot.walletId) ||
        (posting.account.type !== 'issuance' && !lotIds.has(posting.account.lotId))
      ) {
        return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
      }
      const signed = posting.side === 'credit' ? posting.credits : -posting.credits;
      const target = posting.account.type;
      if (target === 'wallet_available') {
        addBalance(availableBalance, posting.account.lotId, signed);
      } else if (target === 'wallet_reserved') {
        const key = reservationLotKey(posting.account.reservationId, posting.account.lotId);
        addBalance(reservedBalance, key, signed);
        addBalance(reservedByLot, posting.account.lotId, signed);
        if (entry.kind === 'reserve' && posting.side === 'credit') {
          addBalance(reservedCreatedBalance, key, posting.credits);
        } else if (entry.kind === 'commit' && posting.side === 'debit') {
          addBalance(committedHistory, key, posting.credits);
        } else if (entry.kind === 'release' && posting.side === 'debit') {
          addBalance(releasedHistory, key, posting.credits);
        }
      } else if (target === 'credits_consumed') {
        addBalance(consumedBalance, posting.account.lotId, signed);
        if (entry.kind === 'compensate' && posting.side === 'debit') {
          const targetEntryId = entry.compensatesEntryId;
          if (!isNonEmptyString(targetEntryId)) {
            return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
          }
          addBalance(
            compensatedByTargetLot,
            compensationLotKey(targetEntryId, posting.account.lotId),
            posting.credits,
          );
        }
      } else {
        addBalance(issuanceBalance, posting.account.tenantId, signed);
      }
    }
  }

  const operationsByKey = new Map<string, CreditLedgerOperationRecord>();
  const coveredEntryIds = new Set<string>();
  for (const operation of snapshot.operations) {
    if (
      !operation ||
      typeof operation !== 'object' ||
      operation.tenantId !== snapshot.tenantId ||
      !isNonEmptyString(operation.principalId) ||
      !creditLedgerCommandKinds.includes(operation.operation) ||
      !isSha256(operation.idempotencyKeyHash) ||
      !isSha256(operation.requestHash) ||
      !Array.isArray(operation.entryIds) ||
      operation.entryIds.length !== 1 ||
      !isNonEmptyString(operation.entryIds[0]) ||
      !isNullableNonEmptyString(operation.reservationId)
    ) {
      return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
    }
    const key = ledgerOperationKey(
      operation.tenantId,
      operation.principalId,
      operation.operation,
      operation.idempotencyKeyHash,
    );
    if (operationsByKey.has(key)) return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
    operationsByKey.set(key, operation);
    const entry = entryById.get(operation.entryIds[0]);
    if (
      !entry ||
      coveredEntryIds.has(entry.id) ||
      entry.kind !== operation.operation ||
      entry.identity.principalId !== operation.principalId ||
      entry.identity.idempotencyKeyHash !== operation.idempotencyKeyHash ||
      entry.identity.requestHash !== operation.requestHash ||
      entry.reservationId !== operation.reservationId
    ) {
      return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
    }
    coveredEntryIds.add(entry.id);
  }
  if (operationsByKey.size !== entryById.size || coveredEntryIds.size !== entryById.size) {
    return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
  }
  for (const entry of snapshot.entries) {
    if (entry.kind !== 'compensate') continue;
    const targetEntryId = entry.compensatesEntryId;
    if (!isNonEmptyString(targetEntryId)) {
      return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
    }
    const target = entryById.get(targetEntryId);
    if (target?.kind !== 'commit' || target.reservationId !== entry.reservationId) {
      return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
    }
  }
  for (const entry of snapshot.entries) {
    if (entry.kind !== 'commit') continue;
    const consumedByLot = new Map<string, bigint>();
    for (const posting of entry.postings) {
      if (posting.account.type === 'credits_consumed' && posting.side === 'credit') {
        addBalance(consumedByLot, posting.account.lotId, posting.credits);
      }
    }
    for (const [lotId, compensated] of consumedByLot) {
      if ((compensatedByTargetLot.get(compensationLotKey(entry.id, lotId)) ?? 0n) > compensated) {
        return Object.freeze({ ok: false, reason: 'lot_balance_mismatch' });
      }
    }
  }

  const reservations = new Set<string>();
  const reservationLotKeys = new Set<string>();
  for (const reservation of snapshot.reservations) {
    if (
      !reservation ||
      typeof reservation !== 'object' ||
      !isNonEmptyString(reservation.id) ||
      reservations.has(reservation.id) ||
      reservation.tenantId !== snapshot.tenantId ||
      reservation.walletId !== snapshot.walletId ||
      !isNonEmptyString(reservation.principalId) ||
      reservation.operation !== creditLedgerFixtureOperation ||
      !isNonEmptyString(reservation.jobId) ||
      !isNonEmptyString(reservation.contractId) ||
      !isNonEmptyString(reservation.skuId) ||
      !isNonEmptyString(reservation.policyId) ||
      !isNonEmptyString(reservation.policyVersion) ||
      !isPositiveCreditAmount(reservation.requestedCredits) ||
      !isPostgresInt8(reservation.committedCredits) ||
      reservation.committedCredits < 0n ||
      !isPostgresInt8(reservation.releasedCredits) ||
      reservation.releasedCredits < 0n ||
      reservation.committedCredits + reservation.releasedCredits > reservation.requestedCredits ||
      !Array.isArray(reservation.allocations)
    ) {
      return Object.freeze({ ok: false, reason: 'invalid_snapshot' });
    }
    reservations.add(reservation.id);
    const allocations = reservation.allocations as readonly CreditReservationAllocation[];
    const allocationTotal = allocations.reduce<bigint>((total, allocation) => {
      if (
        !allocation ||
        typeof allocation !== 'object' ||
        !lotIds.has(allocation.lotId) ||
        !isPositiveCreditAmount(allocation.reservedCredits) ||
        !isPostgresInt8(allocation.committedCredits) ||
        allocation.committedCredits < 0n ||
        !isPostgresInt8(allocation.releasedCredits) ||
        allocation.releasedCredits < 0n ||
        allocation.committedCredits + allocation.releasedCredits > allocation.reservedCredits
      ) {
        return -1n;
      }
      return total + allocation.reservedCredits;
    }, 0n);
    if (
      allocationTotal !== reservation.requestedCredits ||
      allocations.reduce<bigint>((total, allocation) => total + allocation.committedCredits, 0n) !==
        reservation.committedCredits ||
      allocations.reduce<bigint>((total, allocation) => total + allocation.releasedCredits, 0n) !==
        reservation.releasedCredits
    ) {
      return Object.freeze({ ok: false, reason: 'reservation_balance_mismatch' });
    }
    for (const allocation of allocations) {
      const key = reservationLotKey(reservation.id, allocation.lotId);
      reservationLotKeys.add(key);
      const expected =
        allocation.reservedCredits - allocation.committedCredits - allocation.releasedCredits;
      const actual = reservedBalance.get(key) ?? 0n;
      if (
        actual !== expected ||
        (reservedCreatedBalance.get(key) ?? 0n) !== allocation.reservedCredits ||
        (committedHistory.get(key) ?? 0n) !== allocation.committedCredits ||
        (releasedHistory.get(key) ?? 0n) !== allocation.releasedCredits
      ) {
        return Object.freeze({ ok: false, reason: 'reservation_balance_mismatch' });
      }
    }
    if (reservation.status !== reservationStatus(reservation)) {
      return Object.freeze({ ok: false, reason: 'reservation_balance_mismatch' });
    }
  }
  if (
    [
      ...reservedBalance.keys(),
      ...reservedCreatedBalance.keys(),
      ...committedHistory.keys(),
      ...releasedHistory.keys(),
    ].some((key) => !reservationLotKeys.has(key))
  ) {
    return Object.freeze({ ok: false, reason: 'reservation_balance_mismatch' });
  }

  for (const lot of snapshot.lots) {
    const available = availableBalance.get(lot.id) ?? 0n;
    const reserved = reservedByLot.get(lot.id) ?? 0n;
    const consumed = consumedBalance.get(lot.id) ?? 0n;
    if (
      available !== lot.availableCredits ||
      (grantedByLot.get(lot.id) ?? 0n) !== lot.issuedCredits ||
      available + reserved + consumed !== lot.issuedCredits
    ) {
      return Object.freeze({ ok: false, reason: 'lot_balance_mismatch' });
    }
  }
  if ([...reservedBalance.values()].some((amount) => amount < 0n)) {
    return Object.freeze({ ok: false, reason: 'reservation_balance_mismatch' });
  }
  if ([...consumedBalance.values()].some((amount) => amount < 0n)) {
    return Object.freeze({ ok: false, reason: 'lot_balance_mismatch' });
  }
  const totalIssued = snapshot.lots.reduce<bigint>((total, lot) => total + lot.issuedCredits, 0n);
  if ((issuanceBalance.get(snapshot.tenantId) ?? 0n) !== -totalIssued) {
    return Object.freeze({ ok: false, reason: 'lot_balance_mismatch' });
  }
  return Object.freeze({ ok: true });
}

export function isBalancedCreditPosting(postings: readonly CreditPosting[]): boolean {
  if (!Array.isArray(postings) || postings.length < 2) return false;
  let debit = 0n;
  let credit = 0n;
  for (const posting of postings) {
    if (
      !posting?.account ||
      (posting.side !== 'debit' && posting.side !== 'credit') ||
      !isPositiveCreditAmount(posting.credits) ||
      !isValidPostingAccount(posting.account)
    ) {
      return false;
    }
    if (posting.side === 'debit') debit += posting.credits;
    else credit += posting.credits;
    if (!isPostgresInt8(debit) || !isPostgresInt8(credit)) return false;
  }
  return debit === credit;
}

function isValidLedgerEntryShape(entry: CreditLedgerEntry): boolean {
  switch (entry.kind) {
    case 'fixture_grant': {
      if (
        entry.reservationId !== null ||
        entry.compensatesEntryId !== null ||
        entry.reasonCode !== null ||
        entry.policyId !== null ||
        entry.policyVersion !== null ||
        entry.postings.length !== 2
      ) {
        return false;
      }
      const issuance = entry.postings.find(
        (posting) => posting.account.type === 'issuance' && posting.side === 'debit',
      );
      const available = entry.postings.find(
        (posting) => posting.account.type === 'wallet_available' && posting.side === 'credit',
      );
      return Boolean(
        issuance &&
          available &&
          issuance.credits === available.credits &&
          issuance.account.tenantId === available.account.tenantId,
      );
    }
    case 'reserve':
      return (
        isNonEmptyString(entry.reservationId) &&
        entry.compensatesEntryId === null &&
        entry.reasonCode === null &&
        isNonEmptyString(entry.policyId) &&
        isNonEmptyString(entry.policyVersion) &&
        isCreditTransferEntry(entry, 'wallet_available', 'wallet_reserved')
      );
    case 'commit':
      return (
        isNonEmptyString(entry.reservationId) &&
        entry.compensatesEntryId === null &&
        entry.reasonCode === null &&
        entry.policyId === null &&
        entry.policyVersion === null &&
        isCreditTransferEntry(entry, 'wallet_reserved', 'credits_consumed')
      );
    case 'release':
      return (
        isNonEmptyString(entry.reservationId) &&
        entry.compensatesEntryId === null &&
        entry.reasonCode === null &&
        entry.policyId === null &&
        entry.policyVersion === null &&
        isCreditTransferEntry(entry, 'wallet_reserved', 'wallet_available')
      );
    case 'compensate':
      return (
        isNonEmptyString(entry.reservationId) &&
        isNonEmptyString(entry.compensatesEntryId) &&
        isNonEmptyString(entry.reasonCode) &&
        /^[a-z][a-z0-9_.:-]{0,63}$/.test(entry.reasonCode) &&
        entry.policyId === null &&
        entry.policyVersion === null &&
        isCreditTransferEntry(entry, 'credits_consumed', 'wallet_available')
      );
  }
}

function isCreditTransferEntry(
  entry: CreditLedgerEntry,
  debitType: 'wallet_available' | 'wallet_reserved' | 'credits_consumed',
  creditType: 'wallet_available' | 'wallet_reserved' | 'credits_consumed',
): boolean {
  if (entry.postings.length < 2 || entry.postings.length % 2 !== 0) return false;
  const debits = new Map<string, bigint>();
  const credits = new Map<string, bigint>();
  for (const posting of entry.postings) {
    if (
      posting.account.type === debitType &&
      posting.side === 'debit' &&
      (posting.account.type !== 'wallet_reserved' ||
        posting.account.reservationId === entry.reservationId)
    ) {
      addBalance(debits, posting.account.lotId, posting.credits);
    } else if (
      posting.account.type === creditType &&
      posting.side === 'credit' &&
      (posting.account.type !== 'wallet_reserved' ||
        posting.account.reservationId === entry.reservationId)
    ) {
      addBalance(credits, posting.account.lotId, posting.credits);
    } else {
      return false;
    }
  }
  if (debits.size !== credits.size) return false;
  return [...debits].every(([lotId, amount]) => credits.get(lotId) === amount);
}

function applyFixtureGrant(
  snapshot: CreditLedgerSnapshot,
  command: Extract<CreditLedgerCommand, { kind: 'fixture_grant' }>,
  requestHash: string,
): CreditLedgerTransition {
  if (
    !isPositiveCreditAmount(command.credits) ||
    !Number.isSafeInteger(command.issuedAtEpochMs) ||
    (command.expiresAtEpochMs !== null && !Number.isSafeInteger(command.expiresAtEpochMs)) ||
    !creditLotOrigins.includes(command.origin)
  ) {
    return denied(snapshot, 'invalid_amount');
  }
  if (!isNonEmptyString(command.lotId) || snapshot.lots.some((lot) => lot.id === command.lotId)) {
    return denied(snapshot, 'identity_conflict');
  }
  const lot: CreditLot = Object.freeze({
    id: command.lotId,
    origin: command.origin,
    issuedCredits: command.credits,
    availableCredits: command.credits,
    issuedAtEpochMs: command.issuedAtEpochMs,
    expiresAtEpochMs: command.expiresAtEpochMs,
  });
  const entry = createEntry(snapshot, command, requestHash, [
    posting({ type: 'issuance', tenantId: snapshot.tenantId }, 'debit', command.credits),
    posting(availableAccount(snapshot, lot.id), 'credit', command.credits),
  ]);
  return applied(snapshot, command, requestHash, {
    lots: [...snapshot.lots, lot],
    entries: [...snapshot.entries, entry],
  });
}

function applyReserve(
  snapshot: CreditLedgerSnapshot,
  command: Extract<CreditLedgerCommand, { kind: 'reserve' }>,
  requestHash: string,
): CreditLedgerTransition {
  if (
    !isPositiveCreditAmount(command.credits) ||
    !isNonEmptyString(command.reservationId) ||
    !isNonEmptyString(command.operation) ||
    command.operation !== creditLedgerFixtureOperation ||
    !isNonEmptyString(command.jobId) ||
    !isNonEmptyString(command.contractId) ||
    !isNonEmptyString(command.skuId)
  ) {
    return denied(snapshot, 'invalid_command');
  }
  if (
    !isFixtureCostGuardAuthorization(command.authorization) ||
    command.authorization.operation !== command.operation ||
    command.authorization.skuId !== command.skuId ||
    command.authorization.credits !== command.credits
  ) {
    return denied(snapshot, 'authorization_required');
  }
  if (
    snapshot.reservations.some((reservation) => reservation.id === command.reservationId) ||
    snapshot.entries.some((entry) => entry.id === command.entryId)
  ) {
    return denied(snapshot, 'identity_conflict');
  }
  const allocation = allocateCreditLots(
    snapshot.lots,
    command.credits,
    command.authorization.evaluatedAtEpochMs,
  );
  if (allocation.status === 'denied') {
    return denied(
      snapshot,
      allocation.reason === 'insufficient_credits' ? 'insufficient_credits' : 'invalid_amount',
    );
  }
  const allocations: CreditReservationAllocation[] = allocation.allocations.map(
    ({ lotId, credits }) =>
      Object.freeze({ lotId, reservedCredits: credits, committedCredits: 0n, releasedCredits: 0n }),
  );
  const reservation: CreditReservation = Object.freeze({
    id: command.reservationId,
    tenantId: snapshot.tenantId,
    walletId: snapshot.walletId,
    principalId: command.principalId,
    operation: command.operation,
    jobId: command.jobId,
    contractId: command.contractId,
    skuId: command.skuId,
    policyId: command.authorization.policyId,
    policyVersion: command.authorization.policyVersion,
    requestedCredits: command.credits,
    committedCredits: 0n,
    releasedCredits: 0n,
    allocations: Object.freeze(allocations),
    status: 'reserved',
  });
  const postingRows = allocation.allocations.flatMap(({ lotId, credits }) => [
    posting(availableAccount(snapshot, lotId), 'debit', credits),
    posting(reservedAccount(snapshot, command.reservationId, lotId), 'credit', credits),
  ]);
  const entry = createEntry(snapshot, command, requestHash, postingRows, {
    reservationId: command.reservationId,
    policyId: command.authorization.policyId,
    policyVersion: command.authorization.policyVersion,
  });
  const lots = snapshot.lots.map((lot) => {
    const reserved = allocation.allocations.find((row) => row.lotId === lot.id)?.credits ?? 0n;
    return reserved === 0n
      ? lot
      : Object.freeze({ ...lot, availableCredits: lot.availableCredits - reserved });
  });
  return applied(
    snapshot,
    command,
    requestHash,
    {
      lots,
      reservations: [...snapshot.reservations, reservation],
      entries: [...snapshot.entries, entry],
    },
    command.reservationId,
  );
}

function applyCommit(
  snapshot: CreditLedgerSnapshot,
  command: Extract<CreditLedgerCommand, { kind: 'commit' }>,
  requestHash: string,
): CreditLedgerTransition {
  if (!isPositiveCreditAmount(command.credits) || !isNonEmptyString(command.reservationId)) {
    return denied(snapshot, 'invalid_amount');
  }
  const reservation = snapshot.reservations.find((item) => item.id === command.reservationId);
  if (!reservation) return denied(snapshot, 'reservation_not_found');
  const remaining =
    reservation.requestedCredits - reservation.committedCredits - reservation.releasedCredits;
  if (remaining <= 0n) return denied(snapshot, 'reservation_terminal');
  if (command.credits > remaining) return denied(snapshot, 'commit_exceeds_reservation');
  if (snapshot.entries.some((entry) => entry.id === command.entryId))
    return denied(snapshot, 'identity_conflict');

  let unallocated = command.credits;
  const allocationDelta = new Map<string, bigint>();
  for (const allocation of reservation.allocations) {
    const available =
      allocation.reservedCredits - allocation.committedCredits - allocation.releasedCredits;
    const committed = available < unallocated ? available : unallocated;
    if (committed > 0n) allocationDelta.set(allocation.lotId, committed);
    unallocated -= committed;
    if (unallocated === 0n) break;
  }
  if (unallocated !== 0n) return denied(snapshot, 'invalid_snapshot');
  const postings = [...allocationDelta.entries()].flatMap(([lotId, credits]) => [
    posting(reservedAccount(snapshot, reservation.id, lotId), 'debit', credits),
    posting(consumedAccount(snapshot, lotId), 'credit', credits),
  ]);
  const entry = createEntry(snapshot, command, requestHash, postings, {
    reservationId: reservation.id,
  });
  const updatedReservation = updateReservation(reservation, (allocation) => ({
    ...allocation,
    committedCredits: allocation.committedCredits + (allocationDelta.get(allocation.lotId) ?? 0n),
  }));
  return applied(
    snapshot,
    command,
    requestHash,
    {
      reservations: replaceById(snapshot.reservations, updatedReservation),
      entries: [...snapshot.entries, entry],
    },
    reservation.id,
  );
}

function applyRelease(
  snapshot: CreditLedgerSnapshot,
  command: Extract<CreditLedgerCommand, { kind: 'release' }>,
  requestHash: string,
): CreditLedgerTransition {
  if (!isNonEmptyString(command.reservationId)) return denied(snapshot, 'invalid_command');
  const reservation = snapshot.reservations.find((item) => item.id === command.reservationId);
  if (!reservation) return denied(snapshot, 'reservation_not_found');
  const remaining =
    reservation.requestedCredits - reservation.committedCredits - reservation.releasedCredits;
  if (remaining <= 0n) return denied(snapshot, 'reservation_terminal');
  if (snapshot.entries.some((entry) => entry.id === command.entryId))
    return denied(snapshot, 'identity_conflict');
  const postings: CreditPosting[] = [];
  const releasedByLot = new Map<string, bigint>();
  for (const allocation of reservation.allocations) {
    const amount =
      allocation.reservedCredits - allocation.committedCredits - allocation.releasedCredits;
    if (amount > 0n) {
      releasedByLot.set(allocation.lotId, amount);
      postings.push(
        posting(reservedAccount(snapshot, reservation.id, allocation.lotId), 'debit', amount),
        posting(availableAccount(snapshot, allocation.lotId), 'credit', amount),
      );
    }
  }
  const entry = createEntry(snapshot, command, requestHash, postings, {
    reservationId: reservation.id,
  });
  const updatedReservation = updateReservation(reservation, (allocation) => ({
    ...allocation,
    releasedCredits: allocation.releasedCredits + (releasedByLot.get(allocation.lotId) ?? 0n),
  }));
  const lots = snapshot.lots.map((lot) => {
    const released = releasedByLot.get(lot.id) ?? 0n;
    return released === 0n
      ? lot
      : Object.freeze({ ...lot, availableCredits: lot.availableCredits + released });
  });
  return applied(
    snapshot,
    command,
    requestHash,
    {
      lots,
      reservations: replaceById(snapshot.reservations, updatedReservation),
      entries: [...snapshot.entries, entry],
    },
    reservation.id,
  );
}

function applyCompensation(
  snapshot: CreditLedgerSnapshot,
  command: Extract<CreditLedgerCommand, { kind: 'compensate' }>,
  requestHash: string,
): CreditLedgerTransition {
  if (!isPositiveCreditAmount(command.credits) || !isNonEmptyString(command.targetEntryId)) {
    return denied(snapshot, 'invalid_amount');
  }
  if (!/^[a-z][a-z0-9_.:-]{0,63}$/.test(command.reasonCode)) {
    return denied(snapshot, 'invalid_reason_code');
  }
  const target = snapshot.entries.find((entry) => entry.id === command.targetEntryId);
  if (target?.kind !== 'commit' || target.tenantId !== command.tenantId) {
    return denied(snapshot, 'compensation_target_invalid');
  }
  if (snapshot.entries.some((entry) => entry.id === command.entryId))
    return denied(snapshot, 'identity_conflict');

  const consumedByLot = new Map<string, bigint>();
  for (const postingRow of target.postings) {
    if (postingRow.account.type === 'credits_consumed' && postingRow.side === 'credit') {
      addBalance(consumedByLot, postingRow.account.lotId, postingRow.credits);
    }
  }
  const alreadyCompensated = new Map<string, bigint>();
  for (const entry of snapshot.entries) {
    if (entry.kind !== 'compensate' || entry.compensatesEntryId !== target.id) continue;
    for (const postingRow of entry.postings) {
      if (postingRow.account.type === 'wallet_available' && postingRow.side === 'credit') {
        addBalance(alreadyCompensated, postingRow.account.lotId, postingRow.credits);
      }
    }
  }
  const uncompensatedTotal = [...consumedByLot.entries()].reduce(
    (total, [lotId, amount]) => total + amount - (alreadyCompensated.get(lotId) ?? 0n),
    0n,
  );
  if (command.credits > uncompensatedTotal)
    return denied(snapshot, 'compensation_exceeds_original');

  let unallocated = command.credits;
  const compensationByLot = new Map<string, bigint>();
  for (const [lotId, amount] of consumedByLot) {
    const remaining = amount - (alreadyCompensated.get(lotId) ?? 0n);
    const compensation = remaining < unallocated ? remaining : unallocated;
    if (compensation > 0n) compensationByLot.set(lotId, compensation);
    unallocated -= compensation;
    if (unallocated === 0n) break;
  }
  if (unallocated !== 0n) return denied(snapshot, 'compensation_exceeds_original');
  for (const [lotId, amount] of compensationByLot) {
    const lot = snapshot.lots.find((item) => item.id === lotId);
    if (!lot || !isPostgresInt8(lot.availableCredits + amount))
      return denied(snapshot, 'integer_overflow');
  }
  const postings = [...compensationByLot.entries()].flatMap(([lotId, credits]) => [
    posting(consumedAccount(snapshot, lotId), 'debit', credits),
    posting(availableAccount(snapshot, lotId), 'credit', credits),
  ]);
  const entry = createEntry(snapshot, command, requestHash, postings, {
    compensatesEntryId: target.id,
    reasonCode: command.reasonCode,
    reservationId: target.reservationId,
  });
  const lots = snapshot.lots.map((lot) => {
    const restored = compensationByLot.get(lot.id) ?? 0n;
    return restored === 0n
      ? lot
      : Object.freeze({ ...lot, availableCredits: lot.availableCredits + restored });
  });
  return applied(
    snapshot,
    command,
    requestHash,
    {
      lots,
      entries: [...snapshot.entries, entry],
    },
    target.reservationId,
  );
}

function validateCommandBase(
  snapshot: CreditLedgerSnapshot,
  command: CreditLedgerCommand,
): CreditLedgerDenyReason | undefined {
  if (
    snapshot?.mode !== 'isolated_test_fixture' ||
    !command ||
    typeof command !== 'object' ||
    !['fixture_grant', 'reserve', 'commit', 'release', 'compensate'].includes(command.kind) ||
    !isNonEmptyString(command.tenantId) ||
    command.tenantId !== snapshot.tenantId ||
    !isNonEmptyString(command.principalId) ||
    !/^[0-9a-f]{64}$/.test(command.idempotencyKeyHash) ||
    !isNonEmptyString(command.entryId)
  ) {
    return 'invalid_command';
  }
  return undefined;
}

function hashCommand(command: CreditLedgerCommand): string {
  const payload: Record<string, string> = { kind: command.kind };
  switch (command.kind) {
    case 'fixture_grant':
      payload.lotId = command.lotId;
      payload.origin = command.origin;
      payload.credits = command.credits.toString();
      payload.issuedAtEpochMs = command.issuedAtEpochMs.toString();
      payload.expiresAtEpochMs = command.expiresAtEpochMs?.toString() ?? '';
      break;
    case 'reserve':
      payload.operation = command.operation;
      payload.jobId = command.jobId;
      payload.contractId = command.contractId;
      payload.skuId = command.skuId;
      payload.credits = command.credits.toString();
      payload.authorizationDecision = command.authorization?.decision ?? 'invalid';
      if (command.authorization?.decision === 'allow_fixture') {
        payload.policyId = command.authorization.policyId;
        payload.policyVersion = command.authorization.policyVersion;
        payload.estimatedInternalCost = command.authorization.estimatedInternalCost.toString();
        payload.maxInternalCost = command.authorization.maxInternalCost.toString();
        payload.evaluatedAtEpochMs = command.authorization.evaluatedAtEpochMs.toString();
      } else if (command.authorization?.decision === 'deny') {
        payload.authorizationReason = command.authorization.reason;
      }
      break;
    case 'commit':
      payload.reservationId = command.reservationId;
      payload.credits = command.credits.toString();
      break;
    case 'release':
      payload.reservationId = command.reservationId;
      break;
    case 'compensate':
      payload.targetEntryId = command.targetEntryId;
      payload.credits = command.credits.toString();
      payload.reasonCode = command.reasonCode;
      break;
  }
  return sha256(JSON.stringify(payload));
}

function createEntry(
  snapshot: CreditLedgerSnapshot,
  command: CreditLedgerCommand,
  requestHash: string,
  postings: readonly CreditPosting[],
  overrides: Partial<
    Pick<
      CreditLedgerEntry,
      'reservationId' | 'compensatesEntryId' | 'reasonCode' | 'policyId' | 'policyVersion'
    >
  > = {},
): CreditLedgerEntry {
  const operationIdentity: CreditLedgerIdentity = Object.freeze({
    tenantId: command.tenantId,
    principalId: command.principalId,
    operation: command.kind,
    idempotencyKeyHash: command.idempotencyKeyHash,
    requestHash,
  });
  if (!isBalancedCreditPosting(postings)) throw new TypeError('Credit posting is not balanced');
  return Object.freeze({
    id: command.entryId,
    tenantId: snapshot.tenantId,
    walletId: snapshot.walletId,
    kind: command.kind,
    identity: operationIdentity,
    postings: Object.freeze(postings.map(freezePosting)),
    reservationId: overrides.reservationId ?? null,
    compensatesEntryId: overrides.compensatesEntryId ?? null,
    reasonCode: overrides.reasonCode ?? null,
    policyId: overrides.policyId ?? null,
    policyVersion: overrides.policyVersion ?? null,
  });
}

function applied(
  snapshot: CreditLedgerSnapshot,
  command: CreditLedgerCommand,
  requestHash: string,
  changes: Partial<Pick<CreditLedgerSnapshot, 'lots' | 'reservations' | 'entries'>>,
  reservationId: string | null = null,
): CreditLedgerTransition {
  const operation: CreditLedgerOperationRecord = Object.freeze({
    tenantId: command.tenantId,
    principalId: command.principalId,
    operation: command.kind,
    idempotencyKeyHash: command.idempotencyKeyHash,
    requestHash,
    entryIds: Object.freeze([command.entryId]),
    reservationId,
  });
  const nextSnapshot = freezeSnapshot({
    ...snapshot,
    ...changes,
    operations: [...snapshot.operations, operation],
  });
  if (!reconcileCreditLedgerSnapshot(nextSnapshot).ok) return denied(snapshot, 'invalid_snapshot');
  return Object.freeze({ status: 'applied', snapshot: nextSnapshot, operation });
}

function denied(
  snapshot: CreditLedgerSnapshot,
  reason: CreditLedgerDenyReason,
  status: 'denied' | 'conflict' = 'denied',
): CreditLedgerTransition {
  return Object.freeze({ status, reason, snapshot });
}

function freezeSnapshot(snapshot: {
  mode: 'isolated_test_fixture';
  tenantId: string;
  walletId: string;
  lots: readonly CreditLot[];
  reservations: readonly CreditReservation[];
  entries: readonly CreditLedgerEntry[];
  operations: readonly CreditLedgerOperationRecord[];
}): CreditLedgerSnapshot {
  return Object.freeze({
    ...snapshot,
    lots: Object.freeze([...snapshot.lots]),
    reservations: Object.freeze([...snapshot.reservations]),
    entries: Object.freeze([...snapshot.entries]),
    operations: Object.freeze([...snapshot.operations]),
  });
}

function freezePosting(postingRow: CreditPosting): CreditPosting {
  return Object.freeze({ ...postingRow, account: Object.freeze({ ...postingRow.account }) });
}

function posting(
  account: CreditPostingAccount,
  side: 'debit' | 'credit',
  credits: CreditUnits,
): CreditPosting {
  return Object.freeze({ account: Object.freeze({ ...account }), side, credits });
}

function availableAccount(snapshot: CreditLedgerSnapshot, lotId: string): CreditPostingAccount {
  return {
    type: 'wallet_available',
    tenantId: snapshot.tenantId,
    walletId: snapshot.walletId,
    lotId,
  };
}

function reservedAccount(
  snapshot: CreditLedgerSnapshot,
  reservationId: string,
  lotId: string,
): CreditPostingAccount {
  return {
    type: 'wallet_reserved',
    tenantId: snapshot.tenantId,
    walletId: snapshot.walletId,
    reservationId,
    lotId,
  };
}

function consumedAccount(snapshot: CreditLedgerSnapshot, lotId: string): CreditPostingAccount {
  return {
    type: 'credits_consumed',
    tenantId: snapshot.tenantId,
    walletId: snapshot.walletId,
    lotId,
  };
}

function isValidPostingAccount(account: CreditPostingAccount): boolean {
  if (!account || typeof account !== 'object' || !isNonEmptyString(account.tenantId)) return false;
  switch (account.type) {
    case 'issuance':
      return true;
    case 'wallet_available':
    case 'credits_consumed':
      return isNonEmptyString(account.walletId) && isNonEmptyString(account.lotId);
    case 'wallet_reserved':
      return (
        isNonEmptyString(account.walletId) &&
        isNonEmptyString(account.lotId) &&
        isNonEmptyString(account.reservationId)
      );
    default:
      return false;
  }
}

function addBalance(target: Map<string, bigint>, key: string, amount: bigint): void {
  target.set(key, (target.get(key) ?? 0n) + amount);
}

function reservationLotKey(reservationId: string, lotId: string): string {
  return JSON.stringify([reservationId, lotId]);
}

function updateReservation(
  reservation: CreditReservation,
  updateAllocation: (allocation: CreditReservationAllocation) => CreditReservationAllocation,
): CreditReservation {
  const allocations = Object.freeze(
    reservation.allocations.map((allocation) => Object.freeze(updateAllocation(allocation))),
  );
  const committedCredits = allocations.reduce(
    (total, allocation) => total + allocation.committedCredits,
    0n,
  );
  const releasedCredits = allocations.reduce(
    (total, allocation) => total + allocation.releasedCredits,
    0n,
  );
  const updated: CreditReservation = {
    ...reservation,
    allocations,
    committedCredits,
    releasedCredits,
    status: 'reserved',
  };
  return Object.freeze({ ...updated, status: reservationStatus(updated) });
}

function reservationStatus(
  reservation: Pick<CreditReservation, 'requestedCredits' | 'committedCredits' | 'releasedCredits'>,
): CreditReservation['status'] {
  if (reservation.committedCredits + reservation.releasedCredits >= reservation.requestedCredits) {
    return 'settled';
  }
  return reservation.committedCredits > 0n ? 'partially_committed' : 'reserved';
}

function replaceById<T extends { id: string }>(items: readonly T[], replacement: T): readonly T[] {
  return Object.freeze(items.map((item) => (item.id === replacement.id ? replacement : item)));
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
