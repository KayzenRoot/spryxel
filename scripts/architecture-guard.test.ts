import { describe, expect, it } from 'vitest';
import { findOutOfScopeProductTables } from './architecture-guard.js';

describe('migration architecture guard', () => {
  it('admits only the project tables in the current implementation slice', () => {
    expect(
      findOutOfScopeProductTables(`
        CREATE TABLE platform.project (id uuid);
        CREATE TABLE platform.project_create_idempotency (project_id uuid);
      `),
    ).toEqual([]);
    expect(findOutOfScopeProductTables('CREATE TABLE public.project (id uuid);')).toEqual([
      'public.project',
    ]);
  });

  it('continues rejecting product domains reserved for later slices', () => {
    expect(
      findOutOfScopeProductTables(`
        CREATE TABLE platform.assets (id uuid);
        CREATE TABLE platform.durable_jobs (id uuid);
        CREATE TABLE platform.credit_ledger (id uuid);
      `),
    ).toEqual(['platform.assets', 'platform.credit_ledger', 'platform.durable_jobs']);
  });
});
