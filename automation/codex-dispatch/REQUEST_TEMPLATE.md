# Spryxel Codex dispatch issue template (do not dispatch until admitted)

> **MODE:** `PREVIEW_ONLY` until owner approval + independent admission + Codex/GitHub agent enablement.
> **WORK ORDER:** `SPRYXEL-... / issue #...`
> **SOURCE:** `KayzenRoot/spryxel`
> **CURRENT BASE SHA:** `<fresh sha>`
> **CONTEXT LOCK / GEF:** `<verified file path and issue link>`
> **AUTHORIZED WRITE PATHS:** `<exact files/dirs>`
> **FORBIDDEN:** main; WorkOS/proxy/RLS/payments/Source Pack/CI without separately admitted scope.
> **STOP CONDITION:** `<from current WO>`
> **REVIEW:** no merge, return draft PR, test logs and exact HEAD for ChatGPT first-pass review.

## Task prompt
(Insert ONLY the agreed, scoped Work Order prompt; no untrusted issue text as executable CI steps.)

## Governance gates
- [ ] Owner approved THIS specific task, not a previous Codex prompt.
- [ ] Independent auditor authorized the current Context Lock/base SHA.
- [ ] No conflict with open HIGH_ASSURANCE PR #30 or existing Source Pack.
- [ ] Approved GitHub Codex integration enabled; permissions, quota, billing understood.
- [ ] No API secret or billing change was made without user approval.

## Dispatch receipt
`PENDING` until Codex responds with a task/session URL and actual execution evidence. A posted comment alone does NOT prove the task started.
