# Audit gate and prospective promotion order | SPRYXEL-WEB-BATCH02

**NON-EXECUTABLE REVIEW PACK.** Owner has authorized **separate-branch preparation only**, not merging or bypassing AGENTS.md. This is a reviewer checklist, not a self-audit approval.

## Historical pre-C-04B source snapshot (retained as history)
- At the earlier snapshot, main canonical SHA was `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c` with next stage Asset Contract/Durable Job backbone; Wo-008 PR #30 HEAD was `4a7d696b72ffab6f1569510d1059f42964864626` with 52 changed paths.
- The earlier source scan found no literal overlap, while noting a future integration conflict. This historical observation is superseded by the exact R5 merge-tree results below.

## R5 current source state and exact readback (2026-10-14)
- Main remains `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`; current #30 HEAD is `5947f86439996c42e70486f18e527e2f1a93927d`, 54 changed paths. Code test evidence is reported on record for `2e6b394c991a7a96eb8749ec9870d6dc5dd8188d`; final #30 commit only adds `.engineering/evidence/SPRYXEL-WO-008-EVIDENCE.md`. See R4 [owner evidence comment](https://github.com/KayzenRoot/spryxel/pull/30#issuecomment-6178472121); local results were not independently rerun for this proposal refresh.
- Static PR #76 HEAD `3dd79038d0cca379a5cd3db7ac09a153a3c5b0a7`, SSR root PR #80 HEAD `9e34e76ce8e451a47999cdd354921b5fed0c08c9` stacked on #76.
- **New empty, non-executing branch** `feat/web-static-batch-02-polish` created at `9e34e76ce8e451a47999cdd354921b5fed0c08c9` under owner approval. **No commits, tests, implementation PR or Codex dispatch.**
- Exact #30 hosted checks on `5947f864...` are 7/7 success; the 13 inline review threads are all resolved, with no formal `APPROVED` submission. Sonar reports Quality Gate PASS, 74 new issues, 0 accepted, 0 hotspots, 0.0% new-code coverage and 1.7% duplication, but issue-level metadata was unavailable to this audit environment (HTTP 403), so **SONAR_TRIAGE_NOT_AVAILABLE** remains a HIGH_ASSURANCE blocker. Standard browser results are recorded as two 20/20 runs with one automatically selected worker; one test used two concurrent BrowserContexts. A multi-worker suite run was NOT_RUN.
- `git merge-tree` for exact #30 `5947f864...` × #80 `9e34e76...` reports content conflicts at `apps/web/app/(workspace)/page.tsx` and `apps/web/app/(workspace)/projects/[projectId]/page.tsx`. The integration risk remains; no merge or resolution was done.
- A distinct read-only static review process inspected #30 at `5947f864...`, but did not run tests or submit a GitHub review. It withdrew its initial MEDIUM cancellation finding after confirming both valid-lease trigger paths return `NULL` before their reconcile-GUC checks. It also checked caller-supplied `finish_job_safe_point`: the reconciler leaves a live lease set, so `durable_job_active_lease_check` aborts the Job update and rolls the transaction back, including the prior Attempt update. No reproducible terminalization defect remains from this path; this static review is not an authenticated PR approval or runtime test.

## Independent admission review checklist

| No. | Gate | Current evidence | State |
|---:|---|---|---|
| 1 | Owner expressly authorizes off-main static **preparation** | 2026-10-14 user authorization; proposed D-162 | YES, limited scope |
| 2 | D-162 proposed normative exception reconciled with historical D-153 | `.engineering/proposals/D-162-WEB-BATCH02-OFFMAIN-CANDIDATE.md` | PROPOSED, not canonical |
| 3 | Independent architecture/security review of coexistence with immutable #30 | Current exact merge-tree shows two protected route content conflicts; static review identified no confirmed HIGH/CRITICAL issue, Sonar issue triage unavailable | BLOCKED / AWAITING SIGNOFF |
| 4 | G1 actual 24 route/3 locale/type/owned paths frozen | `WEB-BATCH02-G1-CONTRACT-CANDIDATE.md` | CANDIDATE |
| 5 | WO executable admission explicitly approved for exact parent #80 head | `SPRYXEL-WEB-BATCH02-WORK-ORDER-CANDIDATE.md` | NOT ADMITTED |
| 6 | Fresh executable Context Lock from **approved** canonical sources | `SPRYXEL-WEB-BATCH02-CONTEXT-LOCK-CANDIDATE.json` | NOT FRESH, not executable |
| 7 | Current source hierarchy/Checkpoint delta formally reconciles exceptional off-main coding without authorizing main merge | Need independently approved **normative** source change; no such approval yet | BLOCKED |
| 8 | C1/C2/C3 file disjointness + serial test ownership | Four SHA-pinned source paths, separate branch at exact parent | PASS as planning, refresh on admission |
| 9 | Cost/time budget and available multiagent runtime verified by executor | User's existing Codex Cloud, ≤3 agents if supported, no new API fees | VERIFY AT EXECUTION |
| 10 | Public release, brand #53, G2 #70, legal/consent, WorkOS+real RLS | Not approved/performed; no publication in Batch02 | RELEASE NO-GO |
| 11 | Protected merge gate for #30/#76/#80/Batch02 | Owner explicitly forbade merges | **NO MERGE** |

## Required sequence of evidence and authorizations

1. Independent source/security reviewer returns a concrete `GO_FOR_NARROW_OFFMAIN_WO` or `BLOCKED` with specific findings, directly tied to exact SHA and proposed D-162/G1 contract. **No generic approval from green GitHub checks**.
2. An owner-approved, Source-Hierarchy-compliant D-162 / Checkpoint **policy delta** is made normative in a separate reviewed branch-protection-compliant action; until then, `AGENTS.md` and current Checkpoint prohibit source mutation by Codex. **The user explicitly forbade merges now**, so it cannot be claimed completed.
3. Only after normative decision review, convert proposed WO into `ADMITTED_FOR_EXECUTION`, issue `FRESH` Context Lock with exact base, expected source Git blobs, allowed files, reviewer proof and stop condition. Ensure no fake self-approval and no stale fingerprints.
4. Re-check branch `feat/web-static-batch-02-polish` is still exactly `9e34e76...` and parental stacked PR HEADs unchanged. If stale, recompile.
5. Then owner sends the existing prompt from planning PR #75 issue #81 to Codex Cloud and obtains a new DRAFT stacked PR. Final acceptance requires real tests on its exact HEAD. Existing WorkOS/tenant/high-assurance acceptance remains separate for merges.

## Owner decision boundary and potential next clarification

Owner has said **NO MERGES** for this preparation. If a future independent reviewer determines the necessary canonical Source Hierarchy/Checkpoint approval can occur only through a governance PR merge, ask explicitly whether a **governance-only reviewed merge** may be allowed. **Do not infer such permission from authorization to prepare the coding branch.**

**STOP:** `SPRYXEL_WEB_BATCH02_GOVERNANCE_REVIEW_PACK_READY_WITHOUT_EXECUTION_ADMISSION`.
