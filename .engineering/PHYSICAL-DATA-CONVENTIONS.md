# Physical Data Conventions

Status: CANONICAL — SPRYXEL-WO-004 / SPR-PLAN-007 approved by objective audit.

These conventions govern later physical schemas; they do not define or create product tables. The conceptual entities and financial/security invariants in [DATA-MODEL.md](DATA-MODEL.md), [BILLING-ECONOMICS.md](BILLING-ECONOMICS.md) and [SECURITY.md](SECURITY.md) remain authoritative. Exact table inventory and per-entity nullable/retention/deletion semantics require implementation-specific review.

## Naming, time and identity

- Use `snake_case` for schema, table, column, index, constraint and migration identifiers. Prefer explicit names over ORM-generated opaque names.
- Store event/creation/update instants as PostgreSQL `timestamptz`; write UTC instants and format for locale only at the presentation edge. Do not encode a local wall-clock timestamp as an authoritative instant.
- New durable product identifiers use UUIDv7-compatible opaque IDs. Provider IDs are stored as provider-scoped immutable references. Human-readable slugs are mutable aliases and never authorization keys.
- Use explicit foreign keys and uniqueness constraints for identity relationships and idempotency. Define `ON DELETE` behavior intentionally; avoid cascades that erase audit, ledger, provenance or ownership evidence.

## Numeric and financial representation

- Store credits as nonnegative integer units with explicit bounds and currency/credit unit in each contract.
- Store authoritative money as integer minor units with explicit ISO currency where the currency scale is fixed, or a documented fixed-precision `numeric(p,s)` where the domain requires a controlled decimal scale. Never use binary floating point for authoritative money, credits, exchange rates or posted ledger facts.
- Keep payment, wallet, credit-lot, reservation and ledger state distinct. A posted ledger fact is immutable. Corrections, refunds and reversals are appended as linked compensating entries with actor/reason/reference and audit context.
- Every amount conversion, rounding rule, rate version and unit is explicit; derive display values from canonical storage rather than writing rounded UI values back.

## Tenant ownership and row security

- The first tenant-owned business table must carry explicit tenant/project ownership. Composite uniqueness and foreign-key design should make cross-tenant references difficult to express.
- Apply application-level authorization and PostgreSQL RLS where applicable; neither substitutes for the other. Use a transaction-scoped principal/tenant context and ensure pooled connections cannot retain another request's context.
- RLS policies default deny and cover reads, writes and relationship joins. Migration owners document the roles that bypass RLS (normally none for application roles); no client-supplied tenant ID alone is proof of access.
- Integration tests use separate tenant fixtures to prove reads, updates, deletes and indirect joins cannot cross the boundary. UI filtering is not a security control.
- Global/system-owned rows are explicitly distinguished from tenant-owned rows and have narrow service-level access.

## Migrations and schema evolution

- Use reviewed, checked-in SQL migrations with typed Drizzle-compatible access. Migration history is the schema change record; no production `db push`, schema-sync or implicit auto-migration.
- Migrations are forward-only in deployment. Each change explains safe rollout order, lock/availability impact, backfill bounds, data compatibility, verification and a roll-forward or risk-appropriate recovery path. Destructive/data-loss work requires a separately admitted migration/recovery Work Order.
- Do not rewrite an applied migration. Add a corrective migration. Use expand/contract when old and new application versions may overlap.
- Put invariants near their source of truth: `NOT NULL`, `CHECK`, uniqueness, foreign keys and indexes in PostgreSQL; mirror relevant input validation at application boundaries.
- Keep database rows distinct from versioned API schemas. ORM types do not become the public contract by accident.

## Nullability, soft deletion and retention

- Every nullable column documents what absence means, which actor can produce it, and whether absence is valid for the entity lifecycle. Prefer explicit state over several correlated nullable columns.
- Soft deletion is not the default. Choose hard deletion, tombstone/soft-delete or anonymization per entity based on legal, security and provenance requirements; specify uniqueness behavior and whether deleted data remains queryable.
- Ledger, security, audit, provenance and dispute evidence follow their own immutable/retention controls. Legal hold and processor deletion behavior are explicit; user-facing deletion cannot erase records that must be retained by an approved obligation.
- Minimize raw sensitive identifiers; use provider references or purpose-bound pseudonymous tokens where canonical Security rules permit.

## Indexes and operational safety

- Index foreign keys and measured access paths; make tenant-leading composite indexes explicit where query and RLS patterns require them. Add uniqueness to enforce idempotency keys and external-event replay control.
- Every new index includes a query/constraint reason and an online/locking consideration. Avoid speculative indexes with no bounded owner.
- Large backfills are resumable, observable, rate-limited and bounded. Migration diagnostics must not log row payloads, credentials or prohibited TrustShield details.

## Physical schema remains open

This contract freezes conventions only. It does not choose the final product tables, full entity field lists, partitioning/retention implementation, exact PostgreSQL hosting/provider, auth schema or billing schema. Those details are planned in the corresponding implementation Work Orders and must preserve the conceptual model and the tenant, ledger and privacy invariants above.
