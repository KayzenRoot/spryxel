# Source Hierarchy

Status: CANONICAL

## Authority
When sources conflict, use this order:
1. CHECKPOINT (machine then human projection)
2. Decisions Ledger / approved ADRs
3. Scope
4. Definition of Done
5. Architecture
6. Requirements
7. Specialized canonical sources: Security, Billing/Economics, Data Model, API Contracts, UI/UX, Integration Contracts, Model/Inference Strategy, Test/Benchmark Plan, Deployment, Backlog
8. Immutable migration/source evidence
9. Issue/PR descriptions and conversational context

Actual Git state, code, tests and provider evidence control descriptive facts. They do not silently override approved normative decisions.

## Product Master migration
`.engineering/source-seeds/SPRYXEL-PRODUCT-MASTER-v0.6.0.md` is immutable historical migration evidence. Its approved decisions were decomposed by `SPRYXEL-WO-002` and objectively audited. After checkpoint promotion, the repository Source Pack above is canonical. The seed may be used for traceability but is not an alternate mutable source of current truth.

## Staleness
A Work Order/Context Lock is STALE if its base SHA changes or a critical authority changes after compilation outside its admitted correction/audit flow. Completed Context Locks are also marked STALE after canonical promotion and must not be reused.

## Current bindings
- Repository: `KayzenRoot/spryxel`
- GEF package: `@gef-bootstrap/cli@1.1.1`
- GEF v1.1.1 immutable release source: `KayzenRoot/gef-bootstrap@1dc030f1358eab0347043a3d54c7fc311c7c2123`
- Product seed: v0.6.0 / `cbb93ec44886eba6cc9b24a072eb23e0ad5ea05a`
- Last objectively approved Work Order: `SPRYXEL-WO-003`
- Next legal stage after safe merge: a separately admitted implementation-planning Work Order with a new Context Lock

Post-release commits in the GEF repository may be consulted only for evidence about publication/rollout. They do not redefine the installed v1.1.1 runtime contract.
