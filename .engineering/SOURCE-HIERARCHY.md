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

## SPR-PLAN-007 candidate source bindings

SPRYXEL-WO-004 / SPR-PLAN-007 is admitted on PR #14, branch `codex/spryxel-wo-004-implementation-planning`, against `main@85173742325fa67fb6b4ea19e62871196eb7c210`, under `.engineering/context-locks/SPRYXEL-WO-004.json`. The new D-123…D-153 entries in the Decisions Ledger and implementation documents are a candidate for audit and do not supersede or edit D-001…D-122. The checkpoint stays unchanged until authorized promotion.

Within this increment, the authority order above still applies. The Decisions Ledger owns the decision IDs; `IMPLEMENTATION-ARCHITECTURE.md` integrates process/domain boundaries; `RUNTIME-STACK.md`, `REPOSITORY-TOPOLOGY.md`, `PHYSICAL-DATA-CONVENTIONS.md`, `API-FOUNDATION-CONTRACT.md`, `LOCAL-DEVELOPMENT.md`, `IMPLEMENTATION-SEQUENCE.md` and `FIRST-IMPLEMENTATION-SLICE.md` detail those decisions; the dependency/open-choice matrix captures edge rules and intentional deferrals. These files remain candidate planning, not implemented state. The immutable v0.6.0 seed, GEF 1.1.1 release and `.gef` baseline remain unchanged.
