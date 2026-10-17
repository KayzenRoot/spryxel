# Test and Benchmark Plan

Status: CANONICAL — approved by objective audit of SPRYXEL-WO-002.
Product benchmark execution has NOT_STARTED; all targets below are planning/qualification targets from the immutable v0.6.0 seed, not measured results.

## SPRYXEL-WO-001 governance profile

Preserve the existing governance proofs:

1. npm ci --ignore-scripts --no-audit --no-fund.
2. Exact GEF CLI version identity = 1.1.1.
3. gef doctor --target . --json succeeds.
4. Two consecutive gef status --target . --json outputs are byte-identical.
5. Checkpoint JSON parses and is supported schemaVersion 2.
6. Workflow/config syntax checks and git diff --check.
7. Gitleaks and Trivy filesystem/configuration scans.
8. Reconcile GEF v1.1.1 drift against the admitted Work Order, Context Lock, exact diff, and evidence. Never hand-edit GEF-managed baseline/receipt files.
9. Exact-head required GitHub contexts, provider/ruleset/settings read-back when a provider-changing Work Order requires them, and proof of no missing/permanently pending context.

In GEF v1.1.1 the public status drift comparison uses authorized:false. A governed project delta can therefore appear as UNEXPECTED. That raw class alone is not an authorization verdict; unbound/out-of-scope drift remains blocking. This Work Order does not change .gef, GEF, ruleset, or provider.

## Quality contract

Integrity Gate is binary PASS/FAIL and asks whether file, canvas, anatomy/topology, crop, required components, transparency, spritesheet layout, Asset Contract, and project constraints are valid. A failure cannot be overridden by aesthetics.

Only after integrity passes, Production Score evaluates appeal, style, silhouette, pose, identity, palette, detail, gameplay readability, and project fit.

Canonical QA verdicts: APPROVED, APPROVED_WITH_MINOR_REPAIR, REPAIR_REQUIRED, REGENERATE_REQUIRED, FAILED_CONTRACT, FAILED_SAFETY, FAILED_TECHNICAL.

Resolution-aware rules cover DimensionLock, AnatomyGuard, SilhouetteGuard, Pixel QA, FrameLock, consistency, seams, map structure, and UI contracts. Critical structural defects always fail. No single probabilistic vision model is the sole approver for anatomy-sensitive production assets.

## Initial qualification targets

Planning targets from SPR-PLAN-001/003; validate and adjust only through a later approved planning/benchmark decision:

- V1 pipeline technical success at least 97%.
- Tested billing/ledger invariants 100%; no double charge on idempotent retry.
- Failed-generation credit reconciliation 100%; job status consistency 100%.
- Deterministic critical hard-gate detection where a rule is available.
- Reproducible pipeline metadata 100%; bounded generation cost 100%; provenance capture 100%.
- During qualification, an APPROVED asset passes all hard gates, has no critical defect, and scores at least 4/5 for production usefulness, applicable anatomy/geometry, style adherence, and gameplay readability.
- Pipeline qualification targets: at least 97% technical completion; zero known deterministic critical contract violations among approved deliveries; at least 90% final acceptance after bounded repair; at least 70% first-pass acceptance for mature V1 SKUs where practical.
- Cost per accepted asset must be measurable and worst-case bounded cost known.
- Style-similarity scores do not receive hard commercial thresholds until their benchmark method is validated.

These are qualification targets, not evidence that any model or pipeline already passes.

## Benchmark protocol and data

Phases:

- Smoke: 2–3 outputs per scenario to prove that a pipeline runs; no quality conclusion.
- Local candidate comparison: at least 10 outputs per scenario where practical on RTX 5050.
- Production qualification: target at least 30 outputs per key scenario where economically practical, enough samples to expose recurrent defects, and a fixed benchmark version. Cloud qualification may be phased to control spend.

Keep prompt, negative prompt, references, pose, Project DNA version, model/hash, runtime, quantization, sampler/scheduler, seed, resolution, steps, guidance, device, and pipeline version fixed and recorded. Measure model load, cold first generation, warm generation; for serverless also cold-start and billed cold/warm cost.

Measure latency, VRAM/RAM, GPU seconds, failure/retry rates, cold-start impact; DNA/palette/identity adherence, grid correctness, seams, human acceptance; raw inference, retry, QA, postprocessing, storage, and cost per accepted asset.

Golden suite includes:

- Characters: knight, mage, archer, goblin, skeleton, orc, wolf, winged imp, spider, robot.
- Items: sword, bow, potion, helmet, crystal, food, key, shield; inspect silhouette, palette, crop, and family cohesion.
- Tiles: grass, dirt, water, stone, interior floor, wall, grass/dirt transition, water/grass transition.
- General 2D: fantasy human, sci-fi human, creature, weapon, environment prop.
- Maps/UI: versioned map and UI QA suites from SPR-SPECIAL-002.
- TrustShield golden cases TS-GOLD-001 through TS-GOLD-007 described in SECURITY.md.

Golden prompts are versioned data, not undocumented strings. Benchmark results record prompt/DNA/model/runtime identity, seed, version, latency/resources, attempts, QA/repair outcomes, full cost, scores, reviewer evidence, and production eligibility.

## Release and regression gates

No pipeline reaches paid Production based on subjective review alone. Require commercial license review, fixed benchmark version, quality and economics evidence, Golden Asset regression, acceptance data, bounded retries/repair, rollback route, and production-model promotion checklist. Generation changes require versioned regression comparisons including critical-defect, cost, and latency deltas.

Track hard-gate/anatomy/dimension/alpha/crop failures; identity/equipment/palette drift; pixel AA/mixel/outline defects; repair attempts/success/cost; first-pass/final accepted cost; QA and repair cost shares. Feedback such as approve/discard/export may inform analytics but is not training data without applicable permission.

Quality failures distinguish FAILED_TECHNICAL, FAILED_QUALITY, USER_REJECTED_VALID, and SUCCESS. A hard-gate-invalid result is not a successful delivered production asset for full-charge purposes; SKU policy must define reservation, charge, release/refund, and paid retry behavior.

## TrustShield test obligations

Unit: rule evaluation, graph edges, retention/TTL, API scopes, budget enforcement.

Integration: signup + Turnstile; trial request; payment webhook; generation authorization; API-key budget; MCP authorization; session revocation.

Abuse simulations: twenty accounts/one device; rotating IP/one device; legitimate shared IP; shared payment instrument; referral ring; leaked API key; recursive agent generation.

Golden security expectations: legitimate household/shared IP is not auto-banned; trial farm receives at most one promotional eligibility without destructive account deletion; corporate card reuse is contextual; referral ring rewards freeze/review; account takeover triggers step-up/sensitive-action block; leaked API key stops at its budget; coworking network sharing alone has no punitive effect.

Before public promotional GPU generation, test every SPR-PLAN-005 acceptance item, including cross-tenant isolation and audited reversible kill switches.

## Governance checks for SPRYXEL-WO-002

This Work Order requires seed fingerprint verification, deterministic decision extraction/duplicate detection, exact-one primary decision ownership with supporting cross-references, JSON/YAML/Markdown structure checks, V1 scope consistency, pricing-freeze and implementation-claim guards, npm/GEF/doctor/deterministic-status checks, git diff --check, and all four required GitHub checks on the exact final PR head.

No benchmark was run under WO-002. Required checks for the final candidate are Repository validation, Pipeline integrity, Gitleaks secrets, and Trivy filesystem and configuration.

## Product foundation test contract — SPR-PLAN-007 canonical

The planned TypeScript/Node.js 22-compatible npm-workspace test stack separates Vitest-compatible unit tests, disposable real-service integration tests and Playwright-compatible browser tests when critical Next.js/React flows exist. Fastify/API tests cover health/readiness and safe boundary behavior. Integration tests use real isolated PostgreSQL through Drizzle-compatible migrations, Redis/BullMQ-compatible coordination and S3-compatible storage via a SeaweedFS S3-compatible service through a dedicated Docker test profile. Pino-compatible redacted JSON logs and OpenTelemetry-compatible correlation/telemetry are checked at process boundaries. Financial, tenant-isolation, migration and idempotency invariants cannot be qualified by mocks alone. Provider/test-service versions are pinned during implementation preflight; this Work Order runs no product test suite or benchmark.

The first implementation slice must cover workspace graph/cycle and forbidden-import rules; typed-config startup fail-closed and redaction; API health/readiness; migration application against disposable PostgreSQL without startup auto-migration; real service health/cleanup; structured logging/correlation; and web-shell smoke/accessibility. Later Work Orders add invariant-specific integration and browser coverage as flows exist. The full IMP-001 executor-ready acceptance and evidence list is in [FIRST-IMPLEMENTATION-SLICE.md](FIRST-IMPLEMENTATION-SLICE.md).

No AI/model benchmark, production COGS measurement, quality qualification or performance claim is established by this planning increment. Status remains NOT_RUN / NOT_AVAILABLE.
