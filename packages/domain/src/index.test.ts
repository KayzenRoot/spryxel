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

  it('orders canonical keys by locale-independent UTF-16 code units', () => {
    const compiled = compileAssetContract({
      skuId: 'SKU-001',
      specification: { ä: 1, z: 2, a: 3 },
    });

    expect(compiled.canonicalSpecification).toBe('{"a":3,"z":2,"ä":1}');
  });

  it('rejects unknown catalog IDs, excessive envelopes, and non-JSON values', () => {
    expect(() => compileAssetContract({ skuId: 'SKU-999', specification: {} })).toThrow(
      AssetContractValidationError,
    );
    const oversizedEnvelope = Object.fromEntries(
      Array.from({ length: 17 }, (_, index) => [`field-${index}`, 'x'.repeat(4_096)]),
    );
    expect(() =>
      compileAssetContract({ skuId: 'SKU-001', specification: oversizedEnvelope }),
    ).toThrow(expect.objectContaining({ code: 'specification_too_large' }));
    expect(() =>
      compileAssetContract({ skuId: 'SKU-001', specification: { value: Number.NaN } }),
    ).toThrow(AssetContractValidationError);
  });

  it('rejects strings and keys PostgreSQL jsonb cannot represent', () => {
    for (const value of ['\u0000', '\ud800', '\udc00']) {
      expect(() => compileAssetContract({ skuId: 'SKU-001', specification: { value } })).toThrow(
        AssetContractValidationError,
      );
      expect(() =>
        compileAssetContract({ skuId: 'SKU-001', specification: { [value]: 1 } }),
      ).toThrow(AssetContractValidationError);
    }
  });

  it('accepts JSONB-valid prototype-like keys and rejects NFC-normalized collisions', () => {
    const prototypeLikeKeys = JSON.parse(
      '{"__proto__":{"safe":true},"constructor":"ok"}',
    ) as unknown;
    const compiled = compileAssetContract({ skuId: 'SKU-001', specification: prototypeLikeKeys });
    expect(compiled.canonicalSpecification).toBe('{"__proto__":{"safe":true},"constructor":"ok"}');
    expect(Object.getPrototypeOf(compiled.specification)).toBeNull();

    const collidingKeys = Object.assign({}, { 'e\u0301': 1, é: 2 });
    expect(() => compileAssetContract({ skuId: 'SKU-001', specification: collidingKeys })).toThrow(
      expect.objectContaining({ code: 'invalid_specification' }),
    );
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
