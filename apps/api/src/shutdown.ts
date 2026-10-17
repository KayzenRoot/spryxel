type SafeShutdownFields = { err: { type: string } };

type SafeErrorLogger = (fields: SafeShutdownFields, message: string) => void;

export async function closeApiSafely(
  close: () => Promise<unknown>,
  logError: SafeErrorLogger,
): Promise<0 | 1> {
  try {
    await close();
    return 0;
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const safeType = /^[A-Za-z][A-Za-z0-9]{0,63}$/.test(errorName) ? errorName : 'Error';
    try {
      logError({ err: { type: safeType } }, 'api shutdown failed');
    } catch {
      // Preserve a failed exit status even if the logger itself is unavailable.
    }
    return 1;
  }
}
