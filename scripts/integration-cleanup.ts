export async function rollbackBeforeRethrowing(
  rollback: () => Promise<unknown>,
  originalError: unknown,
): Promise<never> {
  try {
    await rollback();
  } catch {
    // Keep the integration failure that triggered cleanup as the reported cause.
  }
  throw originalError;
}
