import { describe, expect, it, vi } from 'vitest';
import { closeApiSafely } from './shutdown.js';

describe('API signal shutdown', () => {
  it('logs a safe structured error and returns a non-zero exit code when close fails', async () => {
    const logError = vi.fn();
    const close = vi.fn(async () => {
      throw new Error('connection string contains private credentials');
    });

    await expect(closeApiSafely(close, logError)).resolves.toBe(1);
    expect(logError).toHaveBeenCalledWith({ err: { type: 'Error' } }, 'api shutdown failed');
    expect(JSON.stringify(logError.mock.calls)).not.toContain('private credentials');
  });

  it('returns a successful exit code after a clean close', async () => {
    const logError = vi.fn();
    const close = vi.fn(async () => {});

    await expect(closeApiSafely(close, logError)).resolves.toBe(0);
    expect(close).toHaveBeenCalledOnce();
    expect(logError).not.toHaveBeenCalled();
  });
});
