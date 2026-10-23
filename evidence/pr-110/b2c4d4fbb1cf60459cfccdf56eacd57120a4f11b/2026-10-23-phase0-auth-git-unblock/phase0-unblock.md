# SPRYXEL PR #110 | Phase-0 unblock addendum (Codex Windows)

This is an **append-only amendment** to the original immutable mission
[SPRYXEL-PR110-ECC-CODEX-WIN-FUNCTIONAL-001](https://github.com/KayzenRoot/spryxel/blob/cc4fae084eedafb9514182654a80e36ffef95462/evidence/pr-110/b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b/2026-10-23-codex-windows-five-skills-mission/mission.md).
It supersedes ONLY the old stop-on-presence-of-API-key gate and evidence-checkout Git identity step. All other SHA, LF, five skill, sandbox, trace, secret sanitization, readback, no-change, zero extra billing and NO-MERGE controls remain mandatory.

**Candidate:** PR #110, exact HEAD \`b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b\`, main \`126e3a17265e38c94c5057d5d423eb14a12bb9c9\`.

## Phase 0 result reported in user's Codex Windows screenshot (not independently read-back)

- Reported STOP: Phase 0 blocked because an API-associated environment variable exists. NO variable value inspected/printed. Five skills NOT_RUN; no runtime activations, token usage, CLI exit codes.
- Local evidence reportedly contains 19 manifest entries and SHA256-valid local manifest; ten stdout/stderr files are empty because no skill process started. The report was NOT pushed to GitHub and does not establish remote readback.
- Evidence clone lacked git commit identity. No identity was invented or global config updated.
- Reported original repo and refs remained unchanged. GitHub was rechecked separately in this turn: PR #110 OPEN/DRAFT at exact candidate SHA, main and evidence branch unchanged, 7/7 CI SUCCESS.
- Treat screenshot as user-provided partial evidence. Do not fabricate original raw logfile hashes, an evidence commit, a PR comment from Windows, actual monetary costs, or skill activation.

## Safe authentication preflight: use ChatGPT sign-in without API billing

Do **not** require permanent deletion of an environment variable, inspect a secret's value, call \`codex logout\`, update credentials, or purchase credits. First verify a **fresh Codex CLI / UI is already signed in with ChatGPT**, not API-key auth; see https://help.openai.com/en/articles/11369540-using-codex-with-your-chatgpt-plan. Using plan quota is NOT zero token usage.

Preferred in Windows PowerShell 7 CLI: keep API-associated environment variables out of the **child Codex process** only, keeping the original PowerShell process/user/machine settings intact. Do not run from a session that silently substitutes an API key if ChatGPT authentication is missing. Use a new PowerShell 7 process where possible.

~~~powershell
# Execute with PowerShell 7 in the controlled Phase-0 harness only.
# Never echo the secret values or save $PreviousApiEnv to an output file.
$ApiNames = @('OPENAI_API_KEY', 'CODEX_API_KEY')
$PreviousApiEnv = @{}
foreach ($Name in $ApiNames) {
  $PreviousApiEnv[$Name] = [Environment]::GetEnvironmentVariable($Name, 'Process')
  [Environment]::SetEnvironmentVariable($Name, $null, 'Process')
}
try {
  # Run the SAME five codex exec probes from the original mission INSIDE this try.
  # Check that there are no credential source overrides that would select API billing.
  if (([Environment]::GetEnvironmentVariable('OPENAI_API_KEY', 'Process')) -or
      ([Environment]::GetEnvironmentVariable('CODEX_API_KEY', 'Process'))) {
    throw 'BLOCKED_API_ENV_STILL_SET'
  }
  if ($env:OPENAI_BASE_URL -or $env:OPENAI_API_BASE -or
      $env:OPENAI_IDENTITY_TOKEN_FILE -or $env:OPENAI_WORKLOAD_IDENTITY_CONTEXT) {
    throw 'BLOCKED_AUTH_ENDPOINT_OR_IDENTITY_OVERRIDE_UNVERIFIED'
  }

  $AuthStatus = (& codex login status 2>&1 | Out-String).Trim()
  if ($LASTEXITCODE -ne 0 -or $AuthStatus -notmatch 'Logged in using ChatGPT') {
    throw 'BLOCKED_NOT_SIGNED_IN_WITH_CHATGPT'
  }
  Write-Output 'AUTH_MODE=CHATGPT_CONFIRMED; API_KEY_ENV=ABSENT_IN_PROCESS'
  # INSERT AND RUN the exact five @Cases and foreach invocation loop in
  # the original mission HERE, before the finally clause.
  # Keep: codex exec --json --sandbox read-only -C $Repo.
  # Do not let an assistant assume success: inspect real JSONL tool traces.
}
finally {
  foreach ($Name in $ApiNames) {
    [Environment]::SetEnvironmentVariable($Name, $PreviousApiEnv[$Name], 'Process')
  }
  Remove-Variable PreviousApiEnv -ErrorAction SilentlyContinue
}
~~~

- This snippet is a **scoped wrapper/template**, not a complete five-run execution by itself. If the five probes were not physically placed inside the try, mark NOT_RUN.
- If the Codex CLI was opened through an inherited API-key environment, closing/restarting only that client process with the sanitized child environment may be required. No user/machine environment changes; never show values.
- Only proceed if ChatGPT authentication is explicitly verified in the same process that launches the probes. If CLI or trace shows API-key authorization or api.openai.com billable endpoint, STOP BLOCKED_COST. If auth mode cannot be verified, STOP BLOCKED_AUTH_UNVERIFIED.
- Avoid making a second authentication request just to test costs. If \`codex doctor --json\` is supported, optionally extract only non-sensitive auth mode and model provider metadata, never credential fields. Never claim a billing charge is impossible solely from a benign exit code.
- In the Codex desktop UI, don't spawn a CLI child solely because it's possible. A fresh native ChatGPT-authenticated session may invoke the five skills explicitly; preserve its ACTUAL activation/tool trace and token usage instead. Without trace, status UNVERIFIED.

## Fix Git commit identity ONLY in the EVIDENCE checkout

The prior evidence clone had no user.name/email and could not commit. No reason to recreate the original 19 files as if five probes ran. Use a NEW run-specific evidence directory if running again; the old aborted attempt is BLOCKED and can be archived separately only with genuine sanitized originals.

Do NOT edit \`~/.gitconfig\`, system/user env, remote identity or product repo. Configure identity **only after** making a separate evidence-branch clone and checking its remote/ref. The authenticated GitHub identity must be the owner's own identity. If GitHub CLI is already installed and authenticated:

~~~powershell
# $EvidenceRepo is the SEPARATE, already-verified evidence/spryxel clone.
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw 'BLOCKED_GH_CLI_MISSING_USE_VERIFIED_IDENTITY_MANUALLY'
}
$UserProfile = (& gh api user --jq '{login: .login, id: .id}') | ConvertFrom-Json
if ($LASTEXITCODE -ne 0 -or $UserProfile.login -ne 'KayzenRoot' -or
    -not $UserProfile.id) {
  throw 'BLOCKED_GITHUB_IDENTITY_UNVERIFIED'
}
$NoReply = ('{0}+{1}@users.noreply.github.com' -f
            $UserProfile.id, $UserProfile.login)
git -C $EvidenceRepo config --local user.name $UserProfile.login
git -C $EvidenceRepo config --local user.email $NoReply
if ($LASTEXITCODE -ne 0) { throw 'BLOCKED_GIT_IDENTITY_CONFIG' }
if ((git -C $EvidenceRepo config --local user.name).Trim() -ne 'KayzenRoot') {
  throw 'BLOCKED_GIT_IDENTITY_MISMATCH'
}
Write-Output 'GIT_IDENTITY=ACCOUNT_VERIFIED; SCOPE=EVIDENCE_REPO_ONLY'
~~~

GitHub documents the \`ID+LOGIN@users.noreply.github.com\` pattern for accounts created after July 2017: https://docs.github.com/en/account-and-profile/reference/email-addresses-reference. If \`gh\` is absent or the GitHub owner authentication cannot be verified, use Git's local-only \`user.name\` and **your account's verified email/noreply address from GitHub Settings**, not a made-up identity; otherwise STOP BLOCKED_GIT_IDENTITY. Verify credentials allow authorized push, but never reveal token. Git author identity is NOT the same as push authorization.

## Rerun and evidence acceptance

1. Pin new \`$RunId\`; check PR HEAD/main exact before anything; clean new LF code checkout. Do not change the previous aborted run's logs or status.
2. With **only ChatGPT login verified in the child process**, run five short independent \`$spryxel-*\` probes one each. Record actual \`codex exec\` JSONL, stdout/stderr, exit, skill-source activation evidence and token usage if present. A skill mentioned in a prompt is not proof of activation.
3. Stop immediately on an unsafe action, API auth, unsupported CLI flag, bad source SHA, missing activation, CLI failure or environment-only blocker; each unstarted case stays NOT_RUN.
4. Scrub all output including username/path tokens; SHA256 AFTER sanitization; include exit/usage data only if authentic. Never omit a failing stdout/stderr chunk; preserve full sanitized logs, including truly zero-byte empty files. Mark uncertain activation UNVERIFIED.
5. Use the *separate* authenticated evidence checkout, verify only a NEW \`evidence/pr-110/<HEAD>/codex-windows-functional/<RunId>/\` subtree changes, commit/push normally no force, fetch/read back at **exact remote evidence commit** and compare every byte and hash before commenting the PR.
6. Post one factual PR #110 comment with exact receipt SHA, only verified statuses, immutable links; if push/comment fail, report BLOCKED_PUBLICATION rather than "published."
7. Absolutely no code branch edits, main/PR #105/#108, rules, checkpoints, merge, deploy, global plugin, hooks, MCP, paid APIs, extra subscriptions or blind retries.

**Gates:** Phase0 ChatGPT auth confirmed + evidence identity local verified; skill runtime PASS only with five distinct real traces and exit0; remote evidence PASS only with exact-commit SHA256 readback. Record distinct statuses instead of a global PASS.

STOP if all successful: \`SPRYXEL_PR110_ECC5_CODEX_WINDOWS_FUNCTIONAL_VERIFIED_NO_MERGE\`.
STOP otherwise: \`SPRYXEL_PR110_ECC5_CODEX_WINDOWS_BLOCKED_OR_UNVERIFIED_NO_MERGE\`.
