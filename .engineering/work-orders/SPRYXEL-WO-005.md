# SPRYXEL-WO-005 — SPRYXEL-IMP-001 Platform Foundation Bootstrap

Tracking issue: #17
Status: APPROVED — R2
Risk: ELEVATED
Execution base: main@31e6aec13bcc427ec8449d68da1a420979488b06
GEF: @gef-bootstrap/cli@1.1.1
Implementation increment: SPRYXEL-IMP-001

## OBJECTIVE

Implement only the canonical Platform Foundation Bootstrap from FIRST-IMPLEMENTATION-SLICE.md. This is the first product-code increment, but it contains foundation code only.

## CONTEXT LOCK / CORRECTION

R1 stopped BLOCKED before product dependency installation because MinIO failed the maintenance/security gate. PR #18 is closed and its Context Lock is STALE.

Canonical correction PR #19 merged to main and added D-154/D-155:
- D-142/D-148 remain unchanged historical records;
- SeaweedFS replaces only the MinIO-specific local/test service clauses;
- private S3-compatible/provider-neutral storage remains canonical;
- production object-storage provider remains NOT FROZEN.

This R2 admission is the only valid WO-005 execution context.

## SCOPE

Implement:
- one npm workspace graph and one root lockfile;
- apps/web with minimal Next.js App Router shell and canonical semantic Dark/Light tokens;
- apps/api with Fastify, typed startup config, safe structured logging, request/correlation ID, /healthz and /readyz;
- apps/worker as a separate Node process with technical lifecycle/self-test only;
- non-empty packages/contracts, domain, db, config, observability, ui, testkit;
- PostgreSQL/Drizzle migration harness with technical-only schema if required;
- Redis/BullMQ-compatible connectivity/coordination boundary only;
- S3-compatible storage boundary using SeaweedFS for local/test only;
- bounded Docker Compose infra/test profiles for PostgreSQL, Redis and SeaweedFS;
- Vitest-compatible unit tests, real-service integration tests and Playwright-compatible web-shell smoke tests;
- root format/lint/typecheck/build/test commands;
- dependency-cycle and forbidden-import enforcement.

## PREFLIGHT

Before product dependency/image installation:
1. verify exact Node/npm versions and Node >=22;
2. for every direct product dependency, verify exact registry version, Node/peer compatibility, license, current security evidence, reason and owner;
3. pin exact versions; no latest/* or second package manager;
4. for SeaweedFS, verify current maintained release, exact image tag plus immutable digest, official image-signature/provenance evidence, license notices and current security state;
5. use authenticated S3 test access; anonymous mode is not acceptance evidence;
6. if a required canonical dependency/image is materially unsafe, incompatible, unavailable, provenance-blocked or license-blocked: STOP BLOCKED. Do not silently substitute.

## HARD OUT OF SCOPE

No real auth/signup/session or auth-provider selection.
No user/tenant/project/member product entities.
No billing/payments/credits/wallet/ledger/CostGuard/RevenueShield.
No TrustShield scoring/risk graph.
No product assets/jobs/generation/QA/export.
No AI/model/GPU runtime, downloads or benchmarks.
No production provider procurement.
No pricing freeze.
No production cloud deployment.
No .gef/GEF change.
No source-seed change.
No workflow/ruleset/provider mutation.
No checkpoint promotion.
No Identity/Tenancy or later slice.

## ARCHITECTURE RULES

- Preserve D-001…D-155 unchanged.
- domain: no Next/Fastify/Drizzle/Redis/S3/provider imports.
- contracts: no DB/provider imports.
- ui: no server/database imports.
- web: no direct DB persistence.
- api/worker compose inward packages and edge adapters; no duplicated business backend.
- PostgreSQL is canonical durable state; Redis/SeaweedFS are not product truth.
- No nested lockfiles, workspace cycles or private deep imports.
- Startup must not auto-mutate database schema.
- Config fails closed where required and redacts sensitive values.
- Health/readiness output must remain safe.

## ACCEPTANCE

All admitted workspaces are non-empty and meaningfully used.
Root GEF 1.1.1 identity remains intact.
Dependency/image preflight is evidenced.
Web/API/worker build and tests pass.
Migration harness works on disposable PostgreSQL with no product tables.
Real PostgreSQL/Redis/SeaweedFS handshakes pass with deterministic teardown.
Config/log redaction tests pass.
Forbidden-import/cycle checks pass.
format, lint, typecheck, build, unit, integration and browser smoke pass.
No hard-out-of-scope implementation appears.
Four existing required GitHub checks pass on exact final head.
No unresolved CRITICAL/HIGH finding remains.
Evidence Bundle and proposed Checkpoint Delta are versioned.
Executor does not merge or promote checkpoint.

## DELIVERABLES

Product foundation code/tests/config described above plus:
- .engineering/evidence/SPRYXEL-WO-005-EVIDENCE.md
- .engineering/checkpoint-deltas/SPRYXEL-WO-005-PROPOSED.md
- PR description exact-head evidence.

## REVIEW FORMAT

PT-BR with base/head SHA, Context Lock, dependency/image preflight, changed paths, architecture-boundary result, migration/real-service evidence, config/redaction result, web/API/worker evidence, all test commands/results, required checks, findings, hard-out-of-scope proof and proposed Checkpoint Delta.

## STOP CONDITION

SPRYXEL_IMP_001_PLATFORM_FOUNDATION_BOOTSTRAP_READY_FOR_AUDIT

Do not merge. Do not promote checkpoint. Do not start Identity/Tenancy.


## AUDIT CLOSURE

- Objective audit verdict: `APPROVED`.
- Audited final head: `ace62ffdb53bd5f602e23d1e9572955f2a5dc820`.
- Correction Delta 01 C-01…C-08: SATISFIED.
- D-001…D-155 preserved; canonical checkpoint remained untouched by executor.
- Full foundation suite and all four exact-head required GitHub checks passed.
- Unresolved review threads: 0.
- Known CRITICAL/HIGH findings: 0.
- Hard out-of-scope product modules were not implemented.
- Canonical promotion is an auditor action after approval.
- Identity/Tenancy remains NOT_ADMITTED.
