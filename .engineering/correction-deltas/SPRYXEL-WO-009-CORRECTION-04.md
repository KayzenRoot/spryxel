# SPRYXEL-WO-009 — Correction Delta 04 (idempotency retention and browser test duration)

**WO / increment:** SPRYXEL-WO-009 / IMP-005.
**Risk:** HIGH_ASSURANCE (financial idempotency and browser acceptance).
**Base:** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`.
**Candidate before this correction:** `04a900a02c4e55e686e0b198cf01cba0760a951c` plus the current R3 corrections.
**Authority:** The owner's R3 Marathon request includes completing the financial audit and correcting Playwright failures.

## Financial retention finding

The independent static financial audit found no confirmed HIGH/CRITICAL finding, but identified that Work Order AC requires idempotency scope and retention to be explicit and tested. The canonical contract requires durable replay identity, D-139 makes posted ledger facts immutable, and the Work Order prohibits destructive cleanup of ledger history. In this foundation the idempotency identity is stored on `platform.credit_event`; therefore the explicit retention is the lifetime of that immutable event, with no TTL or cleanup in this increment.

The migration documents this policy on `platform.credit_event`. The real PostgreSQL integration proof attempts owner-level UPDATE and DELETE of an existing event and requires the append-only guard to reject both. Existing same-key concurrent and lost-response replay checks continue to prove that the durable identity returns one reservation and one posting set. This policy applies to the synthetic foundation in this Work Order; any future legal/operational retention or deletion policy for real financial records requires its own reviewed decision and must preserve replay safety.

## Browser timeout correction

The standard four-worker Playwright run had tests exceed the existing 30-second limit while their snapshots already showed the expected final state. The Jobs Center case spent time navigating through Home before testing Jobs; the Home/Projects failure matrix performed ten document navigations in one test. The test updates keep the original assertions and standard Playwright configuration, separate Home recent-job coverage from the Jobs Center lifecycle, and split the same five Home and Projects failure scenarios into distinct cases. This raises the standard suite count from 20 to 22; it does not remove or relax an assertion, change worker count, increase timeouts, or enable retries.

## Verification and stop

The focused Node `22.23.3` / npm `10.9.9` Playwright run selected by `--grep=Jobs` completed **7/7 PASS** with four workers and default retry/timeout configuration after the browser changes. Full 22-test suite execution, database/worker integration, other required gates, exact final SHA evidence, and distinct HIGH_ASSURANCE audit remain pending. Keep PR #87 in draft and do not merge or promote the checkpoint until every required gate is evidenced.
