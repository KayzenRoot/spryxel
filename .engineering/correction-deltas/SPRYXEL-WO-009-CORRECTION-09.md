# SPRYXEL-WO-009 — Correction Delta 09 (terminal Job release authorization)

**WO / increment:** SPRYXEL-WO-009 / IMP-005.
**Risk:** HIGH_ASSURANCE (credit reservation lifecycle and database authorization).
**Base:** `main@34bad103d8066b6d31c5947c20a07ef52032c5d7`.
**Candidate before correction:** `d866e931a759f9f59a89ef93bad421df3c1111f1`.
**Correction commit:** `89200ea2276b4e0b048b9f2fc9c94c63dd1df00e`.
**Authority:** WO-009 authorizes correcting in-scope financial-integrity defects before the execution stop.

## Finding

An independent exact-head review found that an application-callable SQL `release` operation did not itself require a terminal Job state. Although normal Job completion used the terminal-status trigger, a caller could release reserved credits while a Job was still queued or running. This was a HIGH financial-integrity defect in the AC17 boundary.

## Correction

The SQL operation now refuses full and partial releases unless the linked Job is `succeeded`, `failed`, or `cancelled`. Its Job status read is non-locking, preserving the established Job → reservation → wallet lock order used by terminal transitions. The database trigger remains responsible for the exactly-once terminal release.

The integration regression exercises full and partial release attempts in both `queued` and `running` states. It compares projected balance and persisted reservation state, events, postings, and wallet snapshots before and after each denial. Test cleanup transitions each fixture to a terminal state and verifies the trigger release occurs once.

Changed paths: `packages/db/src/migrations/0009_credit_ledger_costguard.sql` and `scripts/credit-ledger-integration.ts`.

## Verification and stop

- `npm run test:integration` — PASS, exit 0; real PostgreSQL, Redis/BullMQ, SeaweedFS, migrations, RLS/ACL checks, and terminal release regression completed.
- `npm test` on the final code candidate — PASS, exit 0; aggregate includes unit, worker, real-service integration, and browser gates.
- Exact source blob IDs at code candidate `6cbd9210573815c82f0af60d274c41f31ef0b2bb`: migration `e998f00aa554ecfafa81fd693b3b93c0ce7a1b27`; integration `1f84e5f076cf7e42d420b82f410d3175624589a4`.

AC17 is corrected. The independent HIGH_ASSURANCE audit approved code candidate `6cbd9210573815c82f0af60d274c41f31ef0b2bb`; its review is recorded in the [Evidence Bundle](../evidence/SPRYXEL-WO-009-EVIDENCE.md). PR #87 is ready for protected owner/reviewer disposition at the Work Order stop state. No merge, checkpoint promotion, release, or IMP-006 work is authorized by this correction.
