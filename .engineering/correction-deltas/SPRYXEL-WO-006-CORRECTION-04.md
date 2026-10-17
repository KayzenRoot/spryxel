# SPRYXEL-WO-006 — Correction Delta 04

Status: CORRECTION REQUIRED  
Risk: HIGH_ASSURANCE  
Work Order: `SPRYXEL-WO-006`  
Increment: `SPRYXEL-IMP-002`  
Audited candidate head: `7801c8681d9c9c21ad9304b568a1c6147812df58`  
Base: `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`

## Re-audit result

Correction Delta 03 is materially satisfied for the main C-09 path:

- a PostgreSQL-backed revocation intent is durably created before the destructive provider call;
- provider failure leaves a truthful recoverable state;
- successful provider confirmation plus audit-finalization failure preserves a durable `provider_confirmed` intent;
- finalization is idempotent and duplicate `session.revoked` events are prevented;
- real PostgreSQL tests cover RLS, cross-tenant denial, pool-context isolation and finalization recovery;
- the full Node 22.23.3 / npm 10.9.9 HIGH_ASSURANCE acceptance suite is recorded PASS;
- all four required GitHub checks pass on the exact audited head;
- six review threads exist and zero are unresolved.

One narrow post-provider durability window remains unresolved.

## C-10 — MEDIUM, blocking HIGH_ASSURANCE acceptance — provider success can be observed but not durably confirmed

Current sequence in `apps/api/src/server.ts`:

1. persist durable revocation intent;
2. call the WorkOS revocation operation;
3. provider call returns success;
4. persist `provider_confirmed`;
5. finalize `session.revoked`.

If step 4 fails after step 3 succeeded, the route correctly returns `204` and the original durable intent survives. However the intent remains `pending`/`retryable`, not `provider_confirmed`.

On a later replay, the implementation invokes `retrySessionRevocation()`, which calls the provider revoke endpoint again and assumes a successful replay can re-establish confirmation.

That recovery currently depends on repeated provider revocation having safe/idempotent semantics. The repository does not contain provider-contract proof for that assumption, and the deterministic tests mock the repeated provider call as successful rather than proving the real contract.

For this HIGH_ASSURANCE auth/security slice, a provider-success + local-confirmation-write-failure window cannot be closed by an undocumented replay assumption.

## Required correction

Preserve the current C-09 design and close only this uncertainty window.

The executor MUST satisfy one of the following two paths.

### Path A — proof-backed replay

Use this path only if current official WorkOS documentation/API contract for the exact V1 user-management session revoke endpoint proves the repeated revoke operation is idempotent/safe after an already-successful revoke.

If that proof exists:

1. version the authoritative evidence and exact endpoint/SDK contract in the Evidence Bundle;
2. keep `retrySessionRevocation` bounded to intents that durably prove prior ownership;
3. add a deterministic provider-contract test representing the documented already-revoked replay outcome;
4. prove provider-success + `markSessionRevocationProviderConfirmed` persistence failure -> replay -> durable `provider_confirmed` -> exactly one `session.revoked`;
5. prove repeated reconciliation remains idempotent.

Do not infer idempotence from a mock or from another WorkOS product endpoint.

### Path B — reconciliation independent of undocumented revoke replay

If the exact user-management revoke contract does not prove safe idempotent replay, implement the smallest bounded reconciliation mechanism that can establish the provider outcome without depending on that assumption.

Examples may include an authoritative WorkOS session/event outcome path already supported by the selected provider, or another narrowly scoped durable mechanism consistent with the existing architecture.

Requirements:

1. no new auth provider;
2. no broad admin console or later product slice;
3. no raw provider errors/tokens/cookies/secrets in durable state;
4. the durable intent remains the canonical local repair handle;
5. recovery must remain possible when the revoked session was the caller's current session and the original authenticated request cannot simply be replayed;
6. provider outcome reconciliation must be bounded, fail closed when ambiguous, and remain idempotent;
7. exactly one durable `session.revoked` event is created after provider revocation is authoritatively confirmed;
8. cross-tenant RLS and restricted runtime-role guarantees remain unchanged.

If satisfying Path B requires a material new integration/role/worker boundary outside the current architecture, STOP `BLOCKED` and report the required architecture decision instead of silently widening scope.

## Required regression evidence

At minimum add proof for:

- provider revoke returns success;
- persistence of `provider_confirmed` then fails;
- first HTTP result remains truthful and does not expose provider/database internals;
- durable intent survives;
- recovery reaches `provider_confirmed` and `finalized` without relying on an unproven provider behavior;
- exactly one `session.revoked` event exists after repeated recovery attempts;
- recovery is still available when the revoked session was the current session;
- provider failure before confirmed success remains distinguishable from the post-success persistence-failure case;
- all C-01…C-09 regressions remain PASS.

## Acceptance rerun

After C-10 is satisfied, rerun the complete HIGH_ASSURANCE acceptance suite under Node `22.23.3` / npm `10.9.9`:

- `npm ci --no-audit --no-fund`;
- `npm run format:check`;
- `npm run lint`;
- `npm run typecheck -- --force`;
- `npm run build -- --force`;
- `npm run architecture:check`;
- `npm run test:unit`;
- `npm run test:worker`;
- `npm run test:integration`;
- `npm run test:browser`;
- `npm test`;
- `npm audit --audit-level=high`;
- `git diff --check`;
- GEF 1.1.1 doctor/status read-only under D-0007;
- four required GitHub checks on the new exact final head.

Update the Evidence Bundle and PR description with the new exact head and evidence. Do not reuse check results from an older SHA.

## Scope guard

Do not:

- start Projects/Product Shell or any later slice;
- change WorkOS/AuthKit selection;
- weaken JWT/JWKS, session ownership, recent-auth/MFA or RLS controls;
- change D-001…D-161;
- promote checkpoint;
- mutate `.gef`, GEF 1.1.1, workflows, ruleset/provider or source seed;
- broaden roles/permissions;
- merge the PR.

## STOP CONDITION

After C-10 is objectively satisfied and the complete canonical-runtime evidence passes:

`SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start the next slice.
