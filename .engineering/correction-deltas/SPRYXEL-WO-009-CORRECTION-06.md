# SPRYXEL-WO-009 — Correction Delta 06 (project-creation action completion)

**WO / increment:** SPRYXEL-WO-009 / IMP-005.
**Risk:** HIGH_ASSURANCE (browser acceptance and authorized project creation flow).
**Base:** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`.
**Candidate before this correction:** `9419f270`.
**Authority:** The owner's R3 Marathon request includes correcting the Playwright suite and finishing the WO-009 gates.

## Reproduced browser synchronization gap

The full aggregate on `9419f27` passed **21/22** browser tests, including the corrected Job cancellation cases, but the Home → Projects → Create → Open case still clicked the Create project Server Action and immediately waited five seconds for its result without synchronizing on that action. Its trace shows the expected `POST /projects` returned HTTP 200 after **5.66 seconds**, while the DOM still had the disabled `Creating…` form and no success status at assertion time.

## Correction

The project-creation test now uses the same bounded helper that waits for the matching Next Server Action response body to complete without error before asserting the existing success status and project navigation. Existing output and project-context assertions remain unchanged. Test workers, retries, and timeout configuration remain unchanged.

## Verification and stop

After this change, `npm exec -- playwright test --grep "Home to Projects|Jobs Center lists|concurrent Jobs"` passed **3/3** with default workers, retries, and timeout. The run includes the previously failing project creation flow and both cancellation flows. A new exact-head full `npm test`, remaining static gates, Evidence Bundle refresh, hosted checks, and a distinct HIGH_ASSURANCE audit remain pending. Keep PR #87 in draft; do not merge or promote the checkpoint.
