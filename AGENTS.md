# Spryxel Agent Contract

## Authority
Read in order: `.engineering/CHECKPOINT.json`, Decisions Ledger/ADRs, Scope, Definition of Done, Architecture, Requirements, then specialized canonical sources. Git/code/tests/provider evidence govern descriptive state.

## Executor boundary
Codex executes only an explicitly admitted Work Order and its current Context Lock. Inspect the exact base before mutation. Do not invent missing product decisions or provider selections.

## Current execution
The **last fully completed Work Order** remains `SPRYXEL-WO-009 / SPRYXEL-IMP-005`, as recorded by `v11.lastApprovedWorkOrder=SPRYXEL-WO-009` in the canonical Checkpoint. Its protected closeout was PR #88; its Context Lock is historical/stale and MUST NOT be reused.

The latest **bounded, approved and checkpoint-promoted implementation increment** is `SPRYXEL-WO-010 / SPRYXEL-IMP-006-PHASE-1-AB`: Project DNA + Asset Core **Phase 1 A+B only**, with disclosed test/evidence limitations. Implementation PR #98, documentary homologation PR #101, bounded Checkpoint promotion PR #102, and post-promotion documentary closeout PR #103 are integrated; the final closeout main is `8205ea9ac5f76a83280fb488765a89a0b92d2e26`. The WO-010 historical A+B execution Context Lock is now `STALE` and not reusable. The full WO-010 remains `INCOMPLETE_PHASES_C_D_E_NOT_ADMITTED`, never COMPLETE by implication.

The next candidate is **Phase C** (private tenant/project-scoped S3-compatible asset storage authorization and bounded API ports), but it remains **`NOT_ADMITTED`**, as do Phases D/E. `SPRYXEL_DNA_ASSET_CORE_PHASE_C_OWNER_ADMISSION_AND_NEW_WORK_ORDER_CONTEXT_LOCK_REQUIRED` is a *next legal stage*, not execution authority. Any implementation needs a **separately owner-admitted Work Order and fresh, base-pinned Context Lock** on then-current protected main, scoped allowlist, test/security evidence and independent review. A draft readiness plan in `.engineering/plans/SPRYXEL-PHASE-C-READINESS.md` is `PROPOSAL_ONLY` and confers no authority. CostGuard remains `DENY`, real-cost execution `PROHIBITED`, public uploads and production generation disabled, and production storage provider `NOT_FROZEN`; local/test S3 compatibility uses SeaweedFS under existing canonical decisions.

Historical SHA references above are evidence, not substitute Context Lock fingerprints for new work. Always consult the current `.engineering/CHECKPOINT.json` and `.engineering/SOURCE-HIERARCHY.md` before acting.

## Safety
No force-push, history rewrite, destructive GitHub mutation, visibility change or executor self-promotion. Checkpoint promotion is an auditor action after objective `APPROVED`, under D-0006. Critical source/base drift makes an execution Context Lock STALE. Missing required permissions means BLOCKED, not weakened controls.

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
