# SPRYXEL PR #108 — EVD-003 evidence

## Result

**BLOCKED — npm run format:check exited 1 on the required exact code HEAD.** Biome 2.5.15 checked 122 files, reported 120 formatting errors, showed 20 diagnostics and stated that 100 diagnostics were omitted by its default reporting limit. No formatting write or code change was made. This result does not authorize merge.

## Identity and read-only boundary

- Repository: KayzenRoot/spryxel; PR #108 remains OPEN and not Draft.
- Code HEAD before and after: d7867965133f406fae76dbee424a25dd6eb102d5.
- Main before and after: 6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f.
- Evidence branch before publication: c90fd52e254426449a2e314a7c46cde4bc7c3ccc.
- Collector interval: 2026-10-22T14:16:25Z through 2026-10-22T14:19:51Z.
- Clone was detached at the expected code HEAD. Working tree and index stayed clean; git diff --check, working diff and staged diff exited 0.
- No source code, PR branch, main, settings, checkpoint, dependency metadata or workflow was changed.

## LF and tool results

git ls-files --eol and its validator exited 0: 304 indexed text files were i/lf; 0 were i/crlf; 7 binary/non-text entries were excluded; 0 LF worktree mismatches were found. The complete EOL listing and validator output are included.

npm ci --ignore-scripts --no-audit --no-fund exited 0. Biome reported Version: 2.5.15. npm run format:check exited 1 with: Checked 122 files in 1244ms. No fixes applied. Found 120 errors. No second formatter run was made and no --write command was used.

Collector exit code: 43, reflecting BLOCKED_FORMAT_CHECK. The collector's full stdout, stderr, per-command exit files, receipt and inspected script are included under this run directory.

## Integrity and sanitization

The original attached evidence archive SHA-256 is recorded in receipt.json. Its original manifest.sha256 was checked with sha256sum -c manifest.sha256: exit 0; all 5 listed files returned OK. The manifest and complete validation stdout/stderr/exit are included.

A deterministic scan of the staged publication found no matches for credential/token/private-key patterns or local absolute Windows/Unix path patterns. No credentials, environment files, cookies or local absolute paths are included. manifest.sha256 lists the SHA-256 of every published file except the manifest itself. The local checksum result and post-push GitHub readback are reported in the PR conversation after the evidence commit.

## GitHub snapshot

At the captured PR check snapshot, 11 substantive checks were successful on the required code HEAD: Gitleaks, Pipeline integrity, Repository validation, Trivy, SonarCloud, contracts/domain, PostgreSQL/API integration, worker regression, Chromium browser regression and both Socket checks. The separate CodeRabbit row says “Review skipped: automatic reviews are disabled”; it is not a review approval.

There are zero unresolved review threads. The three available reviews are COMMENTED on older SHAs (5f0fcd37ab00e6c632f959c3455584979899ff38 and 8ccf21ec78fb2aaecf7264cfce1383c4f998962a); no independent approval is present on the required HEAD. Independent review remains pending.

Eight current workflow definitions were inspected by blob SHA. Any automatic push workflow is filtered to main; pull request workflows target main; workflow_dispatch is manual. A normal push to evidence/spryxel does not match those triggers. Repository webhook count is 0. No paid service or workflow run is requested by this evidence publication.

## Source manifest provenance

The verified original source bundle is from the previously attached SPRYXEL_PR108_EVD003_READONLY_AUDIT_20261021.zip (archive digest in receipt). Its corresponding prior public evidence directory is [the 2026-10-21 local probe](https://github.com/KayzenRoot/spryxel/tree/c90fd52e254426449a2e314a7c46cde4bc7c3ccc/evidence/pr-108/d7867965133f406fae76dbee424a25dd6eb102d5/evd003/2026-10-21T140109Z-local-probe/).

## Decision

**Gate: BLOCKED.** The required format check failed. Evidence publication only records the result; it does not repair formatting, approve the PR, authorize merge, or claim formatting passed. Merge and deploy were not performed.
