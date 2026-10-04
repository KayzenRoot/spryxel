# Backlog

Status: CANONICAL — SPRYXEL-WO-003 / SPR-PLAN-006 approved by objective audit.

## Historical planning and scope

| ID | Classification | Status in master | Result |
| --- | --- | --- | --- |
| SPRYXEL-WO-001 | NECESSARY governance | COMPLETE / AUDITED / MERGED | GEF 1.1.1 GitHub governance baseline |
| SPR-PLAN-001 | NECESSARY | APPROVED / COMPLETED IN MASTER v0.2.0 | Product modules, asset taxonomy, workflows, V1 boundary |
| SPR-PLAN-002 | NECESSARY | APPROVED / COMPLETED IN MASTER v0.3.0 | Technical architecture and local AI benchmark strategy |
| SPR-PLAN-003 | NECESSARY | APPROVED / COMPLETED IN MASTER v0.4.0 | Quality system, benchmark protocol, generation SKUs |
| SPR-SPECIAL-001 | IMPORTANT WITH STRONG DIFFERENTIATION POTENTIAL | APPROVED / ADDED IN MASTER v0.4.1 | Maps, worldbuilding, UI/HUD domains |
| SPR-SPECIAL-002 | IMPORTANT / PRE-FINANCIAL CATALOG COMPLETION | APPROVED / COMPLETED IN MASTER v0.4.2 | Map/UI SKUs, contracts, QA, export, agent automation |
| SPR-PLAN-004 | NECESSARY / HIGH_ASSURANCE | APPROVED / COMPLETED IN MASTER v0.5.0 | Credit economics, pricing safety, simulation |
| SPR-PLAN-005 | NECESSARY / HIGH_ASSURANCE | APPROVED / COMPLETED IN MASTER v0.6.0 | Security, TrustShield, abuse graph, account/payment risk |
| SPRYXEL-WO-002 | NECESSARY source migration | COMPLETE / AUDITED / MERGED / POST-MERGE VALIDATED | Decompose v0.6.0 seed into the canonical Source Pack |
| SPR-PLAN-006 | NECESSARY | COMPLETE / AUDITED / MERGED / POST-MERGE VALIDATED | Product UX, Design System & Information Architecture |

Historical planning rounds above are not being re-run by WO-002.

## SPR-PLAN-007 and first implementation boundary

SPRYXEL-WO-003 completed and objectively approved SPR-PLAN-006. The canonical UX contract now covers visual principles/brand direction, typography/tokens/themes/motion/layout, responsive strategy, global/project navigation, studio screen contracts, billing/API/MCP/admin UX, safe messaging, onboarding/state handling, accessibility/i18n layout, command palette/keyboard workflows, desktop/mobile strategy, and screen inventory.

SPRYXEL-WO-004 completed and objectively approved SPR-PLAN-007 implementation architecture planning. The canonical plan records the runtime/workspace/topology/data/API/local-dev/test boundaries and specifies `SPRYXEL-IMP-001 — Platform Foundation Bootstrap`; it does not execute implementation. Product implementation remains NOT_STARTED until a distinct code Work Order is admitted.

The default later NECESSARY sequence is: (1) IMP-001 platform foundation; (2) identity/tenancy security baseline; (3) Projects + canonical shell/Home; (4) Asset Contract + durable Job backbone; (5) Credit Ledger + CostGuard; (6) Spryxel DNA + Asset core; (7) bounded local inference/Generate; (8) QA/approval/version/export. Each step has a separate Work Order and may be recompiled if evidence/dependencies change. IMPORTANT/FUTURE modules do not jump the queue automatically.

## Open release/planning items

| Open item from the master | Current preserved state |
| --- | --- |
| Exact initial model qualification on RTX 5050; 2D/pixel benchmark execution; 3D model/provider shortlist | Shortlist and benchmark contracts exist; no AI benchmark run and no paid-production model selected. 3D shortlist remains open. |
| Initial credit denomination / trial quantity / new-account financial exposure | SC is abstract with no fixed currency value; exact denomination, entitlement quantities, and configurable monetary caps remain open. |
| Target plans, credit packs, prices, and credits per pack | Credit-pack-first is approved and subscriptions deferred; actual pack ladder, credit quantities, and all public prices remain NOT FROZEN. |
| Payment provider by region and payment contract | Paddle is a preferred early global MoR planning candidate; Stripe is a first-class direct alternative; no provider is contractually selected. |
| Tax, legal, refund, chargeback, and accounting assumptions | Formulas and evidence flows are planned; rates, jurisdictional treatment, working-capital amount, and Brazilian legal/accounting review remain open. |
| Domain and trademark clearance; final brand/logo | Open; D-001 is APPROVED FOR PLANNING and explicitly requires clearance before public launch. |
| Product implementation versions and runtime service providers | Compatibility-level stack is canonical. WorkOS AuthKit is selected for V1 external human authentication/session by D-156…D-161; exact auth SDK versions still require implementation preflight. Billing/GPU/production-storage/hosting providers remain open. |
| Physical database schema and exact V1 SKU/contract inventory | Conceptual entities and SKU/QA requirements are migrated; physical schema and any remaining SKU contract details remain planning work. |
| API v1, MCP v1 tool catalog, and CLI v1 command contract | First-class surfaces/basic CLI are approved; exact paths, schemas, errors, scopes, and commands remain open. |
| UI information architecture, wireframes, visual system, and accessibility contracts | Completed and canonical through SPR-PLAN-006 / SPRYXEL-WO-003. |
| Product-specific formal Definition of Done and later implementation gates | This candidate defines source-pack audit and high-level production gates; finer product increments remain to be planned without implementing product code. |
| Security/privacy implementation, validation, retention periods, and TrustShield calibration | Architecture approved for planning; implementation/validation NOT_STARTED, retention periods and live thresholds require legal/operational review and data. |
| Product implementation Work Orders | Not admitted until Source Pack audit/promotion and the relevant implementation Definition of Done. |

The complete open-decision inventory remains in the seed and specialized documents. Do not close an open item by inference.


## SPRYXEL-WO-004 completion

SPRYXEL-WO-004 / SPR-PLAN-007 is COMPLETE. `SPRYXEL-IMP-001 — Platform Foundation Bootstrap` is COMPLETE under SPRYXEL-WO-005: objectively audited, canonically promoted, squash-merged and post-merge validated. Identity/Tenancy is the next NECESSARY slice and remains NOT_ADMITTED.


## SPRYXEL-WO-005 preflight blocker

The first SPRYXEL-IMP-001 admission stopped BLOCKED before product dependency installation because the planned MinIO community server had become archived/unmaintained and failed the Work Order maintenance/security gate. D-154/D-155 supersede only the local/test service choice with SeaweedFS while preserving the S3-compatible/provider-neutral contract. No product code was implemented. SPRYXEL-WO-005 must be recompiled on the corrected main base before execution resumes.


## SPRYXEL-WO-005 / IMP-001 approval

`SPRYXEL-IMP-001 — Platform Foundation Bootstrap` is APPROVED after Correction Delta 01 and Correction Delta 02. The canonical foundation includes the npm workspace, Next.js web shell, Fastify API, separate worker, typed config/observability, PostgreSQL migration harness, Redis/BullMQ technical boundary, SeaweedFS S3-compatible local/test boundary, Docker profiles, architecture enforcement and unit/integration/browser test harnesses.

No identity/tenancy, project, billing/credits, TrustShield, generation/assets, AI/model/GPU or production-provider implementation was admitted.

Next legal slice: Identity/Tenancy security baseline under its own Work Order/Context Lock, with a current auth-provider decision/preflight before implementation.


## SPRYXEL-WO-005 completion

`SPRYXEL-WO-005 / SPRYXEL-IMP-001` is COMPLETE on `main@6dbce3f1ba1e5b85a6e6ea40083e2d4418755261` with post-merge validation PASS. The platform foundation is canonical. Identity/Tenancy is the next NECESSARY implementation slice but remains NOT_ADMITTED pending a new Work Order/Context Lock and current auth-provider preflight.


## Identity/Tenancy provider prerequisite

The auth-provider planning gate for the next NECESSARY slice is resolved by D-156…D-161:
- WorkOS AuthKit: selected V1 external human authentication/session provider;
- Spryxel PostgreSQL: canonical identity linkage, tenant membership, product authorization and RLS authority;
- exact SDK pins and current terms/security remain an implementation-time preflight;
- Identity/Tenancy code is still NOT_ADMITTED until its Work Order/Context Lock exists.

## SPRYXEL-WO-006 / IMP-002 approval

`SPRYXEL-IMP-002 — Identity/Tenancy security baseline` is objectively APPROVED on exact audited head `8e4f5b16883bf03a29893783032a00d31753457b` after Correction Delta 01…05. The admitted implementation includes WorkOS/AuthKit external authentication/session edges, Spryxel-owned identity/tenant/membership authority, PostgreSQL RLS, bootstrap, JWT/JWKS verification, bounded session management and durable session-revocation reconciliation.

HIGH_ASSURANCE acceptance passed in Node 22.23.3/npm 10.9.9, including 61/61 unit tests, real PostgreSQL/RLS + Redis + SeaweedFS integration, Playwright 7/7, aggregate npm test, audit, required GitHub checks and SonarQube Quality Gate with zero security hotspots.

The next NECESSARY slice is Projects + canonical shell/Home. It remains NOT_ADMITTED until WO-006 is merged/post-merge validated and a new Work Order/Context Lock is compiled.

## SPRYXEL-WO-006 completion

`SPRYXEL-WO-006 / SPRYXEL-IMP-002` is COMPLETE on `main@814abd6ab27b2a4c4549a1941a713e1c6cae69bd` after objective HIGH_ASSURANCE audit, canonical promotion, squash merge and post-merge validation. Identity/Tenancy is now canonical.

The next NECESSARY implementation slice is Projects + canonical shell/Home. It remains NOT_ADMITTED until a new Work Order and fresh Context Lock are created from the current main base.

## SPRYXEL-WO-007 / IMP-003 approval

`SPRYXEL-IMP-003 — Projects + canonical shell/Home` is objectively APPROVED on exact audited head `a64b76c858f9e72e462478d910655b3d69d85ec6` after Correction-01 and Correction-02.

The admitted implementation adds the durable tenant-owned Project entity, forced PostgreSQL RLS, OWNER/ADMIN creation, MEMBER read/select, write-once creation idempotency, `project.created` durable audit evidence, canonical Global Shell, Home/Command Center, Projects list/create/select and minimal Project Overview.

HIGH_ASSURANCE acceptance passed in Node 22.23.3/npm 10.9.9, including 74/74 unit tests, real PostgreSQL/RLS + Redis/BullMQ + SeaweedFS integration, Playwright 12/12, aggregate npm test, dependency audit, exact-head required checks and SonarQube Quality Gate with zero security hotspots.

The next NECESSARY slice is Asset Contract + durable Job backbone. It remains NOT_ADMITTED until WO-007 is merged/post-merge validated and a new Work Order/Context Lock is compiled.

## SPRYXEL-WO-007 completion

`SPRYXEL-WO-007 / SPRYXEL-IMP-003` is COMPLETE on `main@67debfaca7cae164872a06a30faebb43daf34425` after objective HIGH_ASSURANCE audit, canonical promotion, squash merge and post-merge validation. Projects + canonical shell/Home are now canonical.

The next NECESSARY implementation slice is Asset Contract + durable Job backbone. It remains NOT_ADMITTED until a new Work Order and fresh Context Lock are created from the current main base.
