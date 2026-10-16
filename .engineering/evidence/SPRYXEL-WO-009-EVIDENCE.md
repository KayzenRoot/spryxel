# SPRYXEL-WO-009 — Implementation Evidence Bundle

**Independent audit verdict: APPROVED.** The separate HIGH_ASSURANCE reviewer approved code candidate `6cbd9210573815c82f0af60d274c41f31ef0b2bb` and inspected the documentation-only PR head `a52cb9d0d94b57fb4a6025cdb068ec5efc30f312`. No financial or security HIGH/CRITICAL defect was demonstrated. PR #87 remains OPEN/DRAFT; the verdict does not promote the checkpoint or authorize a merge.

**Work Order:** SPRYXEL-WO-009 / IMP-005, HIGH_ASSURANCE.
**Admission:** Owner-approved PR [#86](https://github.com/KayzenRoot/spryxel/pull/86), squash-merged.
**Base:** main@34bad103d8066b6d31c5947c20a07ef52032c5d7.
**Initial implementation commit:** 17fffdc74d09ccef288cb292f39771cbef0c0ae4. **Current code candidate:** `6cbd9210573815c82f0af60d274c41f31ef0b2bb` (tree `2aaa31508111c586ab5fc68d6fe7c785b72e71d0`).
**Branch:** codex/spryxel-wo-009-imp-005-credit-ledger-costguard.
**PR:** [#87, kept as draft](https://github.com/KayzenRoot/spryxel/pull/87).
**PR state at evidence refresh:** OPEN, DRAFT, based on the unchanged execution base; exact code candidate pushed to the authorized branch. Review decision is blank; no formal approval is recorded.
**Context Lock:** .engineering/context-locks/SPRYXEL-WO-009.json; FRESH at preflight, 33/33 exact-main blob pins and approved Work Order blob verified.
**Toolchain:** Node v22.23.3, npm 10.9.9, Docker 29.8.2, Gitleaks 8.30.1.
**Scope controls:** No prices, money movement, paid provider, COGS/GPU/inference, public credit grant, WorkOS change, checkpoint promotion, merge, or IMP-006 work. No CodeRabbit invocation or new paid service.

## Authority and source readback

- The actual branch parent is 8b9fba9fedf5403d8361b9d4d09d6ec118b2e83f. The current main and merge-base are both 34bad103d8066b6d31c5947c20a07ef52032c5d7.
- Admission PR #86 is owner-approved; its merge SHA is 34bad103d8066b6d31c5947c20a07ef52032c5d7. WO-008/IMP-004 remains canonical COMPLETE. This implementation does not change .engineering/CHECKPOINT.json, .engineering/CHECKPOINT.md, .gef, or the immutable decision history.
- The Context Lock was verified before product edits with all 33/33 pins matching exact main. The implementation commit changes only the 17 listed source/test/script paths; the two governance deliverables are recorded separately below.
- GEF doctor is read-only and passed. GEF status is read-only and reports repository DIRTY plus drift UNEXPECTED while this implementation branch differs from canonical checkpoint. The checkpoint is stale relative to the active implementation branch and remains untouched; this observation is not treated as permission to reconcile or promote it.
- .env.local-infra was not read, staged, or edited. No credentials are included in this bundle.

## Implementation summary

- Added forward-only migration 0009 for tenant-owned credit lots, wallet/reservation state, immutable balanced ledger events/postings, idempotency records, reconciliation projection, and narrowly scoped runtime roles. Runtime and worker boundaries use ENABLE and FORCE ROW LEVEL SECURITY; direct posted-ledger mutation is denied. No destructive ledger rollback is introduced; corrections append linked compensating facts.
- Added typed database operations and domain rules using bounded integer credits. Reserve, commit, release, compensation, replay, payload-conflict, tenant scoping, and CostGuard decisions are expressed as explicit transitions with durable operation identity.
- Added a narrow authenticated API boundary and safe contract errors/projection. It fails closed on authorization, policy, or dependency failures and does not expose SQL internals or cross-tenant balances.
- CostGuard denies unknown SKU/policy/cost/bounds, zero-or-negative margin, and above-limit operations. Production cost inputs remain unavailable; the only credit issuance is synthetic integration setup under an owner fixture connection. Existing integrity-check Jobs remain non-costing.
- Added real PostgreSQL role/RLS/ACL, concurrency, overcommit, idempotency, lost-response reconnect, compensation, restart-style pool reopen/reconciliation, and column-level grant regression coverage. The integration runner uses a disposable Compose project, PostgreSQL PGDATA tmpfs, test-only SeaweedFS volume cap 8, and teardown; existing local service containers are not stopped or deleted.

## Exact changed source paths and Git blob IDs

The table below records the initial implementation commit `17fffdc74d09ccef288cb292f39771cbef0c0ae4`. Corrections 09–10 changed these current candidate blobs (verified with `git rev-parse HEAD:<path>`):

| Path | Current candidate Git blob |
|---|---|
| packages/db/src/migrations/0009_credit_ledger_costguard.sql | e998f00aa554ecfafa81fd693b3b93c0ce7a1b27 |
| scripts/credit-ledger-integration.ts | 1f84e5f076cf7e42d420b82f410d3175624589a4 |
| scripts/run-browser-api.ts | 92a18a96751a03cbac9ca6fb631488b80cc389de |
| apps/web/app/page.spec.ts | 6c8db47e716be773a9658faa308dc4d2a822df41 |

The Git root-tree SHA at code candidate `6cbd9210573815c82f0af60d274c41f31ef0b2bb` is `2aaa31508111c586ab5fc68d6fe7c785b72e71d0`. The final PR tree SHA must be read from the post-evidence HEAD; the evidence-only commit does not modify product source paths.

| Path | Git blob |
|---|---|
| apps/api/src/credit-ledger.test.ts | 67770d5238371bc828840de1f6a7f23852fbe4c0 |
| apps/api/src/credit-ledger.ts | a5f95ed640d5025f06c3a4c8b80ec350e00f8d4e |
| apps/api/src/server.test.ts | 9938496d9a8ef87107072b1be323cef327bfdc13 |
| apps/api/src/server.ts | 13f2774a081adb947e7acdc4708a5418d6c48570 |
| packages/contracts/src/index.test.ts | 8d90d829bb633d55358c9c0a1e43a68d516ace33 |
| packages/contracts/src/index.ts | 3a2e2c10a28a07b55f412b57d0cc2520c0987b44 |
| packages/db/src/credit-ledger.ts | 91639b7c7543d8f7488d84afb7ceb37f99d4c43c |
| packages/db/src/index.ts | ab49426e18e34890e522749a777907049e7f364c |
| packages/db/src/migrations/0009_credit_ledger_costguard.sql | 3d3d640eeb414d7fc73ddd3c4a3955cef47eeb36 |
| packages/domain/src/credit-ledger.test.ts | ad585e85fdf8d57103431feec9fc4f5c275e1eb6 |
| packages/domain/src/credit-ledger.ts | e7b0893d4b62df3babf519949e80fdbc5c53fb10 |
| packages/domain/src/index.ts | c7d8821ec2bc1962f66b3a3c36feee86a643a240 |
| scripts/architecture-guard.test.ts | 90f8792e118cc917a9c57f7aa03c0e78acbf8bb3 |
| scripts/architecture-guard.ts | a94381a48bc3321e59859d49cd17c58636b518f3 |
| scripts/check-architecture.test.ts | a387da532c4918275ae0ae3596b46c426a456d52 |
| scripts/credit-ledger-integration.ts | 730a94de6eafcd034011eb1188612a670821fd0b |
| scripts/run-integration.ts | eb99affbbe1db7cac8597734d30c596e2936fdfe |

## Validation receipts

All local commands below ran on the stated Node/npm toolchain. Exit codes are observed, not inferred.

| Command | Result | Evidence |
|---|---|---|
| npm ci --no-audit --no-fund | PASS, exit 0 | Installed 218 lockfile packages; exact package lock retained. |
| npm run format:check -- --line-ending=crlf | PASS, exit 0 | 120 files checked on current code candidate. |
| npm run lint | PASS, exit 0 | 120 files checked, zero warnings on current code candidate. |
| npm run architecture:check | PASS, exit 0 | 11 workspaces, 15 internal edges, no forbidden persistence/provider imports or cycles. |
| npm run typecheck -- --force | PASS, exit 0 | 18/18 Turbo tasks on current code candidate. |
| npm run build -- --force | PASS, exit 0 | 11/11 Turbo tasks on current code candidate. |
| npm run test:unit | PASS, exit 0 | After fixture-label correction: 24 files, 120 tests passed. |
| npm run test:integration | PASS, exit 0 | Real PostgreSQL, Redis/BullMQ, authenticated SeaweedFS S3, migrations, FORCE RLS, role/column ACLs, double-spend/overcommit denial, replay after lost response/reconnect, immutable postings, reconciliation, terminal release guard, and disposable Compose teardown. |
| npm run test:browser, standard config | PASS, exit 0 | Two complete runs, each 22/22 with the default 4 workers/retries; no tests skipped or settings weakened. |
| npm test | PASS, exit 0 | Final post-format aggregate: 120/120 unit tests, worker smoke, real-service integration, and 22/22 browser tests. |
| npm audit --audit-level=high | PASS, exit 0 | Zero vulnerabilities reported; package lock unchanged. |
| Gitleaks 8.30.1, redacted scan of base..implementation commit | PASS, exit 0 | Zero findings after replacing opaque fixture idempotency strings with explicit fixture labels; no allowlist or scanner suppression. GitHub Gitleaks check also passed on the exact implementation SHA. |
| git diff --check | PASS, exit 0 | No whitespace errors; worktree clean after restoring generated apps/web/next-env.d.ts. |
| npm run gef:doctor | PASS, exit 0 | Read-only; ok=true, no remediation. |
| npm run gef:status | OBSERVED, exit 0 | Read-only; repository DIRTY and drift UNEXPECTED because the implementation is active on its branch; canonical checkpoint remains unchanged. |

### Playwright correction record

Corrections 09–10 resolved the observed failures without changing timeout, retry, worker count, or test selection. The server-action helper recognizes the legitimate HTML form POST/303 response as well as same-route server submissions; the deterministic `jobs-all-states` fixture displays all six states in one Jobs route visit. Two full standard-config runs passed 22/22, and the final aggregate `npm test` also passed. Earlier failed runs remain diagnostic history, not acceptance evidence.

## Hosted checks on the exact implementation commit

At exact code candidate `6cbd9210573815c82f0af60d274c41f31ef0b2bb`, GitHub showed **7/7 substantive checks SUCCESS**, including the four required repository checks, Trivy, two Socket checks, and SonarCloud Code Analysis. Sonar status is SUCCESS; issue-level severity was not independently classified and this is not evidence of zero findings:

- [Gitleaks secrets](https://github.com/KayzenRoot/spryxel/actions/runs/38980944468/job/117241418407) — PASS.
- [Pipeline integrity](https://github.com/KayzenRoot/spryxel/actions/runs/38980944477/job/117241418315) — PASS.
- [Repository validation](https://github.com/KayzenRoot/spryxel/actions/runs/38980944502/job/117241418438) — PASS.
- [Trivy filesystem and configuration](https://github.com/KayzenRoot/spryxel/actions/runs/38980944520/job/117241418573) — PASS.
- [Socket Security: Project Report](https://socket.dev/dashboard/org/nexlabs/sbom/a36df1a7-5a32-45dc-8739-79e89a304810) — PASS.
- Socket Security: Pull Request Alerts — PASS.
- [SonarCloud Code Analysis](https://sonarcloud.io/dashboard?id=KayzenRoot_spryxel&pullRequest=87) — SUCCESS on exact code candidate `6cbd9210573815c82f0af60d274c41f31ef0b2bb`; no finding-severity conclusion is claimed.
- CodeRabbit status context is automatic-review-disabled/skipped; the executor did not invoke it and it is excluded from the 7 passing checks.

At pre-audit-evidence PR HEAD `a52cb9d0d94b57fb4a6025cdb068ec5efc30f312` (documentation-only changes after the code candidate), GitHub showed **7/7 substantive checks SUCCESS** as of 2026-10-16 23:28 UTC. The audit evidence update itself changes only the four listed `.engineering/` documents; the live PR checks page must be read for checks on the resulting HEAD:

- [Gitleaks secrets](https://github.com/KayzenRoot/spryxel/actions/runs/38981553754/job/117243342680) — PASS.
- [Pipeline integrity](https://github.com/KayzenRoot/spryxel/actions/runs/38981553773/job/117243342250) — PASS.
- [Repository validation](https://github.com/KayzenRoot/spryxel/actions/runs/38981553747/job/117243341803) — PASS.
- [Trivy filesystem and configuration](https://github.com/KayzenRoot/spryxel/actions/runs/38981553740/job/117243342190) — PASS.
- [Socket Security: Project Report](https://socket.dev/dashboard/org/nexlabs/sbom/73d8ef80-c7e4-490a-9c76-4900714c0ecd) — PASS.
- Socket Security: Pull Request Alerts — PASS.
- [SonarCloud Code Analysis](https://sonarcloud.io/dashboard?id=KayzenRoot_spryxel&pullRequest=87) — SUCCESS.

The [PR #87 checks page](https://github.com/KayzenRoot/spryxel/pull/87/checks) is the live source for later check updates.

## Independent HIGH_ASSURANCE audit

**Verdict: APPROVED** for the reviewed implementation candidate. The independent reviewer inspected the admitted sources, AC01–AC28, migration/ledger invariants, tenant isolation, FORCE RLS/ACL, concurrency/idempotency, terminal release, CostGuard and the Sonar findings. It found no demonstrable financial or security HIGH/CRITICAL defect and made no edits.

- The reviewer independently ran `npm run test:integration` — PASS, exit 0, real PostgreSQL and disposable services, including RLS/ACL, concurrency, replay, reconciliation and AC17.
- The reviewer independently ran `npm run test:unit` — PASS, exit 0, 24 files and 120 tests.
- The reviewer did not rerun the browser suite, aggregate `npm test`, audit, build, or hosted checks; those results are separately recorded above and in the exact-head check links.
- SonarCloud inventory: 109 open/confirmed issues, all `CODE_SMELL`: 76 Critical, 5 Major, 28 Minor; zero Security Hotspots; 0.0% new-code coverage and 2.7% duplication. The reviewer classified the 71 SQL duplicate-literal findings as maintenance concerns; it found no divergent role, ACL, status or session-setting literal that changes access or ledger behavior. The five complexity findings increase review/maintenance cost; the reviewer inspected `withCreditTransaction`, `evaluateCostGuard`, `reconcileCreditLedgerSnapshot`, `applyCompensation` and the integration assertion helper without finding an incorrect financial branch. The five Major and 28 Minor findings also remain maintenance debt, not demonstrated security or financial defects.
- The zero new-code coverage is a material evidence limitation and is not described as covered. Test executions passed, but Sonar line/branch coverage for new code remains 0.0%.

This independent verdict satisfies the audit criterion only; it does not change the canonical checkpoint, merge the PR, or authorize the next increment.

## WO009 acceptance matrix

| AC | Status | Evidence / limitation |
|---|---|---|
| AC01 exact base and fingerprints | PASS | main and merge-base 34bad103d8066b6d31c5947c20a07ef52032c5d7; Context Lock 33/33 pins verified before edits. |
| AC02 decisions/history/GEF preserved | PASS | No checkpoint, decision-history, or .gef edits; read-only GEF doctor/status recorded above. |
| AC03 forward-only repeatable migration | PASS | Migration 0009 and real migration harness/repeated integration pass; no destructive ledger DDL. |
| AC04 tenant ownership, FORCE RLS, least privilege | PASS | Migration validators and real PostgreSQL role/grant/RLS integration. |
| AC05 member/app/worker/no-context/cross-tenant matrix | PASS | Real PostgreSQL role and tenant matrix, including column-level ACL rejection. |
| AC06 bounded integer arithmetic | PASS | Domain tests for invalid/negative/overflow/underflow and bounded credit amounts. |
| AC07 posted-ledger UPDATE/DELETE prevention | PASS | Runtime/worker grants rejected by SQL validators and integration. |
| AC08 linked compensation and immutable history | PASS | Compensation event and immutable posting regression. |
| AC09 exact balance reconciliation after restart/reopen | PASS | Fresh pool reopen reconciles wallet summary, entries, balanced events, and reservation state. |
| AC10 concurrent reserve cannot double-spend | PASS | Concurrent real PostgreSQL reservation race and nonnegative balance assertions. |
| AC11 identical idempotency replay | PASS | Same tenant/key/payload returns durable original operation without a second event. |
| AC12 mismatched payload conflict | PASS | Same key with changed normalized payload returns safe idempotency conflict. |
| AC13 tenant isolation for token reuse | PASS | Independent tenant fixtures can reuse operation keys without collision/leak. |
| AC14 fixture-only issuance/no public mint path | PASS | Issuance is seeded only through integration owner fixture; no public grant endpoint. |
| AC15 atomic Job/contract/tenant references | PASS | Reservation links to canonical Job/contract under the same tenant transaction. |
| AC16 commit bounded by reservation and replay-safe | PASS | Real PostgreSQL rejects commit above remaining reservation with no ledger mutation; duplicate commit replay is stable. |
| AC17 exactly-once release | PASS | Direct full and partial SQL `release` attempts are denied for `queued` and `running` Jobs; persisted reservations, balances, events, postings and wallet snapshots remain unchanged. Terminal cleanup releases exactly once through the Job status trigger. |
| AC18 lost response/reconnect recovery | PASS | Commit response discarded, app pool recreated, same key replayed; event/posting identity and counts remain stable. |
| AC19 unknown/missing/stale policy inputs deny | PASS | Pure CostGuard default-deny and error-path tests. |
| AC20 margin and hard budget bounds | PASS | Non-positive margin and above-limit cases deny. |
| AC21 maximums/operation bounds not reset by retry | PASS | Domain and API tests preserve configured maxima across replay. |
| AC22 existing integrity-check Job stays non-costing | PASS | No provider/GPU/payment calls; integration asserts integrity Job remains outside credit costing. |
| AC23 authorized read projection and safe errors | PASS | Tenant-scoped read-only API summary and redacted machine-readable errors. |
| AC24 unit and real PostgreSQL race/recovery coverage | PASS | 120 unit tests plus real-service integration suite. |
| AC25 existing Jobs/Auth/Projects and browser regressions | PASS | Full standard Playwright suite passed 22/22 twice, including Jobs, Auth, Projects, terminal cancellation and all-state coverage; no worker/retry/timeout relaxation. |
| AC26 clean install/full validation/npm test/audit | PASS | `npm ci`, format, lint, architecture, typecheck, build, unit, worker, integration, full `npm test`, and `npm audit` all exited 0 on the current code candidate. |
| AC27 exact-head checks, Sonar/quality, no HIGH/CRITICAL | PASS | Seven substantive checks pass on code candidate `6cbd921` and current PR HEAD `a52cb9d`. Independent reviewer classified the 109 reported Sonar items (76 Critical, 5 Major, 28 Minor; all smells) and found no financial/security HIGH/CRITICAL defect. Sonar new-code coverage remains 0.0%, documented as a limitation. |
| AC28 evidence and independent HIGH_ASSURANCE verdict | PASS | Evidence Bundle is refreshed and the distinct read-only reviewer returned APPROVED for the code candidate. This does not claim checkpoint promotion or merge authorization. |

## Proposed delta, risks, and next required action

- Proposed checkpoint delta remains PROPOSED_ONLY / NOT_ACCEPTED / NOT_PROMOTED. Canonical checkpoint is main@34bad103d8066b6d31c5947c20a07ef52032c5d7 and still reports WO-008 complete. No checkpoint edit was made.
- Audit is complete with verdict APPROVED. Keep PR #87 draft at the Work Order stop state; no merge, checkpoint promotion, release, or IMP-006 action is included in this executor handoff.

## Exit and review

Executor stop state: SPRYXEL_IMP_005_CREDIT_LEDGER_COSTGUARD_FOUNDATION_READY_FOR_AUDIT. Independent audit verdict: APPROVED. The executor cannot self-promote the proposed checkpoint delta or merge beyond the Work Order stop state.
