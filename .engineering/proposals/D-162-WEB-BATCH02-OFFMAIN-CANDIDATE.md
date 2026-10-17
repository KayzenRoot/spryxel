# D-162 CANDIDATE — Off-main static website Batch 02 exception

**STATUS: OWNER SCOPED APPROVAL RECORDED / PROPOSED DECISION / INDEPENDENT AUDIT PENDING / NOT CANONICAL.**
**Reference:** owner expressly authorized the previously presented choice on 2026-10-14: prepare static Batch 02 work on a separate branch while WO-008 PR #30 remains open, **no merges**, no back-end, WorkOS/auth, Blender/animations or payments changes. Tracking #63, #64, #81; source contract AGENTS.md and CHECKPOINT.json. This is a narrow authorization to advance governance/admission preparation, **not** a statement that execution is already admitted.

## Proposed normative addition to Decisions Ledger (requires separate audited promotion)
Reserve **D-162**, not present on current main. Do **not** modify or erase D-153 or prior D-001...D-161:

> For the public website *static polish only*, the owner authorizes an **independently reviewed off-main implementation candidate** of WEB-BATCH-02 on a new stacked branch based on the unmerged SSR PR #80. This exception does **not** alter the approved next legal **canonical main integration sequence**, Asset Contract + Durable Jobs (WO-008), and does not approve a merge, deploy, commercial function or production website. Actual executor admission requires a current Work Order/Context Lock issued after objective review of the exact stacked base and protected sources; every code worker is restricted to three disjoint presentation files plus a serial test file. All other implementation increments remain bound by D-153, Source Hierarchy, GEF and required security acceptance.

## Explicit owner-approved boundary
- **Allowed to prepare for code review:** dedicated off-main worktree and future DRAFT PR stacked on `feat/web-b1-ssr-locale-01@9e34e76ce8e451a47999cdd354921b5fed0c08c9`, after the normative/admission gate is satisfied.
- **Only potential mutable product files:** `apps/web/src/public-site/shell.tsx`, `apps/web/src/public-site/content.ts`, `apps/web/app/globals.css`, and `apps/web/public-site.spec.ts` (the last only by serial integrator).
- **No main merge, no parent PR merges:** PR #30 (HIGH_ASSURANCE), #76, #80 and all current drafts remain untouched. The eventual integration must independently reconcile the overlapping **old-route** files changed by #30 and relocated in #80.
- **No app/route/auth surface migration:** WorkOS callback and proxy, tenant RLS, `apps/web/app/(workspace)/**`, `apps/web/app/[locale]/**`, auth credentials, providers, billing, credit ledger, GPU/image execution, Blender, motion and video are prohibited.
- **No brand/publication shortcuts:** Existing seven static WebP remain illustrative; owner-approved faithful Digital Leaf #53, G2 #70, real legal/cookie/contact and production security remain future publication gates.
- **Tests and safety:** targeted quick checks during changes, final exact-HEAD build/types/lint/Playwright plus all actual required hosted checks; independent review and correctly classified NOT_RUN real auth tests; no self merge, no made-up approval.

## Technical source facts reviewed for the candidate
- `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`: canonical `CHECKPOINT.json` lists `ASSET_CONTRACT_DURABLE_JOB_WORK_ORDER_REQUIRED`; `AGENTS.md` requires admitted WO and fresh Context Lock.
- Historical pre-C-04B readback (superseded): `#30@4a7d696b72ffab6f1569510d1059f42964864626` had 52 changed files and zero literal overlap with the four proposed Batch02 paths. This was a prior snapshot, not the current PR head.
- Current R5 readback: `#30@5947f86439996c42e70486f18e527e2f1a93927d` is open against `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c` with 54 changed files. The source tested for C-04B is `2e6b394c991a7a96eb8749ec9870d6dc5dd8188d`; the final commit changes only `.engineering/evidence/SPRYXEL-WO-008-EVIDENCE.md`. The C-04B commands/results are accepted on record in [the R4 evidence review](https://github.com/KayzenRoot/spryxel/pull/30#issuecomment-6178472121), not independently rerun in this proposal refresh.
- Exact final HEAD `5947f86439996c42e70486f18e527e2f1a93927d` has 7/7 hosted checks successful, 13/13 review threads resolved, and zero unresolved threads. No formal `APPROVED` review exists. SonarCloud reports Quality Gate PASS, 74 new issues, 0 accepted issues, 0 hotspots, 0.0% new-code coverage and 1.7% duplication; issue-level metadata was unavailable from the audit environment (Sonar API HTTP 403), so triage remains a HIGH_ASSURANCE blocker. See [SonarCloud PR #30](https://sonarcloud.io/dashboard?id=KayzenRoot_spryxel&pullRequest=30).
- The standard browser command is recorded as 20/20 on two consecutive runs with Playwright selecting one worker automatically; one test used two BrowserContexts concurrently. A full-suite run with more than one worker was not run and is not represented as stress evidence.
- The exact #30/#80 merge-tree readback confirms content conflicts in `apps/web/app/(workspace)/page.tsx` and `apps/web/app/(workspace)/projects/[projectId]/page.tsx` after #80 relocates protected routes. **High-assurance merge integration conflict remains real**; this narrow exception authorizes neither merge nor resolution.
- A separately identified read-only static review process inspected #30 at `5947f864...`. It withdrew an initial cancellation concern after tracing both trigger return paths; a caller-settable `finish_job_safe_point` does not bypass the live-lease constraint because reconciliation leaves the lease set and the failed Job update rolls back the statement. No reproducible cancellation terminalization defect remained from this path. The review ran no tests, did not submit a GitHub review, and is not HIGH_ASSURANCE approval.
- `#76@3dd79038d0cca379a5cd3db7ac09a153a3c5b0a7` DRAFT, `#80@9e34e76ce8e451a47999cdd354921b5fed0c08c9` DRAFT, both unmerged.
- Codex Batch02 preflight correctly STOPPED with no code changes when G0/G1 and admitted lock missing. User's explicit approval resolves **only the owner's scope decision**; normative source approvals are still pending.

## Remaining approval/decision protocol
1. Independent engineering/security reviewer checks this proposal, source order, PR #30 immutable high assurance, exact #76/#80 ancestry and file-scoped conflict graph.
2. A separately approved source change must incorporate D-162 into the canonical Decisions Ledger and a corresponding source/Checkpoint **admission policy delta**. It must distinguish **off-main review-only** from main's next legal stage. Current Checkpoint must not be rewritten silently.
3. G1 scope contract candidate `WEB-BATCH02-G1-CONTRACT-CANDIDATE.md` is independently reviewed/frozen for this slice (24 actual localized URLs, no `/legal/` prefix, SSR root verified in code).
4. A real admitted Work Order + **FRESH** Context Lock compiled **after** G0/G1 approval establishes exact code base, four writable blobs, reviewer, hard exclusions and STOP. The candidate documents in this branch **do not** satisfy this.
5. Only then may the user send the existing #81 Codex prompt again. No repeat of blocked preflight and no automated dispatch before admission.

**Current resolution:** `OWNER_APPROVED_FOR_SCOPED_PREPARATION` + `INDEPENDENT_ADMISSION_PENDING`.

**STOP:** `SPRYXEL_D162_PROPOSED_OWNER_G0_APPROVED_INDEPENDENT_AUDIT_REQUIRED`.
