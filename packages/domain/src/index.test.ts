import { describe, expect, it } from 'vitest';
import {
  AssetContractValidationError,
  compileAssetContract,
  canCreateProject,
  nextDurableJobState,
  normalizeProjectName,
  summarizeReadiness,
} from './index.js';

describe('readiness summary', () => {
  it('allows explicitly disabled optional adapters', () => {
    expect(summarizeReadiness([{ name: 'redis', state: 'disabled' }])).toBe('ready');
  });

  it('marks a failed configured dependency unavailable', () => {
    expect(summarizeReadiness([{ name: 'postgres', state: 'unavailable' }])).toBe('unavailable');
  });
});

describe('Asset Contract compiler and durable Job policy', () => {
  it('canonicalizes property order and Unicode before hashing', () => {
    const first = compileAssetContract({
      skuId: 'SKU-001',
      specification: { z: 1, label: 'Cafe\u0301', nested: { b: true, a: 2 } },
    });
    const second = compileAssetContract({
      skuId: 'SKU-001',
      specification: { nested: { a: 2, b: true }, label: 'Café', z: 1 },
    });
    expect(first.canonicalSpecification).toBe(second.canonicalSpecification);
    expect(first.specificationSha256).toBe(second.specificationSha256);
    expect(first.requestSha256).toBe(second.requestSha256);
  });

  it('rejects unknown catalog IDs, excessive envelopes, and non-JSON values', () => {
    expect(() => compileAssetContract({ skuId: 'SKU-999', specification: {} })).toThrow(
      AssetContractValidationError,
    );
    expect(() =>
      compileAssetContract({ skuId: 'SKU-001', specification: { text: 'x'.repeat(65_537) } }),
    ).toThrow(AssetContractValidationError);
    expect(() =>
      compileAssetContract({ skuId: 'SKU-001', specification: { value: Number.NaN } }),
    ).toThrow(AssetContractValidationError);
  });

  it('enforces the finite state machine and bounded retry path', () => {
    expect(nextDurableJobState('queued', 'claim')).toBe('running');
    expect(nextDurableJobState('running', 'retry')).toBe('queued');
    expect(nextDurableJobState('running', 'request_cancel')).toBe('cancel_requested');
    expect(nextDurableJobState('cancel_requested', 'finish_cancel')).toBe('cancelled');
    expect(() => nextDurableJobState('succeeded', 'claim')).toThrow();
  });
});

describe('project policy and normalization', () => {
  it('allows creation only for privileged active-tenant roles', () => {
    expect(canCreateProject('OWNER')).toBe(true);
    expect(canCreateProject('ADMIN')).toBe(true);
    expect(canCreateProject('MEMBER')).toBe(false);
  });

  it('normalizes whitespace and Unicode composition consistently', () => {
    expect(normalizeProjectName('  Cafe\u0301   Quest  ')).toBe('Café Quest');
  });
});
