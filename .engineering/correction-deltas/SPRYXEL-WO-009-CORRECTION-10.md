# SPRYXEL-WO-009 — Correction Delta 10 (standard Playwright Jobs acceptance)

**WO / increment:** SPRYXEL-WO-009 / IMP-005.
**Risk:** HIGH_ASSURANCE (durable Job lifecycle and browser acceptance).
**Base:** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`.
**Candidate before correction:** `d866e931a759f9f59a89ef93bad421df3c1111f1`.
**Correction commit:** `6cbd9210573815c82f0af60d274c41f31ef0b2bb`.
**Authority:** The owner's R3 Marathon request authorizes correcting Playwright while preserving the standard suite.

## Reproduced failure and cause

The standard 4-worker browser suite had intermittent failures and a terminal-cancellation case timed out waiting for a Next.js `next-action` header. Inspection of its trace showed the browser made a valid same-path HTML form POST, received HTTP 303, then rendered the refreshed cancelled Job. The helper was waiting only for a Server Action header, so it missed the valid form submission. Separately, the Job status matrix visited the route once per fixture scope, increasing unnecessary route loads.

## Correction

The browser helper now accepts a completed POST to the same pathname, including the HTML form/303 flow, while retaining the resulting UI and durable Job state assertions. Route navigation waits for document commit and then asserts rendered content. A deterministic `jobs-all-states` API fixture seeds six Job states under one tenant/project so the test checks all admitted states in one Jobs page visit. Existing fixture scopes and production paths remain unchanged.

Changed paths: `apps/web/app/page.spec.ts` and `scripts/run-browser-api.ts`. No Playwright timeout, retry, worker count, or test selection was changed.

## Verification and stop

- Focused terminal-cancellation test — PASS, 1/1.
- Full `npm run test:browser` with standard configuration — PASS twice, 22/22 each run, 4 workers.
- Final `npm test` — PASS, exit 0; 120/120 unit tests, worker smoke, real-service integration, and 22/22 Playwright tests.
- `npm run format:check -- --line-ending=crlf`, `npm run lint`, `npm run architecture:check`, `npm run typecheck -- --force`, `npm run build -- --force`, and `npm audit --audit-level=high` — PASS, exit 0.
- Exact source blob IDs at code candidate `6cbd9210573815c82f0af60d274c41f31ef0b2bb`: `apps/web/app/page.spec.ts` `6c8db47e716be773a9658faa308dc4d2a822df41`; `scripts/run-browser-api.ts` `92a18a96751a03cbac9ca6fb631488b80cc389de`.

AC25 and AC26 are corrected. The exact-source hosted checks are green. PR #87 stays draft pending a distinct read-only HIGH_ASSURANCE review; no merge, checkpoint promotion, release, or IMP-006 work is authorized by this correction.
