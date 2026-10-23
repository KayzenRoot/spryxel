---
name: spryxel-contract-first
description: Keep Spryxel contract schemas and API/worker consumers aligned when modifying Zod commands, domain boundaries and event/job payloads.
---

# Spryxel Contract First

**Source:** ECC by Affaan Mustafa, MIT license, `affaan-m/ECC@90606c8315ee09cafc303515c5f33024db6b9882`. Adapted task playbooks, **not** the entire ECC agent/plugin/runtime. License: `docs/engineering/THIRD_PARTY_ECC_MIT_LICENSE.txt`.

Spryxel already uses shared `packages/contracts` Zod schemas; **do not** introduce OpenAPI generation, a new schema runtime or extra packages merely to use this skill.

1. Identify provider(s), consumer(s) and the single authoritative schema in `packages/contracts`; link concrete usages in API/worker/web/domain.
2. Record operation, required/optional fields, enums, errors, UUID normalization and compatibility. Reject unknown fields at untrusted boundaries; never trust client-supplied identity, tenant, role, bucket or object key.
3. Write a failing contract test for each changed behavior, especially missing/extra fields, malformed ID, size, media type, version state, idempotency, wrong tenant and unauthorized access.
4. Update only the canonical contract and consumers; keep runtime authorization separate and server-side under PostgreSQL FORCE RLS.
5. Run narrow contract/domain tests, build/typecheck and architecture check. Expand to worker/integration/browser only when the actual dependency graph requires it.
6. Report consumer parity and any unverified integrations; do not certify storage or DB authorization from schema tests.

**Done:** one authoritative schema, tested compatibility and no unacknowledged consumer drift.
