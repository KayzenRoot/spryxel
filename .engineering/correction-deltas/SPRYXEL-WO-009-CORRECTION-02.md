# SPRYXEL-WO-009 — Correction Delta 02 (Job cancellation detail refresh)

**WO / increment:** SPRYXEL-WO-009 / IMP-005.
**Risk:** HIGH_ASSURANCE (durable Job and credit-reservation lifecycle).
**Base:** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`.
**Candidate before correction:** `04a900a02c4e55e686e0b198cf01cba0760a951c` plus the uncommitted R3 corrections.
**Authority:** The owner's R3 instruction explicitly requires completing WO-009 and correcting the standard Playwright gate. This delta records the narrow source adjustment required by the reproduced Job cancellation regression; it does not admit another product module or Work Order.

## Reproduced finding

One preserved trace in the standard `api-timing-12` run reproduces stale UI after a successful cancel in `concurrent Jobs sessions isolate cancellation from independent overview state`: the action POST returned HTTP 200 in 5.44 seconds, the response body contained `Status: cancelled`, and `x-action-redirect` targeted the same Job detail route, while the captured DOM still showed `Status: queued`, the Cancel button, and a loading alert. The response also had `x-action-revalidated=1`; the trace does not establish which path that header represents, so the original evidence does not prove that missing path invalidation caused the stale DOM.

This is one reproduced POST, not two. The similarly named `Jobs Center` failure in `full-08` occurred while waiting for the Jobs heading, before the cancel button was clicked. The run14 failure also stopped at Jobs navigation before any cancel POST. After adding the exact detail-path `revalidatePath`, run14 (17/20 overall) and run15 (18/20 overall) both passed the concurrent-cancel and terminal-cancel cases under the unchanged default Playwright settings. This supports the correction as a candidate fix, but no successful-run trace isolates causality; the overall browser gate remains red because Home→Projects and Home→Jobs navigation still fail intermittently.

## Narrow authorized correction

Add only `apps/web/app/jobs/actions.ts` to the WO-009 execution Context Lock `writeScope`. The action invalidates the exact Job detail path with Next's Server Action revalidation before redirecting to the existing detail URL. The unchanged cancellation assertions passed in two later default suite runs. No database/API contract, worker behavior, financial authorization, fixture, test assertion/count, retries, timeout, concurrency, or CI configuration changes are included in this correction.

This correction is limited to the existing Job cancellation flow covered by WO-009 AC17/AC25 and the R3 Playwright correction objective. The Context Lock retains its original exact base and source pins.

## Required verification and status

Before completion, record the exact candidate SHA and run canonical `npm run test:browser` **20/20 twice** at default settings, plus the full `npm test`. The current run15 remains 18/20, so acceptance is not met. Capture all exits, then re-read hosted checks on the pushed exact SHA. A separate HIGH_ASSURANCE auditor must still determine `APPROVED` before the Work Order is considered ready for merge. No checkpoint promotion, merge, or next Work Order is authorized by this correction.

**Current verdict:** `CORRECTION REQUIRED` until the required runtime gates and independent audit pass.
