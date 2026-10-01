# Requirements

Status: SOURCE_PACK_CANDIDATE

## Governance requirements
- REQ-GOV-001: GEF Bootstrap CLI remains pinned exactly to version 1.1.1 until a separately admitted upgrade.
- REQ-GOV-002: GitHub is the durable task/evidence transport; canonical decisions remain versioned in this repository.
- REQ-GOV-003: Every implementation increment uses a stable Work Order and Context Lock.
- REQ-GOV-004: Codex is the implementation/test/CI executor; ChatGPT specifies and audits.
- REQ-GOV-005: Required checks must be proven to exist and pass before a ruleset requires them.
- REQ-GOV-006: `main` must reject deletion and non-fast-forward changes and require PR-based integration.
- REQ-GOV-007: No bypass actor is introduced by default.
- REQ-GOV-008: Provider-side changes require read-back evidence.

## Assurance requirements
- REQ-ASSURE-001: `npm ci`, GEF version identity, `gef doctor`, deterministic repeated `gef status` and repository cleanliness are baseline proofs.
- REQ-ASSURE-002: Governance CI includes repository validation, pipeline integrity, Gitleaks and Trivy using free/native or open-source tooling.
- REQ-ASSURE-003: Third-party Actions are pinned to immutable commit SHAs and receive least-privilege permissions.
- REQ-ASSURE-004: HIGH/CRITICAL findings block advancement.

## Product requirements
No product requirements are approved yet.
