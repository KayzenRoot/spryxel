# Work Order | PR #110 casing conflict minimal delta

STATUS: `PROPOSED_NOT_EXECUTED`.
Precondition PR #110 OPEN/DRAFT HEAD `b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b` and main `126e3a17265e38c94c5057d5d423eb14a12bb9c9`, ruleset unchanged. Abort if refs changed.

**Smallest verified solution preserving feature intent and the pre-existing canonical file:**
1. In PR #110 branch `chore/spryxel-ecc-curated-workflow-20261023` ONLY, transfer the exact bytes of improved upper-case blob `042e00c0560887f90a0b7d69e75010a21c10c8a3` into the pre-existing lowercase path `.github/pull_request_template.md`, replacing its old blob `90e8d37ddee973aafcb230e48e15dd83cab4c2a6`.
2. DELETE only the added duplicate tracked path `.github/PULL_REQUEST_TEMPLATE.md` **within the same atomic commit**. No unrelated files, no change to the skills, AGENTS.md, workflow or products; never modify `main`.
3. Verify new PR commit has just two tree deltas from `b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b` (one lower-case blob update, one upper-case path deletion); diff vs `main` still has exactly ten intended changed paths, substituting a modified lower-case template for the added upper-case one.
4. GitHub `git/trees/<newSHA>?recursive=1` must show EXACTLY ONE case-insensitive match for `.github/pull_request_template.md`, blob `042e00c...`, zero collisions across all tracked paths. Validate SHA and source checkout independently before invoking the skill tests. NEVER use `git config core.ignorecase false` as a workaround.
5. Revalidate CI on the new exact SHA: pinned npm, format:check, lint, build, architecture, Trivy lockfile 0 vulnerabilities, SonarCloud 0 new issues/hotspots, Socket, Gitleaks, pipeline checks and PR threads; no reuse of 7/7 from old `b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b`.
6. NEW clean, LF Windows checkout must be verified with `git status --porcelain` empty and `git hash-object` equality. If dirty, BLOCKED and investigate; no restoring/normalizing/ignoring changes just to pass.
7. Only after clean worktree + ChatGPT subscription-authenticated Codex safe-usage preflight, execute five short distinct skills; gather genuine traces, exit codes, token metrics if available, sanitize, SHA256 after sanitization and exact GitHub evidence branch readback. Mark `NOT_RUN` or `UNVERIFIED` honestly.
8. Publish evidence append-only on `evidence/spryxel`; leave PR #110 Draft; **NO merge, deploy, service spend, ruleset, checkpoint, PR #105/#108 or main edits**.

**Why this solution:** `.github/pull_request_template.md` already exists in main, while PR #110's case-distinct uppercase path is the only new source of the Windows checkout collision. This preserves the strengthened PR template content and ten-file PR scope with a single focused PR branch commit.

**Alternative (NOT recommended):** delete the existing lowercase template and keep uppercase, which changes the canonical path already present on main and broadens the PR diff. Do not take that route without revisiting the work order.

**STOP pending owner decision:** `SPRYXEL_PR110_CASEFOLD_ROOT_CAUSE_CONFIRMED_FIX_NOT_APPLIED_NO_MERGE`.
