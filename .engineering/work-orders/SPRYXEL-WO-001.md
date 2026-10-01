# SPRYXEL-WO-001 — GEF 1.1.1 GitHub Governance Bootstrap

Status: ADMITTED_FOR_EXECUTION  
Risk: ELEVATED  
Tracking issue: #2  
Execution base: `main@10dca04e38cfcd2e07335faf9078cc6041766c02`  
GEF reference: `KayzenRoot/gef-bootstrap@5a32a607ccf2055fab722f3d5d452791c6aae3e6`

## OBJECTIVE
Make the GitHub/GEF governance layer operational and fail-safe before any Spryxel product work.

## CONTEXT
GEF 1.1.1 is installed/initialized and bootstrap validation passed. Current provider gap: no ruleset protects `main`. Product scope is not yet defined and must remain untouched.

## SCOPE
- preflight exact repo/provider state and capture before snapshot;
- create durable repository-validation, pipeline-integrity, Gitleaks and Trivy CI;
- add/complete governance support files, templates, ownership and dependency-update config where justified;
- pin third-party Actions to immutable SHAs and least privileges;
- validate npm/GEF/checkpoint/status determinism;
- ensure `gef-managed` and `governed` labels;
- configure safe repository settings without changing visibility;
- after successful exact-head contexts exist, create and read-back an active `main` ruleset: deletion + non-fast-forward blocked, PR required, review threads resolved, 0 approving reviewers, no bypass, only proven-success required checks;
- produce Evidence Bundle and proposed Checkpoint Delta.

## OUT OF SCOPE
Product code/architecture/features; visibility changes; paid mandatory services; GEF upgrade; history rewrite; destructive branch/tag/release changes.

## FILES / SOURCES TO READ
MUST_READ: CHECKPOINT JSON/MD, DECISIONS-LEDGER, SCOPE, DoD, ARCHITECTURE, REQUIREMENTS, SECURITY, TEST-BENCHMARK-PLAN, DEPLOYMENT, this Work Order, its Context Lock, package files, `.gef/init-state.json`, current `.github/**`.  
READ_IF_TRIGGERED: GEF exact-ref ADR-0008, GitHub-first workflow and reference ruleset.  
WRITE_ALLOWED: `.github/**`, `AGENTS.md`, governance docs only where evidence requires a WO-scoped correction, `.engineering/evidence/SPRYXEL-WO-001-EVIDENCE.md`, proposed checkpoint-delta file.  
WRITE_FORBIDDEN: product source/runtime files, `.gef/init-state.json` rewrite, unrelated canonical product decisions.

## REQUIREMENTS
Exact GEF 1.1.1; doctor success; deterministic status; supported checkpoint schema 2; checks green before ruleset requirement; provider read-back; reversible changes.

## ARCHITECTURE RULES
Git-backed canonical truth; GitHub as transport; Codex is implementation/CI executor; no nonexistent required checks; free/native/open tooling; least privilege; provider state and repo diff evidenced separately.

## CONSTRAINTS
No force push/history rewrite/destructive mutation/visibility change/paid mandatory gate/scope expansion. Context drift => STALE/stop. Missing admin permission => BLOCKED; never weaken the contract.

## ACCEPTANCE CRITERIA
Exact final clean head; npm/GEF/doctor/status PASS; checkpoint valid; four core check contexts PASS; no unresolved HIGH/CRITICAL; safe active ruleset read-back; provider settings/labels read-back; complete Evidence Bundle; no product implementation.

## TESTS
`npm ci --ignore-scripts --no-audit --no-fund`; exact version JSON assertion; doctor; two byte-identical statuses; JSON/YAML/config validation; `git diff --check`; exact-head Actions; Gitleaks; Trivy; `gh api` provider read-back; negative missing-check/deadlock proof.

## DELIVERABLES
Repo governance/CI/config; verified provider ruleset/settings; Evidence Bundle; proposed Checkpoint Delta; PR evidence update.

## REVIEW FORMAT
Brazilian Portuguese Evidence Bundle: base/head, changed paths, provider mutations, PASS/FAIL tests/checks, findings by severity, risks/gaps, ruleset read-back, proposed checkpoint delta, READY_FOR_AUDIT or BLOCKED.

## STOP CONDITION
`SPRYXEL_WO_001_EXACT_HEAD_AND_PROVIDER_STATE_READY_FOR_AUDIT`

Do not merge. Do not self-promote checkpoint.
