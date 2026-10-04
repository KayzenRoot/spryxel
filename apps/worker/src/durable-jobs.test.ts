import { describe, expect, it } from 'vitest';
import { parseJobReference, timeBudgetExceeded } from './durable-jobs.js';

describe('durable queue projection boundary', () => {
  it('accepts only a versioned UUIDv7 durable reference', () => {
    expect(
      parseJobReference({
        jobId: '0190f000-0000-7000-8000-000000000001',
        schemaVersion: 'job-reference.v1',
      }),
    ).toEqual({ jobId: '0190f000-0000-7000-8000-000000000001', schemaVersion: 'job-reference.v1' });
    expect(
      parseJobReference({
        jobId: '0190f000-0000-7000-8000-000000000001',
        schemaVersion: 'job-reference.v1',
        contract: { raw: true },
      }),
    ).toBeNull();
    expect(
      parseJobReference({
        jobId: '0190f000-0000-4000-8000-000000000001',
        schemaVersion: 'job-reference.v1',
      }),
    ).toBeNull();
    expect(
      parseJobReference({ jobId: '0190f000-0000-7000-8000-000000000001', schemaVersion: 'future' }),
    ).toBeNull();
  });

  it('stops bounded work when its hard time budget is reached or its clock is invalid', () => {
    expect(timeBudgetExceeded(10, 5_000, 5_009)).toBe(false);
    expect(timeBudgetExceeded(10, 5_000, 5_010)).toBe(true);
    expect(timeBudgetExceeded(Number.NaN, 5_000, 10)).toBe(true);
    expect(timeBudgetExceeded(10, 0, 10)).toBe(true);
  });
});
