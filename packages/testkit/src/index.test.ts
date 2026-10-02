import { describe, expect, it } from 'vitest';
import { createRunId, waitFor } from './index.js';

describe('disposable service test helpers', () => {
  it('creates unique filesystem and Compose-safe run identifiers', () => {
    const first = createRunId();
    const second = createRunId();
    expect(first).toMatch(/^spryxel-test-[a-f0-9]{12}$/);
    expect(second).not.toBe(first);
  });

  it('polls with a fixed bound and returns the first ready observation', async () => {
    let attempts = 0;
    await expect(
      waitFor(
        async () => ++attempts,
        (value) => value === 2,
        { label: 'test probe', intervalMs: 1, timeoutMs: 100 },
      ),
    ).resolves.toBe(2);
  });
});
