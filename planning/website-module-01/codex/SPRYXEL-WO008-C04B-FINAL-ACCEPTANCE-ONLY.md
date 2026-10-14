# Codex Cloud: WO-008 / Correction Delta 04-B | FINAL ACCEPTANCE ONLY

**Repository:** `KayzenRoot/spryxel`  
**Active PR:** [#30](https://github.com/KayzenRoot/spryxel/pull/30), HIGH_ASSURANCE, WO-008 / IMP-004  
**Expected HEAD at start:** `4a7d696b72ffab6f1569510d1059f42964864626`  
**Protected canonical main:** `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`  
**Corrective authority:** `.engineering/correction-deltas/SPRYXEL-WO-008-CORRECTION-04.md` on #30, and its **FRESH** `.engineering/context-locks/SPRYXEL-WO-008.json`.  
**Intent:** exact remaining C-04-B evidence only; **do not do another feature/coding pass** without a real reproducible failing acceptance.  
**STOP:** `SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT` only if every mandated gate has independent evidence; otherwise `BLOCKED_WITH_EVIDENCE` (do not fake PASS).

## Why this is necessary now

This is the shortest path to safely unblocking the owner-approved G0/D-162 website governance exception and Batch02. A merge of any unrelated proposal into `main` **now** would change `executionBase.sha` of the currently FRESH WO008 Context Lock and invalidate its HIGH_ASSURANCE evidence. The site Batch02 therefore stays blocked until WO008 is objectively reviewed and closed. The four required GitHub workflows and Sonar/Socket already passed on exact #30 HEAD but **do not run the full functional suites**. Correction C-04-A isolated mutable `jobs-populated-*` fixtures and added an explicit two-context regression; C-04-B still lacks default-parallel acceptance.

## Preflight (fail-closed)

1. Read completely the current immutable WO008 Work Order, `Correction-04`, its FRESH Context Lock, current Evidence Bundle, Source Hierarchy, Checkpoint and the PR #30 body. Confirm exact current head `4a7d696b72ffab6f1569510d1059f42964864626`, `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`, no unexpected protected-source drift, current GEF `@gef-bootstrap/cli@1.1.1`.
2. Use the authorized `codex/spryxel-wo-008-imp-004-asset-contract-jobs` branch and a clean permitted worktree. Do not reset/force-push, cherry-pick PR82 governance, touch PRs #75/#76/#80/#82, or merge.
3. Confirm local Node 22/npm10 runtime, npm dependencies and legitimate local/test credentials available for **real** PostgreSQL 18.6 with FORCE RLS, Redis/BullMQ, SeaweedFS. If absent, document exact infrastructure blocker as `NOT_RUN`; do not substitute mocks for required live integrations, fake results or loosen config.
4. Confirm `playwright.config.ts` still uses `fullyParallel:true`, `retries:0`, **no workers=1 override**, test-only fixture cannot run in production.

## Only remaining HIGH_ASSURANCE acceptance (don't redo implementation)

- `npm ci --no-audit --no-fund` clean installation, document runtime.
- `npm run format:check`, `npm run lint`, `npm run typecheck -- --force`, `npm run build -- --force`, `npm run architecture:check`.
- `npm run test:unit`, `npm run test:worker`, `npm run test:integration` with the REAL services/RLS/runtime restrictions.
- **`npm run test:browser` EXACTLY, twice consecutively** on same final code, with repository default workers/parallel config. Record both exit codes, complete passed/failed counts, worker count, seed/port and concurrency; no runner serialization, no sleep/retries to conceal races.
- **`npm test` EXACTLY, with default browser workers**, including unit, worker, real integration and browser. Record exit and test counts.
- `npm audit --audit-level=high`, `git diff --check`; GEF 1.1.1 doctor and two read-only status snapshots, with D-0007 drift reconciliation, not forced GEF baseline rewrite.
- Verify actual independent 2-context Job fixture regression is executed and passed, not just compiled.
- If any real test fails, STOP with exact log excerpt/first root cause. If a genuinely scope-bounded C-04 defect is reproducible, apply the minimum relevant correction **only after verifying delta allows it**, then restart acceptance on the resulting head; no opportunistic refactor.

## Evidence and final HEAD

1. Report complete command list, exact actual runtimes/exit codes, two default-parallel browser results, default aggregate, infra versions, GEF results, audit, non-run gates and test proof in `.engineering/evidence/SPRYXEL-WO-008-EVIDENCE.md`, replacing C-04 `PENDING` statements ONLY where real evidence passed.
2. Commit evidence-only change with `docs(evidence): attest WO008 C04 canonical parallel and aggregate acceptance (#30)`; do not change the Work Order, Context Lock, Checkpoint, Decisions Ledger, Source Hierarchy, AuthKit/proxy, ruleset, CI, dependencies or GEF. **If admission rules forbid the evidence commit, STOP and report.**
3. After push, independently verify final exact HEAD changed as expected and all four required workflow checks plus SonarCloud and both Socket checks PASS on THIS final HEAD. No relying on precommit/old HEAD checks. Check zero unresolved review threads.
4. Add full PR #30 review-facing attestation with exact final HEAD, check-run URLs, real services proof, default Playwright 2x, default `npm test`, and explicit `READY_FOR_INDEPENDENT_AUDIT` only if all requirements satisfied. If final evidence-only commit requires a repeated audit/functional run at final HEAD per current source, run it or explicitly leave `NOT_RUN`; no waiver.
5. Stop and leave **PR #30 UNMERGED** and canonical source unchanged. An independent reviewer will decide on WO-008 acceptance, then a separately authorized governance-only merge can be revisited without invalidating a FRESH active lock.

### Forbidden
No `--workers=1`, no global lowering concurrency, no fake credentials/prod fixture, no new assets/credit ledger/providers/payment/Blender, no merge/rebase/force push, no weakening branch protection or adding Github workflow to bypass tests, no fabricated counts, no changing G0/G1.

**STOP CONDITION:** `SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT` if objectively satisfied, else `BLOCKED_WITH_EVIDENCE`.
