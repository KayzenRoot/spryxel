import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  allocateCreditLots,
  applyCreditLedgerCommand,
  type CostGuardInput,
  type CostGuardPolicy,
  type CreditLedgerCommand,
  type CreditLedgerSnapshot,
  createCreditLedgerSnapshot,
  creditLedgerFixtureOperation,
  evaluateCostGuard,
  isBalancedCreditPosting,
  isFixtureCostGuardAuthorization,
  isPostgresInt8,
  postgresInt8Max,
  postgresInt8Min,
  reconcileCreditLedgerSnapshot,
} from './credit-ledger.js';

const now = 1_800_000_000_000;
const hash = (value: string) => createHash('sha256').update(value).digest('hex');

function costInput(overrides: Partial<CostGuardInput> = {}): CostGuardInput {
  const limits = {
    global: { maxCredits: 1_000n, maxInternalCost: 1_000n },
    tenant: { maxCredits: 900n, maxInternalCost: 900n },
    project: { maxCredits: 800n, maxInternalCost: 800n },
    sku: { maxCredits: 700n, maxInternalCost: 700n },
    operation: { maxCredits: 600n, maxInternalCost: 600n },
  } as const;
  return {
    mode: 'isolated_test_fixture',
    nowEpochMs: now,
    knownSkuIds: ['SKU-TEST'],
    knownOperations: [creditLedgerFixtureOperation],
    skuId: 'SKU-TEST',
    operation: creditLedgerFixtureOperation,
    policy: {
      id: 'fixture-policy',
      version: '1',
      status: 'approved',
      mode: 'isolated_test_fixture',
      validUntilEpochMs: now + 60_000,
      skuIds: ['SKU-TEST'],
      operations: [creditLedgerFixtureOperation],
      limits,
    },
    bounds: {
      requestedCredits: 50n,
      maxCredits: 100n,
      estimatedInternalCost: 20n,
      maxInternalCost: 40n,
    },
    economics: {
      contributionMargin: 10n,
      availableCash: 100n,
      requiredCashReserve: 50n,
      remainingBudget: 100n,
    },
    ...overrides,
  };
}

function fixturePolicy(): CostGuardPolicy {
  const policy = costInput().policy;
  if (!policy) throw new Error('fixture policy is missing');
  return policy;
}

function fixturePolicyLimits(policy: CostGuardPolicy): NonNullable<CostGuardPolicy['limits']> {
  if (!policy.limits) throw new Error('fixture policy limits are missing');
  return policy.limits;
}

function fixtureBounds(): NonNullable<CostGuardInput['bounds']> {
  const bounds = costInput().bounds;
  if (!bounds) throw new Error('fixture bounds are missing');
  return bounds;
}

function fixtureEconomics(): NonNullable<CostGuardInput['economics']> {
  const economics = costInput().economics;
  if (!economics) throw new Error('fixture economics are missing');
  return economics;
}

function grantFixture(snapshot: CreditLedgerSnapshot, credits = 100n) {
  const transition = applyCreditLedgerCommand(snapshot, {
    kind: 'fixture_grant',
    tenantId: 'tenant-1',
    principalId: 'owner-1',
    idempotencyKeyHash: hash('grant-key'),
    entryId: 'entry-grant-1',
    lotId: 'lot-paid-1',
    origin: 'PAID_PACK',
    credits,
    issuedAtEpochMs: now - 1_000,
    expiresAtEpochMs: null,
  });
  expect(transition.status).toBe('applied');
  return transition;
}

function reserveCommand(authorization: ReturnType<typeof evaluateCostGuard>, credits = 60n) {
  return {
    kind: 'reserve',
    tenantId: 'tenant-1',
    principalId: 'member-1',
    idempotencyKeyHash: hash('reserve-key'),
    entryId: 'entry-reserve-1',
    reservationId: 'reservation-1',
    operation: creditLedgerFixtureOperation,
    jobId: 'job-fixture-1',
    contractId: 'contract-fixture-1',
    skuId: 'SKU-TEST',
    credits,
    authorization,
  } as const;
}

function reserveAuthorization() {
  const input = costInput();
  return evaluateCostGuard({
    ...input,
    bounds: { ...fixtureBounds(), requestedCredits: 60n },
  });
}

function appliedSnapshot(result: ReturnType<typeof grantFixture>): CreditLedgerSnapshot {
  if (result.status !== 'applied') throw new Error(`expected applied, got ${result.status}`);
  return result.snapshot;
}

describe('credit integer bounds and postings', () => {
  it('accepts only bigint values within PostgreSQL int8 bounds', () => {
    expect(isPostgresInt8(postgresInt8Min)).toBe(true);
    expect(isPostgresInt8(postgresInt8Max)).toBe(true);
    expect(isPostgresInt8(postgresInt8Min - 1n)).toBe(false);
    expect(isPostgresInt8(postgresInt8Max + 1n)).toBe(false);
    for (const invalid of [0, 1.25, Number.MAX_SAFE_INTEGER, '1', null, undefined]) {
      expect(isPostgresInt8(invalid)).toBe(false);
    }
  });

  it('rejects unbalanced, non-positive, and overflowing postings', () => {
    expect(
      isBalancedCreditPosting([
        { account: { type: 'issuance', tenantId: 'tenant-1' }, side: 'debit', credits: 1n },
        {
          account: {
            type: 'wallet_available',
            tenantId: 'tenant-1',
            walletId: 'wallet-1',
            lotId: 'lot-1',
          },
          side: 'credit',
          credits: 2n,
        },
      ]),
    ).toBe(false);
    expect(
      isBalancedCreditPosting([
        { account: { type: 'issuance', tenantId: 'tenant-1' }, side: 'debit', credits: 0n },
        {
          account: {
            type: 'wallet_available',
            tenantId: 'tenant-1',
            walletId: 'wallet-1',
            lotId: 'lot-1',
          },
          side: 'credit',
          credits: 0n,
        },
      ]),
    ).toBe(false);
    expect(
      isBalancedCreditPosting([
        {
          account: { type: 'issuance', tenantId: 'tenant-1' },
          side: 'debit',
          credits: postgresInt8Max,
        },
        { account: { type: 'issuance', tenantId: 'tenant-1' }, side: 'debit', credits: 1n },
        {
          account: {
            type: 'wallet_available',
            tenantId: 'tenant-1',
            walletId: 'wallet-1',
            lotId: 'lot-1',
          },
          side: 'credit',
          credits: postgresInt8Max,
        },
        {
          account: {
            type: 'wallet_available',
            tenantId: 'tenant-1',
            walletId: 'wallet-1',
            lotId: 'lot-1',
          },
          side: 'credit',
          credits: 1n,
        },
      ]),
    ).toBe(false);
  });
});

describe('CostGuard default-deny evaluation', () => {
  it('authorizes a positive increment only for an explicit isolated fixture', () => {
    const decision = evaluateCostGuard(costInput());
    expect(decision).toMatchObject({
      decision: 'allow_fixture',
      mode: 'isolated_test_fixture',
      skuId: 'SKU-TEST',
      operation: creditLedgerFixtureOperation,
      credits: 50n,
      estimatedInternalCost: 20n,
      maxInternalCost: 40n,
      policyId: 'fixture-policy',
      policyVersion: '1',
    });
    expect(Object.isFrozen(decision)).toBe(true);
    expect(isFixtureCostGuardAuthorization(decision)).toBe(true);
    expect(isFixtureCostGuardAuthorization({ ...decision })).toBe(false);
    expect(isFixtureCostGuardAuthorization(null)).toBe(false);
  });

  it('sets the effective internal-cost ceiling from bounds, every policy scope, and budget', () => {
    for (const scope of ['global', 'tenant', 'project', 'sku', 'operation'] as const) {
      const policy = fixturePolicy();
      const scopeLimit = fixturePolicyLimits(policy)[scope];
      if (!scopeLimit) throw new Error(`fixture ${scope} limit is missing`);
      const decision = evaluateCostGuard(
        costInput({
          bounds: { ...fixtureBounds(), maxInternalCost: 100n },
          policy: {
            ...policy,
            limits: {
              ...fixturePolicyLimits(policy),
              [scope]: { ...scopeLimit, maxInternalCost: 35n },
            },
          },
          economics: { ...fixtureEconomics(), remainingBudget: 80n },
        }),
      );
      expect(decision).toMatchObject({
        decision: 'allow_fixture',
        estimatedInternalCost: 20n,
        maxInternalCost: 35n,
      });
    }

    expect(
      evaluateCostGuard(
        costInput({
          bounds: { ...fixtureBounds(), maxInternalCost: 45n },
          economics: { ...fixtureEconomics(), remainingBudget: 50n },
        }),
      ),
    ).toMatchObject({ estimatedInternalCost: 20n, maxInternalCost: 45n });
    expect(
      evaluateCostGuard(
        costInput({
          bounds: { ...fixtureBounds(), maxInternalCost: 80n },
          economics: { ...fixtureEconomics(), remainingBudget: 30n },
        }),
      ),
    ).toMatchObject({ estimatedInternalCost: 20n, maxInternalCost: 30n });
  });

  it('denies unknown SKU, unknown operation, and integrity work', () => {
    expect(evaluateCostGuard(costInput({ skuId: 'SKU-UNKNOWN' }))).toMatchObject({
      decision: 'deny',
      reason: 'unknown_sku',
    });
    expect(evaluateCostGuard(costInput({ operation: 'unknown.operation.v1' }))).toMatchObject({
      decision: 'deny',
      reason: 'unknown_operation',
    });
    expect(
      evaluateCostGuard(
        costInput({
          knownOperations: ['asset_contract.integrity_check.v1'],
          operation: 'asset_contract.integrity_check.v1',
        }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'non_costing_operation' });
    expect(
      evaluateCostGuard(
        costInput({
          knownOperations: ['caller-invented.operation.v1'],
          operation: 'caller-invented.operation.v1',
        }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'unknown_operation' });
  });

  it('denies absent, unapproved, stale, malformed, or mismatched policy', () => {
    expect(evaluateCostGuard(costInput({ policy: null }))).toMatchObject({
      decision: 'deny',
      reason: 'policy_missing',
    });
    expect(
      evaluateCostGuard(costInput({ policy: { ...fixturePolicy(), status: 'unapproved' } })),
    ).toMatchObject({ decision: 'deny', reason: 'policy_unapproved' });
    expect(
      evaluateCostGuard(costInput({ policy: { ...fixturePolicy(), validUntilEpochMs: now } })),
    ).toMatchObject({ decision: 'deny', reason: 'policy_stale' });
    expect(
      evaluateCostGuard(
        costInput({
          policy: { ...fixturePolicy(), mode: 'production' },
        }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'policy_mode_mismatch' });
    expect(
      evaluateCostGuard(
        costInput({
          policy: { ...fixturePolicy(), skuIds: [] },
        }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'sku_not_approved' });
    expect(
      evaluateCostGuard(
        costInput({
          policy: { ...fixturePolicy(), operations: [] },
        }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'operation_not_approved' });
    expect(
      evaluateCostGuard(costInput({ policy: { ...fixturePolicy(), validUntilEpochMs: null } })),
    ).toMatchObject({ decision: 'deny', reason: 'policy_stale' });
  });

  it('denies missing and invalid bounds, including zero, negative, number, and int8 overflow', () => {
    expect(evaluateCostGuard(costInput({ bounds: null }))).toMatchObject({
      decision: 'deny',
      reason: 'bounds_missing',
    });
    for (const requestedCredits of [0n, -1n, postgresInt8Max + 1n, 1.5, '1', null]) {
      expect(
        evaluateCostGuard(
          costInput({
            bounds: { ...fixtureBounds(), requestedCredits } as NonNullable<
              CostGuardInput['bounds']
            >,
          }),
        ),
      ).toMatchObject({ decision: 'deny', reason: 'bounds_invalid' });
    }
    expect(
      evaluateCostGuard(
        costInput({
          bounds: { ...fixtureBounds(), maxCredits: -1n },
        }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'bounds_invalid' });
    expect(
      evaluateCostGuard(
        costInput({
          bounds: { ...fixtureBounds(), estimatedInternalCost: 0n },
        }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'bounds_invalid' });
    expect(
      evaluateCostGuard(
        costInput({
          bounds: { ...fixtureBounds(), maxInternalCost: postgresInt8Max + 1n },
        }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'bounds_invalid' });
  });

  it('enforces requested credit and internal-cost caller ceilings plus every policy scope', () => {
    expect(
      evaluateCostGuard(costInput({ bounds: { ...fixtureBounds(), maxCredits: 49n } })),
    ).toMatchObject({ decision: 'deny', reason: 'credits_limit_exceeded' });
    expect(
      evaluateCostGuard(costInput({ bounds: { ...fixtureBounds(), maxInternalCost: 19n } })),
    ).toMatchObject({ decision: 'deny', reason: 'internal_cost_limit_exceeded' });
    for (const scope of ['global', 'tenant', 'project', 'sku', 'operation'] as const) {
      const policy = fixturePolicy();
      expect(
        evaluateCostGuard(
          costInput({
            policy: {
              ...policy,
              limits: {
                ...fixturePolicyLimits(policy),
                [scope]: { maxCredits: 49n, maxInternalCost: 20n },
              },
            },
          }),
        ),
      ).toMatchObject({ decision: 'deny', reason: 'credits_limit_exceeded' });
      expect(
        evaluateCostGuard(
          costInput({
            policy: {
              ...policy,
              limits: {
                ...fixturePolicyLimits(policy),
                [scope]: { maxCredits: 50n, maxInternalCost: 19n },
              },
            },
          }),
        ),
      ).toMatchObject({ decision: 'deny', reason: 'internal_cost_limit_exceeded' });
    }
  });

  it('denies any absent or invalid scope limit and rejects non-positive margin, cash, or budget', () => {
    const policy = fixturePolicy();
    expect(evaluateCostGuard(costInput({ policy: { ...policy, limits: null } }))).toMatchObject({
      decision: 'deny',
      reason: 'limits_missing',
    });
    for (const scope of ['global', 'tenant', 'project', 'sku', 'operation'] as const) {
      expect(
        evaluateCostGuard(
          costInput({
            policy: {
              ...policy,
              limits: { ...fixturePolicyLimits(policy), [scope]: null },
            },
          }),
        ),
      ).toMatchObject({ decision: 'deny', reason: 'limits_missing' });
      expect(
        evaluateCostGuard(
          costInput({
            policy: {
              ...policy,
              limits: {
                ...fixturePolicyLimits(policy),
                [scope]: { maxCredits: postgresInt8Max + 1n, maxInternalCost: 20n },
              },
            },
          }),
        ),
      ).toMatchObject({ decision: 'deny', reason: 'limit_invalid' });
    }
    expect(evaluateCostGuard(costInput({ economics: null }))).toMatchObject({
      decision: 'deny',
      reason: 'economics_missing',
    });
    expect(
      evaluateCostGuard(
        costInput({ economics: { ...fixtureEconomics(), contributionMargin: 0n } }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'non_positive_margin' });
    expect(
      evaluateCostGuard(
        costInput({ economics: { ...fixtureEconomics(), contributionMargin: -1n } }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'non_positive_margin' });
    expect(
      evaluateCostGuard(costInput({ economics: { ...fixtureEconomics(), availableCash: 49n } })),
    ).toMatchObject({ decision: 'deny', reason: 'cash_reserve_unfunded' });
    expect(
      evaluateCostGuard(costInput({ economics: { ...fixtureEconomics(), remainingBudget: 19n } })),
    ).toMatchObject({ decision: 'deny', reason: 'budget_exceeded' });
    expect(
      evaluateCostGuard(
        costInput({ economics: { ...fixtureEconomics(), availableCash: postgresInt8Max + 1n } }),
      ),
    ).toMatchObject({ decision: 'deny', reason: 'economics_invalid' });
    expect(
      evaluateCostGuard(costInput({ economics: { ...fixtureEconomics(), remainingBudget: -1n } })),
    ).toMatchObject({ decision: 'deny', reason: 'economics_invalid' });
  });

  it('never enables production spending in this foundation slice', () => {
    const source = costInput();
    const decision = evaluateCostGuard({
      ...source,
      mode: 'production',
      policy: { ...fixturePolicy(), mode: 'production' },
    });
    expect(decision).toMatchObject({
      decision: 'deny',
      reason: 'production_activation_not_authorized',
    });
    expect(evaluateCostGuard(null as unknown as CostGuardInput)).toMatchObject({
      decision: 'deny',
      reason: 'invalid_context',
    });
  });
});

describe('credit lot allocation', () => {
  it('consumes expiring trial, promotional, referral, subscription, then oldest paid pack', () => {
    const lots = [
      {
        id: 'paid-new',
        origin: 'PAID_PACK',
        issuedCredits: 10n,
        availableCredits: 10n,
        issuedAtEpochMs: 5,
        expiresAtEpochMs: null,
      },
      {
        id: 'sub',
        origin: 'SUBSCRIPTION',
        issuedCredits: 10n,
        availableCredits: 10n,
        issuedAtEpochMs: 4,
        expiresAtEpochMs: null,
      },
      {
        id: 'ref',
        origin: 'REFERRAL',
        issuedCredits: 10n,
        availableCredits: 10n,
        issuedAtEpochMs: 3,
        expiresAtEpochMs: now + 4,
      },
      {
        id: 'promo',
        origin: 'PROMOTIONAL',
        issuedCredits: 10n,
        availableCredits: 10n,
        issuedAtEpochMs: 2,
        expiresAtEpochMs: now + 3,
      },
      {
        id: 'trial',
        origin: 'TRIAL',
        issuedCredits: 10n,
        availableCredits: 10n,
        issuedAtEpochMs: 1,
        expiresAtEpochMs: now + 2,
      },
      {
        id: 'paid-old',
        origin: 'PAID_PACK',
        issuedCredits: 10n,
        availableCredits: 10n,
        issuedAtEpochMs: 0,
        expiresAtEpochMs: null,
      },
    ] as const;
    expect(allocateCreditLots(lots, 60n, now)).toMatchObject({
      status: 'allocated',
      allocations: [
        { lotId: 'trial', credits: 10n },
        { lotId: 'promo', credits: 10n },
        { lotId: 'ref', credits: 10n },
        { lotId: 'sub', credits: 10n },
        { lotId: 'paid-old', credits: 10n },
        { lotId: 'paid-new', credits: 10n },
      ],
    });
  });

  it('does not consume expired grants, non-expiring promotional lots, or compensation lots', () => {
    const lots = [
      {
        id: 'expired',
        origin: 'TRIAL',
        issuedCredits: 5n,
        availableCredits: 5n,
        issuedAtEpochMs: 0,
        expiresAtEpochMs: now,
      },
      {
        id: 'non-expiring-promo',
        origin: 'PROMOTIONAL',
        issuedCredits: 5n,
        availableCredits: 5n,
        issuedAtEpochMs: 0,
        expiresAtEpochMs: null,
      },
      {
        id: 'comp',
        origin: 'COMPENSATION',
        issuedCredits: 5n,
        availableCredits: 5n,
        issuedAtEpochMs: 0,
        expiresAtEpochMs: null,
      },
    ] as const;
    expect(allocateCreditLots(lots, 1n, now)).toMatchObject({
      status: 'denied',
      reason: 'insufficient_credits',
    });
    expect(allocateCreditLots(lots, 0n, now)).toMatchObject({
      status: 'denied',
      reason: 'invalid_amount',
    });
    expect(
      allocateCreditLots([{ ...lots[0], availableCredits: postgresInt8Max + 1n }], 1n, now),
    ).toMatchObject({ status: 'denied', reason: 'invalid_lot' });
  });
});

describe('immutable fixture credit ledger lifecycle', () => {
  it('balances issuance, reservation, partial commit, residual release, replay, and compensation', () => {
    const empty = createCreditLedgerSnapshot({ tenantId: 'tenant-1', walletId: 'wallet-1' });
    const granted = grantFixture(empty);
    const afterGrant = appliedSnapshot(granted);
    expect(reconcileCreditLedgerSnapshot(afterGrant)).toEqual({ ok: true });
    expect(empty.lots).toHaveLength(0);
    expect(empty.entries).toHaveLength(0);

    const authorization = reserveAuthorization();
    const reserved = applyCreditLedgerCommand(afterGrant, reserveCommand(authorization));
    expect(reserved.status).toBe('applied');
    if (reserved.status !== 'applied') throw new Error(`expected applied, got ${reserved.status}`);
    const afterReserve = reserved.snapshot;
    expect(afterReserve.lots[0]?.availableCredits).toBe(40n);
    expect(afterReserve.reservations[0]).toMatchObject({
      requestedCredits: 60n,
      committedCredits: 0n,
      releasedCredits: 0n,
      status: 'reserved',
    });

    const commitCommand: CreditLedgerCommand = {
      kind: 'commit',
      tenantId: 'tenant-1',
      principalId: 'member-1',
      idempotencyKeyHash: hash('commit-key'),
      entryId: 'entry-commit-1',
      reservationId: 'reservation-1',
      credits: 35n,
    };
    const committed = applyCreditLedgerCommand(afterReserve, commitCommand);
    expect(committed.status).toBe('applied');
    if (committed.status !== 'applied')
      throw new Error(`expected applied, got ${committed.status}`);
    const afterCommit = committed.snapshot;
    expect(afterCommit.reservations[0]).toMatchObject({
      committedCredits: 35n,
      releasedCredits: 0n,
      status: 'partially_committed',
    });
    expect(reconcileCreditLedgerSnapshot(afterCommit)).toEqual({ ok: true });

    const releaseCommand: CreditLedgerCommand = {
      kind: 'release',
      tenantId: 'tenant-1',
      principalId: 'member-1',
      idempotencyKeyHash: hash('release-key'),
      entryId: 'entry-release-1',
      reservationId: 'reservation-1',
    };
    const released = applyCreditLedgerCommand(afterCommit, releaseCommand);
    expect(released.status).toBe('applied');
    if (released.status !== 'applied') throw new Error(`expected applied, got ${released.status}`);
    const afterRelease = released.snapshot;
    expect(afterRelease.lots[0]?.availableCredits).toBe(65n);
    expect(afterRelease.reservations[0]).toMatchObject({
      committedCredits: 35n,
      releasedCredits: 25n,
      status: 'settled',
    });
    expect(applyCreditLedgerCommand(afterRelease, releaseCommand)).toMatchObject({
      status: 'replayed',
      snapshot: afterRelease,
    });

    const compensationCommand: CreditLedgerCommand = {
      kind: 'compensate',
      tenantId: 'tenant-1',
      principalId: 'owner-1',
      idempotencyKeyHash: hash('compensate-key'),
      entryId: 'entry-compensate-1',
      targetEntryId: 'entry-commit-1',
      credits: 10n,
      reasonCode: 'support.adjustment',
    };
    const compensated = applyCreditLedgerCommand(afterRelease, compensationCommand);
    expect(compensated.status).toBe('applied');
    if (compensated.status !== 'applied')
      throw new Error(`expected applied, got ${compensated.status}`);
    expect(compensated.snapshot.lots[0]?.availableCredits).toBe(75n);
    expect(compensated.snapshot.entries.find((entry) => entry.id === 'entry-commit-1')).toEqual(
      afterCommit.entries.find((entry) => entry.id === 'entry-commit-1'),
    );
    expect(compensated.snapshot.entries.at(-1)).toMatchObject({
      kind: 'compensate',
      compensatesEntryId: 'entry-commit-1',
      reasonCode: 'support.adjustment',
    });
    expect(reconcileCreditLedgerSnapshot(compensated.snapshot)).toEqual({ ok: true });
    expect(
      compensated.snapshot.entries.every((entry) => isBalancedCreditPosting(entry.postings)),
    ).toBe(true);
  });

  it('conflicts on a changed payload for the same idempotency identity', () => {
    const afterGrant = appliedSnapshot(
      grantFixture(createCreditLedgerSnapshot({ tenantId: 'tenant-1', walletId: 'wallet-1' })),
    );
    const reserved = applyCreditLedgerCommand(afterGrant, reserveCommand(reserveAuthorization()));
    if (reserved.status !== 'applied') throw new Error(`expected applied, got ${reserved.status}`);
    const first: CreditLedgerCommand = {
      kind: 'commit',
      tenantId: 'tenant-1',
      principalId: 'member-1',
      idempotencyKeyHash: hash('same-key'),
      entryId: 'entry-commit-a',
      reservationId: 'reservation-1',
      credits: 10n,
    };
    const committed = applyCreditLedgerCommand(reserved.snapshot, first);
    if (committed.status !== 'applied')
      throw new Error(`expected applied, got ${committed.status}`);
    expect(
      applyCreditLedgerCommand(committed.snapshot, {
        ...first,
        credits: 11n,
        entryId: 'entry-commit-b',
      }),
    ).toMatchObject({
      status: 'conflict',
      reason: 'idempotency_conflict',
      snapshot: committed.snapshot,
    });
    expect(
      applyCreditLedgerCommand(committed.snapshot, {
        ...first,
        entryId: 'entry-commit-other-key',
        idempotencyKeyHash: hash('other'),
      }),
    ).toMatchObject({ status: 'applied' });
  });

  it('includes estimated internal cost and effective ceiling in reservation idempotency', () => {
    const afterGrant = appliedSnapshot(
      grantFixture(createCreditLedgerSnapshot({ tenantId: 'tenant-1', walletId: 'wallet-1' })),
    );
    const reserved = applyCreditLedgerCommand(afterGrant, reserveCommand(reserveAuthorization()));
    if (reserved.status !== 'applied') throw new Error(`expected applied, got ${reserved.status}`);

    const changedEstimate = evaluateCostGuard(
      costInput({
        bounds: {
          ...fixtureBounds(),
          requestedCredits: 60n,
          estimatedInternalCost: 21n,
        },
      }),
    );
    expect(
      applyCreditLedgerCommand(reserved.snapshot, {
        ...reserveCommand(changedEstimate),
        entryId: 'entry-reserve-changed-estimate',
      }),
    ).toMatchObject({ status: 'conflict', reason: 'idempotency_conflict' });

    const changedCeiling = evaluateCostGuard(
      costInput({
        bounds: {
          ...fixtureBounds(),
          requestedCredits: 60n,
          maxInternalCost: 35n,
        },
      }),
    );
    expect(
      applyCreditLedgerCommand(reserved.snapshot, {
        ...reserveCommand(changedCeiling),
        entryId: 'entry-reserve-changed-ceiling',
      }),
    ).toMatchObject({ status: 'conflict', reason: 'idempotency_conflict' });
  });

  it('includes all grant fields in the idempotent request identity and rejects int8 overflow', () => {
    const snapshot = createCreditLedgerSnapshot({ tenantId: 'tenant-1', walletId: 'wallet-1' });
    const base: CreditLedgerCommand = {
      kind: 'fixture_grant',
      tenantId: 'tenant-1',
      principalId: 'owner-1',
      idempotencyKeyHash: hash('grant-replay-key'),
      entryId: 'entry-grant-replay-1',
      lotId: 'lot-grant-replay-1',
      origin: 'PAID_PACK',
      credits: 10n,
      issuedAtEpochMs: now - 100,
      expiresAtEpochMs: null,
    };
    const first = applyCreditLedgerCommand(snapshot, base);
    expect(first.status).toBe('applied');
    if (first.status !== 'applied') throw new Error(`expected applied, got ${first.status}`);
    expect(
      applyCreditLedgerCommand(first.snapshot, {
        ...base,
        entryId: 'entry-grant-replay-2',
        issuedAtEpochMs: now - 99,
      }),
    ).toMatchObject({ status: 'conflict', reason: 'idempotency_conflict' });
    expect(
      applyCreditLedgerCommand(first.snapshot, {
        ...base,
        entryId: 'entry-grant-overflow',
        idempotencyKeyHash: hash('grant-overflow-key'),
        lotId: 'lot-overflow',
        credits: postgresInt8Max + 1n,
      }),
    ).toMatchObject({ status: 'denied', reason: 'invalid_amount' });
  });

  it('reconciliation detects missing audit records, foreign posting scope, and malformed nested rows', () => {
    const snapshot = appliedSnapshot(
      grantFixture(createCreditLedgerSnapshot({ tenantId: 'tenant-1', walletId: 'wallet-1' })),
    );
    expect(reconcileCreditLedgerSnapshot({ ...snapshot, operations: [] })).toMatchObject({
      ok: false,
      reason: 'invalid_snapshot',
    });
    const foreignScope: CreditLedgerSnapshot = {
      ...snapshot,
      entries: snapshot.entries.map((entry) => ({
        ...entry,
        postings: entry.postings.map((posting, index) =>
          index === 1
            ? { ...posting, account: { ...posting.account, walletId: 'wallet-other' } }
            : posting,
        ),
      })),
    };
    expect(reconcileCreditLedgerSnapshot(foreignScope)).toMatchObject({
      ok: false,
      reason: 'invalid_snapshot',
    });
    expect(
      reconcileCreditLedgerSnapshot({
        ...snapshot,
        reservations: [null] as unknown as CreditLedgerSnapshot['reservations'],
      }),
    ).toMatchObject({ ok: false, reason: 'invalid_snapshot' });
    expect(Object.isFrozen(snapshot.entries[0])).toBe(true);
    expect(Object.isFrozen(snapshot.entries[0]?.postings)).toBe(true);
    expect(Object.isFrozen(snapshot.entries[0]?.postings[0]?.account)).toBe(true);
  });

  it('rejects fabricated authorization, integrity jobs, overcommit, cross-tenant writes, and bad compensation', () => {
    const afterGrant = appliedSnapshot(
      grantFixture(createCreditLedgerSnapshot({ tenantId: 'tenant-1', walletId: 'wallet-1' })),
    );
    const fakeAuthorization = {
      decision: 'allow_fixture',
      mode: 'isolated_test_fixture',
      skuId: 'SKU-TEST',
      operation: creditLedgerFixtureOperation,
      credits: 60n,
      estimatedInternalCost: 20n,
      maxInternalCost: 20n,
      policyId: 'fake',
      policyVersion: '1',
      evaluatedAtEpochMs: now,
    } as ReturnType<typeof evaluateCostGuard>;
    expect(applyCreditLedgerCommand(afterGrant, reserveCommand(fakeAuthorization))).toMatchObject({
      status: 'denied',
      reason: 'authorization_required',
    });
    const realAuthorization = reserveAuthorization();
    expect(
      applyCreditLedgerCommand(afterGrant, {
        ...reserveCommand(realAuthorization),
        operation: 'asset_contract.integrity_check.v1',
      }),
    ).toMatchObject({ status: 'denied', reason: 'invalid_command' });
    expect(
      applyCreditLedgerCommand(afterGrant, {
        ...reserveCommand(realAuthorization),
        tenantId: 'other-tenant',
      }),
    ).toMatchObject({ status: 'denied', reason: 'invalid_command' });
    const reserved = applyCreditLedgerCommand(afterGrant, reserveCommand(realAuthorization));
    if (reserved.status !== 'applied') throw new Error(`expected applied, got ${reserved.status}`);
    expect(
      applyCreditLedgerCommand(reserved.snapshot, {
        kind: 'commit',
        tenantId: 'tenant-1',
        principalId: 'member-1',
        idempotencyKeyHash: hash('overcommit'),
        entryId: 'entry-overcommit',
        reservationId: 'reservation-1',
        credits: 61n,
      }),
    ).toMatchObject({ status: 'denied', reason: 'commit_exceeds_reservation' });
    expect(
      applyCreditLedgerCommand(reserved.snapshot, {
        kind: 'compensate',
        tenantId: 'tenant-1',
        principalId: 'owner-1',
        idempotencyKeyHash: hash('bad-compensate'),
        entryId: 'entry-bad-compensate',
        targetEntryId: 'missing',
        credits: 1n,
        reasonCode: 'not valid',
      }),
    ).toMatchObject({ status: 'denied', reason: 'invalid_reason_code' });
  });

  it('fails closed for malformed untyped commands rather than throwing', () => {
    const snapshot = createCreditLedgerSnapshot({ tenantId: 'tenant-1', walletId: 'wallet-1' });
    expect(() =>
      applyCreditLedgerCommand(snapshot, null as unknown as CreditLedgerCommand),
    ).not.toThrow();
    expect(
      applyCreditLedgerCommand(snapshot, null as unknown as CreditLedgerCommand),
    ).toMatchObject({
      status: 'denied',
      reason: 'invalid_command',
    });
  });
});
