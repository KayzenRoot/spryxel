# SPRYXEL WEB Batch 02 | Source and merge preflight audit (2026-10-14)

**AUDIT OUTCOME: NO_GO_IMMEDIATE_GOVERNANCE_MERGE.** This is an objective source-review report, NOT independent reviewer signoff or a canonical approval. Owner has conditionally authorized governance-only merge **after independent audit**, not permission to invalidate active HIGH_ASSURANCE work or bypass branch protection.

## Live GitHub readback

| Item | Evidence | Consequence |
| --- | --- | --- |
| `main` canonical state | `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`; `CHECKPOINT.json` says `ASSET_CONTRACT_DURABLE_JOB_WORK_ORDER_REQUIRED` | No current canonical parallel Batch02 admission |
| `#30 / WO-008` | Open HIGH_ASSURANCE, head `4a7d696b72ffab6f1569510d1059f42964864626`; `.engineering/context-locks/SPRYXEL-WO-008.json` explicitly `FRESH` with **executionBase.main.sha=`08bd429...`**, `stopOnStale=true` | ANY merge into `main` changes SHA, even if only adds `proposals/` files; WO-008 preflight must then STOP or be explicitly audited and recompiled |
| Lock critical SHA pins | `CHECKPOINT.json` `cd1a8729...`; `CHECKPOINT.md` `2986cc6b...`; `DECISIONS-LEDGER.md` `856894e9...`; `SOURCE-HIERARCHY.md` `682405cf...`; `AGENTS.md` `4dec6b3e...` | Actual normative D-162/Checkpoint/AGENTS change on main additionally invalidates multiple critical source pins |
| `#82` governance draft | Head started `35eb630d068fa99c208b00c9263a1b5fd1b21b5e`, 5 proposal-only files, **7/7 hosted checks SUCCESS**, GitHub inline unresolved 0, **formal review submissions 0** | CI GREEN != independent governance approval; the current PR alone does NOT make D-162 canonical nor G1 frozen, and will not unblock Codex |
| `#76` and `#80` drafts | Public head `3dd7903`, SSR head `9e34e76` | Protected app integration and final merged source heads not yet admitted |
| Batch02 branch | `feat/web-static-batch-02-polish` points to `9e34e76...`, no Batch02 product commits | Safe staging, not an executable Work Order |

## Three independent blockers to an effective governance-only merge NOW

1. **WO-008 source-base collision (HIGH_ASSURANCE):** a governance merge changes `main`, making `executionBase.sha` stale under the active WO-008 lock. Repo checks cannot waive this. Do not merge before WO-008 completes with objective acceptance or an independently approved new WO-008 base/lock is reissued.
2. **Missing distinct reviewer signoff:** GitHub PR #82 has zero formal review submissions, and ChatGPT authored the proposals. A same-author code review cannot truthfully be called independent signoff. Request a qualified independent architecture/security/source auditor to record exact HEAD and verdict.
3. **Proposals are not normative changes:** PR #82 adds only under `.engineering/proposals/`. This is correct for preliminary audit, but merge would not itself update `DECISIONS-LEDGER.md`, `CHECKPOINT.json` and relevant `AGENTS.md` admission rules. Therefore even a merged #82 leaves Codex legally blocked.

## Safest sequence, avoiding repeat Codex failures

A. **Keep #82 DRAFT, no merge.** Owner conditional governance-only merge authorization is recorded, contingent on audit and no WO-008 invalidation. Branch protection and proper reviewer controls stay in force.
B. Continue to close high-assurance #30 on its existing base, only after its remaining REAL database/Redis/S3/Playwright acceptance, independent review, canonical promotion and exact-main post-merge verification. **Do not merge it just to unblock a cosmetics batch.**
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
