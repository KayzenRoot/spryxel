# Deployment

Status: SOURCE_PACK_CANDIDATE

## Product deployment
Not defined. No product artifact exists.

## Governance/provider rollout
SPRYXEL-WO-001 changes repository-local files through the PR branch first. Provider-side GitHub ruleset/settings are applied only after intended required checks have been observed successful on the exact PR head.

## Rollback / recovery
- Capture pre-change repository/ruleset state.
- Ruleset currently has no existing object to overwrite; creation must be read-back verified.
- If the new ruleset causes a deadlock or mismatched context, restore/remove only the WO-created provider object using the captured ID/snapshot.
- Do not rewrite Git history during recovery.
- If permissions are insufficient, stop BLOCKED without partial weakening.
