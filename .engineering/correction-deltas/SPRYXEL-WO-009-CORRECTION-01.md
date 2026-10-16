# SPRYXEL-WO-009 — Correction Delta 01 (independent review)

**WO / increment:** SPRYXEL-WO-009 / IMP-005.  
**Risk:** HIGH_ASSURANCE (credits and financial authorization).  
**Source HEAD under review:** `f77f005752959eb2762a24dc002ebd356e6e3ea3` (before this delta document).  
**Base:** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`.  
**Verdict:** **CORRECTION REQUIRED** for AC25, AC26, AC28. Do not start next Work Order, promote checkpoint, merge PR #87, modify ruleset, invoke CodeRabbit or purchase services.

## SOURCE CHECK / ALREADY VERIFIED

- Candidate is PR #87, 22 changed files, actual financial schema/domain/API and real-infra tests present.
- Hosted exact-source HEAD checks 7/7 SUCCESS: 4 mandatory, SonarCloud Code Analysis, 2 Socket checks. GitHub Sonar summary: **Quality Gate PASS, 93 new issues, 0 security hotspots**. Sonar analysis detail authorization unavailable; do not label 93 issues HIGH/CRITICAL or discard without evidence. The Evidence Bundle's `SonarCloud NOT OBSERVED` entry is outdated and should be replaced by this exact readback.
- Executor receipts: Node 22.23.3/npm 10.9.9; 120/120 unit tests; real PostgreSQL / forced RLS / Redis-BullMQ / SeaweedFS integration; format/lint/architecture/typecheck/build/audit pass. These are *OBSERVED* by reviewer, not independently reexecuted.
- `npm test` exit 1; standard Playwright no skips or overridden workers failed in 3 attempts: **9/20, 15/20, 10/20**. No successful full standard browser suite. Current PR remains DRAFT.
- Audit of SQL and API source was directed, not an exhaustive proof: migrations add credit wallet/lot/events/entries/reservations, multiple `SECURITY DEFINER` functions with fixed `search_path`, forced RLS, dedicated role privilege checks, advisory+row locks, compensating facts and default-deny CostGuard. No confirmed HIGH/CRITICAL defect reproduced in this read-only review. This is NOT unconditional assurance that none exists.

## CORRECTION OBJECTIVE

Make **canonical** `npm run test:browser` and `npm test` green with *all* existing Playwright tests, without changing test expectations, ignoring failures, reducing concurrency, increasing retry/timeouts globally, masking test failures or widening WO scope.

## NECESSARY DIAGNOSTIC ORDER

1. **Compare exact baseline with candidate** on the same Windows/Node 22/npm 10 test host, dependencies and equivalent clean worktree. Capture a canonical `npm run test:browser` run from `main@34bad103...` and `f77f005...`. Compare failed test names, stack traces, worker lifecycle, web-server launch/teardown and result artifacts. If baseline also fails, this is evidence of an environmental/harness condition but does **not** turn red tests green.
2. From Playwright traces/Next dev-server logs, identify whether Next 16.3.8 route compilation, Windows file contention, `.next` access races, stale listeners on ports 3100/3201, API fixture server or request cleanup causes hangs. Note browser navigations that return 200 but do not swap the SPA DOM. Reproduce at least one deterministically under default `fullyParallel: true` and original 30s assertion budget.
3. Correct only the verified issue. Prefer deterministic test harness setup/isolated Next build/cache/route readiness or wait for *actual UI state* where appropriate. Never blanket-raise timeouts, force `workers=1`, change `retries=0`, skip tests or manipulate product behavior to satisfy fixtures.
4. Verify on resulting SHA: targeted failing spec(s), **`npm run test:browser` 20/20 twice** with default CLI options and **`npm test` complete PASS**, Node22/npm10 exact. Keep real PostgreSQL/RLS+Redis/BullMQ+SeaweedFS, worker, 120 unit, no degraded mock mode. If no reproducible fix, report exact traces, compare baseline and give `BLOCKED` with evidence; do not mark accepted.
5. **Financial security audit preparation (read-only separate reviewer):** additionally document how real code/DB prevents a direct call to `reserve_credit_ledger` from bypassing trusted CostGuard authorization. SQL currently validates `allow_fixture` and schema metadata, but does not re-evaluate the branded JavaScript policy. Verify with an explicit local adversarial test whether an `spryxel_app` session can forge positive authorization on an existing synthetic fixture Job, and establish the strict **fixture-only** boundary; classify defect severity based on actual reachability and scope. Do NOT activate real payments or providers. Check `compensates_entry_id` schema terminology (currently points to `credit_event.id`) against external contracts and reconciliation; if semantic confusion creates an incorrect public contract, correct in same WO with tests.
6. **Evidence correction:** update the old `SonarCloud NOT OBSERVED` label to verified 7/7 exact-head checks; after any new code/evidence HEAD, read back checks again. Sonar 93 open issues without detailed severity is not alone a merge blocker; a proven HIGH/CRITICAL is.
7. Produce updated Evidence Bundle with base/head SHA, exact executed test exits, reproducible traces/logs, 28 ACs and remediation decision. Get independent HIGH_ASSURANCE objective reviewer *distinct from the code executor*. No CodeRabbit.

## OUT OF SCOPE

No new paid service, trial credits, payment gateway, GPU/inference, price/COGS freeze, canonical checkpoint promotion, `.gef`/ruleset edits, frontend Batch02, autonomous dispatch, PR split, new implementation WO, merge or release.

## ACCEPTANCE / STOP

- `CORRECTION_REQUIRED` while AC25/26 are red, evidence stale or serious independently reproduced security finding is unresolved.
- Only when exact-head default browser and aggregate suite pass, checks are green, no known HIGH/CRITICAL, evidence is consistent and a separate reviewer returns objective APPROVED: `SPRYXEL_IMP_005_CREDIT_LEDGER_COSTGUARD_FOUNDATION_READY_FOR_AUDIT` (executor STOP, **not** permission to merge).
- If environmental failure cannot be eliminated: `SPRYXEL_WO009_BROWSER_ACCEPTANCE_BLOCKED_WITH_REPRO`.

**No downstream WO-010, no checkpoint promotion, no self-merge.**
