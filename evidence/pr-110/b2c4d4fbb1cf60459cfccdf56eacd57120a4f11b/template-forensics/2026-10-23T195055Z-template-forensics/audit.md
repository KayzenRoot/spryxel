# SPRYXEL PR #110 Windows template checkout forensics

Run: 2026-10-23T195055Z-template-forensics
Status: BLOCKED_DIRTY_BOTH

## Scope and guards
This is a read-only Git diagnosis. The primary workspace was not changed. The investigation used two new isolated Windows clones at the exact PR HEAD. No file was restored, edited, formatted, staged, or committed in either source clone. No hooks were run; each clone had a local empty hooks directory configured before checkout.

PR #110 was OPEN and DRAFT at head b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b; main was 126e3a17265e38c94c5057d5d423eb14a12bb9c9. The primary checkout remained at 3f14441ac48d0067dfad8214ba29dfcb2e285a8a on codex/spryxel-wo-009-imp-005-credit-ledger-costguard with six pre-existing status entries before and after.

## Results
The pinned Git tree and index both contain template blob 042e00c0560887f90a0b7d69e75010a21c10c8a3. Both independent worktrees contain raw and path-cleaned blob 90e8d37ddee973aafcb230e48e15dd83cab4c2a6, SHA-256 3b98ecf1a8043c7f8c48e7ba49ddc27b024fab409b367f02ddc6987614264248. Their byte sequences and complete Git diff patches are identical.

The Git blob is 673 bytes and 673 UTF-8 characters with 17 LF, 0 CRLF, no BOM, no NUL, and a final LF. Each checkout file is 683 bytes and 683 UTF-8 characters with 23 LF, 0 CRLF, no BOM, no NUL, and a final LF. Git reports index LF and worktree LF for both clones. The change is therefore not explained by CRLF conversion.

Both clones show 19 insertions and 13 deletions. The quiet diff exits are 1 for the normal diff and 1 with ignore-space-at-eol, proving the content difference remains after ignoring trailing whitespace. The full patch and ignore-space-at-eol patch have the same SHA-256, 822ccb40d09c090517bd834a43cf201e571f77721b4d4d8f2ee7ed32913f7a3b.

The path has text, eol, and filter all unspecified in both clones; check-attr --all emitted no attributes. There are no root or .github .gitattributes files at the pinned commit. Clone A used core.autocrlf=false and core.eol=lf. Clone B used the same settings plus core.attributesFile=NUL. B reproduced A byte-for-byte, so suppressing the global attributes file did not resolve the divergence. The path-cleaned hash equals the raw hash in both clones, and no filter attribute is assigned.

## Conclusion
The unexpected modification is reproducible in both new Windows clones, but its cause is not established. Current evidence does not support attributing it to EOL conversion, an applicable Git attributes rule, or a path clean filter. Git configuration lists filter.lfs.* definitions, but this path has no filter attribute and the path-cleaned hash equals its raw hash. An external or other checkout-time transformation remains a hypothesis only. Because both clones are dirty, the mission requires stopping here: no skills were run and all five remain NOT_RUN.

## Exit codes and evidence
Exact command exit codes, stdout/stderr sizes and SHA-256 values are recorded in receipt.json. Raw status, full diff, ignore-space-at-eol diff, attributes/EOL, index entry, numstat, diff-check and ignore check are under raw/. The expected blob SHA-256 and byte statistics are recorded in receipt.json.

An initial local harness bootstrap failed before creating source-A because its argument binding was incorrect; it was discarded, then the successful run used a fresh temporary directory. It made no tracked or primary-workspace changes.

Merge: NOT_DONE. Deploy: NOT_DONE. Five skills: NOT_RUN.

## Publication integrity detail
The evidence clone was clean at base 653d3bcaf92c81c26d815070d5cd0ade41848416 before copying. A normal staging attempt normalized line endings in eight CRLF-bearing evidence files; byte comparison detected all eight before any commit or push. That stage was not published. The evidence package and manifest were retained unchanged. Publication uses raw Git blob insertion with filters disabled for only the new evidence paths, followed by exact blob-byte verification.
git diff --cached --check on the new evidence additions returned exit 2 with 198 diagnostic lines, including 99 trailing-whitespace diagnostics. This was recorded and is not a product-source check. The source clones themselves each returned exit 0 for git diff --check. No product file is part of the evidence branch change.