# SPRYXEL-WO-006 — Correction Delta 02

Status: CORRECTION REQUIRED — PROOF ONLY  
Risk: HIGH_ASSURANCE  
Work Order: `SPRYXEL-WO-006`  
Increment: `SPRYXEL-IMP-002`  
Re-audited correction head: `f8557d83152c6e0b626355014386db1c4e034ab9`  
Base: `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`

## Re-audit result

Correction Delta 01 code findings C-01…C-08 are materially satisfied on this head.

Verified:
- API startup validates the runtime PostgreSQL role before bind/listen and refuses privileged/BYPASSRLS/migration-owner style configurations;
- API identity operations reuse one bounded shared pool and close it in server lifecycle;
- transaction-scoped RLS context remains local to transactions;
- WorkOS import enforcement uses AST-based detection for static/side-effect/dynamic/require forms;
- JWT invalid-credential failures are separated from provider/JWKS infrastructure failures;
- suspended identities are checked before provider session revocation;
- successful external revoke is not misreported as failed solely because post-side-effect audit projection fails;
- WorkOS session traversal is bounded/paginated;
- undocumented `amr=mfa` is no longer accepted as verified MFA evidence;
- sensitive policy remains fail-closed pending trustworthy strong-auth evidence;
- exact-head required checks pass and review threads are currently zero.

No additional code correction is required by this delta unless the canonical-runtime run exposes a defect.

## P-01 — HIGH_ASSURANCE proof obligation — run final suite on canonical Node 22/npm 10

The current Evidence Bundle explicitly records:
- clean install/preflight: Node `22.23.3` / npm `10.9.9`;
- corrected final validation suite: Node `24.19.0` / npm `11.17.0`.

The repository/runtime contract is Node 22-compatible and root `packageManager` is `npm@10.9.9`.

For this HIGH_ASSURANCE identity/tenancy slice, installation under Node 22 does not prove that the corrected runtime, RLS, JWT/JWKS, AuthKit edge and browser/integration suite actually execute correctly under the canonical deployment runtime.

### Required proof

Using Node `22.23.3` and npm `10.9.9` (or the exact current admitted Node 22 version resolved by the Work Order):

1. record:
   - `node --version`;
   - `npm --version`;
2. run a clean:
   - `npm ci --no-audit --no-fund`;
3. run the complete corrected acceptance suite:
   - `npm run format:check`;
   - `npm run lint`;
   - `npm run typecheck`;
   - `npm run build`;
   - `npm run architecture:check`;
   - `npm run test:unit`;
   - `npm run test:worker`;
   - `npm run test:integration`;
   - `npm run test:browser`;
   - `npm test`;
   - `npm audit --audit-level=high`;
   - `git diff --check`;
4. preserve the existing real PostgreSQL/Redis/SeaweedFS integration execution;
5. preserve all focused Correction Delta 01 regressions;
6. run GEF doctor/status read-only evidence under D-0007;
7. update the Evidence Bundle so the Node 22 run is the **acceptance run**, not merely preflight;
8. update PR #24 with the new exact final head and four required check IDs/URLs;
9. resolve no new review thread unless its corresponding evidence/change exists.

### Failure rule

If any corrected code/test only passes under Node 24 and fails under Node 22, STOP `BLOCKED`. Do not raise the canonical runtime to Node 24 inside this Work Order.

## Scope guard

Proof-only delta.

Do not:
- change product behavior merely to make evidence prettier;
- add Projects/Product Shell;
- change D-001…D-161;
- change WorkOS/AuthKit provider decision;
- change dependencies unless a Node-22 incompatibility is objectively discovered, in which case STOP BLOCKED;
- change checkpoint, `.gef`, GEF 1.1.1, workflows, ruleset/provider or source seed;
- widen roles/permissions;
- begin the next implementation slice.

If the Node 22 run reveals a genuine code defect, report it and stop for architect review rather than silently widening this delta.

## STOP CONDITION

After the canonical-runtime proof and new exact-final-head checks pass:

`SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`

Do not merge. Do not promote checkpoint. Do not start Projects/Product Shell.
