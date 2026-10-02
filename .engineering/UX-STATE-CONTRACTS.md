# UX State Contracts

Status: CANONICAL — SPRYXEL-WO-003 / SPR-PLAN-006 approved by objective audit.

## State contract shape

Every major screen and operation identifies: current user-visible state; owning project/job/asset where relevant; what is available or blocked; next safe action; whether the operation can be retried/cancelled; and where the durable record can be found. Internal service codes may drive behavior but are not automatically user-facing copy.

The UI reflects authoritative backend state. A local canvas, toast or cached page cannot declare a job complete, override a permission/policy denial, bypass a budget block or create asset provenance.

## Canonical states

| State | User experience | Action and durability |
| --- | --- | --- |
| Loading | Identify the surface/record being retrieved; use stable skeletons for known content regions | Avoid duplicate submission; retain context and announce meaningful completion to assistive technology |
| Empty | Explain why the surface has no records and identify the next useful action | Distinguish a new project from no results, no permission and a failed request |
| Queued | Show that a durable request is accepted and waiting, with safe cancellation eligibility if available | Link to Jobs Center and retain queue state beyond navigation |
| Running / progress | Show the current stage and useful progress evidence without false precision | Keep job/contract/project links; communicate cancel availability and limits |
| Success | State what completed and link to the resulting record/version | Durable job, asset, export or setting outcome; toast may supplement it |
| Partial success | Identify completed and incomplete parts, preserve successful outputs and describe safe follow-up | Durable per-item/job outcome; never label the whole operation simply successful |
| Degraded / offline | Explain which capability is unavailable or stale and what remains usable | Prevent an unsafe duplicate cost action; indicate retry/synchronization path and data freshness |
| Recoverable error | State the user-actionable problem, preserve safe inputs and offer an allowed retry/edit/support path | Related job/request retains error details; retry re-checks authorization and budget |
| Terminal error | State that the operation ended without the requested result and link to durable evidence | No misleading retry button when retry is not allowed; support path carries safe reference |
| Permission denied | Explain missing access at a safe level and identify the authorized owner/admin or request path | Do not reveal protected record details; no partial mutation |
| Budget / credit blocked | Identify that the configured budget/credit boundary prevented work and show permitted remediation | No job that incurs prohibited cost and no hidden expensive fallback; preserve any reservation reconciliation evidence |
| Policy restricted | Use safe human-readable wording and a permitted support/appeal path | Do not disclose risk scores, thresholds, device hashes, linked account IDs, graph edges or internal rules |
| Validation blocked | Identify the required field/contract/integrity issue and the affected input or candidate | Preserve safe user work; hard integrity failures cannot be overridden by aesthetics |
| Confirmation required | Summarize scope, consequence and expected bounded credit impact where applicable | No operation until explicit confirmation; re-check server permission and state on submit |
| Cancelled | Show that cancellation was requested and whether the durable job reached a cancellable boundary | Keep final job and credit reconciliation result; cancellation does not erase provenance |

Loading, progress and transient feedback can coexist only when their meaning is clear. A transient toast is never the sole record of a critical error, approval, security event, budget block or completed cost-incurring operation.

## Durable jobs and transitions

The user-facing lifecycle is queued → running → review/QA → repair or completion, with terminal success, partial success, failure, cancellation or restriction as applicable. The backend remains authoritative for legal transitions. The screen must not invent progress percentages or transition states that the durable job does not report.

Each job surface carries an owning project, request/contract/profile reference, bounded workflow budget, status, origin link and final outcome. Cancellation is offered only when the operation contract permits it. Retry, repair and resume create or continue durable records according to backend semantics and preserve prior attempts.

## Cost and credit state

Before cost-incurring work, show a user-facing credit estimate/reservation, applicable workflow bounds and uncertainty. After completion, show actual charged/released credits when relevant. Never present NOT_FROZEN commercial prices as final. A blocked operation stops before disallowed spend; no silent fallback, retry or splitting is allowed. Failed-generation credit reconciliation remains explicit and linked to the durable job/ledger outcome.

## Quality state

Integrity Gate is binary PASS/FAIL and precedes Production Score. Critical structural defects always fail; aesthetics cannot override an integrity failure. Production-quality guidance is shown only with its evidence and scope. Canonical verdicts remain APPROVED, APPROVED_WITH_MINOR_REPAIR, REPAIR_REQUIRED, REGENERATE_REQUIRED, FAILED_CONTRACT, FAILED_SAFETY and FAILED_TECHNICAL. Present explanation and safe next step without flattening these distinct meanings.

## Notification and toast behavior

Toasts are accessible, action-aware and deduplicated. They identify a concise outcome and link to its durable record. Success/info/warning/error use semantic text and icon/pattern in addition to token color. Critical job, cost, account or security outcomes persist in Jobs, Notifications or their owning record.

The notification center covers job completion/failure, approvals, exports, billing/account/security events, quota/budget warnings and actionable system notices. Ordinary preferences may quiet eligible non-security notifications; they cannot suppress required security communication or make critical outcomes undiscoverable.

## Safe copy contract

- Use plain language and explain the permitted next action.
- For policy/trial eligibility, retain the approved safe posture in SECURITY.md. Do not expose device hashes, linked account IDs, graph edges, thresholds, rule names or exploitable antifraud details.
- For permission denial, reveal neither protected record existence nor another tenant's identifiers.
- For a budget block, explain the applicable user-facing boundary without exposing internal margins, model/provider budgets or administrative risk policy.
- Do not invent final prices, quotas, timelines, precision or guarantees when the authoritative record does not provide them.

## Accessibility and localization

Announce asynchronous status updates semantically without repeatedly interrupting assistive technology. Associate errors with fields and preserve input when safe. Do not use color alone. Keep focus visible across loading, dialog, validation and state transitions; do not unexpectedly steal focus.

All states localize to English (canonical/default), pt-BR and Spanish; support pluralization and locale-aware date/time/number/credit formats. Layouts tolerate approximately 35–40% expansion and preserve the full warning, blocked reason, status and primary action without clipping.
