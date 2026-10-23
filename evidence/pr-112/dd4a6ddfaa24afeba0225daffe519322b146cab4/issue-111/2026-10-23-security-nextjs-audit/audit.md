# Spryxel Issue #111: Next.js 16.4.1 security remediation

**Timestamp:** 2026-10-23 UTC; **status:** TECHNICAL_SECURITY_GATES_PASS / DRAFT_NO_MERGE.
Repository: `KayzenRoot/spryxel`; candidate [PR #112](https://github.com/KayzenRoot/spryxel/pull/112).
Immutable code HEAD: `dd4a6ddfaa24afeba0225daffe519322b146cab4`. Main baseline `6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f` (unchanged).
Security branch: `security/nextjs-16-4-1-issue-111`.

## Original findings and patch scope

Observed [failing Trivy check on unrelated PR #110](https://github.com/KayzenRoot/spryxel/actions/runs/39944966851): `next@16.3.8`, 2 CRITICAL and 1 HIGH. Advisory identifiers: `GHSA-2464-fhr4-w9xw`, `GHSA-673q-mjm6-r5xr`, `CVE-2026-94482`. Fixed Next.js release: 16.4.1 (see https://github.com/vercel/next.js/releases/tag/v16.4.1).

**Final PR #112 diff: exactly two files**, `apps/web/package.json` and `package-lock.json`. Next.js is pinned from 16.3.8 to **16.4.1**. No application source or Dockerfile changes; temporary code-generation workflow removed from final diff.

## Reproducible lockfile

[GitHub Actions run 39948933439](https://github.com/KayzenRoot/spryxel/actions/runs/39948933439), successful:
- Node 22.23.3 and npm **10.9.9** asserted before running.
- `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`, then `npm ci --ignore-scripts --no-audit --no-fund`, exit 0.
- Lockfile verified via exact committed file SHA: `apps/web` next, `node_modules/next` and `node_modules/@next/env` all 16.4.1; 8 SWC optional packages all version 16.4.1; sharp 0.35.5.
- Temporary `contents: write` branch-specific workflow used only for lockfile generation, then deleted from final branch and final diff. No production workflow/ruleset changes.
- This run is a source of package-lock reproducibility, not proof of subsequent runtime behaviors.

## Candidate validation at exact source HEAD

11 of 11 GitHub check-runs `SUCCESS`, all attached to `dd4a6ddfaa24afeba0225daffe519322b146cab4`:
1. SonarCloud Code Analysis: PASS, PR bot shows 0 new issues, 0 security hotspots, 0 accepted issues; **0.0% new-code coverage** reported, not evidence of positive coverage.
2. Socket Security Pull Request Alerts: SUCCESS; direct dependency diff identifies next 16.3.8 -> 16.4.1.
3. Socket Security Project Report: SUCCESS.
4. Trivy filesystem and configuration: SUCCESS, [run 39949178554](https://github.com/KayzenRoot/spryxel/actions/runs/39949178554), raw output shows `package-lock.json 0 vulnerabilities`, `infra/postgres/Dockerfile 0 misconfigurations`. Trivy 0.70.0 noted 0.76.1 available; scanner was **not** disabled or bypassed.
5. Repository validation: SUCCESS, [run 39949178436](https://github.com/KayzenRoot/spryxel/actions/runs/39949178436). Locked npm ci, build and architecture check passed. Original main CI does NOT run global format/lint: do not claim those gates ran for this PR.
6. Pipeline integrity: SUCCESS, [run 39949178447](https://github.com/KayzenRoot/spryxel/actions/runs/39949178447).
7. Spryxel PostgreSQL RLS and API integration: SUCCESS, [run 39949178452](https://github.com/KayzenRoot/spryxel/actions/runs/39949178452).
8. Gitleaks secrets: SUCCESS, [run 39949178431](https://github.com/KayzenRoot/spryxel/actions/runs/39949178431).
9. Spryxel Chromium browser regression: SUCCESS, [run 39949178430](https://github.com/KayzenRoot/spryxel/actions/runs/39949178430).
10. Spryxel contracts and domain tests: SUCCESS, [run 39949178438](https://github.com/KayzenRoot/spryxel/actions/runs/39949178438).
11. Spryxel worker regression: SUCCESS, [run 39949178448](https://github.com/KayzenRoot/spryxel/actions/runs/39949178448).

## Exact scope and remaining gates

- PR #112 is **OPEN DRAFT**, 0 submitted reviews, 0 inline threads. A genuinely independent substantive review tied to exact HEAD remains outstanding before any merge decision.
- Security patch not merged into `main`, no deployment/release or production runtime exposure claim.
- No change to PR #105 (draft), PR #108 (open, EVD-003), PR #110 (draft, curated ECC integration), Issue #109, ruleset, or checkpoints.
- Original Issue #111 remains open until remediation is merged and validated according to owner approval; issue can be marked technically remediated in candidate only.
- This technical audit asserts only observed tests and scanners. `format:check` and `lint` were not executed on the **final exact-head** of PR #112 by main's existing build workflow; optional independent verification is still possible before readiness.
- Next.js 16.4.1 is the minimum patched 16.x version for the advisories. Broader package security and real exploitability depend on future runtime/deployment and threat modeling. No new paid service or extra permissions were activated.

**STOP:** `SPRYXEL_ISSUE111_SECURITY_CANDIDATE_11_OF_11_PASS_DRAFT_NO_MERGE`.
