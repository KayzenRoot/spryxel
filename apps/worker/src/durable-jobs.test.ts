import { describe, expect, it } from 'vitest';
import {
  createRateLimitedQueueErrorReporter,
  parseJobReference,
  timeBudgetExceeded,
  workerRedisConnectionOptions,
} from './durable-jobs.js';

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

  it('keeps BullMQ blocking Redis commands free of command timeouts', () => {
    expect(workerRedisConnectionOptions()).toEqual({
      maxRetriesPerRequest: null,
      connectTimeout: 2_000,
    });
  });

  it('reports queue and worker errors with per-source rate limits and safe details', () => {
    const outcomes: Array<{ fields: Record<string, unknown>; message: string }> = [];
    let timestamp = 100_000;
    const report = createRateLimitedQueueErrorReporter(
      (fields, message) => outcomes.push({ fields, message }),
      () => timestamp,
      60_000,
    );
    const error = new Error('redis://user:private-password@localhost:6379/0');
    error.name = 'ReplyError';

    report('worker', error);
    report('worker', new Error('second failure is suppressed'));
    report('queue', error);
    timestamp += 59_999;
    report('worker', error);
    timestamp += 1;
    report('worker', error);

    expect(outcomes.map((outcome) => outcome.fields)).toEqual([
      { event: 'jobs.worker_error', errorType: 'ReplyError' },
      { event: 'jobs.queue_error', errorType: 'ReplyError' },
      { event: 'jobs.worker_error', errorType: 'ReplyError' },
    ]);
    expect(JSON.stringify(outcomes)).not.toContain('private-password');
  });
});
