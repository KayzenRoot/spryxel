# SPRYXEL-PR110-ECC-CODEX-WIN-FUNCTIONAL-001

## Executable mission for a NEW Codex Windows session

Repository: KayzenRoot/spryxel
PR: https://github.com/KayzenRoot/spryxel/pull/110
EXACT CODE HEAD: b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b
Main expected: 126e3a17265e38c94c5057d5d423eb14a12bb9c9
Preflight evidence: bf4733f9583e7b563b8c2924ab5a78b460a3c02f
Scope: read-only functional discovery and invocation of FIVE existing repository-local Agent Skills; append real logs only to evidence/spryxel after sanitization. Do not merge, deploy, purchase tokens/services, install plugins, modify source/config, change rulesets, or modify PR #105/#108 or checkpoints.

**IMPORTANT:** This document is an executable INSTRUCTION to the actual Windows Codex executor, NOT evidence that Codex ran. The user must open a NEW local Codex session or Codex CLI on Windows to execute it. Status before that happens: CODEX_FUNCTIONAL_NOT_RUN. Do not self-attest success.

### Phase 0: Costs, authorization and executable environment

- Use only the user's already-available subscription-connected Codex; no paid API key, additional subscription, paid MCP, GPU, CodeRabbit, cloud CI run or model-switch with incremental spend. On Windows, confirm PowerShell 7+, git, codex, existing Codex login, and CLI help. Do NOT install/update anything or sign up for an account. If there is an OPENAI_API_KEY/CODEX_API_KEY, no subscription login, a metered billing risk, or quota exhaustion, STOP BLOCKED_COST_OR_AUTH; never expose the key's value.
- A Codex invocation uses model quota even if no new monetary purchase. Record usage and do not equate usage with “zero tokens”. No parallel agents, repeated attempts, web search, install, full-auto, or background runs; MAXIMUM five short model tasks, one per skill.
- If the user pasted this instruction inside a new Codex session, DO NOT launch a nested Codex task without reason. Either invoke each named skill explicitly in five short labeled sequential steps with real conversation/tool trace, OR use the fresh CLI read-only probe below (preferred for machine-parseable JSONL events). Do not count simply reading SKILL.md manually as actual Codex skill discovery.

### Phase 1: Isolated immutable LF checkout

Create work outside the original project and outside evidence branch. Examples use PowerShell 7; adapt to an existing safely isolated checkout if it can be proven clean. Capture all commands' stdout/stderr/exit codes.

~~~powershell
$ErrorActionPreference = 'Stop'
$Head = 'b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b'
$Main = '126e3a17265e38c94c5057d5d423eb14a12bb9c9'
$RunId = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHHmmssZ') + '-windows-codex-ecc5'
$Work = Join-Path $env:TEMP ('spryxel-pr110-' + $RunId)
$Repo = Join-Path $Work 'repo'
$Raw  = Join-Path $Work 'raw-private'
New-Item -ItemType Directory -Path $Raw -Force | Out-Null
git ls-remote https://github.com/KayzenRoot/spryxel.git refs/heads/main refs/heads/chore/spryxel-ecc-curated-workflow-20261023
git clone --no-checkout https://github.com/KayzenRoot/spryxel.git $Repo
git -C $Repo config core.autocrlf false
git -C $Repo config core.eol lf
git -C $Repo checkout --detach $Head
if ((git -C $Repo rev-parse HEAD).Trim() -ne $Head) { throw 'BLOCKED_HEAD' }
if ((git -C $Repo status --porcelain).Count -ne 0) { throw 'BLOCKED_DIRTY' }
git -C $Repo ls-files --eol
~~~

- Before or after clone, resolve actual GitHub refs; if PR110 HEAD or main differs from pinned SHAs, STOP BLOCKED_SHA_DRIFT; do not test a newer head silently.
- Capture SHA before/after, git version, pwsh version, codex version, path, git EOL stats. Require all five SKILL.md files to have LF in working tree and their frontmatter names to match directories. Do not reformat any file.
- Confirm from the real checkout: root AGENTS.md rules; exactly these source files:
  .agents/skills/spryxel-search-first/SKILL.md
  .agents/skills/spryxel-change-impact/SKILL.md
  .agents/skills/spryxel-contract-first/SKILL.md
  .agents/skills/spryxel-secure-review/SKILL.md
  .agents/skills/spryxel-verify/SKILL.md
- Pin original Git blob IDs of each file, license and provenance ECC affaan-m/ECC@90606c8315ee09cafc303515c5f33024db6b9882. No changes to product files.

### Phase 2: Safe functional tests in fresh Codex

- First capture 'codex --version', 'codex exec --help' and 'codex login status' **without** leaking personal session credentials. Confirm that CLI supports '--json', '--sandbox read-only' and '-C'. If not, STOP BLOCKED_CODEX_CLI_FLAGS; do not substitute '--full-auto' or bypass sandbox.
- Record names (only) of any pre-existing MCP servers, plugins and hooks if that metadata is safely accessible; never output tokens or contents of ~/.codex/auth.json, config credentials, cookies or secrets. The mission may not install/enable/execute ECC hooks, MCP, plugin marketplace, external tools, curl, npm or binaries.
- Use one short task per skill (each fresh CLI invocation; no extra agent/model). Keep generated trace in $Raw, outside repo; read-only sandbox enforced. Quotes below are PowerShell single-quoted literals, preserving the literal $skill reference:

~~~powershell
if ($env:OPENAI_API_KEY -or $env:CODEX_API_KEY) { throw 'BLOCKED_POTENTIAL_METERED_API_KEY' }
$Cases = @(
  @{ id='spryxel-search-first'; prompt='Use $spryxel-search-first. Read its instructions. In <=100 words, choose reuse/extend/adopt/build for adding a duplicate UUID utility in Spryxel. Read only. Report the exact skill path and the special stop condition.' },
  @{ id='spryxel-change-impact'; prompt='Use $spryxel-change-impact. In <=100 words, list real blast-radius surfaces and verification gates for a hypothetical private-asset authorization boundary change. Read only; name the actual skill path.' },
  @{ id='spryxel-contract-first'; prompt='Use $spryxel-contract-first. In <=100 words, list minimal contract-negative tests for a hypothetical private-asset command and explain why Zod is not DB authorization. Read only; name the actual skill path.' },
  @{ id='spryxel-secure-review'; prompt='Use $spryxel-secure-review. In <=100 words, name two concrete tenant/storage threats and corresponding negative tests for Spryxel, plus residual proof limits. Read only; name the actual skill path.' },
  @{ id='spryxel-verify'; prompt='Use $spryxel-verify. In <=100 words, list the actual fast-fail repository commands, SHA/clean-tree gates and how to report NOT_RUN vs PASS. DO NOT RUN tests. Read only; name the actual skill path.' }
)
foreach ($Case in $Cases) {
  $Out = Join-Path $Raw ($Case.id + '.stdout.jsonl')
  $Err = Join-Path $Raw ($Case.id + '.stderr.log')
  & codex exec --json --sandbox read-only -C $Repo $Case.prompt 1> $Out 2> $Err
  $Exit = $LASTEXITCODE
  Set-Content -Path (Join-Path $Raw ($Case.id + '.exit.txt')) -Value $Exit -Encoding utf8
  if ((git -C $Repo rev-parse HEAD).Trim() -ne $Head) { throw 'BLOCKED_SOURCE_SHA_CHANGED' }
  if ((git -C $Repo status --porcelain).Count -ne 0) { throw 'BLOCKED_SOURCE_MODIFIED' }
  if ($Exit -ne 0) { throw ('BLOCKED_SKILL_EXEC_' + $Case.id) }
}
~~~

- If testing directly inside the Codex UI rather than CLI, use five successive explicit '$spryxel-*' invocations in a fresh session, export the REAL transcript and tool traces with exit/usage information if available. Do not claim JSONL CLI data exists if running UI-only.
- For EACH skill, require the actual agent to identify the exact .agents/skills path and explain a distinct, skill-body-grounded behavior. Validate evidence of actual activation/source reading in Codex trace or supported activation log. A prompt echo or self-asserted “I used it” alone is NOT proof. If trace lacks activation/read evidence, mark UNVERIFIED_RUNTIME_INVOCATION, not PASS.
- Parse JSONL line-by-line, preserve parse errors, count actual actions and identify any command/process attempts, writes, hook/MCP calls, network requests or unexpected plugin use. An unexpected external action or unsafe write means BLOCKED_SECURITY. If CLI emits per-turn token usage, record actual input/output/total per run; otherwise mark TOKEN_USAGE_NOT_AVAILABLE. Flag avoidable agent/model proliferation and long responses; do not infer monetary cost from token counts.
- No automatic reruns. STOP after five invocations (or on first failure).

### Phase 3: Build authentic, sanitized evidence

Create a NEW local output directory $Work/sanitized/<RunId> and never edit the Spryxel code checkout. Copy stdout and stderr **in full**, preserving order and all failure diagnostics; redact sensitive spans with [REDACTED:<category>] (credentials, bearer tokens, auth headers, private path fragments, user identifiers). Never publish raw confidential files. Perform human/agent review of every output for secrets. If redaction is untrustworthy, STOP BLOCKED_SECURITY_SANITIZATION.
Save:
- receipt.json: source HEAD/main SHA, versions, LF/EOL checks, actual per-case exit codes, activation evidence type and classification, clean tree before/after, whether MCP/hooks/tools used, token metrics or unavailable, no-spend declaration limited to actions observed.
- README.md/audit.md: exact success criteria, genuine 5x statuses PASS/FAIL/UNVERIFIED/NOT_RUN, blockers, timing and warnings; do not fabricate “skills installed globally”.
- All five pairs '<skill>.stdout.jsonl' and '<skill>.stderr.log' plus exit-code/metadata logs; full sanitized contents. If a file is empty, it MUST remain zero bytes.
- manifest.sha256: SHA-256 of ALL sanitized files except the manifest itself, computed AFTER sanitization with Get-FileHash SHA256, deterministic relative names. Include SHA of manifest separately in the receipt or PR comment; avoid circular hashing.
- run context: local UTC RunId, exit status; optional cost/usage data only if provided by the Codex CLI.

### Phase 4: GitHub publication with append-only, byte-for-byte verification

ONLY when evidence is sanitized, use an entirely SEPARATE checkout/clone of branch 'evidence/spryxel'. Never git-add or push the code checkout. Create this new, exclusive path (replace RUN_ID with actual timestamp from this run):

evidence/pr-110/b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b/codex-windows-functional/RUN_ID/

- STOP if directory already exists or if evidence branch cannot be read. Add exclusively files inside that newly created directory; verify git diff --cached --name-only has NO other paths. Check manifest locally. Commit once on evidence branch; push normally using fast-forward, with no force, no rebase rewriting published records, no settings changes. If evidence branch advanced, retry only after safe fast-forward reconciliation, without changing the old evidence directories.
- Clone/fetch GitHub in a NEW readback directory at the exact **published evidence commit SHA** (not merely the local unpushed tree), download/read each published file, compare byte-for-byte/SHA-256 to sanitized files, validate manifest 100%. Revalidate exact PR HEAD, main SHA and protected PR states; no merge.
- After successful readback, post a SINGLE PR #110 conversation comment with real statuses (including warnings), exact SHA evidence commit, immutable GitHub permalinks to receipt/logs/manifest, 5/5 file digest counts, Codex CLI run versions, usage availability, verified STOP. If GitHub comment fails, do not claim it exists.
- If execution or sanitization failed, publish a non-secret BLOCKED receipt only when safe, with the correct NOT_RUN/FAIL status; never pretend the five functional activations passed.

### Acceptance, cost and STOP

PASS only if: pinned HEAD/base and LF, source clean throughout, all five genuine activations backed by real trace, five exit codes 0, no unapproved plugin/MCP/hook/install/paid API, token usage recorded when available, files sanitized and SHA256 manifest fully verified by immutable GitHub readback. Any uncertain activation => UNVERIFIED (NOT a PASS); any unapproved side effect => BLOCKED.

The mission does not authorize edits of any existing code or PR branch, changes in 'main', PR #105/#108, Issue #109, repository rulesets or checkpoints, changing PR #110 from Draft, merge, deploy, release or extra spend.

STOP PASS: SPRYXEL_PR110_ECC5_CODEX_WINDOWS_FUNCTIONAL_VERIFIED_NO_MERGE
STOP otherwise: SPRYXEL_PR110_ECC5_CODEX_WINDOWS_BLOCKED_OR_UNVERIFIED_NO_MERGE
