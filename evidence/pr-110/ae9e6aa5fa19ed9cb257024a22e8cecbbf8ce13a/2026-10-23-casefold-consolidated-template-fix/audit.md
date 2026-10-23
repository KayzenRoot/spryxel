# SPRYXEL PR #110 | Consolidated GitHub PR template Windows casefold fix

Date: 2026-10-23. GitHub connector exact-SHA audit; no Windows executable attached.
Source PR: https://github.com/KayzenRoot/spryxel/pull/110
Original authorized HEAD: `b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b`; new PR HEAD: `ae9e6aa5fa19ed9cb257024a22e8cecbbf8ce13a`.
Protected main unchanged: `126e3a17265e38c94c5057d5d423eb14a12bb9c9`.
Origin Work Order and case-collision evidence: `04ecfed6a0bcf61a1182f93bfe7554dd9bac65f1`.

## Single focused source commit

Source commit `ae9e6aa5fa19ed9cb257024a22e8cecbbf8ce13a`, parent `b2c4d4fbb1cf60459cfccdf56eacd57120a4f11b`, tree `acbc9876bdc369d06ecbfe580b9db34b9eb67dff`, was committed and advanced with a compare-and-swap expected SHA, normal fast-forward, with no force or history rewrite.

**EXACTLY two source paths changed relative to original HEAD:**
1. **REMOVED** `.github/PULL_REQUEST_TEMPLATE.md`, blob `042e00c0560887f90a0b7d69e75010a21c10c8a3`.
2. **MODIFIED** canonical, pre-existing `.github/pull_request_template.md`, blob `90e8d37ddee973aafcb230e48e15dd83cab4c2a6` -> `d0a7235dfb0f72b4e02446f351d19dbb5a552a49`, 1,445 bytes, LF ending.

The consolidated content retains: issue/module, visible outcome, scope and paths, existing `npm ci` / build and focused tests, exact-head CI and limitations, tenancy/auth/RLS/CostGuard and private assets, public endpoints, provider changes, deploy/paid-default-NO, no automatic merge and owner/repository-settings decision. It ALSO retains the new vertical scope/smallest-safe-diff rationale; explicit `format:check`, `lint`, `build`, `architecture:check`, NOT_RUN/BLOCKED tests, Trivy/Gitleaks/SonarCloud/Socket required checks, review gating where required, actual exits/evidence, no unapproved deploy/merge/spend. No product source, skill instructions, license, AGENTS.md or workflow modified by this fix.

Compared Git trees at original and candidate HEAD: old 394 entries, new 393 entries; **only two path deltas**, and **zero case-insensitive path collisions across the entire new untruncated tree**. New tree contains **only one** `.github/pull_request_template.md` with SHA-1 `d0a7235dfb0f72b4e02446f351d19dbb5a552a49`. PR compare against main is **10 intended files**, 3 commits ahead and 0 behind, with exactly one lowercase template modification replacing the prior added uppercase template.

## Exact-HEAD CI and security revalidation

At `ae9e6aa5fa19ed9cb257024a22e8cecbbf8ce13a` exactly **7/7 GitHub check-runs COMPLETED/SUCCESS**:
- SonarCloud Code Analysis PASS, PR comment says **0 new issues**, **0 accepted issues**, **0 security hotspots**, **0.0% coverage on new code** (NOT positive coverage proof).
- Socket Security Pull Request Alerts SUCCESS.
- Socket Security Project Report SUCCESS.
- Pipeline integrity SUCCESS, [Actions #40020677132](https://github.com/KayzenRoot/spryxel/actions/runs/40020677132).
- Gitleaks secrets SUCCESS, [Actions #40020677214](https://github.com/KayzenRoot/spryxel/actions/runs/40020677214).
- Trivy filesystem and configuration SUCCESS, [Actions #40020677133](https://github.com/KayzenRoot/spryxel/actions/runs/40020677133). Raw job `120644120511` shows `package-lock.json` **0 vulnerabilities** and `infra/postgres/Dockerfile` **0 misconfigurations**. No ignore policy or bypass.
- Repository validation SUCCESS, [Actions #40020677104](https://github.com/KayzenRoot/spryxel/actions/runs/40020677104), job `120644120513`: checkout candidate SHA, Node 22, locked npm ci, read-only `npm run format:check`, read-only `npm run lint`, `npm run build` and `npm run architecture:check`; all steps SUCCESS.

Active ruleset `24340349`: enforcement active, zero bypass actors, four required checks (`Repository validation`, `Pipeline integrity`, `Gitleaks secrets`, `Trivy filesystem and configuration`). PR review threads 0 unresolved. No approval is fabricated. Tests not triggered by these documentation-only paths (worker/PostgreSQL/browser) are **NOT_RUN on this HEAD**.

## Runtime and Windows limitations

The historical case-insensitive Windows checkout failure at old HEAD is **causally resolved in the Git tree**, but an **actual fresh Windows checkout and `git status --porcelain` clean-tree assertion at NEW HEAD are NOT_RUN** in this GitHub-only session. Linux GitHub Actions checkout success does not substitute for Windows proof.

Five real Codex Windows skill discovery/invocations remain **NOT_RUN**, with no claimed token/latency usage or session traces. Follow previous Phase0 safe ChatGPT auth guidance when running locally. Do NOT run skill tests against old dirty source SHA. New windows run must pin `ae9e6aa5fa19ed9cb257024a22e8cecbbf8ce13a`.

No merge, deploy, paid service, account/permission/ruleset/settings edits, force push, code outside the two approved template paths, PR #105, PR #108, historical checkpoints or protected main modifications.

**Verdict:** `CASEFOLD_FIX_APPLIED / SOURCE_TREE_COLLISION_FREE / PR110_CI_7_OF_7_PASS / WINDOWS_CLEAN_CHECKOUT_NOT_RUN / ECC5_RUNTIME_NOT_RUN / DRAFT_NO_MERGE`.

**STOP:** `SPRYXEL_PR110_WINDOWS_CASEFOLD_FIXED_EVIDENCE_PUBLISHED_NO_MERGE`.
