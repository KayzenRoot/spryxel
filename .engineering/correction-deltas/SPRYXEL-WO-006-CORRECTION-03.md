# SPRYXEL-WO-006 — Correction Delta 03

Status: CORRECTION REQUIRED  
Risk: HIGH_ASSURANCE  
Work Order: `SPRYXEL-WO-006`  
Increment: `SPRYXEL-IMP-002`  
Audited candidate head: `768e77f47ad0e0edc7121eae48808f1450489482`  
Base: `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`

## Re-audit result

Correction Delta 02 proof obligation is satisfied on the audited candidate head:

- the official acceptance run is recorded under Node `22.23.3` / npm `10.9.9`;
- the complete format/lint/typecheck/build/architecture/unit/worker/integration/browser/npm-test/audit suite is recorded PASS;
- the acceptance code head `09f393314c0426c6149815d4ecfcd4c8ea7e9a40` differs from the audited candidate only by the Evidence Bundle update;
- the four required GitHub checks pass on the audited candidate head;
- the previous C-01…C-08 corrections remain materially present.

The candidate is nevertheless **not approved** because one independent data-integrity finding remains.

## C-09 — MEDIUM, blocking acceptance — provider revocation can lose its durable security audit/reconciliation trail

Current flow in `apps/api/src/server.ts`:

1. local identity/suspension validation;
2. provider ownership verification + revocation;
3. attempt to persist `session.revoked`;
4. if the persistence attempt fails, return `204` and emit only the operational log event `session.revocation_audit_reconciliation_required`.

The ordering correctly avoids telling the client that a confirmed provider revoke failed. The remaining defect is that, after the external side effect succeeds, the only surviving repair signal may be a process/logging event. There is no canonical durable pending record or idempotent repair path that guarantees the missing `session.revoked` audit record can be recovered.

That conflicts with the canonical security requirement that session revocation has safe security-event audit, and with the canonical requirement that security events remain discoverable through durable records. A resolved review thread does not by itself satisfy this invariant.

### Required correction

Implement the smallest durable reconciliation design that preserves the existing provider and architecture boundaries.

The implementation MUST ensure:

1. identity/suspension validation and provider-session ownership checks still happen before the destructive provider side effect;
2. before the provider revoke can occur, Spryxel has a **durable canonical repair handle** for that revocation attempt in PostgreSQL, or an objectively equivalent canonical durable mechanism;
3. if the durable repair handle cannot be persisted, provider revocation is not attempted and the API fails safely with the existing availability semantics;
4. after confirmed provider success, the canonical state can be finalized idempotently to the durable `session.revoked` security event;
5. if that post-provider finalization fails, the API may still return `204`, but a durable pending/reconciliation record must remain so the audit gap is not permanent;
6. an explicit deterministic reconciliation path exists and is testable. It must be idempotent and must not create duplicate `session.revoked` events;
7. provider failure after creation of the durable intent must not falsely claim that the session was revoked. The durable record must preserve a truthful retryable/failed/pending state;
8. reconciliation records and logs contain only the minimum safe internal IDs/session reference/reason codes required for repair. No raw token, cookie, provider secret, credential or raw provider error may be persisted or logged;
9. tenant isolation and the restricted `spryxel_app` role remain enforced. A cross-tenant caller cannot read/write/finalize another tenant's reconciliation state;
10. no new external service or dependency is introduced unless the executor proves it is strictly necessary and separately stops for architectural approval.

An acceptable shape is a minimal PostgreSQL-backed revocation intent/reconciliation record plus idempotent finalization/recovery. Equivalent designs are allowed only if they objectively provide the same durability and recovery guarantees.

## Required regression evidence

Add deterministic tests proving at minimum:

- durable-intent persistence failure => no provider revoke and safe failure;
- suspended identity => no durable revoke intent/provider side effect;
- unowned session => no provider revoke/final success event;
- provider revoke failure after durable intent => truthful recoverable state, no false `session.revoked`;
- provider success + final audit write/finalization failure => client receives `204` and a durable pending repair record remains;
- reconciliation retry after the transient failure => exactly one durable `session.revoked` event;
- repeated reconciliation => idempotent, no duplicate final audit event;
- cross-tenant direct access/finalization is denied by real PostgreSQL RLS;
- reused pooled connections do not leak reconciliation RLS context;
- no credential/token/provider-error leakage in durable rows, logs or API bodies.

Preserve all existing C-01…C-08 regression tests.

## Acceptance rerun

After the correction, rerun the complete HIGH_ASSURANCE acceptance suite under canonical Node `22.23.3` / npm `10.9.9`:

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
- the four required GitHub checks on the new exact final head.

Update the Evidence Bundle and PR description with the new exact head and evidence. Do not reuse required-check results from an older SHA.

## Scope guard

Do not:

- start Projects/Product Shell or any later slice;
- change WorkOS/AuthKit as the selected provider;
- weaken session ownership, recent-auth/MFA, JWT/JWKS or RLS controls;
- change D-001…D-161;
- promote checkpoint;
- mutate `.gef`, GEF 1.1.1, workflows, ruleset/provider or source seed;
- broaden product roles/permissions;
- merge the PR.

## STOP CONDITION

After C-09 is implemented, the full canonical-runtime suite passes, the Evidence Bundle is updated, and all four required checks pass on the new exact final head:

`SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Projects/Product Shell.
