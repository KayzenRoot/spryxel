# SPRYXEL-WO-006 — Proposed Checkpoint Delta

**Status:** PROPOSED_FOR_INDEPENDENT_AUDIT; not accepted or promoted.

## Preconditions

- An independent objective audit returns `APPROVED` for PR #24 at its exact audited head and verifies this Evidence Bundle.
- Any merge is separately authorized; the four required checks pass on the resulting exact `main` SHA, and post-merge validation uses that new SHA.
- The checkpoint authority records the actual merge/promotion SHAs and check evidence; candidate-SHA checks are not reused after merge.
- No checkpoint or production state changes before that separate audit and promotion.

## Proposed semantic delta

1. Preserve the canonical `SPRYXEL-WO-005 / SPRYXEL-IMP-001` platform foundation and record `SPRYXEL-WO-006`, issue #23, PR #24, `SPRYXEL-IMP-002`, the audited candidate head, eventual merge SHA, and post-merge validation only after the above preconditions pass.
2. Record that the provider-neutral identity/session boundary, AuthKit web edge, Fastify JWT/JWKS verifier, Spryxel identity/tenant/membership schema, real PostgreSQL RLS, bootstrap, session revocation, recent-auth/MFA policy and deterministic security tests were audited at the exact evidence SHA.
3. Advance the implementation milestone to Identity/Tenancy complete only if the audit approves it. Any Projects/Product Shell work still requires its own admitted Work Order and fresh Context Lock; this proposal does not start that work.
4. Preserve WorkOS AuthKit V1 as selected, GEF 1.1.1, active ruleset/provider/workflows, required checks, D-001…D-161 and all prior product decisions. Pricing, billing provider, production GPU/model provider and production object-storage provider remain not frozen. Preserve the historical acceptance record of frozen versions.
5. Preserve the D-0007 drift policy and immutable `.gef` baseline; do not encode raw GEF `UNEXPECTED` as a baseline update.

## Explicitly prohibited in this proposal

- No edit to `.engineering/CHECKPOINT.json` or `.engineering/CHECKPOINT.md` during this execution.
- No merge, checkpoint promotion, provider/ruleset/workflow mutation, `.gef` mutation, source-seed or decision-ledger mutation.
- No Projects/Product Shell, billing, TrustShield, generation/assets, AI/model/GPU or any later slice.

Current checkpoint remains authoritative until independent approval and separate promotion. Executor stops at `SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`.
