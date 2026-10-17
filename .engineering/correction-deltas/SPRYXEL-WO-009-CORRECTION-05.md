# SPRYXEL-WO-009 — Correction Delta 05 (Server Action response completion)

**WO / increment:** SPRYXEL-WO-009 / IMP-005.
**Risk:** HIGH_ASSURANCE (durable Job cancellation acceptance).
**Base:** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`.
**Candidate before this correction:** `320974476fd59f57865460370c00dc3273aa7fac`.
**Authority:** The owner's R3 Marathon request includes correcting Playwright and completing the WO-009 evidence gates.

## Reproduced browser synchronization gap

The aggregate `npm test` on the candidate SHA reached Playwright after unit (120/120) and worker/integration steps completed, then ended **20/22 PASS**. The Jobs Center cancellation and concurrent-session cancellation cases received HTTP 200 for the expected Next Server Action. In the concurrent trace, the completed RSC response itself contained `Status: cancelled.`, but the test snapshot still had the old queued UI when the five-second assertion ran. The Server Action response took approximately 12 seconds; the helper only waited for response headers via `request.response()`, which did not ensure the streamed RSC body had finished.

## Correction

`clickAndWaitForServerAction` now fails explicitly if the action has no HTTP response and waits for Playwright's `Response.finished()` to confirm the streamed body completed without a request error before checking the durable UI state. Existing status, reload, isolation, and failure assertions remain unchanged. Workers, retries, and per-test timeout remain at their standard values.

## Verification and stop

The focused command `npm exec -- playwright test --grep "Jobs Center|concurrent Jobs"` on the working branch passed **3/3** with the default worker/retry/timeout settings. This run preceded the final explicit null/stream-error assertion in the helper. Exact-head focused and aggregate `npm test`, remaining static gates, evidence refresh, hosted checks, and a distinct HIGH_ASSURANCE audit are pending. Keep PR #87 in draft; do not merge or promote the checkpoint.
