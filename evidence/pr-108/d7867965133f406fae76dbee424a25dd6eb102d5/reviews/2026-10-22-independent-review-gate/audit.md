# SPRYXEL PR #108 | Independent review eligibility and code audit

Audit date: 2026-10-22 (America/Sao_Paulo)
Mode: GitHub-only desk review, no source-code changes
Repository: KayzenRoot/spryxel
PR: https://github.com/KayzenRoot/spryxel/pull/108
Exact source HEAD: `d7867965133f406fae76dbee424a25dd6eb102d5`
Exact main baseline: `6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f`
Prior immutable EVD-003 CWD-FIX evidence: `02c4bbdd1a840f93acafd187195ef6ba50afe6f1`; format check **PASS**, 135 checked, 0 edits, Biome 2.5.15.

## Exact-head source review

GitHub PR patch and compare API agree: 5 commits ahead of main, none behind; six files changed, all in `packages/contracts/src/` and `packages/domain/src/`:
1. `contracts/src/index.ts`: exports the new private asset contract.
2. `contracts/src/private-asset-storage.ts`: strict discriminated Zod command union (begin/finalize/read/abort/revoke); canonical UUIDv7; begin media allowlist PNG/WEBP, 1 to 10 MiB size, hex SHA256, bounded idempotency key; rejects supplied tenant/actor/role/bucket/object keys/URLs.
3. `contracts/src/private-asset-storage.test.ts`: exercises strict fields, invalid sizes, formats, UUID, all five operations.
4. `domain/src/index.ts`: exports pure private-asset policy.
5. `domain/src/private-asset-storage.ts`: pure fail-closed predicate; requires matching tenant, principal, project, asset version, active membership, known version status; validates exact scoped upload attempt for finalize/abort; enforces admin roles on begin/revoke/finalize, member read only with assetReadAllowed, member abort only for initiator.
6. `domain/src/private-asset-storage.test.ts`: tests tenant/project/version/member mismatches, missing/inactive membership, unsupported states/roles/operations and upload-attempt association.

The two historical Copilot review findings (missing authoritative upload-attempt binding, non-runtime-validated versionStatus) are addressed in the current patch and their two threads resolved. No demonstrated new P0 defect was found in this read-only code analysis.

**Architecture/security boundary:** the policy is pure code only; it does not read PostgreSQL FORCE RLS data and cannot attest freshness, atomicity, tenant-scoped DB authorization or signed storage links. Future handlers must resolve trusted principal/membership/attempt/asset state server-side under FORCE RLS for EACH operation. The absence of this adapter is a **known out-of-scope integration dependency**, not evidence of a deployed authorization system. Do not describe the phase as production-ready based on this PR.

## Current verification gates

- 11/11 exact-head GitHub check-runs success: SonarCloud, Gitleaks, Trivy, Repository validation, Pipeline integrity, contracts/domain, worker, PostgreSQL/API integration, Chromium, 2 Socket.
- SonarCloud PR bot: Quality Gate PASS; zero new issues, zero accepted issues, zero security hotspots, zero new-code duplication; **0.0% coverage on new code**, so coverage is not established.
- No independently verified CodeQL check-run in the 11 emitted checks. Do not conflate Gitleaks/Trivy/Socket with CodeQL.
- EVD-003 final LF format gate independently examined in preceding audit: Biome 2.5.15, `npm run format:check` exit 0 at exact HEAD, 135 files, no changes. Recorded npm 11.17.0 differs from `packageManager npm@10.9.9`, non-blocking documented drift.
- Ruleset 24340349 is active, zero bypass actors, four mandatory success checks; requires resolved review threads, but `required_approving_review_count=0`. That configuration DOES NOT satisfy the stricter project-level independent review gate.
- PR #108 open, non-draft, unmerged, no requested reviewers and no exact-head substantive APPROVED reviews; all recorded submissions COMMENTED and older than exact HEAD. Two threads resolved.
- PR #105 remains open/draft; Issue #109 open; main and PR source HEAD unchanged.

## Native zero-incremental-cost reviewer search

GitHub's normal **human** pull-request review/request feature is available in public repositories on GitHub Free (GitHub Docs: https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/requesting-a-pull-request-review). This does not require enabling a paid AI service.

`kayzenweb3` is a distinct GitHub login from the PR author `KayzenRoot`. The repository collaborator-permission lookup returned `permission=read`; HOWEVER, this was not proof of being an explicitly invited collaborator on this PUBLIC repository. A real native `request_pull_request_reviewers(["kayzenweb3"])` call failed with GitHub **HTTP 422**, message `Reviews may only be requested from collaborators` and no reviewer request was created. Afterward the PR still had no requested reviewers. **Do not say kayzenweb3 is currently eligible for native review requests.**

A different account name also does not prove a different human reviewer, freedom from author control, or substantive independent analysis. **Identity/independence of kayzenweb3 remains unverified.** Even if this account submits a review, it does NOT satisfy the independent gate if controlled by the author or merely approves without substantive analysis.

Automated options: CodeRabbit CI row says `Review skipped: automatic reviews are disabled`; it is not an approval. Copilot left COMMENTED findings on older heads and has no validated current exact-HEAD review or verified no-incremental-cost rerun. Do NOT trigger metered/plan-dependent services without independently established zero incremental cost.

**Safe free paths:** (1) an actually separate human expert voluntarily reviews this PUBLIC PR, providing substantive PR comments/review tied to exact HEAD; (2) with separate explicit authorization, GitHub owner can grant/review collaborator access to a trusted distinct human and then request a native review. Do not alter access in this audit. A technical AI desk review like this record is NOT a formal independent GitHub reviewer approval.

## Recommendation and STOP

**Disposition:** `INDEPENDENT_REVIEW_BLOCKED_NO_ELIGIBLE_CONFIRMED_REVIEWER / NO_MERGE`.
Formatting and checks pass, but independent substantive final-head review remains unproven. Zero code edits, zero main/PR changes, zero rule/config changes, zero merge/deploy and no paid action. Only this new evidence record is authorized.
