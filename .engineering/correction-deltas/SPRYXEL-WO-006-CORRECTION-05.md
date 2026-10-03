# SPRYXEL-WO-006 — Correction Delta 05

Status: CORRECTION REQUIRED  
Risk: HIGH_ASSURANCE  
Work Order: `SPRYXEL-WO-006`  
Increment: `SPRYXEL-IMP-002`  
Audited candidate head: `17e82ebf4ae53e08afbc252e40216d61eacaaf7e`  
Base: `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`

## Re-audit result

Correction Delta 04 / C-10 Path B is materially correct for the explicit provider-success + local-confirmation-write-failure window:

- WorkOS user-session revoke idempotence is not assumed;
- a durable `pending` intent is reconciled from the authoritative WorkOS `session.revoked` Events API;
- matching is bounded to the exact WorkOS subject + session and uses the documented Events API retention/query limits;
- a revoked current session can be recovered from a fresh authenticated session;
- positive event confirmation finalizes exactly one durable `session.revoked` record;
- event absence/Events API failure for a `pending` intent fails closed;
- Node `22.23.3` / npm `10.9.9` acceptance is recorded PASS, including aggregate `npm test`, 57/57 unit tests, real PostgreSQL/RLS + Redis + SeaweedFS integration and Playwright 7/7;
- all four required GitHub checks pass on the exact audited head;
- review threads are currently zero unresolved.

One remaining path still violates the same C-10 Path B ambiguity rule.

## C-11 — MEDIUM, blocking HIGH_ASSURANCE acceptance — ambiguous provider exception can still replay undocumented revoke

Current behavior for a durable intent in `retryable` state:

1. WorkOS revoke is attempted.
2. The SDK throws.
3. The local intent is marked `retryable`.
4. On recovery, Events API reconciliation is attempted first.
5. If no `session.revoked` event is found at that moment, the code calls `retrySessionRevocation()`, which reissues the same user-session revoke operation.

The generic provider exception in step 2 does **not** prove that WorkOS failed before applying the revocation. A timeout, dropped response, connection reset after request delivery, or upstream 5xx can leave the external outcome ambiguous.

Therefore “no event observed yet” is not sufficient negative evidence to prove that the original revoke did not occur. Events can be delayed. Reissuing the undocumented revoke in that state reintroduces the replay assumption that Correction Delta 04 Path B was intended to remove.

This is directly covered by the existing Path B requirement that provider outcome reconciliation be bounded and **fail closed when ambiguous**.

## Required correction

Preserve the current C-10 positive-event reconciliation and change only the ambiguous `retryable` recovery path.

A recovery attempt MUST NOT reissue `POST /user_management/sessions/revoke` merely because a matching `session.revoked` event is not yet visible.

Before any new revoke attempt after an ambiguous provider exception, obtain **authoritative positive evidence that the exact session is currently active**.

The selected WorkOS user-session API documents its list operation as listing active sessions. A bounded, complete listing that positively contains the exact session ID for the exact external subject may be used as current-state evidence that a new revoke attempt is needed.

Required semantics:

1. Existing positive `session.revoked` event:
   - mark provider confirmed;
   - finalize idempotently;
   - do not call revoke again.

2. No matching event + a bounded, complete WorkOS active-session listing positively contains the exact target session:
   - a new revoke attempt is permitted;
   - keep the durable intent and existing ownership/tenant/RLS constraints;
   - process its outcome through the same durable confirmation/reconciliation rules.

3. No matching event + target session absent from the active-session listing:
   - absence MUST NOT be converted into `session.revoked`;
   - do not replay revoke;
   - remain recoverable/fail closed because the session may be revoked, expired, or provider state may still be converging.

4. Events API unavailable, active-session listing unavailable/incomplete/page-capped/deadline-exceeded, or any other ambiguous provider state:
   - fail closed;
   - preserve the durable intent;
   - do not replay revoke.

5. Do not infer idempotence from WorkOS agent-session APIs or other products/endpoints.

6. Do not introduce a second auth provider, new product module, broad worker architecture or new dependency.

The existing bounded pagination/deadline logic in the WorkOS session adapter should be reused where possible rather than creating a second session-list implementation.

## Required regression evidence

Add deterministic tests proving at minimum:

- original revoke throws after an intentionally ambiguous simulated transport failure;
- immediate Events API lookup returns no matching event;
- recovery does **not** call revoke again unless the bounded active-session listing positively contains the exact target;
- exact active target -> one permitted new revoke attempt;
- target absent -> 503/fail-closed, no revoke replay and no false `session.revoked`;
- session listing page cap/deadline/provider failure -> fail-closed, no revoke replay;
- delayed `session.revoked` event on a later recovery -> finalizes exactly once without another revoke;
- current-session recovery still works from a fresh authenticated session;
- cross-tenant/RLS, privacy/redaction and C-01…C-10 regressions remain PASS.

Where practical, extend the real PostgreSQL integration path to prove the durable intent survives the ambiguous period and later reaches exactly one final audit event.

## Acceptance rerun

After C-11 is satisfied, rerun the complete HIGH_ASSURANCE acceptance suite under Node `22.23.3` / npm `10.9.9`:

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

Update the Evidence Bundle and PR description with the new exact head and evidence. Do not reuse required-check results from an older SHA.

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

After C-11 is objectively satisfied and the complete canonical-runtime evidence passes:

`SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start the next slice.
