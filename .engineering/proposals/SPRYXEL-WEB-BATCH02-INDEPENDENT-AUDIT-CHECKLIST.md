# Audit gate and prospective promotion order | SPRYXEL-WEB-BATCH02

**NON-EXECUTABLE REVIEW PACK.** Owner has authorized **separate-branch preparation only**, not merging or bypassing AGENTS.md. This is a reviewer checklist, not a self-audit approval.

## Source state and readback
- Main canonical SHA `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c` with next stage Asset Contract/Durable Job backbone; Wo-008 PR #30 HEAD `4a7d696b72ffab6f1569510d1059f42964864626`.
- Static PR #76 HEAD `3dd79038d0cca379a5cd3db7ac09a153a3c5b0a7`, SSR root PR #80 HEAD `9e34e76ce8e451a47999cdd354921b5fed0c08c9` stacked on #76.
- **New empty, non-executing branch** `feat/web-static-batch-02-polish` created at `9e34e76ce8e451a47999cdd354921b5fed0c08c9` under owner approval. **No commits, tests, implementation PR or Codex dispatch.**
- GitHub source scan of #30: 52 changed paths, no exact overlap among four Batch02 writable paths, but high-assurance eventual page move conflict (old protected page.tsx and projects/[projectId]/page.tsx vs #80 relocated files) remains.

## Independent admission review checklist

| No. | Gate | Current evidence | State |
|---:|---|---|---|
| 1 | Owner expressly authorizes off-main static **preparation** | 2026-10-14 user authorization; proposed D-162 | YES, limited scope |
| 2 | D-162 proposed normative exception reconciled with historical D-153 | `.engineering/proposals/D-162-WEB-BATCH02-OFFMAIN-CANDIDATE.md` | PROPOSED, not canonical |
| 3 | Independent architecture/security review of coexistence with immutable #30 | 52 changed paths, literal overlap zero, indirect conflict flagged | AWAITING SIGNOFF |
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
