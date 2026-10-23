# SPRYXEL-PR110-ECC5-WINDOWS-WORKTREE-FORENSICS-002

## Purpose and invariant

Investigate an inexplicably **modified** \`.github/PULL_REQUEST_TEMPLATE.md\` immediately after \`git checkout --detach\` of exact source HEAD. **NO bypass of a dirty-tree gate**; do not edit, restore, delete, reformat or stage the template. Previous skill test remains NOT_RUN until the source checkout is independently clean. This is a bounded, zero-added-billing **Git-only** diagnostic, not a reason to launch another Codex model/skill invocation.

Source repository: \`KayzenRoot/spryxel\`; PR #110 HEAD \`b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b\`; main \`126e3a17265e38c94c5057d5d423eb14a12bb9c9\`.
Exact GitHub HEAD template blob \`042e00c0560887f90a0b7d69e75010a21c10c8a3\`; known GitHub content 673 UTF-8 characters, ending in LF.
Prior blocked Windows run: \`2026-10-23T182004Z-windows-codex-ecc5\`, evidence \`4bf0445f843e8421d1f5e050b90bf6a4d4169847\`. The old run reported 19 insertions/13 deletions and a difference even with \`--ignore-space-at-eol\`. That is NOT sufficient to diagnose filter, EOL, editor, antivirus or content rewrite; do not guess cause.

**Scope:** diagnose once in a new, isolated Windows source clone, collect only relevant read-only Git commands and sanitized outputs; publish a new appendix solely to \`evidence/spryxel\` if authorized authentication and verified Git identity are present. Original source PR and code MUST remain unchanged. Never execute Codex skills on a dirty checkout, and do not rerun costly five-model tests merely to check git.

## Stage A. Fresh checkout, pinned SHA and raw diagnostics (PowerShell 7)

PowerShell commands below are a safe skeleton to be executed by the authorized Windows Codex executor. All log files must be located OUTSIDE the source clone. Do not echo tokens or environment values.

~~~powershell
$ErrorActionPreference = 'Stop'
$Head = 'b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b'
$Main = '126e3a17265e38c94c5057d5d423eb14a12bb9c9'
$RelPath = '.github/PULL_REQUEST_TEMPLATE.md'
$Blob = '042e00c0560887f90a0b7d69e75010a21c10c8a3'
$RunId = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHHmmssZ') + '-template-forensics'
$Root = Join-Path ([System.IO.Path]::GetTempPath()) ('spryxel-' + $RunId)
$Repo = Join-Path $Root 'source-A'
$Private = Join-Path $Root 'private-logs'
New-Item -ItemType Directory -Path $Private -Force | Out-Null
# Record git --version, PowerShell version, and GIT_* VARIABLE NAMES ONLY.
git ls-remote https://github.com/KayzenRoot/spryxel.git refs/heads/main refs/heads/chore/spryxel-ecc-curated-workflow-20261023
if ($LASTEXITCODE -ne 0) { throw 'BLOCKED_REMOTE_ACCESS' }
git clone --no-checkout https://github.com/KayzenRoot/spryxel.git $Repo
if ($LASTEXITCODE -ne 0) { throw 'BLOCKED_CLONE' }
git -C $Repo config --local core.autocrlf false
git -C $Repo config --local core.eol lf
git -C $Repo checkout --detach $Head
if ($LASTEXITCODE -ne 0) { throw 'BLOCKED_CHECKOUT' }
if ((git -C $Repo rev-parse HEAD).Trim() -ne $Head) { throw 'BLOCKED_HEAD_DRIFT' }
$Expected = (git -C $Repo rev-parse ('HEAD:' + $RelPath)).Trim()
$Index = (git -C $Repo ls-files --stage -- $RelPath | Out-String).Trim()
$Abs = Join-Path $Repo '.github/PULL_REQUEST_TEMPLATE.md'
$RawWorktreeBlob = (git -C $Repo hash-object --no-filters -- $Abs).Trim()
$FilteredWorktreeBlob = (git -C $Repo hash-object --path=$RelPath -- $Abs).Trim()
$Status = (git -C $Repo status --porcelain=v1 --untracked-files=no | Out-String).Trim()
$Eol = (git -C $Repo ls-files --eol -- $RelPath | Out-String).Trim()
$Attributes = (git -C $Repo check-attr -a -- $RelPath | Out-String).Trim()
$Numstat = (git -C $Repo diff --no-ext-diff --numstat -- $RelPath | Out-String).Trim()
$Patch = (git -C $Repo diff --no-ext-diff --no-textconv -- $RelPath | Out-String)
$IgnoreEolPatch = (git -C $Repo diff --no-ext-diff --no-textconv --ignore-space-at-eol -- $RelPath | Out-String)
$SHA256 = (Get-FileHash -Path $Abs -Algorithm SHA256).Hash
if ($Expected -ne $Blob) { throw 'BLOCKED_TEMPLATE_EXPECTED_BLOB_DRIFT' }
# Keep $Patch and $IgnoreEolPatch privately for sanitization; this tracked template is public.
# Record the actual facts in a sanitized JSON receipt; do not record secret values.
~~~

Capture **the actual Git paths/line endings** in \`$Patch\`, \`$IgnoreEolPatch\` and \`$Eol\`; avoid publishing private Windows directories. If the file isn't present, STOP BLOCKED_TEMPLATE_MISSING. Always preserve the preflight \`git status\` and initial blob hashes in evidence, even on a failed test.

Additional diagnostics, **names only** for configuration:
- \`git -C $Repo config --show-origin --name-only --list\`, sanitized; reveal NO credential URLs, email addresses, filter shell commands, auth headers or secret values.
- \`git -C $Repo check-attr --all -- .github/PULL_REQUEST_TEMPLATE.md\` after inspecting output for any sensitive path.
- \`git -C $Repo ls-files --stage -- .github/PULL_REQUEST_TEMPLATE.md\`.
- \`git -C $Repo status --porcelain=v1\` and \`git -C $Repo diff --check\`, both logged with exit codes.
- \`git -C $Repo check-ignore -v -- .github/PULL_REQUEST_TEMPLATE.md\` may exit 1 when not ignored; do not call that an error.
- Record whether template differs in (a) raw bytes, (b) after path-specific cleaning, or (c) only index metadata. An editor/formatter or global Git filter is a **hypothesis** until actual diff and attributes identify it.

## Stage B. Independent filter-isolation comparison (no modifications to source)

Only if clone A is dirty, make a SECOND empty clone at \`$Root/source-B\` using the **same exact HEAD**, LF checkout, and local-only \`core.attributesFile=NUL\` to suppress a user-global attributes file. Do not copy files from A to B and do not modify any tracked content. Collect the same template blob hashes, EOL, status and diff.

~~~powershell
$RepoB = Join-Path $Root 'source-B'
git clone --no-checkout https://github.com/KayzenRoot/spryxel.git $RepoB
if ($LASTEXITCODE -ne 0) { throw 'BLOCKED_CLONE_B' }
git -C $RepoB config --local core.autocrlf false
git -C $RepoB config --local core.eol lf
git -C $RepoB config --local core.attributesFile NUL
git -C $RepoB checkout --detach $Head
if ($LASTEXITCODE -ne 0) { throw 'BLOCKED_CHECKOUT_B' }
if ((git -C $RepoB rev-parse HEAD).Trim() -ne $Head) { throw 'BLOCKED_SHA_B' }
$StatusB = (git -C $RepoB status --porcelain=v1 --untracked-files=no | Out-String).Trim()
# Repeat Git blob/diff/attribute capture on B and compare A vs B.
~~~

- If B clean but A dirty: **global attributes/filter suspect**, not proven; inspect which actual attributes or file transforms differ, without changing global settings. Any future Codex run may use a clean isolated repo only after authenticity, EOL and Git object hashes are proven.
- If both dirty: STOP BLOCKED_DIRTY_BOTH; collect evidence without restoring, committing or running skills.
- If A clean: record TRANSIENT_NOT_REPRODUCED; do not invent a root cause. A clean clone is necessary but not sufficient to prove Codex skill runtime.
- Never run \`git reset --hard\`, \`git restore\`, Biome \`--write\`, \`git add\`, \`git commit\`, a pre/post checkout hook, plugin installer or any Codex skill in source-A/B during this diagnostic.

## Stage C. Report, artifact security and decision

Produce a new run-specific diagnostic package containing full sanitized \`audit.md\`, \`receipt.json\`, \`raw/clone-a-status.txt\`, \`raw/clone-a-diff.patch\`, \`raw/clone-a-ignore-eol.patch\`, \`raw/clone-a-attributes.txt\`, and for B if executed analogous clone-B logs. Capture versions, commands and true exit codes; include no logs that print secret values. Record SHA256 per file after sanitization in \`manifest.sha256\`.

Only if authorized, verified local GitHub identity and safe authenticated push exist, commit those append-only files on a SEPARATE clone of \`evidence/spryxel\` in:
\`evidence/pr-110/b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b/template-forensics/<RUN_ID>/\`.
Git identity must be configured locally only for evidence clone and verified against the authenticated owner as specified in the prior Phase0 addendum. No force push. Pull latest evidence branch before publishing. Read back every file **by exact published evidence commit SHA**, compare hashes/bytes with sanitized originals; only then post a single factual comment to PR #110.

**ALL 5 skills remain \`NOT_RUN\` in this diagnosis**, even if both clones are clean. Do not spend further model quota, invoke Codex CLI inside Codex, or do full tests without a clean and isolated source clone. After causal diagnosis and clean checkout, return to the original Phase0 ChatGPT-authenticated 5-skill test using its actual five direct invocations and exact SHA guards.

No changes to \`main\`, product PR #110, PR #105/#108, Issue #109, rulesets, checkpoints; no merge/deploy/gastos.

**STOP diagnosis complete:** \`SPRYXEL_PR110_TEMPLATE_FORENSICS_RECORDED_FIVE_SKILLS_NOT_RUN_NO_MERGE\`.
**STOP unresolved:** \`SPRYXEL_PR110_TEMPLATE_WORKTREE_UNRESOLVED_FIVE_SKILLS_NOT_RUN_NO_MERGE\`.
