# Spryxel review report after a Codex multi-agent batch

**Batch:** `<id>` | **Date:** `<ISO>` | **Review principal:** `<independent reviewer>`
**GitHub exact source readback:** `<main/base sha>` | **Canonical checkpoint:** `<phase>` | **Source Pack status:** `<fresh/stale>`

| Work Order / issue | PR / branch | Exact HEAD | Required checks | ChatGPT corrected | Codex needed | Module closeout | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <WO> | <#> | <40-char sha> | <names + runs> | <paths/commit SHA> | <evidence> | <linked #issue> | <APPROVED / CORRECTION REQUIRED / BLOCKED> |

## Findings (one record per unique root cause)
| ID | P0/P1/P2/P3 | Source/line | Acceptance or gate impacted | Root cause/evidence | Routing | Followup / module due |
| --- | --- | --- | --- | --- | --- | --- |
| <id> | <priority> | <path:line> | <WO criterion or 'non-gating'> | <repro> | DIRECT_GITHUB_FIX / LOCAL_VALIDATION / CODEX_CORRECTION / TRACKED_DEFER | <issue, owner, due> |

## Completed directly in ChatGPT
<Each fix with exact PR branch, file blob at edit, commit SHA, validation outcome. If none: state none.>

## Consolidated Codex-only correction prompt
<Only include if genuinely required; list all P1 blockers and specific test commands, exact HEAD, protected exclusions, evidence expected, stop condition. Distinguish 'run missing tests' from 'fix implementation'.>

## Deferred module-closeout debt
<Only proven P2, linked issue and module deadline, no required DoD/acceptance conflicts, review authorization. Never call P0/P1 debt.>

## Final audit/promotion gate
- [ ] WO/Context Lock current (or mismatch disclosed and blocked)
- [ ] Every P0/P1 resolved with evidence, not suppressed
- [ ] Mandatory Work Order acceptance, including integration where relevant, passed
- [ ] All mandatory exact-head hosted CI contexts passed, **no stale SHA reuse**
- [ ] Required review threads resolved through legitimate documented resolution
- [ ] Independent approval and required owner checkpoint/merge authorization
- [ ] Postmerge checks before dependent WO admission

**Decision:** <verdict> | **Next independent eligible work:** <issues> | **STOP CONDITION:** <WO exact stop condition>
