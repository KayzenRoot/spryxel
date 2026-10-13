# Spryxel Agent Contract

## Authority
Read in order: `.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, Definition of Done, Architecture, Requirements, then specialized canonical sources. Git/code/tests/provider evidence govern descriptive state.

## Executor boundary
Codex executes only an explicitly admitted Work Order and its current Context Lock. Inspect the exact base before mutation. Do not invent missing product decisions or provider selections.

## Current execution and admission
The current completed increment and next legal stage are defined by `.engineering/CHECKPOINT.json` and `.engineering/CHECKPOINT.md`, not by this agent guidance. Re-read them at task start.

For work already admitted on an open PR, also read its versioned Work Order, Context Lock, Correction Delta(s), Evidence Bundle, and exact current PR HEAD. Do not treat an open PR or passing hosted checks as approval. An in-progress increment remains gated until objective audit, canonical checkpoint promotion, merge, and post-merge validation. Never start its successor before those gates are satisfied.

## Safety
No force-push, history rewrite, destructive GitHub mutation, visibility change or checkpoint self-promotion. Critical source/base drift makes an execution Context Lock STALE. Missing required permissions means BLOCKED, not weakened controls.

## Agent skills

### Matt Pocock skill invocation

When the `mattpocock-skills` plugin is available, automatically use a model-invoked skill whose description matches the current task; these skills do not require the user to type a slash command. Use `/ask-matt` when skill routing is unclear. User-invoked workflows remain user-led. Do not force-fit a skill or let it override the user's request, this repository's governance/security rules, or deterministic evidence.

Prefer deterministic Git, text search, AST, hashes, tests, lint, typecheck, and build checks whenever they are sufficient. Use Jev only when available and useful for bounded context relevance, triage, classification, reranking, claim verification, comparison, or explicit-gate decisions. Jev output is advisory; never send it secrets or credentials.

### Issue tracker

Issues and specs for this repository live in GitHub Issues. Use the `gh` CLI and follow `docs/agents/issue-tracker.md`.

### Triage labels

Use `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix` for the five canonical triage roles. Follow `docs/agents/triage-labels.md`.

### Domain docs

Follow `.engineering/SOURCE-HIERARCHY.md` and the canonical `.engineering/` Source Pack for domain vocabulary and decisions. See `docs/agents/domain.md` for Spryxel-specific paths; generic skills examples must never replace an approved decision.
