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
- Last objectively approved Work Order: `SPRYXEL-WO-005`
- Next legal stage: Identity/Tenancy security baseline under a new admitted Work Order and Context Lock

Post-release commits in the GEF repository may be consulted only for evidence about publication/rollout. They do not redefine the installed v1.1.1 runtime contract.

## SPR-PLAN-007 canonical source bindings

SPRYXEL-WO-004 / SPR-PLAN-007 was objectively audited and promoted. D-123…D-153 and the implementation-planning documents are canonical; they do not supersede or edit D-001…D-122. The historical execution Context Lock is stale/closed after promotion.

Within this increment, the authority order above still applies. The Decisions Ledger owns the decision IDs; `IMPLEMENTATION-ARCHITECTURE.md` integrates process/domain boundaries; `RUNTIME-STACK.md`, `REPOSITORY-TOPOLOGY.md`, `PHYSICAL-DATA-CONVENTIONS.md`, `API-FOUNDATION-CONTRACT.md`, `LOCAL-DEVELOPMENT.md`, `IMPLEMENTATION-SEQUENCE.md` and `FIRST-IMPLEMENTATION-SLICE.md` detail those decisions; the dependency/open-choice matrix captures edge rules and intentional deferrals. These files are canonical planning, not implemented state. The immutable v0.6.0 seed, GEF 1.1.1 release and `.gef` baseline remain unchanged.


## SPRYXEL-WO-005 preflight supersession binding

Current external maintenance/security evidence discovered during the first IMP-001 preflight invalidated the MinIO-specific local/test implementation named by D-142/D-148. D-154/D-155 preserve those historical decisions and explicitly supersede only their MinIO-specific local-service clauses.

For current implementation work:
- private S3-compatible/provider-neutral storage remains the architectural contract;
- SeaweedFS is the current local/test S3-compatible implementation direction;
- production object-storage provider remains NOT FROZEN;
- exact SeaweedFS release/image digest/provenance must be revalidated and pinned by the recompiled IMP-001 preflight;
- the stale WO-005 Context Lock must not be reused.


## SPRYXEL-WO-005 canonical implementation binding

SPRYXEL-IMP-001 is objectively approved as the bounded platform foundation. Git/code/tests now prove the technical workspace, runtime boundaries, local infrastructure, migration harness, observability and test architecture described by the planning sources. D-001…D-155 remain normative and unchanged.

The historical SPRYXEL-WO-005 R2 Context Lock is closed/stale after promotion and must not be reused. Identity/Tenancy requires a new Work Order/Context Lock and a current auth-provider decision/preflight before code.


## SPRYXEL-WO-005 completion binding

`SPRYXEL-WO-005 / SPRYXEL-IMP-001` is COMPLETE on `main@6dbce3f1ba1e5b85a6e6ea40083e2d4418755261` after objective audit, canonical promotion and post-merge validation. The platform foundation is implemented/canonical; Identity/Tenancy remains the next legal slice and requires a new Work Order/Context Lock plus current auth-provider preflight.

The historical WO-005 R2 Context Lock remains STALE/closed and must not be reused.
