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
- Active development framework: repository-native build-first GitHub PRs + product-specific tests, no GEF CLI.
- Historical GEF v1.1.1 release record: archived provenance only, not an active execution dependency or prerequisite.
- Product seed: v0.6.0 / `cbb93ec44886eba6cc9b24a072eb23e0ad5ea05a`
- Last **fully** completed Work Order: `SPRYXEL-WO-009 / SPRYXEL-IMP-005`; `v11.lastApprovedWorkOrder=SPRYXEL-WO-009` retains that historical full-WO identity.
- Latest bounded canonical promotion: `SPRYXEL-WO-010 / SPRYXEL-IMP-006-PHASE-1-AB`, **Phase 1 A+B only**, on protected PR #102; the full WO-010 remains INCOMPLETE.
- Next legal implementation: DNA + Asset Core Phase C, `NOT_ADMITTED` until a separately admitted new Work Order and Context Lock; Phases D/E also `NOT_ADMITTED`.

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


## Identity/Tenancy auth-provider binding

D-156…D-161 select WorkOS AuthKit as the V1 external human authentication/session provider and preserve Spryxel PostgreSQL as the canonical tenant authorization/membership/RLS authority.

`.engineering/AUTH-PROVIDER-PREFLIGHT.md` is the current provider-evidence record. Exact SDK versions are not frozen by this planning decision and must be revalidated/pinned by the admitted Identity/Tenancy Work Order.

If current implementation-time evidence materially invalidates the provider, execution must stop BLOCKED and return to an explicit decision update rather than silently substituting.

## SPRYXEL-WO-006 canonical implementation binding

`SPRYXEL-IMP-002 — Identity/Tenancy security baseline` is objectively approved on exact audited head `8e4f5b16883bf03a29893783032a00d31753457b`. Git/code/tests prove the WorkOS/AuthKit authentication/session edge, Spryxel-owned identity/tenant/membership authority, PostgreSQL RLS, bootstrap, JWT/JWKS verification, bounded session operations and durable revocation reconciliation. D-001…D-161 remain normative and unchanged.

The historical WO-006 Context Lock becomes closed/stale at canonical promotion and must not be reused. Projects + canonical shell/Home requires its own Work Order and fresh Context Lock after merge/post-merge closeout.

## SPRYXEL-WO-006 completion binding

`SPRYXEL-WO-006 / SPRYXEL-IMP-002` is COMPLETE on `main@814abd6ab27b2a4c4549a1941a713e1c6cae69bd` after objective audit, promotion head `12a87d0a83907426acaaa208419f5a00b0f8007b`, squash merge and post-merge validation. Identity/Tenancy is implemented/canonical.

The historical WO-006 Context Lock is STALE/closed and must not be reused. The next legal implementation stage is Projects + canonical shell/Home under a new admitted Work Order and fresh Context Lock.

## SPRYXEL-WO-007 canonical implementation binding

`SPRYXEL-IMP-003 — Projects + canonical shell/Home` is objectively approved on exact audited head `a64b76c858f9e72e462478d910655b3d69d85ec6`. Git/code/tests prove tenant-owned Projects, application membership authorization, forced PostgreSQL RLS, write-once project-create idempotency, `project.created` audit evidence, Global Shell, Home/Command Center, Projects list/create/select and minimal Project Overview. D-001…D-161 remain normative and unchanged.

The historical WO-007 Context Lock becomes closed/stale at canonical promotion and must not be reused. Asset Contract + durable Job backbone requires its own Work Order and fresh Context Lock after merge/post-merge closeout.

## SPRYXEL-WO-007 completion binding

`SPRYXEL-WO-007 / SPRYXEL-IMP-003` is COMPLETE on `main@67debfaca7cae164872a06a30faebb43daf34425` after objective audit, promotion head `4d2d2fad3e1d74a8311420f7c403cfed015582b1`, squash merge and post-merge validation. Projects + canonical shell/Home are implemented/canonical.

The historical WO-007 Context Lock is STALE/closed and must not be reused. The next legal implementation stage is Asset Contract + durable Job backbone under a new admitted Work Order and fresh Context Lock.

## SPRYXEL-WO-008 completion binding

`SPRYXEL-WO-008 / SPRYXEL-IMP-004` is COMPLETE on `main@75054119d4f0f110ed766b8094f1d3c1f17e59f3`, after independent APPROVED on candidate `fe54bfac66bcb85c10d56c4c8a0c9c7526bec624`, checkpoint promotion `2e3d9cdd09ed1ff31655183e54f6d23bd3c0716e`, PR #30 protected squash merge, and exact-main post-merge validation. The 4 required checks, Sonar Quality Gate, and Socket Project Report passed on that exact `main` SHA. The tested tree exactly matches the merged tree. PostgreSQL-canonical immutable Asset Contracts and Job/Attempt state, reconstructable transient Redis/BullMQ, the separate least-privilege worker, and bounded recovery/cancellation are canonical implementation. D-001…D-161 remain unchanged.

The WO-008 Context Lock is closed/stale after canonical promotion and must not be reused.

## SPRYXEL-WO-009 completion binding

`SPRYXEL-WO-009 / SPRYXEL-IMP-005 — Credit Ledger + CostGuard authorization foundation` is COMPLETE on merged `main@f1ce1df2dad7aabb45dd7d725d31821f30e21a2c` after independent HIGH_ASSURANCE APPROVAL of code candidate `6cbd9210573815c82f0af60d274c41f31ef0b2bb`, PR #87 protected squash merge from reviewed PR head `3f14441ac48d0067dfad8214ba29dfcb2e285a8a`, and successful exact-main required/security/quality checks. The merged tree `efee1dca1a54942f35ab5d0f227e3f0d24919ad8` equals the reviewed PR tree. Audit scope, AC01–AC28 results, known limits and post-merge receipts are recorded in `.engineering/evidence/SPRYXEL-WO-009-INDEPENDENT-AUDIT.md` and `.engineering/evidence/SPRYXEL-WO-009-EVIDENCE.md`.

The historical WO-009 Context Lock remains unchanged and is stale/closed after merge; it must not be reused. Credit Ledger + CostGuard is a non-commercial authorization foundation: CostGuard defaults to DENY, paid balance/spend and providers remain inactive/unfrozen, and no real-cost execution is enabled. The next NECESSARY increment is Spryxel DNA + Asset core, NOT_ADMITTED until a new Work Order and Context Lock are created from the then-current `main` base.


## SPRYXEL-WO-010 — bounded Phase 1 A+B post-checkpoint binding (2026-10-19)

Phase 1 A+B (contracts/domain/PostgreSQL RLS) was integrated in PR #98 (audited code HEAD `0ba0b78b15a533186415bfd6c4c5ae1354d357c8`, main `7d0700921933d91d266d763ea17d8c9b632e9446`). The evidence documentation followed via PR #101 (main `17e093491fd5365cfdced15d7930b68fa3a37bb5`). The owner expressly authorized the exact bounded Checkpoint literals/HEAD/base and protected squash PR #102, following a separate objective checkpoint-candidate review. The checkpoint was promoted on `main@81990f5492ca91a7d433f81a8a28e11d8945ac67` (tree `8966160d30b54910d118f6d63353c7a5c39dbfff`). This **does not** close the full WO-010.

Six post-promotion GitHub check runs on exact `main@81990f5492ca91a7d433f81a8a28e11d8945ac67` completed successfully: Repository validation `118285294072`, Pipeline integrity `118285294478`, Gitleaks secrets `118285294504`, Trivy filesystem and configuration `118285294382`, SonarCloud Code Analysis `118285643469`, Socket Security: Project Report `118285298723`. These are hosted receipts, not new local/database test runs.

The versioned `.engineering/evidence/SPRYXEL-WO-010-INDEPENDENT-AUDIT.md` is a **historical** Phase A+B technical review; its then-pending checkpoint-promotion verdict must be interpreted in its original time context. The later checkpoint-specific objective candidate disposition is recorded in [PR #102](https://github.com/KayzenRoot/spryxel/pull/102). This documentation-only closeout proposes `STALE` closure of the completed execution Context Lock while preserving historical critical-source fingerprints and original preflight decision fields. The lock becomes canonically closed only if this separate closeout PR is reviewed and owner-authorized for protected merge.

Checkpoint `SPRYXEL_WO_010_PHASE_1_AB_COMPLETE` records *only A+B*. `v11.lastApprovedWorkOrder` remains WO-009 as expressly ratified; Phase C/D/E are NOT_ADMITTED, CostGuard remains `DENY`, real-cost execution remains `PROHIBITED` and public upload, production generation and commercial activation remain disabled. Do not infer deploy, release, model/provider selection, funding, full WO closure or future implementation admission.

## Post-GEF operational supersession (owner-directed, 2026-10-20)

This Source Pack is a **product-domain reference**, not an admission/Context Lock dependency for new ordinary code changes. Original GEF/Work Order/Context Lock/Checkpoint enforcement wording below documents the historical execution model and remains traceable, not active instructions. Current workflow is `AGENTS.md` + `docs/BUILD_FIRST.md` + GitHub PR/CI. Preserve existing product authorization, RLS, secret handling, cost guard and no-production-deploy boundaries; removing a tool does not permit bypassing security. Old evidence and Checkpoint remain read-only history. GitHub rulesets are separately configured in GitHub Settings and are not removed by this document.
