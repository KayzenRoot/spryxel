# SPRYXEL-WO-009 — Correction Delta 07 (concurrent browser teardown budget)

**WO / increment:** SPRYXEL-WO-009 / IMP-005.
**Risk:** HIGH_ASSURANCE (browser session-isolation acceptance).
**Base:** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`.
**Candidate before this correction:** `d703989`.
**Authority:** The owner's R3 Marathon request includes correcting the browser suite while preserving its acceptance assertions and normal test settings.

## Reproduced timeout

The aggregate `npm test` passed **21/22** browser tests after the two Server Action synchronization corrections. The remaining concurrent-session test reached and passed its functional assertions: one session rendered the canceled Job and, after reload, the independent session still rendered its queued Job and cancel action. The test then exceeded its standard 30-second limit while closing both contexts together. The traces show approximately 10.2 seconds for the action response and 4.7 seconds for the independent page reload, in addition to both page and detail navigations.

## Correction

After the canceled state is asserted, the test now closes that context immediately, while preserving the independent overview context for its durable reload and assertions. The independent page reload waits for the document commit, then the same queued-state and cancel-action assertions remain. The `finally` block still closes any context that remains open if an earlier assertion fails. Global worker count, retries, and the 30-second test timeout are unchanged.

## Verification and stop

`npm test` on `d703989` passed unit **120/120**, worker smoke, real PostgreSQL/Redis/SeaweedFS integration, and browser **21/22**; the only failure was the concurrent browser test's context-cleanup timeout. After this correction, `npm exec -- playwright test apps/web/app/page.spec.ts --grep=concurrent` passed **1/1** with the normal project configuration (28.9 seconds total including setup). The exact-head aggregate retest, remaining static gates, Evidence Bundle refresh, hosted checks, and a distinct HIGH_ASSURANCE audit remain pending. Keep PR #87 in draft; do not merge or promote the checkpoint.
