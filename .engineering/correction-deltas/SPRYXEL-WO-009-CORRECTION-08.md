# SPRYXEL-WO-009 — Correction Delta 08 (browser route load budget)

**WO / increment:** SPRYXEL-WO-009 / IMP-005.
**Risk:** HIGH_ASSURANCE (browser route and durable Job state acceptance).
**Base:** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`.
**Candidate before this correction:** `f826789`.
**Authority:** The owner's R3 Marathon request includes correcting the browser suite while preserving assertions and standard test settings.

## Reproduced timeout

After a clean `npm ci --no-audit --no-fund`, `npm test` passed unit **120/120**, worker smoke, and real-service integration, but browser ended **21/22**. The failing `Project Overview shows recent jobs and all admitted states remain readable` test hit the standard 30-second limit while its final `/jobs` navigation awaited the browser `load` event. The trace shows seven full `page.goto` navigations in the scenario, each spending 2–6.8 seconds, and the final navigation was still pending when the test timed out. No browser settings were changed.

## Correction

The scenario's `/jobs` and project-detail navigations now wait for document commit. Existing visible-content and six admitted-state assertions still wait for their expected UI content, so the test continues to verify the resulting page and all statuses. The change is limited to this test; global workers, retries, and 30-second timeout remain unchanged.

## Verification and stop

`npm exec -- playwright test apps/web/app/page.spec.ts --grep=Overview` passed **3/3**, including the corrected scenario (**17.1 seconds**) and concurrent Jobs isolation (**15.5 seconds**). The full aggregate and remaining exact-head checks after this correction, Evidence Bundle refresh, hosted checks, and distinct HIGH_ASSURANCE review remain pending. Keep PR #87 draft; do not merge or promote the checkpoint.
