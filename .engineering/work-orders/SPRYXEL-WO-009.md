# SPRYXEL-WO-009 — SPRYXEL-IMP-005 Credit Ledger + CostGuard Authorization Foundation

Tracking Issue: [#85](https://github.com/KayzenRoot/spryxel/issues/85)

**Status:** ADMITTED_FOR_EXECUTION — owner-approved documentation PR #86 merged under required checks; HIGH_ASSURANCE code audit remains required  
**Risk:** HIGH_ASSURANCE (credits, economic authorization and data integrity)  
**Repository:** `KayzenRoot/spryxel`  
**Execution base (after admission merge):** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`  
**Authorized execution branch:** `codex/spryxel-wo-009-imp-005-credit-ledger-costguard`  
**Admission authority:** owner explicitly approved the exact PR #86 admission package; source/fingerprint preflight independently rechecked against its exact committed baseline. Product modifications require a FRESH Context Lock, real tests and later independent HIGH_ASSURANCE audit.  
**GEF:** `@gef-bootstrap/cli@1.1.1` immutable baseline.

## OBJECTIVE

Implement the next NECESSARY increment in D-153: PostgreSQL-canonical tenant-owned Credit Ledger and bounded, fail-closed CostGuard authorization foundation. Preserve Asset Contract/Durable Jobs, identity/tenant security and the already merged product shell. Create a true ledger/transaction security boundary before any future GPU/provider/paid generation.

The slice is **non-commercial and non-cost-incurring**. No publicly usable paid balance, price, credit pack, entitlement, external payment provider or GPU execution is activated. Missing real SKU economics, policy and priced bounds produce deterministic DENY (not zero-cost ALLOW). Tests may use explicitly labeled, fixed, artificial policy/credit fixtures in isolated local integration environments.

## CONTEXT / SOURCE HIERARCHY

1. `.engineering/CHECKPOINT.json` (machine authority), `CHECKPOINT.md`.
2. `.engineering/DECISIONS-LEDGER.md` D-0006, D-0007, D-009, D-060, D-061…D-089, D-136…D-153 and applicable financial decisions.
3. `.engineering/SCOPE.md`, `DEFINITION-OF-DONE.md`, `ARCHITECTURE.md`, `REQUIREMENTS.md`.
4. `.engineering/BILLING-ECONOMICS.md`, `SECURITY.md`, `DATA-MODEL.md`, `PHYSICAL-DATA-CONVENTIONS.md`, `API-CONTRACTS.md`, `API-FOUNDATION-CONTRACT.md`, `IMPLEMENTATION-ARCHITECTURE.md`, `IMPLEMENTATION-SEQUENCE.md`, `TEST-BENCHMARK-PLAN.md`, `DEPLOYMENT.md`.
5. WO-008 evidence/independent audit/Context Lock (historical only), current committed code and exact Git baseline. Prior conversations, planning issue #39 and proposed expansion #33 are **not** authority to broaden scope.

## SOURCE CHECK / PREFLIGHT

1. Verify main SHA exact and source fingerprint set in the new Context Lock; calculate current WO Git blob and SHA-256. Any changed checkpoint/Scope/DoD/Architecture/relevant decision => STALE, recompile (do not reset/rewrite main).
2. Inspect `packages/db/src/migrations/0001…0008`, `packages/db/src/index.ts`, `packages/domain/src/index.ts`, `packages/contracts/src/index.ts`, `apps/api/src/server.ts`, `apps/worker/src/durable-jobs.ts`, test/integration harness and session/RLS security handling before any code change.
3. Record exact Node v22.23.3 and npm 10.9.9, lockfile, DB/Redis/SeaweedFS baseline, tests and GEF status. Avoid re-running entire suite after unchanged snapshots; reserve complete suite for acceptance.
4. No new direct dependency unless required and proven; pin version and check license/security, Node22 compatibility and lockfile.
5. No outside paid services, cloud GPU, merchant account, real payment/promotion, new secrets or external API budget for this slice. If required, STOP for explicit new owner decision.

## SCOPE (NECESSARY ONLY)

### A. Credit persistence and immutable accounting
- Add **forward-only**, transactional PostgreSQL migration(s) for tenant wallet, credit lot, immutable ledger entry, reservation/commit/release state and durable idempotency identities with explicit ownership/foreign keys, unique constraints, integer-safe bounds, indexes, audit references and appropriate `ON DELETE` policy.
- `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY` for every tenant-owned table. Verify runtime `spryxel_app` / `spryxel_worker` least-privilege and no cross-tenant lookup by guessed IDs. Never grant worker direct unrestricted ledger UPDATE/DELETE.
- **Posted entries append-only**; corrections use new, linked compensating entries. Do not change/deallocate a posted transaction to recover credits. Use database uniqueness/invariant enforcement, not UI or race-prone app-only checks.
- Wallet/lots/balance and available-versus-reserved may be **derived projections**, never contradict canonical entries. Credit units nonnegative, bounded integers; no binary floating-point accounting or monetary amount in credits. Distinguish payment and wallet domains without adding payment provider tables/events in this increment.
- Model lot origin enum per canonical planning where relevant; all non-test issue/grant origins remain ineligible for public activation until later WOs. Support correct lot-based reservation allocation logic only when objectively needed for this foundation; do not invent expiry rules or actual prices.
- Use durable request idempotency (tenant, operation, principal / bounded payload hash) and durable operation identity. Duplicate identical request yields exact prior ledger/reservation result, mismatch yields conflict; concurrent same key converges. No double debit, grant, reservation or negative availability.

### B. Reservation lifecycle
- Specify and implement atomic `authorize/reserve → commit actual bounded debit → release unused` as a **service/domain boundary**, with idempotent finalization, reference to immutable Job/Asset Contract and reason/policy version.
- Enforce reservation amount maximum, sufficient available credits, concurrency race-safe locking, and no repeated capture on retries/crashes. Protect transaction rollback and referential integrity.
- Failed/cancelled Job operations release eligible reservations deterministically; `commit` cannot exceed reserved amount; refund/correction requires compensation event with provenance, not historical rewriting.
- There must be no public API that creates spend on behalf of a client in this slice. Existing deterministic `asset_contract.integrity_check.v1` remains non-costing and **does not begin consuming credits**.
- Deterministic fixture-credit injection is test-only via ephemeral databases; prohibit production admin mint/grant endpoint or seed users with real-valued credits.

### C. CostGuard authorization boundary
- Pure, versionable policy evaluator with typed allow/deny reason codes, explicit bounded inputs and safe UI/API errors (request ID; no secret/internal anti-fraud data).
- Fail closed for missing trusted price/COGS/cash/budget/approved policy, invalid numeric bounds, stale policy, unknown SKU or unavailable service. Default real cost-incurring exposure = ZERO until independent future approval.
- Encode global / tenant / project / SKU / operation envelope ceilings and `max_credits` + `max_internal_cost` as typed limits; avoid creating unapproved policy default numeric amounts or offering optimistic substitutes.
- Preserve the approved **cost-before-execution** invariant. No inference model routing, GPU booking, automatic paid fallback, or provider charge. CostGuard is an authorization foundation, not evidence of benchmark economics.
- When authenticated and permitted, safe read-only wallet/reservation/ledger summary boundaries may be exposed through existing `/api/v1` contracts. No new external BillingProvider, checkout, subscription, trial or public credit issuance route. Adopt existing Fastify schemas and error patterns.

### D. Auditability and migration recovery
- Store redacted, durable audit events for reserve/debit/release/compensation with actor, tenant, operation/Job, policy/reason and correlation ID. No PAN/CVV, payment tokens, raw auth token or personal security signal.
- Migration is forward-only with expand/backfill/roll-forward and compatibility check; test idempotency and non-loss recovery, rollback strategy only where legally/data safe. No `DROP`/destructive cleanup of ledger history.
- Optional UI read-only surface only when existing canonical shell requires it for a Work Order acceptance condition; no new dashboard redesign.

## OUT OF SCOPE (HARD)
Real payment providers/Paddle/Stripe, checkout, webhooks, paid packs, coupons, subscriptions, refunds/disputes handling, cash settlements, public pricing, credit denomination or fixed SC-to-currency rate, real trial/free budget, referral/marketing campaigns, TrustShield scoring graph, RevenueShield, SKU actual price freeze, benchmarks/COGS claim, GPU/model inference, output assets or QA pipeline, owner finance dashboard, API/MCP keys and privileged wallet grant UI. No WorkOS/provider changes; no new auth paths, `apps/web/proxy.ts`, frontend PR #76/#80/Batch02 edits, GEF baseline, `.gef`, branch rulesets, CI config or unrelated modernization.

## ARCHITECTURE / SECURITY RULES
- PostgreSQL is authoritative for accounting and Job identities; Redis/BullMQ is transient coordination only. All mutation flows are transactional and enforce tenant authorization plus DB RLS.
- No floating-point balances, no negative spendable balance, no debit before reservation, no extra charge on replay, no unrestricted service-role credit edit and no implicit change to an already posted ledger fact.
- Idempotency scope and retention must be explicit and tested, especially when concurrent claims/deliveries collide. External request-controlled actor/tenant IDs may never bypass signed identity context.
- A missing or unapproved cost policy must **DENY** and log a safe reason, not turn off validation. This is an independent boundary for future Generate implementation.
- API contracts remain `/api/v1` with safe machine-readable errors. Errors cannot expose other tenants' wallets, amounts, policy internals, SQL errors or security state.
- Treat reconciliation mismatch/invariant breach as HIGH_ASSURANCE fail-closed with durable incident evidence.
- Do not silently update any canonical source or mark `COMPLETE` in the executor.

## ACCEPTANCE CRITERIA (WO009-AC01…AC28)
1. Exact main base and relevant fingerprints match FRESH Context Lock before edits.
2. D-001…D-161, historical WO-008 completions and GEF baseline preserved.
3. Migration(s) forward-only and repeatable by migration harness; no unplanned destructive DDL.
4. Wallet/lot/entry/reservation data has tenant ownership + FORCE RLS and least-privilege SQL grants.
5. Member/app/worker/absent-context/cross-tenant access matrix proven with real PostgreSQL.
6. Integer credit arithmetic rejects negative, zero-invalid, overflow and underflow safely.
7. Posted ledger mutation (UPDATE/DELETE) prevented for runtime and worker roles.
8. Corrections use linked compensating entries with reasons and immutable history.
9. Balance projection reconciles exactly to entries, including restarts.
10. Concurrent reserve cannot double-spend or produce negative available credits.
11. Same-key identical input replays the same durable operation without second reservation.
12. Same-key different normalized payload fails with safe idempotency conflict.
13. Unrelated tenants can reuse identical external idempotency tokens without collision/leak.
14. Credit issuance is fixture-only, never public or paid; no mint backdoor in production.
15. Reservation atomic with canonical Job/contract and tenant reference.
16. Terminal commit cannot exceed reservation; duplicate commit is idempotent.
17. Release unused amount exactly once after completed/failed/cancelled workflows.
18. Compensation and replay after interrupted response preserve ledger identity.
19. CostGuard denies unknown SKU, stale/missing policy, missing bounds/COGS/cash data.
20. CostGuard never admits operation with non-positive margin or above hard budget.
21. User maximums/max credits and operation bounds are enforced and cannot be reset by retries.
22. Existing integrity-check Job remains non-costing; no provider/GPU/external payment call.
23. Safe API/read-only projection and errors preserve tenant ownership/redaction.
24. Unit/domain and real PostgreSQL concurrent integration cover race/recovery scenarios.
25. Existing Jobs/Auth/Projects regression, worker smoke and browser (if changed) PASS.
26. Node22/npm10 clean install, format/lint/typecheck/build/architecture/npm test/npm audit and migration proof PASS.
27. Exact HEAD four required CI checks and existing Sonar/quality checks PASS; no known unresolved HIGH/CRITICAL.
28. Evidence Bundle (base/head, locks, tests, audit, risks, recovery, proposed Checkpoint Delta) and independent HIGH_ASSURANCE review determine `APPROVED / CORRECTION REQUIRED / BLOCKED`.

## TEST PLAN / PROOF OBLIGATIONS
Unit: strict integer domain, accounting balance equations, lot allocation edge cases, idempotency hashes, unknown SKU/policy/budget, partial debit/release, every legal/illegal lifecycle transition.  
Integration real PostgreSQL: multi-connection concurrent reservations, lost-response retry, crash/replay, duplicate finalization, safe-point/cancel, compensated correction, SQL role grants, RLS no-context and cross-tenant, migration idempotency, malformed inputs and overflow. Redis/worker regression as applicable; real SeaweedFS retained in aggregate regression harness.  
Security: permission matrix, SQL injection/error redaction, no privileged grant/mint path, logs without sensitive financial input, policy DENY on dependency failure.  
CI: exact SHA GEF, format, lint, typecheck, build, unit, worker, integration, browser (if appropriate), `npm test` default, npm audit high, GitHub required checks, Sonar/other existing checks. Distinguish `EXECUTED / OBSERVED / NOT_RUN`.

## DELIVERABLES
- Small forward-only SQL migrations plus accompanying no-loss migration/recovery notes.
- Domain/API/DB contracts implementing scoped reserve/commit/release/compensate and safe read surfaces.
- Test fixtures/real-service integration with no real money/provider.
- `.engineering/evidence/SPRYXEL-WO-009-EVIDENCE.md`, `.engineering/checkpoint-deltas/SPRYXEL-WO-009-PROPOSED.md` and final PR evidence.
- Review in Brazilian Portuguese; stable Work Order ID in commits/branch/PR/correction, independent HIGH_ASSURANCE audit.

## REVIEW FORMAT
`BASE_SHA`, `HEAD_SHA`, `CONTEXT_LOCK`, changed paths, financial/tenant invariants, migrations, runtime role grants, idempotency, double-spend tests, reconciliation, policy DENY, security, actual test command exits, CI links, known gaps, proposed Checkpoint Delta, status of all ACs. Verdict `APPROVED` / `CORRECTION REQUIRED` / `BLOCKED`.

## STOP CONDITION / ADMISSION
**Owner admission:** APPROVED for this bounded Work Order as documented in PR #86; pre-implementation requires current Git base, this Work Order blob and the accompanying execution Context Lock to match. Approval is not approval of implementation, pricing, commercial operations or a production release.

Executor implements only this WO on the authorized branch and PR, corrects proven in-scope defects, pushes tests/evidence and STOPS at `SPRYXEL_IMP_005_CREDIT_LEDGER_COSTGUARD_FOUNDATION_READY_FOR_AUDIT`. A distinct read-only auditor must review HIGH_ASSURANCE results before promotion. Executor may not self-promote checkpoint, merge, publish, freeze prices or start IMP-006.

**Execution stop:** `SPRYXEL_IMP_005_CREDIT_LEDGER_COSTGUARD_FOUNDATION_READY_FOR_AUDIT`.
