# PR #112 | Security, compatibility, and independent-review gate audit

**Mode:** read-only technical desk audit using actual GitHub source and check-runs, 2026-10-23.
**Repository/PR:** [KayzenRoot/spryxel #112](https://github.com/KayzenRoot/spryxel/pull/112).
**Exact source HEAD:** `dd4a6ddfaa24afeba0225daffe519322b146cab4`.
**Protected main baseline:** `6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f`.
**Existing evidence:** `evidence/spryxel` at `b459c02fbd45545622783ee095a770dce3eb688b`.
**Verdict:** `TECHNICAL_PASS / INDEPENDENT_SUBSTANTIVE_REVIEW_MISSING / NO_MERGE`.

## Exact scope and supply-chain integrity

- PR remains **OPEN / DRAFT**, not merged, with no requested reviewers, zero submitted GitHub reviews and zero review threads on the verified HEAD.
- Compared PR patch and `main..HEAD`: **exactly two changed files**. `apps/web/package.json`: pinned `next` 16.3.8 -> **16.4.1**. `package-lock.json`: matching workspace declaration, `next` and `@next/env` 16.4.1, eight optional `@next/swc-*` binaries 16.4.1; `sharp` resolved at 0.35.5. No application source files, peer packages or CI workflows in final diff.
- The `next` optional `sharp` range changes from `^0.35.4` to `^0.35.5`; installed `sharp` remains 0.35.5. This is relevant to the image-optimization advisory and is not an unreviewed new direct dependency.
- Next 16.4.1 requires Node >=20.9.0; project requires Node >=22.11.0; actual CI ran Node 22.23.3. The installed `@workos-inc/authkit-nextjs@4.4.0` peer-range allows `next ^16`, `react ^19` and `react-dom ^19`; locked React/React-DOM are 19.3.0. These are **declaration-level compatibility checks**, backed by a real CI build and Chromium/API tests, not a claim of exhaustive runtime equivalence.
- Npm 10.9.9 generated and installed the exact committed lockfile, see [regeneration run 39948933439](https://github.com/KayzenRoot/spryxel/actions/runs/39948933439). `npm ci` exited zero; temporary write-token workflow does not occur in final PR diff.

## Upstream security check and threat surface

Official patches all three findings in Next 16.4.1:
1. **CRITICAL [GHSA-673q-mjm6-r5xr](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr)**: App Router with Cache Components, `use cache` and typed-array return. GitHub source-code search found zero indexed `"use cache"` strings in this repository at audit time. This is not a runtime or every-branch assurance.
2. **CRITICAL [GHSA-2464-fhr4-w9xw](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw)**: upstream image-optimization SVG issue on glibc Linux; project uses `next/image` in `apps/web/src/public-site/sections.tsx` and has locked `sharp@0.35.5`. Real exposure depends on untrusted image inputs, runtime and deployment; do not claim exploitability simply from an advisory.
3. **HIGH [GHSA-p3m5-59mp-jv5r](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r)** (CVE-2026-94482): App Router Server Actions CPU exhaustion. The repo has real `'use server'` actions in `apps/web/app/(workspace)/jobs/actions.ts` and `projects/actions.ts`. Treat patch as relevant even though no exploit has been demonstrated.

No new P0/P1 source-code defect was found in this two-file dependency bump after direct review; the preceding sentence does NOT establish external independent approval or exhaustive zero-risk.

## Verified evidence and limitations

- **11/11** exact source-HEAD GitHub checks `SUCCESS`: SonarCloud, Socket PR Alerts, Socket Project Report, Trivy, Repository validation, Pipeline integrity, PostgreSQL RLS/API, Gitleaks, Chromium browser, contracts/domain and worker regression.
- Trivy [run 39949178554](https://github.com/KayzenRoot/spryxel/actions/runs/39949178554) raw output: `package-lock.json` **0 vulnerabilities** and `infra/postgres/Dockerfile` **0 misconfigurations**. No scanner bypass. Trivy 0.70.0 notes newer 0.76.1 available; version did not change here.
- SonarCloud Quality Gate PASS, **0 new issues**, **0 security hotspots**, and **0.0% coverage on new code**; no claim of positive coverage is permitted.
- Socket Security Pull Request Alerts and Project Report both `SUCCESS`, and direct dependency diff identifies exactly `next 16.3.8 -> 16.4.1`. This does not imply that every transitive dependency has been manually reviewed.
- [Read-only quality run 39951304410](https://github.com/KayzenRoot/spryxel/actions/runs/39951304410): `npm run format:check` **exit 0** and `npm run lint` **exit 0**, each checking 131 files without writing; exact HEAD before/after, tracked changes 0. Four stdout/stderr SHA-256 matches independently verified; immutable logs and manifest published at evidence commit `b459c02fbd45545622783ee095a770dce3eb688b`.
- Repository ruleset `24340349` active, no bypass, four required checks and review threads must resolve. Its formal required approvals count **0**, but this is strictly weaker than the project's own independent-substantive-review gate. Do not bypass the stricter gate.
- No production deployment, end-to-end application session in a real production environment, or newly collected independent adversarial review is attested.

## A truly independent and zero-fee review route

**Recommended: pro-bono review of this PUBLIC PR by a third-party Next.js/TypeScript security engineer not controlled by, working as, or financially incentivized by the PR author.** GitHub documentation says a signed-in person with read access can submit a PR review or line comments without a paid reviewer app. The source PR URL and this dossier can be shared with a voluntarily consenting engineer; no collaborator invitation or permission change is necessary for unsolicited read-only public feedback. Because this PR is still DRAFT, it does not automatically request code-owner reviews. Changing draft state, adding collaborators, or contacting people are **not** authorized by this audit.

**Provenance/quality acceptance gate:**
1. Reviewer is an identifiable, consenting, genuinely separate person using an independently controlled GitHub account, with credible TypeScript/Next.js knowledge. A second account controlled by `KayzenRoot`, including `kayzenweb3` without verified independence, does NOT count. AI-generated self-review, CodeRabbit `review skipped`, self-comments and approvals on prior SHAs do NOT count.
2. Reviewer reads **both changed files at exact source HEAD**, original patched advisory/release, lockfile integrity/SWC/sharp, Node/React/WorkOS compatibility, Server Actions and image optimization impact, CI Trivy/Sonar/Socket status, and open risks.
3. Reviewer submits a **substantive GitHub review** referencing `dd4a6ddfaa24afeba0225daffe519322b146cab4`, with concrete findings/assumptions/negative checks and a real `APPROVED` verdict or requests changes. Generic 'LGTM' or standalone author comments are insufficient. Record GitHub reviewer login, review submission, commit SHA, review URL and actual independence basis.
4. If the GitHub UI/API prevents formal APPROVED while Draft, obtain separate owner authorization to mark Ready for Review, without merging or changing required rules. Do not invent an approval.
5. Re-read the review and the candidate SHA after submission; if changed or requested changes remain, set `BLOCKED_REVIEW` pending further work. Do not merge until separate specific authorization.

**Current outcome:** no consenting independent human has been identified or engaged in this task and no valid independent review exists. This technical ChatGPT-assisted read-only audit is **not** the independent reviewer. Verified no-cost channel and concrete acceptance criteria are available; reviewer availability/identity are unresolved.

**Scope:** this is an evidence-only append to `evidence/spryxel`. No product source, main, PR #105/#108/#110, Issue #109/#111 state, rulesets, permissions, checkpoint or prior archived record altered. No merge, deploy or paid service.

**STOP:** `SPRYXEL_PR112_ISSUE111_TECHNICAL_PASS_EXTERNAL_REVIEW_PENDING_NO_MERGE`.
