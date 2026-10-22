# Spryxel immutable evidence index

This branch `evidence/spryxel` is an **evidence-only** branch. It is not intended for merging into `main`.

## Rules
- Store versioned, sanitised, verified evidence only, grouped by PR, exact source HEAD SHA and run ID.
- Publish records using the actual command exit codes. `NOT_RUN`, `BLOCKED`, `PASS` are distinct states; never infer a formatter PASS from a passing GitHub Actions job that did not run it.
- Verify the local SHA-256 manifest before publication, then read back exact committed blobs on the GitHub evidence commit and compare contents/hashes.
- Link to permanent `blob/<evidence-commit-SHA>/...` paths from a PR comment only after successful remote readback.
- No tokens, secrets, .env contents, credentials, local private paths or unredacted proprietary data in this public evidence branch.
- Preserve code branches, `main`, PR #105, Issue #109, rulesets, checkpoint files and all existing CI rules; do not merge, deploy or incur paid service costs.
- Never overwrite historic evidence runs. Use a new unique run ID and append-only commits. Mark errors transparently.
- A reviewer approval cannot be fabricated from author self-review, an earlier SHA, or CodeRabbit's "Review skipped" status.

## Current migration
PR #108, EVD-003, source HEAD `d7867965133f406fae76dbee424a25dd6eb102d5`: only the earlier locally verified **DNS-blocked isolated LF probe** was available for safe publication. Its `format:check` was **NOT_RUN**, not PASS. No new Codex Windows raw-logs bundle was supplied or found on GitHub at migration time.
