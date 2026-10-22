# SPRYXEL PR #108 — EVD-003: audit of collector working-directory mismatch

Source code HEAD: `d7867965133f406fae76dbee424a25dd6eb102d5`.
Published evidence: `22e0ce61decfaaedb771daac76e5356246caaab2`.
Source report: https://github.com/KayzenRoot/spryxel/pull/108#issuecomment-6343401366

## Finding: command working-directory mismatch (reproducible from archived script)

The archived `collector_lf_readonly.sh` creates a fresh checkout in `$WORK/repo`, configures `core.autocrlf=false` and `core.eol=lf`, checks out the exact code HEAD, and invokes `git -C "$WORK/repo" ls-files --eol`. The EOL log records 304 `i/lf w/lf` files and zero mismatches.

However, the same collector then invokes these commands WITHOUT changing directory to `$WORK/repo`:
- `run_logged npm_ci ... npm ci --ignore-scripts --no-audit --no-fund`
- `run_logged biome_version ... ./node_modules/.bin/biome --version`
- `run_logged format_check ... npm run format:check`

The `run_logged` function invokes `"$@"` in the calling process's working directory. No `cd "$WORK/repo"` or `--prefix "$WORK/repo"` is present. Therefore the checked EOL worktree and the formatted files were not proven to be the same directory.

## Raw results, NOT fabricated

- `npm run format:check`: exit 1, 122 files checked, 120 reported errors, 20 diagnostics shown, 100 omitted.
- The 20 displayed diagnostics prominently contain carriage-return (`CR`) removal in JSON/TS config files, despite the separate temporary checkout reporting `i/lf w/lf`.
- `biome --version`: 2.5.15, but was also invoked outside the explicit temporary checkout path.
- Node 26.4.0 / npm 11.17.0 in this run, while `package.json` declares `packageManager: npm@10.9.9` and `engines.node: >=22.11.0`. Version mismatch is documented, not assumed to be the cause.
- Collector exit 43 and the evidence-publication SHA/hash records remain valid as observations.
- Source PR #108: 11/11 GitHub checks pass on the unchanged source HEAD; zero unresolved review threads; no substantive independent APPROVED review on that HEAD.

## Correct interpretation

**EVD-003 remains BLOCKED.** The previous exit 1 was real for the collector invocation directory, but it cannot prove that `npm run format:check` fails in the verified temporary LF checkout at the exact code HEAD. Conversely, this finding does NOT imply that the temporary checkout would pass. All 100 hidden diagnostics remain unclassified. **Do not mass-format 120 files on the basis of this report.**

## Required minimal follow-up in Codex Windows

1. Inspect, then create a corrected collector *outside the source repository*. Reuse existing pinned source HEAD and main SHA. Preserve original evidence (no overwrite).
2. Bind `npm ci`, `./node_modules/.bin/biome --version`, and `npm run format:check` to the temporary checkout explicitly, e.g. a helper:
   ```bash
   run_in_clone() { ( cd "$WORK/repo" && "$@" ); }
   run_logged npm_ci 'npm ci --ignore-scripts --no-audit --no-fund (cwd=temporary LF checkout)' run_in_clone npm ci --ignore-scripts --no-audit --no-fund
   run_logged biome_version 'biome --version (cwd=temporary LF checkout)' run_in_clone ./node_modules/.bin/biome --version
   run_logged format_check 'npm run format:check (cwd=temporary LF checkout)' run_in_clone npm run format:check
   ```
3. Record `pwd` or equivalent for the subprocess working directory, source HEAD, `git ls-files --eol` just before and after npm installation, exact pinned Biome 2.5.15, stdout/stderr, exit code, and clean Git status. If any check fails, stop with the actual BLOCKED reason, no code edits.
4. Publish a NEW sanitized, SHA-256-verified evidence run ONLY in `evidence/spryxel`, perform remote GitHub readback and comment immutable permalinks in PR #108.
5. Seek a substantive independent review on the final source HEAD only through a verified zero-cost channel. Do not confuse CodeRabbit 'Review skipped' with an approval.

## Scope & safety

No source-code modifications, no broad formatter writes, no changes to main, source branch, PR #105, Issue #109, ruleset, security settings, or checkpoints; no merge/deploy/release/cost. The GitHub evidence branch is an archive and must not be merged into main.

Verdict: `BLOCKED_COLLECTOR_CWD_MISMATCH_REQUIRES_EXACT_LF_CHECKOUT_RUN`.
STOP: `SPRYXEL_PR108_EVD003_CWD_AUDIT_ARCHIVED_NO_MERGE`.
