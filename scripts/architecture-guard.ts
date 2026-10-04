const admittedProductTables = new Set([
  'platform.project',
  'platform.project_create_idempotency',
  'platform.asset_contract',
  'platform.asset_contract_version',
  'platform.durable_job',
  'platform.job_create_idempotency',
  'platform.job_attempt',
]);

const outOfScopeProductTableTokens = new Set([
  'user',
  'users',
  'project',
  'projects',
  'asset',
  'assets',
  'job',
  'jobs',
  'wallet',
  'credit',
  'credits',
  'ledger',
  'trustshield',
]);

export function findOutOfScopeProductTables(sql: string): string[] {
  const matches = sql.matchAll(
    /\bcreate\s+table\s+(?:if\s+not\s+exists\s+)?(?:(?:"?([a-z_][a-z0-9_]*)"?)\.)?"?([a-z_][a-z0-9_]*)"?/gi,
  );
  const violations = new Set<string>();
  for (const match of matches) {
    const schema = match[1]?.toLowerCase();
    const name = match[2]?.toLowerCase();
    if (!name) continue;
    const qualifiedName = schema ? `${schema}.${name}` : name;
    if (admittedProductTables.has(qualifiedName)) continue;
    if (name.split('_').some((token) => outOfScopeProductTableTokens.has(token))) {
      violations.add(qualifiedName);
    }
  }
  return [...violations].sort((left, right) => left.localeCompare(right));
}
