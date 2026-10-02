# Deployment

Status: SOURCE_PACK_CANDIDATE

## Product deployment
Not defined. No product artifact exists.

## Governance/provider rollout
`SPRYXEL-WO-001` completed the provider rollout and was objectively approved before merge authorization. The accepted provider baseline includes active ruleset ID `24340349`, immutable-action enforcement, the required governance/security contexts, and the `gef-managed` / `governed` labels.

## Rollback / recovery
- Preserve the before/after provider snapshots in the Evidence Bundle.
- If ruleset ID `24340349` creates a verified deadlock or context mismatch, modify or remove only the Work Order-created provider object using the captured evidence and a separately authorized recovery action.
- Do not rewrite Git history during recovery.
- Do not weaken required security/governance checks as an ad hoc workaround.
