# Source Hierarchy

Status: SOURCE_PACK_CANDIDATE

## Authority
When sources conflict, use this order:
1. CHECKPOINT (machine then human projection)
2. Decisions Ledger / approved ADRs
3. Scope
4. Definition of Done
5. Architecture
6. Requirements
7. Security, Test/Benchmark Plan, Deployment, Backlog and supporting docs
8. Issue/PR descriptions and conversational context

Actual Git state, code, tests and provider evidence control descriptive facts. They do not silently override approved normative decisions.

## Staleness
A Work Order/Context Lock is STALE if its base SHA changes or a critical authority above changes after compilation. Codex must stop rather than silently reinterpret it.

## Current bindings
- Repository: `KayzenRoot/spryxel`
- Execution base for SPRYXEL-WO-001: `10dca04e38cfcd2e07335faf9078cc6041766c02`
- GEF package: `@gef-bootstrap/cli@1.1.1`
- GEF reference source: `KayzenRoot/gef-bootstrap@5a32a607ccf2055fab722f3d5d452791c6aae3e6`
