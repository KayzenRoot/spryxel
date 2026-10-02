# Spryxel

Spryxel is governed by **GEF Bootstrap 1.1.1**.

## Current stage

`SPRYXEL-WO-004 / SPR-PLAN-007` is **COMPLETE**. The implementation architecture baseline was objectively audited, checkpoint-promoted, squash-merged and post-merge validated.

The canonical implementation plan defines the TypeScript/Node.js 22, npm-workspace modular-monolith foundation, Next.js web boundary, Fastify API boundary, separate Node worker, PostgreSQL/Drizzle persistence, Redis/BullMQ transient coordination, S3-compatible storage with SeaweedFS local/test development, typed configuration, observability and test architecture.

Product implementation has **not started**.

The next legal implementation slice is:

`SPRYXEL-IMP-001 — Platform Foundation Bootstrap`

It is specified but **not admitted or executed** until a new Work Order and Context Lock are created.

## Canonical source order
1. `.engineering/CHECKPOINT.json` and `.engineering/CHECKPOINT.md`
2. `.engineering/DECISIONS-LEDGER.md`
3. `.engineering/SCOPE.md`
4. `.engineering/DEFINITION-OF-DONE.md`
5. `.engineering/ARCHITECTURE.md`
6. `.engineering/REQUIREMENTS.md`
7. Specialized Source Pack documents

See `.engineering/SOURCE-HIERARCHY.md` for conflict rules.
