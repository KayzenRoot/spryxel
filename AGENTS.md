# Spryxel development instructions

## Build the product first

Follow the same practical development pattern as CoinBlink: implement working Spryxel features in small, reviewable branches/PRs. **GEF Bootstrap is not installed, and no GEF CLI, mandatory Work Order, Context Lock, checkpoint promotion or extra governance admission is required for ordinary implementation.** Use GitHub Issues/PRs to track scope and tests; prefer actual working code over repeated planning cycles.

Start with `README.md` and `docs/BUILD_FIRST.md`. Spryxel is a Node 22/npm monorepo with Next.js web, Fastify API, worker, PostgreSQL, Redis and a local/test S3-compatible adapter. **Do not copy CoinBlink's Astro/D1 commands into this stack.**

## Development and validation

Run `npm ci --ignore-scripts`, `npm run build`, and run `npm run dev` to inspect UI/API locally. Use focused `npm run test:unit`, `npm run test:worker`, `npm run test:integration` (disposable PostgreSQL/Redis/SeaweedFS and Docker) or `npm run test:browser` (Chromium) when affected. CI uses a CoinBlink-style always-on build and path-filtered module tests. Fix reproducible regressions, keep `main` usable, do not invent passing local tests.

## Product protections remain non-negotiable

Preserve canonical PostgreSQL tenant/project membership and FORCE RLS, immutable DNA/Asset versions and provenance, WorkOS session verification, fail-closed CostGuard, private object access and data integrity. Do not commit secrets, do not weaken authentication or cross-tenant isolation, and do not turn on real paid/production GPU, provider, storage, payment, deployment or release without distinct owner consent. Avoid rewriting applied SQL migrations or Git history. No silent bypass of GitHub settings or failed checks.

## Current product state

Identity/Tenancy, Projects, durable Job/Asset Contract, credit ledger/CostGuard and DNA/Asset core **Phase A+B** have existing implementations. Phase C private storage/API, Phase D and Phase E are **not implemented or admitted by the previous system**. Their draft proposals, including PR #105, are suggestions, not executable authority or proof that a feature works. Under the new build-first approach the owner can scope future implementation directly in a normal issue/PR; until then, do not claim Phase C implemented.

The `.engineering/` Source Pack and `CHECKPOINT` are **historical/product reference** materials. Their prior GEF-related execution gates are superseded for development; do not fabricate or delete past evidence. Runtime/test behavior and current code supersede stale implementation-status prose. Keep security/economic domain decisions.

## Collaboration

Use the CoinBlink-style concise PR reviews and explicit clickable choice/authorization controls when available; they request consent and never auto-merge. See `docs/CHAT_WORKFLOW_AND_HANDOFF.md`. Do not merge or deploy without actual authorization.

## Selective ECC-derived project skills (opt-in, lightweight)

Five local task skills live under `.agents/skills/spryxel-*/SKILL.md`. They are checked into the repository, require no global plugin, hooks, MCP servers, background agents or paid service, and must not override this file:
- `spryxel-search-first` when choosing libraries/tools or about to build duplicate utilities.
- `spryxel-change-impact` for cross-package or data/security boundary changes.
- `spryxel-contract-first` for API/Zod/service contract changes.
- `spryxel-secure-review` for identity, tenant isolation, RLS, assets, cost or input-handling changes.
- `spryxel-verify` before PR handoff to report real build/lint/format/tests/diffs.

Use only the relevant skill(s); avoid ritual multi-agent handoffs. Project commands in package.json and active GitHub Actions remain authoritative. No skill can certify an unrun test, change permissions, auto-merge, deploy or incur cost. See `docs/engineering/CI_TOOLING_AND_ECC.md` for source, license and workflow details.
