# Domain Docs — Spryxel

This file adapts general-purpose agent skills to Spryxel's **existing canonical Source Pack**. It does not create a new domain authority or alter any approved decision.

## Read the actual authority first

1. `.engineering/CHECKPOINT.json` and `.engineering/CHECKPOINT.md` for approved implementation state.
2. `.engineering/SOURCE-HIERARCHY.md` for precedence and stale-context rules.
3. `.engineering/DECISIONS-LEDGER.md` and approved ADRs, if present, for normative decisions.
4. `.engineering/SCOPE.md`, `.engineering/DEFINITION-OF-DONE.md`, `.engineering/ARCHITECTURE.md`, and `.engineering/REQUIREMENTS.md`.
5. The specialized `.engineering/` documents relevant to the task, such as API Contracts, Data Model, Security, UI/UX, Integration Contracts, Test Plan, or Deployment.
6. For execution/review, the active versioned Work Order, Context Lock, Correction Delta, Evidence Bundle and exact Git base/HEAD.

Repository Git/code/tests/runtime evidence controls claims about what actually exists or has passed. It **does not silently override normative decisions**. If an authority is missing, inaccessible or conflicts with the task, surface the blocker; do not substitute a generic example.

## Domain language

Use the definitions and bounded module names from Spryxel's canonical docs and approved Decisions Ledger. Optional `GLOSSARY.md`, `GLOSSARY-MAP.md`, or `docs/adr/` files may add context **only if they exist** and do not conflict with the Source Hierarchy.

Do not assume a root `GLOSSARY.md`, `docs/adr/`, or a single `src/` folder. Spryxel uses `apps/`, `packages/`, `infra/`, `scripts/`, and the `.engineering/` Source Pack. Generic skill examples involving ordering, billing, or illustrative ADR numbers are **examples, not Spryxel decisions**.

## Agent skill boundaries

- Never generate or update a glossary, ADR, architecture, checkpoint, or Work Order merely because a skill template expects one. Such changes require a separately authorized, scoped increment.
- If a proposed name, dependency, endpoint, table, feature, or ADR conflicts with an approved decision, report the exact conflict and stop that change until formally resolved.
- Treat generated domain-model suggestions as advisory and verify them against Scope, Requirements, Architecture, Git and acceptance evidence before proposing implementation.
- A skill cannot promote checkpoints, waive HIGH_ASSURANCE gates, or approve/merge an in-progress implementation solely because the hosted CI is green.
