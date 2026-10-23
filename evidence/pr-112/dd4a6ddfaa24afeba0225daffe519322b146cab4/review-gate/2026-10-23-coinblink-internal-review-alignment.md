# PR #112 | CoinBlink-style INTERNAL review gate, no external reviewer

**Decision source:** User requested reuse of the owner-controlled review workflow used for KayzenRoot/coinblink, explicitly **without external reviewers**.
**Source repo/PR:** KayzenRoot/spryxel [#112](https://github.com/KayzenRoot/spryxel/pull/112).
**Exact candidate code HEAD:** `dd4a6ddfaa24afeba0225daffe519322b146cab4`; protected main baseline `6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f`.
**Existing signed-off technical evidence:** `evidence/spryxel` commits `52325350a279775d67534a6b132c9640a5fa0d1e`, `b459c02fbd45545622783ee095a770dce3eb688b`, `a041cd7b95bc5333cd5dc61eb36b2a7fe307bdb7`.

## Verified actual CoinBlink precedent

GitHub [KayzenRoot/coinblink PR #195](https://github.com/KayzenRoot/coinblink/pull/195) was authored by KayzenRoot and has a GitHub `APPROVED` review submitted from `kayzenweb3` on 2026-10-22. That is a distinct GitHub *login*, not proof of a different independent human. The PR was subsequently merged after a separate explicit owner-authorization workflow, according to project usage. An earlier Copilot review said quota exhausted, so it did not constitute substantive approval.

Recent [CoinBlink PR #209](https://github.com/KayzenRoot/coinblink/pull/209) uses evidence bundles, pinned HEAD, CodeQL/Sonar/Socket, `NOT_RUN` markers, scoped draft PRs and no automated merge. Actual tool runs, tests and security evidence are the meaningful parts of this pattern. An author-account comment/AI-generated dossier is NOT an independent human approval.

## Adapted practical Spryxel gate

1. **A. Evidence-based technical audit**: pin HEAD + base; enumerate full diff; verify lockfile integrity, npm/node compatibility, 11 GitHub check-runs, Trivy, SonarCloud, Socket, Gitleaks, PostgreSQL RLS/API, Chromium, domain/worker and formatting/lint. No fake pass or invented coverage.
2. **B. Second-pass internal review**: re-examine the entire change and residual risks using a different review pass/tool/account when authorized and available. This may be AI-assisted and owner-controlled. LABEL IT HONESTLY as internal, not independent human scrutiny.
3. **C. GitHub review submission if technically eligible**: Optionally use account `kayzenweb3` exactly as the CoinBlink convention, with specific findings and SHA-bound review. This cannot be assumed: a previous request for reviewer on Spryxel returned HTTP 422 "Reviews may only be requested from collaborators", and attempting the connected `kayzenweb3` GitHub review in this audit failed with `link_id must identify an eligible linked account`. No review was created; do not bypass access restrictions or claim `APPROVED`.
4. **D. Gate decision**: distinguish `TECHNICAL_GATES_PASS`, `INTERNAL_REVIEW_DOCUMENTED`, `GITHUB_APPROVED_NOT_PRESENT` and `MERGE_NOT_AUTHORIZED` instead of claiming a formal independent approval. GitHub ruleset currently asks for 0 formal approvals; the user expressly rejected requiring an external human. Continue owner-controlled decision-making with a **new specific merge authorization** only after revalidating exact code HEAD, main SHA and required checks. Keep current PR Draft/unmerged until separately authorized to change readiness/merge.
5. **E. Evidence storage**: append sanitized notes only in `evidence/spryxel`, reference immutable evidence commit SHAs from a PR comment. Do not alter production code, permissions, rule sets, CI, checkpoints, main or parallel PRs while documenting this decision.

## Exact-head technical findings now

- Change set is **only two files**: `apps/web/package.json` and reproducibly regenerated `package-lock.json`; Next.js 16.3.8 -> 16.4.1. `@next/env` plus 8 SWC binaries all 16.4.1; `sharp=0.35.5`.
- Compatibility: `@workos-inc/authkit-nextjs@4.4.0` peer range permits Next.js 16, React/React DOM 19.3.0; Node 22.23.3 and npm 10.9.9 tested.
- **11/11** check-runs SUCCESS, Trivy `package-lock.json` 0 detected vulnerabilities, SonarCloud 0 new issues and 0 security hotspots, Socket x2 SUCCESS, Gitleaks SUCCESS, PostgreSQL RLS/API, browser, contracts/domain and worker SUCCESS. SonarCloud *new-code coverage 0.0%*, not a positive coverage claim.
- Separate read-only GitHub runner: `npm run format:check` exit 0 and `npm run lint` exit 0, 131 files each; 4/4 SHA-256 stdout/stderr verified and archived.
- Relevant App Router threat surfaces: real `'use server'` actions and `next/image`; no indexed `"use cache"` usage detected. No observed critical regression from this patch, but this is **not proof** of production runtime or full vulnerability absence.
- PR #112 **OPEN/DRAFT**, exact HEAD unchanged; zero submitted GitHub reviews and zero unresolved threads. Ruleset 24340349 active, no bypass, four required checks, zero required approvals. The prior additional external-human gate is **replaced per user instruction by an INTERNAL owner-controlled technical assurance gate**, without changing the GitHub ruleset.
- Preserve protected main at `6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f`, PR #105 (Draft), #108 (Open), #110 (Draft), Issue #109, Issue #111 and all prior checkpoints. No merge, deploy, paid external reviewers or permission grants.

**Assessment:** `INTERNAL_TECHNICAL_REVIEW_PASS`, `FORMAL_GITHUB_REVIEW_NOT_AVAILABLE`, `OWNER_MERGE_DECISION_PENDING`. These are independent status dimensions; do not rewrite them into a fictitious `APPROVED`.

**STOP:** `SPRYXEL_PR112_COINBLINK_INTERNAL_REVIEW_PATTERN_RECORDED_NO_MERGE`.
