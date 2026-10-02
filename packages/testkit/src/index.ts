import { randomBytes } from 'node:crypto';

export function createRunId(prefix = 'spryxel-test'): string {
  const normalized = prefix
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .slice(0, 24);
  return `${normalized}-${randomBytes(6).toString('hex')}`;
}

export async function waitFor<T>(
  action: () => Promise<T>,
  isReady: (value: T) => boolean,
  options: { timeoutMs?: number; intervalMs?: number; label: string },
): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const intervalMs = options.intervalMs ?? 500;
  const deadline = Date.now() + timeoutMs;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const value = await action();
      if (isReady(value)) return value;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  const reason = lastError instanceof Error ? lastError.name : 'not ready';
  throw new Error(`Timed out waiting for ${options.label} (${reason})`);
}
