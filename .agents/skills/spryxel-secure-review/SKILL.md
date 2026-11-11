---
name: spryxel-secure-review
description: Threat-model sensitive Spryxel changes involving tenant membership, WorkOS, private assets, presigned URLs, SQL/RLS, idempotency, credits and CostGuard.
---

# Spryxel Secure Review

**Source:** ECC by Affaan Mustafa, MIT license, `affaan-m/ECC@90606c8315ee09cafc303515c5f33024db6b9882`. Adapted task playbooks, **not** the entire ECC agent/plugin/runtime. License: `docs/engineering/THIRD_PARTY_ECC_MIT_LICENSE.txt`.

Assess the actual diff, not a generic OWASP checklist. Use read-only tools by default.

- **Identity & tenant isolation:** verify the caller's authenticated principal is derived server-side; enforce current active tenant/project membership; deny all missing/malformed/out-of-scope snapshots.
- **PostgreSQL:** force tenant-scoped RLS at data access; prefer parameterized queries and fresh transaction-bound authorization, not client IDs or TypeScript types as authority.
- **Assets and uploads:** validate MIME, size and digest; bind upload attempt, version, actor and object to the same tenant/project; keep private buckets private; minimize signed URL lifetime and object privileges.
- **Economics:** CostGuard is fail-closed; no paid model/GPU/provider action without explicit owner authorization; ledger changes must remain accurate, idempotent and auditable.
- **Secrets and supply chain:** scan for credentials, unsafe CI permissions, unpinned Actions, executable network installers and unsafe workflow contexts; do not print secret values.
- **Verification:** enumerate negative tests, RLS/integration needs, remaining threats, and actual Gitleaks/Trivy/Socket/Sonar reports. Never claim an automatic check implies human independent review.

Output severity-tagged findings with precise file/line evidence, accepted scope and missing proof. NO bypass, no false PASS.
