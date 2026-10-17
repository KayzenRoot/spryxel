# Control Tower: Fast Feedback / Full Assurance (proposal)

> **PROPOSAL ONLY.** Parent #61, #55. This file does not amend GEF, required GitHub checks, existing admitted Work Orders or tests. Product security invariants remain mandatory. Requires independently reviewed Decision Delta before any workflow/policy change.
> **Primary metric**: wall-clock admission → audited, authorized merge → post-merge PASS, **not** raw number of tests or spawned agents.

## Current observed bottleneck candidate (must benchmark)
Current root `package.json`: `npm test` calls `npm run test:unit && npm run test:worker && npm run test:integration && npm run test:browser`. Each script separately begins with `npm run build`, so this command requests **four builds**. Turborepo may cache much of that work; we **do not claim four full rebuilds** without timing evidence. A single controlled build plus each test stage is an optimization candidate only **after proving identical actual test behavior**. 
- **Current canonical invocation**: `npm test` (do not replace inside existing admitted WO).
- **Experiment only in an isolated approved WO**: `npm run build && npx vitest run && npx tsx scripts/run-worker-smoke.ts && npx tsx scripts/run-integration.ts && npx playwright test`, always preserving **default parallel browser configuration**, no `--workers=1`. Compare output, service setup/teardown, environment contracts and exit status on **exact same source SHA**; if not equivalent, retain canonical invocation.
- Profile separate time spent on npm ci/install, each build invocation, unit, worker, PG/Redis/S3 integration, Playwright, GEF, audit and hosted checks. Benchmark cold and warm cache with measured medians and flake rates, then decide.

## Staged test policy
| Profile | Trigger | Fast required feedback | Allowed to defer? |
| --- | --- | --- | --- |
| **F0 / developer inner loop** | Each small change to owned files | Targeted format/lint/unit/type feedback, targeted screenshot or contract test if applicable | May defer *unaffected* heavyweight infra browser suites **until F1/F2**, not waive them |
| **F1 / isolated task candidate** | Before opening/updating its PR | Changed-workspace full unit, architecture/import restrictions, targeted browser/integration, affected security/contract suites, zero known blocking issues | May not omit any explicit admitted Work Order required acceptance suite |
| **F2 / exact PR HEAD audit** | After final push, before verdict | All Work Order-required tests on actual final HEAD, real service integration when required, default Playwright parallel, four hosted check contexts, security/GEF, objective audit | **None of the required gates may be skipped** |
| **F3 / authorized merge** | Before/after merge | Independent approval, unresolved blocker=0, exact HEAD checks, authorized checkpoint promotion, post-merge smoke | No branch-protection bypass or self-approval |

**Mandatory for HIGH_ASSURANCE:** Any auth/RLS, ledger/CostGuard, payment, sensitive schema/migration, API key, ruleset, supply chain or worker idempotency change triggers explicitly named suites and a separate specialist audit. Do not weaken checks to save time. **If change impact cannot be proved, expand test scope**.

## Concrete cost-saving measures (proposed)
1. **One bundle, multiple admitted WOs**: Codex prompt contains a read-only batch manifest with exact base SHAs; distinct agents use distinct branches/worktrees. Scheduler immediately refills completed agent slots; no barrier waits.
2. **Shared test fixtures only when safely isolated**: local disposable PG/Redis/SeaweedFS can be reused within one integrated build job if each test gets unique tenant/project IDs and deterministic cleanup. Avoid process-global mutable fixture state and flaky `fullyParallel` races.
3. **Build-once integration**: measure Turborepo cache hits and perform a one-build comparison. Do not change `npm test` or pipeline without equivalent evidence and an admitted Work Order.
4. **Worktree-scoped static tooling**: run Biome only on changed files in F0, expand to repository-wide in F2, ensure architecture checks whenever contract boundaries move.
5. **Skip expensive suites only in F0 when proven unaffected**, not in F2; no fake green from test filters, retries, sleeps, or serializing Playwright to hide fixture races.
6. **GitHub Actions**: preserve all required check *names/statuses*, immutable action pins and least privilege; consider cache keying by lockfile + Node + OS + tool versions and sharing artifacts between CI jobs only after supply-chain/security review. Avoid `pull_request_target` untrusted-code execution.
7. **Avoid redundant broad reviews**: one independent scoped audit per immutable final HEAD; if HEAD changes afterward, revalidate mandatory gates. Concurrent WOs keep independent PR receipts.

## Experiment: acceptance evidence
Collect baseline 5 comparable runs when feasible; report (i) elapsed local/hosted stage timings, (ii) worker-slot idle minutes, (iii) total token usage, (iv) exact-head pass ratio, (v) median time to merge + post-merge, (vi) security/quality regressions and (vii) queue/cold start. A 20% faster test pipeline is NOT useful if flaky reruns double or correctness suffers. No guaranteed throughput gains.

## Owner / auditor gate
Do not alter current workflows, `.gef`, rulesets, protected checks, `.engineering/CHECKPOINT.*`, pricing, WorkOS/RLS, WO-008 or its Correction-04. A separate reviewed sequencing/policy Decision Delta and new Context Lock must precede any implementation change. This R0 proposal has no authority to relax requirements.

**STOP**: `SPRYXEL_DEV_PERF_001_OPTIMIZATION_DELTA_READY_FOR_REVIEW`.
