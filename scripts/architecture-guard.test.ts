import { describe, expect, it } from 'vitest';
import { findOutOfScopeProductTables } from './architecture-guard.js';

describe('migration architecture guard', () => {
  it('admits the existing tables and exact Project DNA and Asset Core tables', () => {
    expect(
      findOutOfScopeProductTables(`
        CREATE TABLE platform.project (id uuid);
        CREATE TABLE platform.project_create_idempotency (project_id uuid);
        CREATE TABLE platform.asset_contract (id uuid);
        CREATE TABLE platform.asset_contract_version (contract_id uuid);
        CREATE TABLE platform.durable_job (id uuid);
        CREATE TABLE platform.job_create_idempotency (job_id uuid);
        CREATE TABLE platform.job_attempt (id uuid);
        CREATE TABLE platform.credit_wallet (id uuid);
        CREATE TABLE platform.credit_lot (id uuid);
        CREATE TABLE platform.credit_reservation (id uuid);
        CREATE TABLE platform.credit_event (id uuid);
        CREATE TABLE platform.credit_ledger_entry (id uuid);
        CREATE TABLE platform.credit_integrity_incident (id uuid);
        CREATE TABLE platform.project_dna (id uuid);
        CREATE TABLE platform.project_dna_version (id uuid);
        CREATE TABLE platform.asset (id uuid);
        CREATE TABLE platform.asset_version (id uuid);
        CREATE TABLE platform.asset_version_lineage (id uuid);
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

  it.each([
    'public.asset',
    'public.project_dna',
    'platform.assets',
    'platform.project_dnas',
    'platform.project_dna_versions',
    'platform.asset_versions',
    'platform.asset_version_lineages',
    'platform.unapproved_asset',
  ])('rejects unauthorized schema or near-match table %s', (tableName) => {
    expect(findOutOfScopeProductTables(`CREATE TABLE ${tableName} (id uuid);`)).toEqual([
      tableName,
    ]);
  });
});
