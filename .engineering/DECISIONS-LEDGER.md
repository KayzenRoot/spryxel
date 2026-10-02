# Decisions Ledger

Status: SOURCE_PACK_CANDIDATE

## D-0001 — GEF version
Use `@gef-bootstrap/cli@1.1.1` exactly. Upgrade requires a future Work Order.

## D-0002 — GitHub-first executor model
Adopt the GEF ADR-0008 operating model for this project: ChatGPT specifies/audits; Codex implements code/tests/CI; GitHub carries durable tasks and evidence.

## D-0003 — Product definition deferred
No product mission, feature or architecture is inferred during governance bootstrap. Product truth remains TBD until explicit owner planning.

## D-0004 — Safe main protection
The target ruleset for `main` requires PR integration, resolved threads, deletion/non-fast-forward protection and no bypass. Required status checks are added only after their exact contexts have succeeded in Spryxel.

## D-0005 — Cost boundary
No paid/trial-only external service may become a required merge gate without explicit future owner approval.

## D-0006 — Checkpoint authority
Executor may propose a Checkpoint Delta but may not self-promote it. Promotion follows objective audit.

## D-0007 — GEF v1.1.1 drift interpretation
The installed v1.1.1 baseline is immutable evidence and is not rewritten merely because governed project files evolve. The exact v1.1.1 release implementation routes `gef status` project-drift comparison through `detectDrift(..., { authorized: false })`. Consequently, post-baseline changes can be reported as `UNEXPECTED` even when a Work Order authorized them. Spryxel resolves authorization outside that raw diagnostic by binding the delta to the Work Order, Context Lock, exact Git diff and Evidence Bundle. Unbound drift remains blocking.
