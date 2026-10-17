import type { CreditLedgerError, CreditReservationResult } from '@spryxel/db';
import type { CostGuardInput, CostGuardLimits } from '@spryxel/domain';
import { describe, expect, it, vi } from 'vitest';
import { createCostGuardedCreditReservationService } from './credit-ledger.js';

const operation = 'test_fixture.credit_ledger.v1';

function makeInput(overrides: Partial<CostGuardInput> = {}): CostGuardInput {
  const limit = { maxCredits: 100n, maxInternalCost: 100n };
  const limits: CostGuardLimits = {
    global: limit,
    tenant: limit,
    project: limit,
    sku: limit,
    operation: limit,
  };
  return {
    mode: 'isolated_test_fixture',
    nowEpochMs: 1_800_000_000_000,
    knownSkuIds: ['SKU-001'],
    knownOperations: [operation],
    skuId: 'SKU-001',
    operation,
    policy: {
      id: 'fixture-credit-policy',
      version: '1',
      status: 'approved',
      mode: 'isolated_test_fixture',
      validUntilEpochMs: 1_900_000_000_000,
      skuIds: ['SKU-001'],
      operations: [operation],
      limits,
    },
    bounds: {
      requestedCredits: 20n,
      maxCredits: 25n,
      estimatedInternalCost: 10n,
      maxInternalCost: 15n,
    },
    economics: {
      contributionMargin: 20n,
      availableCash: 30n,
      requiredCashReserve: 10n,
      remainingBudget: 20n,
    },
    ...overrides,
  };
}

const reservation: CreditReservationResult = {
  reservationId: 'c18baf1e-3333-4d8d-8dbb-950fd17e00f8',
  entryId: '9a21a8e3-2298-4b10-9c42-6e3d8f1d1002',
  status: 'reserved',
  reservedCredits: '20',
  committedCredits: '0',
  releasedCredits: '0',
  remainingCredits: '20',
  replayed: false,
};

describe('CostGuard credit reservation service', () => {
  it('passes the issued fixture authorization and audit fields to the persistence port', async () => {
    const reserve = vi.fn(async () => reservation);
    const service = createCostGuardedCreditReservationService({ reserve });

    await expect(
      service({
        jobId: 'cd38c4cc-1189-4f59-8a65-c1f0601a43a0',
        amountCredits: 20n,
        idempotencyKey: 'fixture-a',
        requestId: 'req_fixture_reservation_1',
        costGuardInput: makeInput(),
      }),
    ).resolves.toEqual(reservation);

    expect(reserve).toHaveBeenCalledWith({
      jobId: 'cd38c4cc-1189-4f59-8a65-c1f0601a43a0',
      amountCredits: 20n,
      idempotencyKey: 'fixture-a',
      requestId: 'req_fixture_reservation_1',
      costGuard: {
        skuId: 'SKU-001',
        policyId: 'fixture-credit-policy',
        policyVersion: '1',
        decision: 'allow_fixture',
        reasonCode: 'fixture_policy_passed',
        estimatedInternalCost: 10n,
        maxInternalCost: 15n,
      },
    });
  });

  it('does not call persistence when CostGuard denies the request', async () => {
    const reserve = vi.fn(async () => reservation);
    const service = createCostGuardedCreditReservationService({ reserve });

    await expect(
      service({
        jobId: 'cd38c4cc-1189-4f59-8a65-c1f0601a43a0',
        amountCredits: 20n,
        idempotencyKey: 'fixture-b',
        requestId: 'req_fixture_reservation_2',
        costGuardInput: makeInput({ mode: 'production' }),
      }),
    ).rejects.toMatchObject({ code: 'cost_guard_denied' } satisfies Partial<CreditLedgerError>);

    expect(reserve).not.toHaveBeenCalled();
  });

  it('rejects amount mismatches before persistence', async () => {
    const reserve = vi.fn(async () => reservation);
    const service = createCostGuardedCreditReservationService({ reserve });

    await expect(
      service({
        jobId: 'cd38c4cc-1189-4f59-8a65-c1f0601a43a0',
        amountCredits: 21n,
        idempotencyKey: 'fixture-c',
        requestId: 'req_fixture_reservation_3',
        costGuardInput: makeInput(),
      }),
    ).rejects.toMatchObject({ code: 'cost_guard_denied' });

    expect(reserve).not.toHaveBeenCalled();
  });
});
