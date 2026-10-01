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
- provider mutation captured before/after and read-back verified.

## Failure policy
Ambiguous permissions, missing admin capability, unknown required-check context or provider read-back mismatch is BLOCKED. Do not weaken security controls to make a PR green.

## Current known gap
Before SPRYXEL-WO-001 execution, `main` has no repository ruleset. This is the active security/governance gap being addressed.
