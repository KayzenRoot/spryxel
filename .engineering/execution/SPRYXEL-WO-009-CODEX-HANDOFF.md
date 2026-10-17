# Codex Executor Handoff — SPRYXEL-WO-009 / IMP-005

**AUTHORITY:** Read `.engineering/SOURCE-HIERARCHY.md`, canonical checkpoint, `.engineering/work-orders/SPRYXEL-WO-009.md`, `.engineering/context-locks/SPRYXEL-WO-009.json` and the corresponding Evidence Bundle. The Work Order, Context Lock, canonical decisions, tests and Git always outrank this handoff. This handoff grants NO additional scope.
**Owner:** approved WO-009 admission (PR #86 integrated).  
**HIGH_ASSURANCE:** credit ledger / financial integrity.  
**Execution branch:** `codex/spryxel-wo-009-imp-005-credit-ledger-costguard`  
**Base:** `34bad103d8066b6d31c5947c20a07ef52032c5d7`  
**Tracking issue:** [#85](https://github.com/KayzenRoot/spryxel/issues/85)  
**Expected PR:** create/update one draft implementation PR on this same branch against `main`, then mark ready only when all scoped acceptance checks pass.

## OBJECTIVE

Implement the entire **NECESSARY** scope of Credit Ledger + CostGuard foundation, no more: PostgreSQL-canonical immutable ledger and credit-lot/wallet/reservation state; transactional idempotency; strict tenant FORCE RLS and least-privilege grants; bounded default-DENY CostGuard. Test with local synthetic credit fixtures, without real payments/prices/COGS/GPU/inference.

## PREFLIGHT (NO PRODUCT MUTATIONS UNTIL COMPLETE)

1. Inspect actual repository, branch, last commit, `git status`, diff and all docs in canonical hierarchy; do not rely on this prompt's possibly stale snapshot. Verify `git merge-base` and actual main SHA. Source Lock critical path blobs must match 33/33 exactly; verify Work Order Git blob. On a true critical SHA change, mark STALE, rebase/recompile transparently **without force push**; do not make silently invalid modifications.
2. Use Node v22.23.3, npm 10.9.9, exact existing npm lockfile; inspect migrations 0001-0008, PostgreSQL roles/context setting, schema, API error contracts, domain structure and test harness. Only preserve source tests known green; baseline checks targeted as permitted by WO.
3. GEF 1.1.1 doctor/status read-only; reconcile baseline drift through D-0007 with exact admitted diff. Never rewrite .gef or downgrade rulesets/CI.
4. Confirm that this task does NOT need paid cloud, merchant contract, real provider, new secrets or external credit price; if so redesign within approved in-memory/local scope or stop with concrete decision required, not fabricated numeric defaults.

## DELIVERY STRATEGY: LONG-RUN, CONCURRENCY WITHOUT CROSS-FILE COLLISIONS

Run continuously while useful and permitted work remains, but do not artificially consume time to reach 12h. Minimize wall clock through small atomic commits, targeted tests during development, and one complete acceptance suite at the end. If available, delegate independent **file-disjoint** subtasks:
- **Database subagent:** migrations, SQL functions, privilege policy, RLS and transaction invariants; owns new migration paths and DB-only code after coordination.
- **Domain/CostGuard subagent:** typed immutable financial events, pure policy evaluator, integer arithmetic, duplicate operation guards; owns domain/contracts paths.
- **Integration/test subagent:** real PostgreSQL concurrency, cross-tenant / crash / replay / immutable ledger tests and synthetic fixture harness; owns dedicated test paths only; do not patch product code autonomously.
- **API-boundary subagent:** read-only authorized projection and machine-readable fail-closed errors ONLY if necessary for specific WO AC; owns dedicated API paths after DB contract stabilized.
- **Security reviewer subagent:** inspect diff/read-only and report repro-backed HIGH/CRITICAL findings, conflict-of-interest and gaps. A reviewing subagent under the same executor is not a substitute for final independently commissioned audit.

Do not spawn independent workers editing the same file or starting multiple PRs. The coordinator resolves contract changes, integration and evidence.

## ITERATIVE IMPLEMENTATION

### Stage 1: Models and persistence
- Determine minimal schema from canonical financial invariants, with explicit `tenant_id`, nonnegative integer bounded credits, credit-lot provenance, wallet, reservation/commit/release and append-only ledger references. Avoid premature cash/billing/provider models.
- Design transaction boundaries to prohibit lost updates, double-spend, duplicate reservation/grants, account-to-account leakage and independent worker mutation.
- Only forward-safe migrations with RLS `ENABLE` and `FORCE`; traceable reversible operations via compensating facts, never destructive mutation of a posted entry.
- Add actual SQL/test proof for direct app role, worker role, missing tenant context, inactive membership and cross-tenant resource ID access.

### Stage 2: Domain contracts / CostGuard
- Strict integer-only/fixed-precision accounting; bounds and overflow/underflow validation; no floating point financial state.
- Formal idempotency key scope + request hash + durable operation identity. Duplicate same request returns original result; mismatch conflicts; many concurrent requests converge without overspend.
- CostGuard policy evaluator must **DENY** when SKU/policy/cost/cash/credits are unknown or above bounded ceiling. Real external costing budget defaults ZERO and cannot be silently set to positive. No invented public price/credit equivalence.
- Reservation->commit->release lifecycle must survive retries, cancellation and crash/lost-response replays. Link to canonical Job/Contract identity where required by WO without making the integrity-check job cost-bearing.

### Stage 3: Narrow API and observability
- Strictly authorized read-only projection if demanded by acceptance; tenant+role checks on server, never from UI-only state.
- Safe error codes with correlation IDs. No raw policy secrets, payment data, JWT, cross-tenant object amounts, stack or SQL errors.
- Bounded structured audit trail for events and compensation.

### Stage 4: Tests / performance / security
- During work, run small tests on changed scopes. Unit arithmetic/denies/idempotency; PostgreSQL 18 real role/RLS double-spend and contention tests; replay/conflict and failed commit/recovery; local worker integration; HTTP negative tests if endpoints added.
- Acceptance on final code exact SHA: `npm ci --no-audit --no-fund`, `npm run format:check`, `npm run lint`, `npm run architecture:check`, `npm run typecheck -- --force`, `npm run build -- --force`, `npm test` (worker/real PostgreSQL/Redis/SeaweedFS/Playwright as existing), `npm audit --audit-level=high`, `git diff --check`, GEF read-only. Avoid hiding browser tests by `--workers=1` or skipping expensive cases just to get a green report.
- Verify actual exit codes and cleanup; report only `EXECUTED` if executed.
- Push commits to same branch and wait for exact-head required CI, SonarCloud and Socket checks. Do not demand Sonar issue-by-issue API access if authenticated access does not exist; investigate any demonstrated serious finding.
- Inspect all 28 WO-009 ACs explicitly. A known HIGH/CRITICAL => correct before ready-for-audit.

## DELIVERABLES / REVIEW FORMAT

1. Working code and forward-only migrations exclusively on authorized branch.
2. Unit/integration/security regression tests, service test harness and migration recovery proof.
3. Updated `.engineering/evidence/SPRYXEL-WO-009-EVIDENCE.md` with BASE/HEAD, exact Git filenames/hashes, design decisions, repro, commands, actual exits, roles/RLS/contended balances, Sonar/CI links, risks, 28 AC matrix, and remaining gaps.
4. Proposed, not promoted, checkpoint delta `.engineering/checkpoint-deltas/SPRYXEL-WO-009-PROPOSED.md`.
5. Update ONE draft PR against protected main; no merge, no release, no real transactions. Leave Portuguese final summary of implementation, validation and `READY_FOR_INDEPENDENT_AUDIT` or `CORRECTION REQUIRED/BLOCKED`.

## HARD STOPS

- Don't use or invoke CodeRabbit.
- Don't enable real money, public credit mint/grant, checkout, payment webhooks, trial/free/promotional budgets, fixed SC prices, GPU/provider/model execution, measured COGS claims, cloud API charges, subscriptions, RevenueShield/TrustShield expansion or new asset inference.
- Don't bypass auth/RLS, disable financial fail-closed semantics, change main/rulesets/checkpoint/source ledger/GEF or merge your own PR.
- If a HIGH/CRITICAL finding appears, correct within the same WO/PR and rerun impacted tests. If external contract/secret/funding is needed, STOP with actionable minimal blocker. No repetitive Sonar 403 attempts.
- Executor **may not declare its own implementation APPROVED**. Distinct objective HIGH_ASSURANCE reviewer must audit product code and tests.

**EXECUTION STOP CONDITION:** `SPRYXEL_IMP_005_CREDIT_LEDGER_COSTGUARD_FOUNDATION_READY_FOR_AUDIT` only after complete scoped delivery and acceptance evidence, or `SPRYXEL_WO009_CORRECTION_REQUIRED`/concrete `BLOCKED` with a reproducible reason.
