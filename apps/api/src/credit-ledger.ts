import { CreditLedgerError, type CreditAmount, type CreditReservationResult } from '@spryxel/db';
import {
  evaluateCostGuard,
  isFixtureCostGuardAuthorization,
  type CostGuardInput,
  type FixtureCostGuardAuthorization,
} from '@spryxel/domain';

const fixtureOperation = 'test_fixture.credit_ledger.v1';
const fixtureReasonCode = 'fixture_policy_passed';

export type CreditReservationCommand = Readonly<{
  jobId: string;
  amountCredits: CreditAmount;
  idempotencyKey: string;
  requestId: string;
  costGuardInput: CostGuardInput;
}>;

export type AuthorizedCreditReservation = Readonly<{
  jobId: string;
  amountCredits: CreditAmount;
  idempotencyKey: string;
  requestId: string;
  costGuard: Readonly<{
    skuId: FixtureCostGuardAuthorization['skuId'];
    policyId: FixtureCostGuardAuthorization['policyId'];
    policyVersion: FixtureCostGuardAuthorization['policyVersion'];
    decision: FixtureCostGuardAuthorization['decision'];
    reasonCode: typeof fixtureReasonCode;
    estimatedInternalCost: FixtureCostGuardAuthorization['estimatedInternalCost'];
    maxInternalCost: FixtureCostGuardAuthorization['maxInternalCost'];
  }>;
}>;

export type CreditReservationPort = {
  reserve(input: AuthorizedCreditReservation): Promise<CreditReservationResult>;
};

export function createCostGuardedCreditReservationService(port: CreditReservationPort) {
  return async function reserveWithCostGuard(
    command: CreditReservationCommand,
  ): Promise<CreditReservationResult> {
    const authorization = evaluateCostGuard(command.costGuardInput);
    if (!isFixtureCostGuardAuthorization(authorization)) {
      throw new CreditLedgerError('cost_guard_denied');
    }

    const requestedCredits = parseAmount(command.amountCredits);
    if (
      authorization.mode !== 'isolated_test_fixture' ||
      authorization.operation !== fixtureOperation ||
      authorization.skuId !== command.costGuardInput.skuId ||
      authorization.credits !== requestedCredits
    ) {
      throw new CreditLedgerError('cost_guard_denied');
    }

    return port.reserve({
      jobId: command.jobId,
      amountCredits: command.amountCredits,
      idempotencyKey: command.idempotencyKey,
      requestId: command.requestId,
      costGuard: {
        skuId: authorization.skuId,
        policyId: authorization.policyId,
        policyVersion: authorization.policyVersion,
        decision: authorization.decision,
        reasonCode: fixtureReasonCode,
        estimatedInternalCost: authorization.estimatedInternalCost,
        maxInternalCost: authorization.maxInternalCost,
      },
    });
  };
}

function parseAmount(value: CreditAmount): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value)) {
    throw new CreditLedgerError('invalid_request');
  }
  try {
    return BigInt(value);
  } catch {
    throw new CreditLedgerError('invalid_request');
  }
}
