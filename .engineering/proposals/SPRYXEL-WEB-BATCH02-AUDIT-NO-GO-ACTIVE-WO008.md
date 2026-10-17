# SPRYXEL WEB Batch 02 | Source and merge preflight audit (R5 refresh, 2026-10-14)

**AUDIT OUTCOME: NO_GO_IMMEDIATE_GOVERNANCE_MERGE.** This is an objective source-review report, NOT independent reviewer signoff or a canonical approval. Owner has conditionally authorized governance-only merge **after independent audit**, not permission to invalidate active HIGH_ASSURANCE work or bypass branch protection.

## Live GitHub readback

| Item | Evidence | Consequence |
| --- | --- | --- |
| `main` canonical state | `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`; `CHECKPOINT.json` says `ASSET_CONTRACT_DURABLE_JOB_WORK_ORDER_REQUIRED` | No current canonical parallel Batch02 admission |
| `#30 / WO-008` | Open HIGH_ASSURANCE, current head `5947f86439996c42e70486f18e527e2f1a93927d`; `.engineering/context-locks/SPRYXEL-WO-008.json` explicitly `FRESH` with **executionBase.main.sha=`08bd429...`**, `stopOnStale=true`. Historical pre-C-04B readback was `4a7d696...` / 52 paths. | ANY merge into `main` changes SHA, even if only adds `proposals/` files; WO-008 preflight must then STOP or be explicitly audited and recompiled |
| Lock critical SHA pins | `CHECKPOINT.json` `cd1a8729...`; `CHECKPOINT.md` `2986cc6b...`; `DECISIONS-LEDGER.md` `856894e9...`; `SOURCE-HIERARCHY.md` `682405cf...`; `AGENTS.md` `4dec6b3e...` | Actual normative D-162/Checkpoint/AGENTS change on main additionally invalidates multiple critical source pins |
| `#82` governance draft | Pre-correction head `97aeb8123aa05e05927ba636e0cce9b1b97935a0`, six proposal-only files, DRAFT, no formal review submissions. Exact new-head checks are to be recorded after publication. | CI GREEN != independent governance approval; this PR does NOT make D-162 canonical nor G1 frozen, and does not admit Codex |
| `#76` and `#80` drafts | Public head `3dd79038d0cca379a5cd3db7ac09a153a3c5b0a7`, SSR head `9e34e76ce8e451a47999cdd354921b5fed0c08c9`, respectively. | Protected app integration and final merged source heads not yet admitted |
| Batch02 branch | `feat/web-static-batch-02-polish` points to `9e34e76...`, no Batch02 product commits | Safe staging, not an executable Work Order |

## R5 current exact-head evidence (historical observations above remain historical)

- `main` remains `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`; PR #30 is still open, DRAFT state was not requested for #30 and no merge was performed. The current #30 diff is 54 files. Its tested code SHA is `2e6b394c991a7a96eb8749ec9870d6dc5dd8188d`; final `5947f864...` adds only `.engineering/evidence/SPRYXEL-WO-008-EVIDENCE.md`.
- R4 owner evidence comment: [#30 comment 6178472121](https://github.com/KayzenRoot/spryxel/pull/30#issuecomment-6178472121). Reported on record (not independently rerun in R5): `npm ci`; format/lint; 18/18 typecheck; 11/11 uncached build; architecture check; 94/94 unit tests; worker checks; real PostgreSQL 18.6 FORCE RLS with Redis/BullMQ and SeaweedFS integration; two standard Playwright runs 20/20; aggregate `npm test`; audit. The two browser runs selected one worker automatically; one test exercised two concurrent BrowserContexts. A suite run with more than one Playwright worker was NOT_RUN. These reports do not independently prove current runtime behavior.
- Exact `5947f864...` hosted checks: Repository validation [run](https://github.com/KayzenRoot/spryxel/actions/runs/38633572196/job/116090983607), Pipeline integrity [run](https://github.com/KayzenRoot/spryxel/actions/runs/38633572047/job/116090984106), Gitleaks [run](https://github.com/KayzenRoot/spryxel/actions/runs/38633572233/job/116090984090), Trivy [run](https://github.com/KayzenRoot/spryxel/actions/runs/38633572035/job/116090984338), SonarCloud [run](https://github.com/KayzenRoot/spryxel/runs/116091284494), Socket PR Alerts [run](https://github.com/KayzenRoot/spryxel/runs/116091034385), Socket Project Report [run](https://github.com/KayzenRoot/spryxel/runs/116090993581): **7/7 success**. GitHub reports 13/13 inline review threads resolved, 0 unresolved; formal reviews are comments, with no `APPROVED` submission.
- SonarCloud's exact-head bot readback is Quality Gate PASS, 74 new issues, 0 accepted issues, 0 hotspots, 0.0% new-code coverage, 1.7% duplicated lines. Issue-level severity/type/rule/path/status metadata request failed HTTP 403 at CloudFront; issue classification is **SONAR_TRIAGE_NOT_AVAILABLE**, an explicit HIGH_ASSURANCE blocker. The gate result does not classify or dismiss the 74 issues. [SonarCloud PR #30](https://sonarcloud.io/dashboard?id=KayzenRoot_spryxel&pullRequest=30).
- Distinct read-only static review agent `/root/wo008_independent_review` inspected exact #30 `5947f864...` against `main@08bd429...`; it did not execute tests or submit a GitHub review. It withdrew its initial live-lease cancellation claim after tracing the trigger returns. It also considered whether a worker could spoof `spryxel.finish_job_safe_point`; although the setting is caller-settable and the worker can call `reconcile_jobs`, the legacy reconciliation UPDATE leaves a valid `lease_expires_at` in place. The `durable_job_active_lease_check` constraint therefore rejects the cancelled Job, and PostgreSQL rolls back the whole statement, including the preceding Attempt update. **No reproducible cancellation terminalization defect remains from this path.** This is a read-only static review, not runtime validation or authenticated GitHub approval. No #30 code was changed.
- `git merge-tree` between #30 `5947f864...` and #80 `9e34e76...` reports content conflicts in `apps/web/app/(workspace)/page.tsx` and `apps/web/app/(workspace)/projects/[projectId]/page.tsx`. This remains a required future HIGH_ASSURANCE integration resolution.

## Three independent blockers to an effective governance-only merge NOW

1. **WO-008 source-base collision (HIGH_ASSURANCE):** a governance merge changes `main`, making `executionBase.sha` stale under the active WO-008 lock. Repo checks cannot waive this. Do not merge before WO-008 completes with objective acceptance or an independently approved new WO-008 base/lock is reissued.
2. **Missing distinct reviewer signoff:** GitHub PR #82 has zero formal review submissions, and the proposal author is not a GitHub independent reviewer. The separate read-only agent's source review is not an authenticated PR approval or a full runtime acceptance. Obtain a qualified independent architecture/security/source auditor's verdict on exact HEAD.
3. **Proposals are not normative changes:** PR #82 adds only under `.engineering/proposals/`. This is correct for preliminary audit, but merge would not itself update `DECISIONS-LEDGER.md`, `CHECKPOINT.json` and relevant `AGENTS.md` admission rules. Therefore even a merged #82 leaves Codex legally blocked.

## Safest sequence, avoiding repeat Codex failures

A. **Keep #82 DRAFT, no merge.** Owner conditional governance-only merge authorization is recorded, contingent on audit and no WO-008 invalidation. Branch protection and proper reviewer controls stay in force.
B. Continue to close high-assurance #30 on its existing base. The prior R4 record reports the real database/Redis/S3/Playwright acceptance completed on `2e6b394...`, but that evidence was not rerun in R5; remaining gates include Sonar issue triage, independent authenticated review and exact-main post-merge verification. **Do not merge it just to unblock a cosmetics batch.**
C. Independently review proposed G0/D-162 and G1 and the contract of four disjoint Batch02 files, reporting any conflict with PR #30's changed legacy protected routes now relocated under `(workspace)` by #80. If blocking defects found, update the proposals on #82 and recheck final HEAD.
D. Once #30 has validly closed, take a **fresh main HEAD and all protected SHA fingerprints**; prepare the actual governance-only normative delta as its own narrowly scoped PR (D-162 and limited Checkpoint/AGENTS parallel off-main admission rule plus G1 freeze and admissible WO/Context Lock). Respect precise review and merge authorization; do not reuse older stale candidate blobs.
E. Only after formal admission, recheck #76/#80 parent SHAs and new Batch02 source branch head, then trigger the *existing* #81 Codex prompt once. Final coding target stays DRAFT stacked above #80, with NO production merge or back-end/Blender.
F. If owner explicitly wants governance before #30 closeout, present a separate HIGH_ASSURANCE option: first halt #30, formally rebase/recompile its Context Lock on a new canonical base, redo affected tests and independent audit. This **can cost substantially more** and is **NOT** permitted by current instruction to preserve active #30.

## Permanent controls

- No merge of #30/#76/#80/#82 or Batch02 until correct per-PR gates.
- No unverified task dispatch, billing, Blender/motion, auth/tenant or credit changes.
- A separate exception to sequence is a *governance change*, not a stealth waiver of the Source Hierarchy or existing HIGH_ASSURANCE WOs.
- Current owner authorization alone is insufficient to assert independent admission, and "7/7" means CI checks, not security acceptance.

**Audit STOP:** `SPRYXEL_WEB_BATCH02_GOVERNANCE_MERGE_NO_GO_ACTIVE_WO008_SOURCE_LOCK`.
