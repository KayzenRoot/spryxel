# Control Tower proposed agent protocol

**NOT ADMITTED / NO AGENT DISPATCH.** Issue #55. The file is a design contract, not an authorization to use a coding model.

## Source-of-truth and constraints
Order: CHECKPOINT -> Decisions/ADRs -> Scope -> DoD -> Architecture -> Requirements -> admitted Work Order + Context Lock. An issue title, manifest entry or green CI **cannot** authorize execution.

## Proposed future assignment envelope
- batchId, woId, issue, exact repository/base/head SHA, Context Lock fingerprint, admission evidence.
- chosen tested adapter/runtime and immutable version; worktree/branch ID, exact allowed paths, semantic locks.
- dependency receipts containing independent APPROVED audit and PASS post-merge proof.
- typed prompts/scope, explicit excluded files, estimated time and hard token/time/attempt budget.
- stop condition, test plan, required CI/evidence and reviewer assignment.
- never credentials, payment/private user data, protected workflow mutation, or broad repository token in prompt.

## Future runtime states (not implemented)
DISCOVERED -> SOURCE_CHECKED -> ADMITTED -> READY -> LEASED -> RUNNING -> EVIDENCE_PENDING -> INDEPENDENT_AUDIT -> [CORRECTION REQUIRED | BLOCKED | APPROVED] -> OWNER AUTHORIZATION -> CHECKPOINT PROMOTION -> MERGE -> POST-MERGE PASS -> COMPLETE.

Failures, lost heartbeat, expired lease, stale SHA and permissions errors **fail closed**; cancellation must release only its own lock. Retrying is idempotent and bounded. Replay must not duplicate PRs or jobs. A failure is not a bypass invitation.

## Separation of responsibility
Source scout and architect may research independently. Builders only edit assigned paths in isolated worktrees. HIGH_ASSURANCE jobs run alone with specialist independent audit. Test agents collect exact-head evidence; auditors cannot be replaced by the builder's self-report. Checkpoint is promoted only by the authorized audit flow, never the executor. Merge and production releases need separately granted owner authorization. Post-merge validation is mandatory.

## R0 limitations
`planner.mjs` is a pure, read-only simulation. The example JSON is not a verified GitHub query. A future GitHub source adapter MUST verify all entries, SHA, Context Locks, dependency receipts, protected paths and current PR states *before dispatch*; JSON `ADMITTED_FOR_EXECUTION` by itself is not sufficient evidence.

No default license to alter branch protection, GEF, canonical sources, Actions permissions or billing/GPU systems. No secret exposure. No automatic recurring agent work from ChatGPT in this PR.
