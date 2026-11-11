## Feature or fix / vertical scope

- GitHub issue / module:
- Visible outcome:
- Scope and changed paths:
- What working behavior changed, and where is the authoritative contract?
- Why is this the smallest safe diff?

## Build and tests (exact HEAD)

- [ ] `npm ci` (record flags and exit code)
- [ ] `npm run format:check`
- [ ] `npm run lint`
- [ ] `npm run build` and `npm run architecture:check`
- [ ] Affected focused unit, integration, worker or browser tests identified and run, or explicitly NOT_RUN/BLOCKED
- Exact-head CI check status (do not reuse old SHA evidence):
- Known limits or untested cases:

## Security and rollout

- Tenant isolation / auth / RLS / private assets / CostGuard impact:
- Public endpoints or credential changes:
- Provider/security-control changes: before/after evidence, no secret contents, production authorization:
- [ ] Tenant/RLS/private assets/CostGuard checked if impacted
- [ ] GitHub required checks, SonarCloud, Gitleaks, Trivy and Socket reviewed
- Deployment or paid provider required? (default **NO**)
- [ ] No unapproved deploy, merge or spend

## Review and merge decision

- [ ] Independent substantive review completed where required by project
- Internal review evidence and review limitations (if applicable):
- No automatic merge. Owner confirmation and actual repository settings apply.

List evidence links, actual command exits and missing proof. A checkmark is not proof by itself.
