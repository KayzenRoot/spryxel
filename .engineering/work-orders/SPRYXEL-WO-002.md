# SPRYXEL-WO-002 — Import Product Master v0.6.0 & Canonical Source Pack Decomposition

Tracking issue: #7

# SPRYXEL-WO-002 — Import Product Master v0.6.0 & Canonical Source Pack Decomposition

**Status:** APPROVED  
**Risk:** ELEVATED  
**Repository:** `KayzenRoot/spryxel`  
**Execution base:** `main@0a90e1c93d81f6f0ac861847a5434030d96f0307`  
**GEF:** `@gef-bootstrap/cli@1.1.1`

## OBJECTIVE
Migrate the approved pre-repository product truth from `SPRYXEL-PRODUCT-MASTER-v0.6.0.md` into the repository and decompose it into the canonical GEF Source Pack without re-planning, weakening, silently changing, or inventing product decisions.

The imported master is a migration seed/historical authority for pre-repository approved decisions. After decomposition and audit, the repository Source Pack becomes the canonical authority.

## SOURCE CHECK
The current repository checkpoint correctly records that governance bootstrap is complete and product implementation has not started, but the repository product documents still contain placeholder/TBD product state because the pre-repository master had not yet been imported.

The master explicitly states that once the repository exists it becomes the seed for decomposition into Requirements, Scope, Architecture, Security, Billing/Economics, Data Model, API Contracts, UI/UX, Test Plan, Deployment, Backlog, Definition of Done, Decisions Ledger/ADRs and Checkpoint.

The master records approved planning through `SPR-PLAN-005` and identifies `SPR-PLAN-006 — Product UX, Design System & Information Architecture` as the next NECESSARY planning increment.

## AUTHORITATIVE SEED
Expected repository snapshot:
`.engineering/source-seeds/SPRYXEL-PRODUCT-MASTER-v0.6.0.md`

Expected source identity:
- version: `0.6.0`
- date: `2026-10-01`
- SHA-256: `1c2bf605cb4851300e7f1cc64071b1eaa4cf6d814187dcc95ebe7366d5ec2a8e`
- size: `238278` bytes
- lines: `12447`

The source snapshot is immutable migration evidence. Do not rewrite it.

## SCOPE
1. Validate Context Lock, execution base and source-seed fingerprint before mutation.
2. Read the entire master, not selected snippets.
3. Build a decision/increment extraction inventory before editing canonical files.
4. Preserve all explicitly APPROVED decisions and statuses from the master, including stable decision IDs.
5. Reconcile current repository placeholders/TBD statements with the imported approved master; do not treat placeholder absence as permission to discard prior approved decisions.
6. Decompose the master into canonical repository sources, updating existing files and adding specialized documents where necessary:
   - PROJECT-OVERVIEW.md
   - REQUIREMENTS.md
   - SCOPE.md
   - ARCHITECTURE.md
   - SECURITY.md
   - TEST-BENCHMARK-PLAN.md
   - DEPLOYMENT.md
   - BACKLOG.md
   - DEFINITION-OF-DONE.md
   - DECISIONS-LEDGER.md
   - CHECKPOINT.json / CHECKPOINT.md only as a proposed delta until audit
   - BILLING-ECONOMICS.md
   - DATA-MODEL.md
   - API-CONTRACTS.md
   - UI-UX.md
   - INTEGRATION-CONTRACTS.md
   - MODEL-INFERENCE-STRATEGY.md or equivalent if required by the master
7. Preserve the product identity and constraints already approved in the master, including:
   - AI Game Asset Platform, not a generic image generator;
   - game project / visual universe as the fundamental unit;
   - primary users: indie/solo developers, vibe coders, small AI-native studios, coding-agent users, technical artists/designers;
   - local-first Docker development with RTX 5050 8 GB baseline;
   - English default UI plus pt-BR and Spanish;
   - V1 focus on Pixel + 2D while remaining architecture-ready for 2.5D/3D;
   - Godot + Unity initial engine export targets;
   - API + MCP + basic CLI;
   - Model Router abstraction;
   - Spryxel DNA, Asset Graph, CostGuard, TrustShield, RevenueShield, QA, AgentBridge/automation and engine/export boundaries;
   - generation economics based on bounded cost and cost per accepted production asset;
   - no commercial price freeze before measured benchmarks;
   - all existing security/trust/anti-abuse decisions through SPR-PLAN-005.
8. Preserve scope classifications NECESSARY / IMPORTANT / FUTURE / OUT OF SCOPE as stated by the master.
9. Preserve the completed planning history through `SPR-PLAN-005`; do not rerun those rounds.
10. Set the proposed next legal planning increment to `SPR-PLAN-006 — Product UX, Design System & Information Architecture`.
11. Produce a migration matrix mapping master sections/decisions to canonical repository files.
12. Produce an Evidence Bundle and proposed Checkpoint Delta.

## OUT OF SCOPE
- Product implementation/code.
- Executing SPR-PLAN-006.
- Choosing new technologies not already approved in the master.
- Freezing commercial pricing.
- Running AI/model benchmarks.
- Changing GEF 1.1.1.
- Modifying ruleset/provider governance except read-only validation.
- Editing `.gef`.
- Rewriting history or force-pushing.
- Deleting or condensing approved decisions merely to make documents shorter.
- Treating the master as disposable before every approved item is mapped.

## FILES / SOURCES TO READ
### MUST_READ
- entire `.engineering/source-seeds/SPRYXEL-PRODUCT-MASTER-v0.6.0.md`
- `.engineering/source-seeds/SPRYXEL-PRODUCT-MASTER-v0.6.0.manifest.json`
- `.engineering/CHECKPOINT.json`
- `.engineering/CHECKPOINT.md`
- `.engineering/SOURCE-HIERARCHY.md`
- `.engineering/DECISIONS-LEDGER.md`
- `.engineering/SCOPE.md`
- `.engineering/DEFINITION-OF-DONE.md`
- `.engineering/ARCHITECTURE.md`
- `.engineering/REQUIREMENTS.md`
- `.engineering/SECURITY.md`
- `.engineering/TEST-BENCHMARK-PLAN.md`
- `.engineering/DEPLOYMENT.md`
- `.engineering/BACKLOG.md`
- `AGENTS.md`
- this Work Order
- its Context Lock

## REQUIREMENTS
- Imported seed SHA-256 and size must match the manifest before use.
- Every master decision marked APPROVED must be present in the migration inventory and mapped to at least one canonical destination.
- No approved decision may be silently omitted, renamed semantically, downgraded, or contradicted.
- Open/TBD decisions remain open/TBD unless the master itself resolves them.
- Historical planning statuses through SPR-PLAN-005 remain preserved.
- Commercial pricing remains NOT FROZEN.
- Product implementation remains NOT_STARTED.
- GEF stays exactly 1.1.1.
- Repository governance/ruleset remains unchanged and healthy.
- Canonical docs must not claim implementation or benchmarks that do not exist.

## ARCHITECTURE RULES
- Repository Source Pack becomes canonical only after objective audit/promotion.
- Imported master remains immutable source evidence.
- Preserve stable concepts/IDs; normalize wording only when semantics remain identical.
- Product architecture is organized around game-production jobs, not model/provider names.
- Model/provider selection remains behind Model Router / SKU contracts.
- Financial/security invariants are cross-cutting and cannot be deferred as cosmetic add-ons.
- Prefer explicit contracts and traceability over narrative duplication.

## CONSTRAINTS
- No code/product implementation.
- No provider mutation.
- No `.gef` edits.
- No force-push/history rewrite.
- No new pricing numbers.
- No invention of benchmark results.
- No deletion of approved master decisions.
- If seed fingerprint, execution base, or critical canonical authority changes unexpectedly, mark Context Lock STALE and stop.

## ACCEPTANCE CRITERIA
1. Seed snapshot is committed unchanged and fingerprint-verified.
2. A complete migration inventory covers all approved master decisions/planning increments through SPR-PLAN-005.
3. Canonical Source Pack accurately represents the approved product: purpose, audiences, module taxonomy, capability matrix, architecture, economics, security/trust, integrations, data/API boundaries, V1 scope and benchmark obligations.
4. All master APPROVED decision IDs are preserved and traceable.
5. No contradiction exists between canonical docs on V1 scope or product identity.
6. Current repository placeholders/TBD claims are corrected only where the master already contains approved truth.
7. Open decisions stay open.
8. Pricing remains unfrozen pending benchmarks.
9. Product implementation stays NOT_STARTED.
10. `SPR-PLAN-006` is the next proposed NECESSARY planning increment; it is not executed.
11. GEF doctor/status/checkpoint validation remains healthy under the documented v1.1.1 drift policy.
12. Four existing required GitHub checks pass on the exact final PR head. After push, the PR description is authoritative for that final HEAD SHA, timestamps, check-run IDs/URLs, and conclusions; the versioned Evidence Bundle records pre-push evidence and references the PR description for those post-push details. `READY_FOR_AUDIT` is allowed only after all four checks PASS on the exact final PR HEAD; never reuse earlier-SHA results.
13. No unresolved CRITICAL/HIGH finding.
14. Evidence Bundle includes source fingerprint proof, migration coverage matrix, changed paths, local/pre-push tests and evidence, known gaps, and proposed Checkpoint Delta; it references the PR description as the authoritative post-push record of exact-HEAD check evidence.

## TESTS
- SHA-256/size verification of imported seed.
- deterministic extraction inventory / duplicate-ID detection.
- all APPROVED decision IDs mapped exactly once as canonical ownership plus optional cross-references.
- JSON/YAML/Markdown structural validation.
- cross-document V1 scope consistency checks.
- commercial-pricing freeze guard.
- product-implementation false-claim guard.
- `npm ci --ignore-scripts --no-audit --no-fund`
- exact GEF 1.1.1 assertion.
- `gef doctor --target . --json`
- repeated byte-identical `gef status --target . --json`
- `git diff --check` for this Work Order delta.
- existing four required GitHub checks on exact head.

## DELIVERABLES
- immutable source seed + manifest;
- migration inventory/matrix;
- decomposed/updated canonical Source Pack;
- specialized product documents where required;
- `.engineering/evidence/SPRYXEL-WO-002-EVIDENCE.md`;
- `.engineering/checkpoint-deltas/SPRYXEL-WO-002-PROPOSED.md`;
- updated PR description with exact-head evidence.

## REVIEW FORMAT
Brazilian Portuguese:
- base/head SHA;
- seed fingerprint verification;
- migrated planning increments;
- decision coverage totals and unmapped IDs;
- changed files;
- canonical-source mapping;
- tests/checks PASS/FAIL;
- CRITICAL/HIGH/MEDIUM/LOW findings;
- unresolved/open product decisions;
- proposed Checkpoint Delta;
- verdict candidate: READY_FOR_AUDIT or BLOCKED.

## STOP CONDITION
`SPRYXEL_WO_002_PRODUCT_MASTER_DECOMPOSED_READY_FOR_AUDIT`

Do not merge. Do not promote the checkpoint. Do not execute SPR-PLAN-006.


## AUDIT CLOSURE

- Objective audit verdict: `APPROVED`.
- Audited execution head: `0524677d09189b549f76c1172b0828a0f814f1a9`.
- Seed integrity, decision coverage, section/module/open-decision coverage, correction delta, required checks and review-thread resolution were independently verified.
- No CRITICAL/HIGH finding remains known for this Work Order.
- Checkpoint/source-pack promotion is performed by the auditor after approval.
- No further executor action is authorized under this Work Order after promotion.
- `SPR-PLAN-006` remains NOT EXECUTED and requires a separate Work Order/Context Lock.
