# Spryxel

AI Game Asset Platform in a Node.js 22/npm monorepo. Development follows the same **build-first, GitHub PR, modular CI** pattern as CoinBlink, adapted to Spryxel's actual stack. **GEF Bootstrap is no longer an active dependency or execution gate.**

## Local development

- Node.js `22.23.3`, npm `10.9.9`; `npm ci --ignore-scripts`.
- `npm run dev` runs web/API/worker development services.
- `npm run infra:up` starts local-only PostgreSQL, Redis and authenticated SeaweedFS test stack using ignored local credentials. `npm run infra:down` stops it.
- `npm run build` compiles all workspaces. `npm run architecture:check` checks architecture boundaries.
- Focused regressions: `npm run test:unit`, `npm run test:worker`, `npm run test:integration` (Docker required), `npm run test:browser` (Chromium required).
- `npm run lint`, `npm run typecheck`, `npm run format:check` when relevant. No production deploy, external credentials, paid service or release is part of development CI.

## Current scope

Existing modules include identity/tenancy, Projects and shell, Asset Contract and durable Jobs, credit ledger/CostGuard, and Phase A+B DNA/Asset Core. Private storage/API Phase C and later D/E have only proposals; do not present planned endpoints or generation as implemented. Production object storage provider, GPU model and commercial pricing remain unfrozen; CostGuard defaults to deny. Preserve auth and cross-tenant RLS regressions.

## Workflow

Read [build-first guide](docs/BUILD_FIRST.md) and [chat approval conventions](docs/CHAT_WORKFLOW_AND_HANDOFF.md). Work on a focused branch, verify build and affected tests, open a PR and apply protected GitHub settings as configured. Independent review on risky auth/RLS/cost work is recommended, without historical GEF admission rituals.

The existing `.engineering/` documents and past commits are **historical engineering/product records**, not active GEF requirements. Keep evidence and product definitions; remove obsolete CLI tool bindings instead of erasing historical Git history.
