# Definition of Done

Status: SOURCE_PACK_CANDIDATE

SPRYXEL-WO-001 is DONE only when all are true:
- repository-local deliverables satisfy the Work Order;
- exact GEF 1.1.1 identity is proven;
- doctor succeeds with governance checkpoint present/readable/valid;
- repeated status is byte-deterministic and repository observation is healthy;
- any nonzero GEF project drift is captured and reconciled path-by-path against the admitted Work Order/PR and predecessor evidence, with no unexplained or out-of-scope delta;
- GEF managed baseline/receipt files were not manually rewritten to manufacture a clean drift result;
- all intended required GitHub checks succeed on the exact final head;
- no unresolved HIGH/CRITICAL finding exists;
- active `main` ruleset is read-back verified and cannot be trivially bypassed;
- required status contexts are real and successful, with no circular gate;
- provider-side settings/labels are read-back verified;
- Evidence Bundle records base/head, changed paths, commands/results, GEF drift reconciliation, provider before/after and known risks;
- ChatGPT performs objective audit and returns APPROVED;
- only then is a Checkpoint Delta promoted and the PR eligible to merge.

A green workflow alone is not DONE. A forced `drift.changed=false` obtained by rewriting GEF managed state is a failure, not evidence.
