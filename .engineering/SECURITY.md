# Security

Status: SOURCE_PACK_CANDIDATE

## Protected assets
- Git history and protected branches;
- canonical governance documents and checkpoints;
- credentials/tokens/provider permissions;
- CI workflows and supply-chain inputs;
- GEF receipts and evidence.

## Minimum controls
- no secrets committed;
- Gitleaks and Trivy on PRs;
- third-party Actions pinned by immutable SHA;
- least-privilege workflow permissions;
- no force-push or history rewrite;
- ruleset with no bypass by default;
- no paid service required for a merge gate;
- provider mutation captured before/after and read-back verified;
- `.gef/init-state.json`, `.gef/adopt-state.json` and GEF receipts must never be hand-edited to suppress a drift signal.

## Failure policy
Ambiguous permissions, missing admin capability, unknown required-check context or provider read-back mismatch is BLOCKED. Do not weaken security controls to make a PR green.

A GEF v1.1.1 `drift.class=UNEXPECTED` is reconciled against the admitted Work Order and exact diff. It is a blocker if any changed surface is unadmitted, unexplained or cannot be bound to evidence. It is not a reason to rewrite the immutable GEF baseline.

## Approved governance baseline
`SPRYXEL-WO-001` resolved the initial unprotected-`main` gap. Ruleset `SPRYXEL main governance` ID `24340349` is active for `refs/heads/main`, has no bypass actors, blocks deletion/non-fast-forward and requires PR integration, resolved review threads, and the four proven security/governance checks.
