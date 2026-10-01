# SPRYXEL-WO-001 — GEF 1.1.1 GitHub Governance Bootstrap

Status: ADMITTED_FOR_EXECUTION  
Risk: ELEVATED  
Tracking issue: #2  
Execution base: `main@10dca04e38cfcd2e07335faf9078cc6041766c02`  
GEF release source: `KayzenRoot/gef-bootstrap@1dc030f1358eab0347043a3d54c7fc311c7c2123` / tag `v1.1.1`

## OBJECTIVE
Make the GitHub/GEF governance layer operational and fail-safe before any Spryxel product work.

## CONTEXT
GEF 1.1.1 is installed/initialized and bootstrap validation passed. Current provider gap: no ruleset protects `main`. Product scope is not yet defined and must remain untouched.

The Source Pack was intentionally added after the immutable init baseline. In the exact v1.1.1 release, the public status path invokes project drift detection with `authorized: false`; therefore legitimate post-init repository changes can still project as `drift.class=UNEXPECTED`. This Work Order treats that value as a raw baseline-difference signal and requires path-by-path reconciliation against the authorized Git delta. It must never be suppressed by editing GEF managed state.

## SCOPE
- preflight exact repo/provider state and capture before snapshot;
- validate the Context Lock and reconcile all existing project drift from the init baseline to this admitted planning head;
- create durable repository-validation, pipeline-integrity, Gitleaks and Trivy CI;
- add/complete governance support files, templates, ownership and dependency-update config where justified;
- pin third-party Actions to immutable SHAs and least privileges;
- validate npm/GEF/checkpoint/status determinism;
- ensure `gef-managed` and `governed` labels;
- configure safe repository settings without changing visibility;
- after successful exact-head contexts exist, create and read-back an active `main` ruleset: deletion + non-fast-forward blocked, PR required, review threads resolved, 0 approving reviewers, no bypass, only proven-success required checks;
- produce Evidence Bundle and proposed Checkpoint Delta.

## OUT OF SCOPE
Product code/architecture/features; visibility changes; paid mandatory services; GEF upgrade; history rewrite; destructive branch/tag/release changes; manual rewriting/rebaselining of `.gef/init-state.json`, `.gef/adopt-state.json` or GEF receipts.

## FILES / SOURCES TO READ
MUST_READ: CHECKPOINT JSON/MD, DECISIONS-LEDGER, SCOPE, DoD, ARCHITECTURE, REQUIREMENTS, SECURITY, TEST-BENCHMARK-PLAN, DEPLOYMENT, this Work Order, its Context Lock, package files, `.gef/init-state.json`, current `.github/**`.  
READ_IF_TRIGGERED: GEF exact v1.1.1 release source at `1dc030f1358eab0347043a3d54c7fc311c7c2123`, especially ADR-0008, GitHub-first workflow, CLI registry drift projection and the reference ruleset behavior.  
WRITE_ALLOWED: `.github/**`, `AGENTS.md`, governance docs only where evidence requires a WO-scoped correction, `.engineering/evidence/SPRYXEL-WO-001-EVIDENCE.md`, proposed checkpoint-delta file.  
WRITE_FORBIDDEN: product source/runtime files, manual GEF baseline/receipt rewrites, unrelated canonical product decisions.

## REQUIREMENTS
Exact GEF 1.1.1; doctor success; deterministic repeated status; supported checkpoint schema 2; every observed project drift path reconciled to admitted Git evidence; no manual baseline rewrite; checks green before ruleset requirement; provider read-back; reversible changes.

## ARCHITECTURE RULES
Git-backed canonical truth; GitHub as transport; Codex is implementation/CI executor; GEF drift is an immutable-baseline diagnostic, while authorization comes from WO/Context Lock/diff/evidence; no nonexistent required checks; free/native/open tooling; least privilege; provider state and repo diff evidenced separately.

## CONSTRAINTS
No force push/history rewrite/destructive mutation/visibility change/paid mandatory gate/scope expansion. Context drift => STALE/stop. Missing admin permission => BLOCKED; never weaken the contract. Never edit managed GEF state merely to force `drift.changed=false`.

## ACCEPTANCE CRITERIA
1. Exact final clean PR head is known.
2. `npm ci` succeeds with the committed lockfile.
3. Installed GEF reports exactly 1.1.1.
4. `gef doctor --json` succeeds and checkpoint governance is present/readable/valid.
5. Two consecutive `gef status --json` outputs are byte-identical.
6. The final Evidence Bundle records the GEF baseline ref/fingerprint and current drift projection; every delta path from the recorded baseline is explained by PR #1 bootstrap evidence, this Source Pack/WO or the current PR diff. Any unexplained/out-of-scope delta is BLOCKING.
7. No managed GEF baseline/receipt file is manually rewritten to manufacture a clean drift result.
8. Repository validation, Pipeline integrity, Gitleaks secrets and Trivy filesystem and configuration succeed on the exact final head.
9. No unresolved CRITICAL/HIGH finding introduced by this WO exists.
10. `main` ruleset is active, targets only `refs/heads/main`, prevents deletion and non-fast-forward, requires PRs/thread resolution, has no bypass, and requires only proven-success check contexts.
11. Provider read-back proves the intended ruleset/settings/labels.
12. Evidence Bundle includes base/head SHA, changed paths, commands/results, exact check URLs/IDs, ruleset before/after snapshot, drift reconciliation, risks and proposed Checkpoint Delta.
13. No Spryxel product implementation exists in the diff.

## TESTS
`npm ci --ignore-scripts --no-audit --no-fund`; exact version JSON assertion; doctor; two byte-identical statuses; explicit drift reconciliation against Git history/diff; JSON/YAML/config validation; `git diff --check`; exact-head Actions; Gitleaks; Trivy; `gh api` provider read-back; negative missing-check/deadlock proof.

## DELIVERABLES
Repo governance/CI/config; verified provider ruleset/settings; Evidence Bundle; proposed Checkpoint Delta; PR evidence update.

## REVIEW FORMAT
Brazilian Portuguese Evidence Bundle: base/head, changed paths, provider mutations, PASS/FAIL tests/checks, GEF baseline/drift reconciliation, findings by severity, risks/gaps, ruleset read-back, proposed checkpoint delta, READY_FOR_AUDIT or BLOCKED.

## STOP CONDITION
`SPRYXEL_WO_001_EXACT_HEAD_AND_PROVIDER_STATE_READY_FOR_AUDIT`

Do not merge. Do not self-promote checkpoint.
