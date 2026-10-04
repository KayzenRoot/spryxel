import { describe, expect, it, vi } from 'vitest';
import { rollbackBeforeRethrowing } from './integration-cleanup.js';

describe('integration transaction cleanup', () => {
  it('preserves the original failure when rollback also fails', async () => {
    const originalError = new Error('RLS regression is the root failure');
    const rollback = vi.fn().mockRejectedValue(new Error('connection already closed'));

    await expect(rollbackBeforeRethrowing(rollback, originalError)).rejects.toBe(originalError);
    expect(rollback).toHaveBeenCalledTimes(1);
    expect(rollback).toHaveBeenCalledWith();
  });
});
