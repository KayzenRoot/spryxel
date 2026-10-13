# ChatGPT-first review and correction routing (proposed protocol)

> Owner instruction: **After every Codex prompt, ChatGPT reviews it and fixes all feasible findings using GitHub before requesting another Codex correction.** Planning authority: #62. Review may triage issues immediately; permanent governance/policy changes require independent audit and formal Decision Delta before canonical adoption.

## Single-loop approach
**Codex multi-WO batch result → ChatGPT source/PR review → classify → direct GitHub correction → exact-head verification → independent audit → next independent issue.** A batch may contain multiple independently admitted, conflict-free WOs, but each retains its own branch/PR/evidence/STOP CONDITION.

Review all issues for the returned prompt once. A finding must be deduplicated by root cause, tied to file/line and acceptance item, and classified from **evidence**, not bot prominence.

| Priority | When | Recommended action | Can wait? |
| --- | --- | --- | --- |
| P0 - STOP | Sensitive data/credentials, security critical, tenant/RLS violation, destructive migration, unauthorized expenses, governance bypass | Stop impacted lane immediately. Security owner + independent review. Fix, full relevant evidence before resume | NO |
| P1 - REQUIRED NOW | WO-required acceptance missing, canonical tests failing/flaky, release-blocking functional bug, exact-head protected CI fail, contract violation, unsafe retries/cancel | ChatGPT attempt scoped correction if verifiable. Otherwise ONE consolidated Codex Correction Delta; no merge without resolving | Not for *that PR/module acceptance*, but other independent lanes may continue |
| P2 - MODULE CLOSEOUT | Cosmetic polish, nonbreaking docs, improvements not in DoD/required requirements, performance tuning without regression | Open/associate tracked issue, owner, affected module, target closeout and proof no gate depends on it. Fix via ChatGPT during module closeout | May wait during module, not be silently forgotten |
| P3 - FUTURE | Feature idea, speculative refactor, unapproved extras, unrelated style taste | Record in backlog with priority; no new scope disguised as correction | YES, if owner accepts |
| UNCLASSIFIED | Unknown impact/conflicting review or missing evidence | Treat as P1 until measured; P0 on reasonable security suspicion | NO |

**P2 is eligible for deferral only if** non-gating, explicitly not in the Work Order's required acceptance or current issue DoD, no security/data/behavior/cost/user-critical harm, linked followup issue, deadline/owner assigned, and objective reviewer acknowledges deferral. Never waive required GitHub thread resolution, nor mark an unresolved legitimate review concern as addressed.

## ChatGPT-first execution routing
**DIRECT_GITHUB_FIX** when necessary files and context are available, scope is narrow, change is reversible, independent/hosted tests can support it and approved Work Order permits it. Examples: typo, i18n strings, docs/evidence cross-reference, isolated low-risk TypeScript fix, icons/SVG/brand source (visual approval pending). Read the current PR branch SHA and file blob SHA; patch only the same PR branch. Do not edit `main` or active unrelated WOs. After each commit, refresh HEAD and required check status.

**LOCAL_VALIDATION** when only missing evidence is Node/Docker/Playwright (e.g. WO-008 Correction-04). Prefer running tool-accessible native tests without Codex if possible. If neither ChatGPT runtime nor GitHub CI runs the required environment, ask Codex **once to run a consolidated acceptance pack**, not to rewrite correct code. Do not pretend GitHub's four governance checks cover browser/PostgreSQL tests unless evidence shows they do.

**CODEX_CORRECTION** only when scoped code fix needs tooling/complex local debugging not available here, isolated fixtures require running parallel browser, privileged provider credentials or nontrivial multi-file changes with integrations. Consolidate multiple valid blocking findings into one Correction Delta. Read latest repo state so Codex does not redo fixes already committed by ChatGPT.

**TRACKED_DEFER** for proven P2/P3 only. Do not open a new PR merely to satisfy cosmetic bot nit if safe to defer under the actual approved acceptance.

## Report on every prompt
1. `batch_id` and each `WO/issue -> PR/base/exact-head/ContextLock/status`.
2. What actually changed and who owns it.
3. Findings grouped P0/P1/P2/P3, each with evidence and impact.
4. **Corrections completed via ChatGPT**, commit SHA, affected tests/CI.
5. Pending Codex-only items **with proof why local tool is required**. Pack as one prompt only if necessary.
6. Explicit module-closeout debt links and due milestone, never hidden.
7. Verdict per PR: `APPROVED | CORRECTION REQUIRED | BLOCKED`. Mark `READY FOR INDEPENDENT AUDIT` only when acceptance is verifiably complete; owner/auditor guards remain.
8. Next independent admitted issues eligible to proceed. Do not unlock dependent WOs until prerequisites have full receipts.

## Required boundary
Existing canonical Source Pack, Checkpoint, protected GitHub required checks, GEF 1.1.1 and no force pushes remain intact. HIGH_ASSURANCE auth, Postgres/RLS, payments, Credit Ledger/CostGuard, Job state, migrations, privacy and required Playwright/integration remain full acceptance. A fast lint/format pass is insufficient for protected acceptance. No self-promotion or silent merge.

## Existing PR #30 special case
Correction-04 fixture isolation source has been applied to the current branch. The evidence document explicitly says full browser x2 and aggregate/real integration default runs remain outstanding. Classify as **P1 (missing mandatory run evidence)**, NOT yet an unsolved implementation defect. ChatGPT should run/read required acceptance when possible, report gaps, and only hand back to Codex for **specific real environment runs** unavailable through the chat.
