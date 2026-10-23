---
name: spryxel-change-impact
description: Map blast radius of Spryxel changes before editing authentication, tenant policy, PostgreSQL RLS, contracts, worker jobs, asset storage, credits or cross-package APIs.
---

# Spryxel Change Impact

**Source:** ECC by Affaan Mustafa, MIT license, `affaan-m/ECC@90606c8315ee09cafc303515c5f33024db6b9882`. Adapted task playbooks, **not** the entire ECC agent/plugin/runtime. License: `docs/engineering/THIRD_PARTY_ECC_MIT_LICENSE.txt`.

Read-only preflight unless implementation is separately authorized.

1. Pin source HEAD and intended files before doing anything. Map callers and boundaries from actual source imports and tests; label unknowns `UNVERIFIED`.
2. Check affected surfaces: `apps/web`, `apps/api`, `apps/worker`, `packages/contracts`, `packages/domain`, `packages/db`, `infra`.
3. List data/release risks: PostgreSQL FORCE RLS, tenant membership and WorkOS sessions, immutable asset versions, object-storage access, idempotency, CostGuard, credits and durable jobs. Never infer database authorization from a pure predicate.
4. For changes to API contract/Zod schema, require explicit backward compatibility, clients and negative tests. For applied migrations, use forward-only migration planning.
5. Define smallest candidate diff and affected test gates: `test:unit`, `test:worker`, `test:integration`, `test:browser`. Scope heavier checks to actual change impact.
6. After implementation compare the actual diff to the predicted blast radius, flag additions and omissions, and record outcome in the PR.

Do not invent completeness, change `main` directly, deploy, spend or bypass protection. Output **scope / affected callers / tests / risk / rollback / stop condition** in brief form.
