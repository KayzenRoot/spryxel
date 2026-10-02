# SPRYXEL-WO-001 - GEF 1.1.1 GitHub Governance Bootstrap

Status: APPROVED  
Risk: ELEVATED  
Tracking issue: #2  
Execution base: `main@10dca04e38cfcd2e07335faf9078cc6041766c02`  
Audited execution head: `db68f8aeb85beed2f8bbfba98fcc8fd562f7515b`  
GEF release source: `KayzenRoot/gef-bootstrap@1dc030f1358eab0347043a3d54c7fc311c7c2123` / tag `v1.1.1`

## OBJECTIVE
Make the GitHub/GEF governance layer operational and fail-safe before any Spryxel product work.

## CONTEXT
GEF 1.1.1 is installed/initialized and bootstrap validation passed. The Source Pack was intentionally added after the immutable init baseline. In exact GEF 1.1.1, the public status path invokes project drift detection with `authorized: false`; legitimate post-init repository changes can therefore project as `drift.class=UNEXPECTED`. Authorization is reconciled against the Work Order, Context Lock, exact Git delta and Evidence Bundle. Managed GEF state must never be rewritten to suppress that signal.

## SCOPE
- preflight exact repo/provider state and capture before snapshot;
- validate the Context Lock and reconcile existing project drift from the init baseline;
- create durable repository-validation, pipeline-integrity, Gitleaks and Trivy CI;
- add governance support files, templates, ownership and dependency-update configuration where justified;
- pin third-party Actions to immutable SHAs and least privileges;
- validate npm/GEF/checkpoint/status determinism;
- ensure `gef-managed` and `governed` labels;
- configure safe repository settings without changing visibility;
- create and read back an active `main` ruleset only after required contexts are proven;
- produce Evidence Bundle and proposed Checkpoint Delta.

## OUT OF SCOPE
Product code/architecture/features; visibility changes; paid mandatory services; GEF upgrade; history rewrite; destructive branch/tag/release changes; manual rewriting/rebaselining of `.gef/init-state.json`, `.gef/adopt-state.json` or GEF receipts.

## ACCEPTANCE SUMMARY
All acceptance criteria were audited against PR #3. The four required checks passed on the exact audited head, the provider ruleset/settings/labels were read back, no product implementation entered the diff, GEF drift was reconciled without managed-state edits, and no unresolved CRITICAL/HIGH finding remained.

## AUDIT
- Verdict: `APPROVED`.
- Audited head: `db68f8aeb85beed2f8bbfba98fcc8fd562f7515b`.
- Evidence: `.engineering/evidence/SPRYXEL-WO-001-EVIDENCE.md`.
- Correction Delta: completed in the same Work Order/PR.
- Checkpoint promotion: performed by the auditor after approval.
- Merge authorization: conditional only on the four required checks succeeding again on the checkpoint-promotion head.

## STOP CONDITION
Executor stop condition reached: `SPRYXEL_WO_001_EXACT_HEAD_AND_PROVIDER_STATE_READY_FOR_AUDIT`.

No further executor implementation is authorized under this Work Order. After checkpoint promotion, the historical Context Lock is stale by design.
