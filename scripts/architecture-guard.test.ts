import { describe, expect, it } from 'vitest';
import { findOutOfScopeProductTables } from './architecture-guard.js';

describe('migration architecture guard', () => {
  it('admits only the project, durable Job, and credit ledger tables authorized through IMP-005', () => {
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
