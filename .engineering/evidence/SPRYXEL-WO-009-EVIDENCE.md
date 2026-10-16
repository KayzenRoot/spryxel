# SPRYXEL-WO-009 — Implementation Evidence Bundle

**Verdict: CORRECTION REQUIRED.** The implementation and financial-integrity proofs are present, but the required aggregate test gate is not green: the standard Windows Playwright run repeatedly timed out in pre-existing Home/Projects/Jobs browser tests. Stop state: SPRYXEL_WO009_CORRECTION_REQUIRED. This is not an approval, checkpoint promotion, or merge authorization.

**Work Order:** SPRYXEL-WO-009 / IMP-005, HIGH_ASSURANCE.
**Admission:** Owner-approved PR [#86](https://github.com/KayzenRoot/spryxel/pull/86), squash-merged.
**Base:** main@34bad103d8066b6d31c5947c20a07ef52032c5d7.
**Implementation commit:** 17fffdc74d09ccef288cb292f39771cbef0c0ae4.
**Branch:** codex/spryxel-wo-009-imp-005-credit-ledger-costguard.
**PR:** [#87, kept as draft](https://github.com/KayzenRoot/spryxel/pull/87).
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

Blob IDs are from implementation commit 17fffdc74d09ccef288cb2e178b8cf761106c8de.

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
| npm run format:check -- --line-ending=crlf | PASS, exit 0 | 119 files checked after the fixture-label correction. |
| npm run lint | PASS, exit 0 | 119 files checked, zero warnings after correction. |
| npm run architecture:check | PASS, exit 0 | 11 workspaces, 15 internal edges, no forbidden persistence/provider imports or cycles. |
| npm run typecheck -- --force | PASS, exit 0 | 18/18 Turbo tasks; run before the final human-readable test-fixture label change. |
| npm run build -- --force | PASS, exit 0 | 11/11 Turbo tasks; run before the final test-fixture label change. |
| npm run test:unit | PASS, exit 0 | After fixture-label correction: 24 files, 120 tests passed. |
| npm run test:integration | PASS, exit 0 | Real PostgreSQL, Redis/BullMQ, authenticated SeaweedFS S3, migrations, FORCE RLS, role/column ACLs, double-spend/overcommit denial, replay after lost response/reconnect, immutable postings, reconciliation, and disposable Compose teardown. Run before the final test-fixture label change; that change only replaces API unit-test fixture strings. |
| npm test | FAIL, exit 1 | Unit, worker smoke, and real-service integration passed; Playwright completed 9/20. This aggregate run preceded the fixture-label-only correction. |
| npm run test:browser, standard config | FAIL, exit 1 | Repeated without changing the default 4 workers or retries: one run 15/20; later run 10/20. No tests were skipped and no workers=1 workaround was used. |
| npm audit --audit-level=high | PASS, exit 0 | Zero vulnerabilities reported; package lock unchanged. |
| Gitleaks 8.30.1, redacted scan of base..implementation commit | PASS, exit 0 | Zero findings after replacing opaque fixture idempotency strings with explicit fixture labels; no allowlist or scanner suppression. GitHub Gitleaks check also passed on the exact implementation SHA. |
| git diff --check | PASS, exit 0 | No whitespace errors; worktree clean after restoring generated apps/web/next-env.d.ts. |
| npm run gef:doctor | PASS, exit 0 | Read-only; ok=true, no remediation. |
| npm run gef:status | OBSERVED, exit 0 | Read-only; repository DIRTY and drift UNEXPECTED because the implementation is active on its branch; canonical checkpoint remains unchanged. |

### Playwright failure triage

Three standard-parallel browser runs were non-green. The latest ended 10/20. Retained traces show slow Windows Next dev filesystem/server responses, requests to RSC detail routes aborted during browser cleanup, and some browser sessions closing during a 30-second timeout. `/projects` and `/jobs` SPA responses were HTTP 200 in two navigation failures, while the prior page DOM remained visible. A read-only browser QA triage found no shared fixture-ID collision and no evidence establishing a product defect; its classification is probable local dev-server/resource flakiness, not a conclusive exemption. The cancellation test did not reach its cancel request in the failed trace. This remains an acceptance failure until the full suite passes under the standard configuration.

## Hosted checks on the exact implementation commit

At 17fffdc74d09ccef288cb292f39771cbef0c0ae4, the four required repository checks passed, as did Trivy and both Socket checks. A subsequent exact-HEAD GitHub readback of `8b62f72e1acb7685428017529c02253ecc683c56` (Correction Delta 01 documentation commit, with the same product implementation) verified **7/7 SUCCESS**, including SonarCloud Code Analysis. Sonar Quality Gate PASS reported 93 new issues, 0 security hotspots, and 0.0% reported coverage on new code. Issue-level severity remains not independently classified due missing access; PASS must not be equated to 0 open issues:

- [Repository validation](https://github.com/KayzenRoot/spryxel/actions/runs/38821382481/job/116718502743) — PASS.
- [Pipeline integrity](https://github.com/KayzenRoot/spryxel/actions/runs/38821382450/job/116718502774) — PASS.
- [Gitleaks secrets](https://github.com/KayzenRoot/spryxel/actions/runs/38821382456/job/116718502493) — PASS.
- [Trivy filesystem and configuration](https://github.com/KayzenRoot/spryxel/actions/runs/38821382561/job/116718502630) — PASS.
- [Socket Security: Project Report](https://socket.dev/dashboard/org/nexlabs/sbom/81965ee5-6841-453e-b0d4-189d4b683214) — PASS.
- Socket Security: Pull Request Alerts — PASS.
- SonarCloud — **OBSERVED SUCCESS** on exact Correction Delta documentation HEAD `8b62f72e1acb7685428017529c02253ecc683c56`. Quality Gate PASS, 93 new issues (severity details unavailable), 0 security hotspots, 0.0% coverage reported. A future product-fix HEAD must be checked again.
- CodeRabbit — automatic review was disabled/skipped by the repository; the executor did not invoke it.

The [PR #87 checks page](https://github.com/KayzenRoot/spryxel/pull/87/checks) is the live source for checks attached to the current PR head. Evidence and checkpoint-document commits may produce a newer head and must be checked again.

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
| AC17 exactly-once release | PASS | Terminal workflow release is durable/idempotent and tested after replay. |
| AC18 lost response/reconnect recovery | PASS | Commit response discarded, app pool recreated, same key replayed; event/posting identity and counts remain stable. |
| AC19 unknown/missing/stale policy inputs deny | PASS | Pure CostGuard default-deny and error-path tests. |
| AC20 margin and hard budget bounds | PASS | Non-positive margin and above-limit cases deny. |
| AC21 maximums/operation bounds not reset by retry | PASS | Domain and API tests preserve configured maxima across replay. |
| AC22 existing integrity-check Job stays non-costing | PASS | No provider/GPU/payment calls; integration asserts integrity Job remains outside credit costing. |
| AC23 authorized read projection and safe errors | PASS | Tenant-scoped read-only API summary and redacted machine-readable errors. |
| AC24 unit and real PostgreSQL race/recovery coverage | PASS | 120 unit tests plus real-service integration suite. |
| AC25 existing Jobs/Auth/Projects and browser regressions | CORRECTION REQUIRED | Standard browser suite repeatedly failed locally; latest 10/20. Do not treat likely flakiness as PASS. |
| AC26 clean install/full validation/npm test/audit | CORRECTION REQUIRED | Install, static checks, unit, build, migration/integration, and audit passed; aggregate npm test exited 1 because browser suite was not green. |
| AC27 exact-head checks, Sonar/quality, no HIGH/CRITICAL | PARTIAL | **7/7 SUCCESS** including SonarCloud on Correction Delta documentation HEAD `8b62f72e1acb7685428017529c02253ecc683c56`; 93 new issues and unknown issue-level severity, 0 hotspots and 0.0% reported new-code coverage. No independently established HIGH/CRITICAL defect; full separate financial audit remains pending. Rerun/readback exact final code HEAD. |
| AC28 evidence and independent HIGH_ASSURANCE verdict | CORRECTION REQUIRED | Evidence and proposed delta are updated; distinct objective HIGH_ASSURANCE audit is still required, and the local test gate is not green. No approval or promotion claimed. |

## Proposed delta, risks, and next required action

- Proposed checkpoint delta remains PROPOSED_ONLY / NOT_ACCEPTED / NOT_PROMOTED. Canonical checkpoint is main@34bad103d8066b6d31c5947c20a07ef52032c5d7 and still reports WO-008 complete. No checkpoint edit was made.
- Main unresolved gate: run the complete standard npm test suite successfully, including all 20 browser tests, on this source commit in the supported Windows environment or provide reproducible evidence that a scoped environment correction is needed. Do not reduce Playwright workers, increase timeouts, skip tests, or mark the browser failures flaky without a green run.
- After the local aggregate suite is green, recheck the final product HEAD's CI, SonarCloud and Socket statuses; then request the distinct read-only HIGH_ASSURANCE audit. Current 7/7 green hosted checks do not waive the failing browser suite. Keep PR #87 draft until the Work Order criteria are satisfied. Do not merge, promote, or start IMP-006.

## Exit and review

Executor stop state: SPRYXEL_WO009_CORRECTION_REQUIRED. The implementation is not marked READY_FOR_INDEPENDENT_AUDIT because AC25/AC26 are not green. Final independent audit verdict remains pending: APPROVED / CORRECTION REQUIRED / BLOCKED. The executor cannot self-approve or promote this candidate.
