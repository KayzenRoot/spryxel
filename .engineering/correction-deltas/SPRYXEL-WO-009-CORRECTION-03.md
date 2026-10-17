# SPRYXEL-WO-009 — Correction Delta 03 (Playwright route synchronization)

**WO / increment:** SPRYXEL-WO-009 / IMP-005.
**Risk:** HIGH_ASSURANCE (browser acceptance for financial authorization paths).
**Base:** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`.
**Candidate before this correction:** `04a900a02c4e55e686e0b198cf01cba0760a951c` plus the uncommitted R3 corrections.
**Authority:** The owner's R3 Marathon request explicitly includes correcting Playwright; R3 allows minimal formal reconciliation when a required test file is outside the current execution lock.

## Reproduced finding

Under the unchanged default Playwright settings (four workers, `fullyParallel: true`, zero retries, the existing 5-second assertion timeout), the standard `Jobs Center` test failed while waiting for the Jobs heading after a client-side navigation. The trace shows the Next RSC `GET /jobs?_rsc=...` returned HTTP 200 after 5,111.539 ms. The heading assertion began about 99 ms after the request started and timed out approximately 13 ms before the response body completed. At failure, the URL was already `/jobs`, the UI still showed the Jobs loading shell, and the trace contained no page error or console error. This is evidence of a request/UI synchronization race at the current assertion deadline, not evidence that the route returned an HTTP error.

## Narrow lock reconciliation

Add only `apps/web/app/page.spec.ts` to the execution Context Lock `writeScope`. This file contains the existing browser assertions for the affected route and cancellation flows. The correction may register and await the matching Next RSC response, including response completion, before running the existing assertion; for cancellation it may await the matching existing server-action response. It must preserve all current assertions, test count, CLI worker count, `fullyParallel`, retries, and timeout values. No app behavior, production route, workflow, financial rule, or Work Order boundary is added.

The lock's original exact execution base and critical source pins remain unchanged. This is a test-harness synchronization adjustment made solely to satisfy the already authorized R3 browser gate.

## Verification and stop

After the change, capture the exact standard Playwright result and traces. Acceptance still requires `npm run test:browser` 20/20 twice at default settings and a complete passing `npm test`, followed by exact-head hosted checks and a distinct HIGH_ASSURANCE audit. Until all are green, retain `CORRECTION REQUIRED`; do not promote, merge, or begin another Work Order.
