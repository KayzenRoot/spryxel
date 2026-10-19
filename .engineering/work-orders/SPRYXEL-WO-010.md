# SPRYXEL-WO-010 — IMP-006 DNA + Asset Core (Phase 1 A+B OWNER ADMITTED)

**Status:** IMPLEMENTATION_MERGED_PHASE1_AB / DOCUMENTAL_HOMOLOGATION_PENDING / CHECKPOINT_PROMOTION_NOT_AUTHORIZED. **Risk:** HIGH_ASSURANCE, tenant-owned durable data, forced RLS, immutable provenance. **Tracking:** [#91](https://github.com/KayzenRoot/spryxel/issues/91); [planning PR #95](https://github.com/KayzenRoot/spryxel/pull/95). **Draft source base:** `main@f544aba74c7609d3ad1bce80538e8218fe555ca8`.

**Authority:** Owner explicitly authorized the protected docs-only squash merge of PR #95 and **admitted WO-010 Phase 1 A+B**, with documented allowlist/tests/restrictions and explicit prohibition on deployment, Phase C expansion and implementation merge without later independent audit (user directive 2026-10-18, 12:19 America/Sao_Paulo). PR #95 was protected-merged to `main@8c7ea8e7f40146dd1531f4ee772f26cc4d524e8d`. Canonical `.engineering/CHECKPOINT.json` still records `SPRYXEL_WO_009_COMPLETE`, next `SPRYXEL_DNA_ASSET_CORE_WORK_ORDER_REQUIRED` / `NOT_ADMITTED` because **canonical checkpoint promotion has not occurred and is not authorized**. This WO documents a narrower *implementation admission* within that next legal stage, not a claim that WO-010 is COMPLETE or that full Asset Core was admitted. Codex cannot begin until the admitted WO and a FRESH Context Lock are on protected main and preflight matches.

## Instruções históricas de pré-implementação: escopo e gates originais A+B

**Nota histórica:** o allowlist, o preflight e os gates abaixo registram as instruções emitidas antes da implementação e do merge. Permanecem como registro das restrições originais; o estado integrado e a auditoria posterior estão documentados na seção de homologação ao final deste Work Order.

**A. Contracts & immutable domain models.** Add strict Zod/TS schemas and deterministic canonical JSON SHA-256 digest, versioned Project DNA v1 and Asset metadata v1 with opaque UUIDv7 identifiers, payload bounds and provenance. Stable entity IDs must not be derived from hashes; content digest is integrity evidence. Published versions are append-only; restore/fork creates a new version. Explicit tenant/project association and valid state transitions. Use existing `platform.asset_contract` and `asset_contract_version` as contract references, **not** as a duplicate asset/blob record. Never enable public asset URLs or real generation.

**B. Durable tenant-safe persistence.** Add the minimal next forward-only SQL migration `0010_*.sql` for `project_dna`, `project_dna_version`, `asset`, `asset_version`, and necessary lineage/provenance relations **only after confirming existing schema does not provide equivalent entities**. All tenant-owned tables have explicit tenant+project FK/unique key, `ENABLE` and `FORCE ROW LEVEL SECURITY`, role privilege limits, transaction-scoped principal context and denial of cross-tenant reads/writes/joins/linkage. Adapter functions in existing DB package enforce active project membership, idempotency, safe conflicts and immutable history. No API route or external upload interface in Phase 1.

**Bounded allowlist for the admitted Phase 1 (effective once admission/lock docs are protected-merged): `packages/contracts/src/**`, `packages/domain/src/**`, `packages/db/src/**`; narrowly necessary existing local integration tests `scripts/**` only after confirming impact. NO code in `apps/web`, `apps/api`, `apps/worker`, WorkOS/session/proxy, Ledger/CostGuard, `.engineering`, `.gef`, workflows or deployment. NO new dependency/lockfile change without separate explicit justification and permission.

## Owner-admitted exact-file integration-test exception (2026-10-18)

**Authority:** the owner expressly admitted this **one new, test-only file** in WO-010 Phase 1 A+B via [PR #98 owner authorization](https://github.com/KayzenRoot/spryxel/pull/98#issuecomment-6255810097), after [independent scope review](https://github.com/KayzenRoot/spryxel/pull/98#pullrequestreview-5565267630). This is a narrow exception to the existing-harness/minimal-change wording of the prior `scripts/**` allowlist, not a general extension of that allowlist:

- **Sole admitted new test file:** `scripts/asset-core-integration.ts`, exact Git blob `2306874257dd6a6e0d8e10f48e3b5b9a20747702` at implementation candidate PR #98 HEAD `bf240de115109267eb58509972fc2f10620aaaff` (59,752 UTF-8 bytes, approximately 1,706 lines). Any different blob requires fresh owner approval.
- **Bounded purpose:** strictly local, disposable PostgreSQL integration tests for Project DNA and Asset Core A01–A04 and B02–B04; the new file is imported only by the already admitted existing `scripts/run-integration.ts` harness. It contains the direct-RPC canonical digest, immutable history, idempotency, RESTORE, tenant/project isolation, role/ACL, RLS, and pool-context regressions. Other B01/B05/B06 regression evidence remains in the pre-existing suite; do not attribute those tests to this file.
- **Explicit boundaries:** no further new `scripts/**` file and no general permission to change additional scripts, apps, APIs, workers, UI, dependencies or lockfiles, live providers, historical migrations, credit/CostGuard, GEF, workflows, deployment or production infrastructure. The prior exact two-file architecture-guard amendment remains separate and unchanged.
- **Protected activation:** this admission must be recorded together with the matching Context Lock in a **docs-only protected PR** before the implementation branch is synchronized with the resulting protected main; revalidate authority pins, gates, independent HIGH_ASSURANCE B08 review and exact final implementation HEAD afterward. This admission **does not authorize any merge** of PR #98, deploy, Phase C/D/E, or checkpoint promotion; those remain subject to their existing independent gates and separate owner authorization.

## Owner-admitted scope amendment: architecture guard only (2026-10-18)

**Authority:** owner expressly extended the already admitted WO-010 Phase 1 A+B for **only** `scripts/architecture-guard.ts` and `scripts/architecture-guard.test.ts`, exclusively to recognize the five tables introduced by migration `0010_project_dna_asset_core.sql`. This is a **path-and-purpose exception**, not permission to alter any other scripts, expand the migration, change architecture policy or grant database privileges.

**Exactly admitted table identities**, all under the existing `platform` schema:

| New table, qualified exact spelling | Permitted reason |
| --- | --- |
| `platform.project_dna` | Versioned project DNA identity |
| `platform.project_dna_version` | Immutable DNA history |
| `platform.asset` | Project asset identity |
| `platform.asset_version` | Immutable asset history |
| `platform.asset_version_lineage` | Cross-version lineage with tenant/project checks |

**Two-file, minimally invasive guard adjustment:**
- `scripts/architecture-guard.ts`: recognize **these five exact qualified table names only**, retaining every previous admitted table and all existing rejection rules for unapproved schemas, typo/plural variants, new unrelated project/asset/job/credit tables, legacy dangerous domains, etc. Do not change SQL matching semantics or broadly whitelist the `platform` schema, prefixes, migration directories or products.
- `scripts/architecture-guard.test.ts`: extend existing positive table list with these five qualified names **and preserve all existing negative assertions**. Add targeted regressions that reject `public.asset`, `platform.assets`, `platform.project_dnas`, `platform.asset_versions`, `platform.asset_version_lineages`, `platform.unapproved_asset`, and other existing out-of-scope job/ledger candidates. Do not delete, weaken, skip or update negative expectations to manufacture PASS.

**Added gate B06-ARCH:** `npm run architecture:check` PASS on the new implementation HEAD, and `scripts/architecture-guard.test.ts` full existing + new positive/negative suite PASS. `format:check`, lint, typecheck, unit and Docker/PostgreSQL RLS integration regressions must remain valid; reuse prior exact-HEAD receipts only when those surfaces were unaffected and the actual DoD allows reuse. Review the changed architecture guard directly for scope expansion. GitHub required checks and independent HIGH_ASSURANCE security review remain mandatory before any later protected code merge.

**Absolutely unchanged exclusions:** Phase C storage/API, Phase D/E worker/web, production Cloudflare/WorkOS, GPU/paid providers, historical migrations, ledger/CostGuard, GEF, `CHECKPOINT.json`, ruleset, and any implementation merge or deployment. No checkpoint promotion. The extension is not admission of WO-010 completion. Only ChatGPT/GitHub updates this Work Order and the matching Context Lock.

**Later Phase C NOT_ADMITTED (explicitly excluded by owner):** private S3-compatible object storage authorization and bounded API ports/endpoint (SeaweedFS local/test only); must be separately authorized and independently audited. Phase D/E (worker/user interface) not admitted. A+B alone does **NOT** satisfy full Asset Core requirement or promote the checkpoint.

## Negative acceptance matrix, Phase A+B

| Test | Gate (all NOT_RUN before code) |
| --- | --- |
| A01 | Strict schema/version/unknown-field/size bounds and UUIDv7 validation; invalid input fails closed |
| A02 | Canonical serialization SHA-256 invariant under semantically equivalent key order |
| A03 | Published historical DNA/Asset versions immutable; restore creates new tracked version |
| A04 | Idempotent duplicate same payload returns same identity; conflicting replay rejected |
| B01 | New migration forward-only and compatible with existing migrations 0001–0009 |
| B02 | FORCE RLS, app/worker least privilege, explicit role checks for every new table |
| B03 | Tenant A/B negative list/read/update/delete/version/lineage/guessed-ID/FK |
| B04 | Pool-scoped context isolation, no stale tenant principal across transactions |
| B05 | Asset Contract, Durable Jobs, Credit Ledger and CostGuard default DENY untouched; targeted nonregression |
| B06 | Node v22.23.3, npm10.9.9, LF format, lint, typecheck, unit, architecture, real Docker/Postgres integration |
| B06-ARCH | New guard permits exactly 5 platform tables, preserves all preexisting negative rejects, adds typo/schema/near-match rejects; architecture:check PASS |
| B07 | Four strict exact-final-head GitHub checks, Sonar/Socket findings, zero unresolved high/critical |
| B08 | Independent HIGH_ASSURANCE reviewer and owner-protected merge authorization, no executor self-approval |

**No cloud dependency or production environment needed for A+B.** Use disposable Docker Postgres/Redis/SeaweedFS only if touched by tests, never delete existing external volumes. Test evidence states EXECUTED, OBSERVED, NOT_RUN, BLOCKED; do not claim checks by implication. New migrations are additive; destructive SQL is forbidden. No financial credit, paid GPU, model, billing, external storage purchase, Cloudflare deploy, WorkOS real login, provider selection, pricing, legal/brand publication, checkpoint promotion, or GEF baseline rewrite.

## Critical source baseline fingerprints

Read source order: Checkpoint > Decisions/approved ADRs > Scope > DoD > Architecture/Requirements > specialized canonical; actual Git/code/tests constrain descriptive claims. Fingerprints below are **verified Git blob SHAs at `main@f544aba74c7609d3ad1bce80538e8218fe555ca8`**, for drafting and future lock compilation only.

| File | Git blob SHA |
| --- | --- |
| `AGENTS.md` | `95ebc461596feecefe8766f4cd8b87730ae30e7c` |
| `.engineering/CHECKPOINT.json` | `1230aa41cc197ad3e58e5e27aba724b43de777dc` |
| `.engineering/SOURCE-HIERARCHY.md` | `bf9f656350da3712b12fa1ecc267855baee27b14` |
| `.engineering/DECISIONS-LEDGER.md` | `856894e9936780f36c5e9982d1c3fe6e96aed90f` |
| `.engineering/SCOPE.md` | `cca8420aa6427b9ddd2a16151f44f83a6bfd7cfe` |
| `.engineering/DEFINITION-OF-DONE.md` | `4d3a24b404cdd70a86168773bc0ac206dec0365d` |
| `.engineering/IMPLEMENTATION-ARCHITECTURE.md` | `ad12992ab85841e051bbc482ae7cab96ea07bacb` |
| `.engineering/IMPLEMENTATION-SEQUENCE.md` | `822290f94688286e6962d79904a77d12c3fae8cd` |
| `.engineering/SECURITY.md` | `d8aa5007a8cc9429d8860a76d544bd7b1c49516b` |
| `.engineering/DATA-MODEL.md` | `ff988dcc33cc640e258a058b1f016186ab2b1c14` |
| `.engineering/PHYSICAL-DATA-CONVENTIONS.md` | `4e65b6778f63ff6664cf6aec6985db60013eead5` |
| `packages/contracts/src/index.ts` | `3a2e2c10a28a07b55f412b57d0cc2520c0987b44` |
| `packages/domain/src/index.ts` | `c7d8821ec2bc1962f66b3a3c36feee86a643a240` |
| `packages/db/src/index.ts` | `22463d4e6d636bfdd83d6fa79d3b7c6836957c2c` |
| `packages/db/src/migrations/0005_asset_contract_jobs.sql` | `d29851784d29d48757183eb0dcdbbf0608b7a18c` |
| `packages/db/src/migrations/0009_credit_ledger_costguard.sql` | `e998f00aa554ecfafa81fd693b3b93c0ce7a1b27` |
| `apps/api/src/server.ts` | `13f2774a081adb947e7acdc4708a5418d6c48570` |

Source movement, differing fingerprint, changed current `main`, or new approved authority after this proposal requires preflight reconciliation. An **execution** Context Lock can be issued only **after specific owner scope/admission** and the admitted Work Order is available on current `main`. Do not reuse WO-009 lock. ChatGPT handles GitHub documents, issues, PRs, review/audit, governance. Codex codes/tests/commits only and returns SHA+commands/exit codes.

**Approved Phase 1 implementation STOP after actual admitted code/tests:** `SPRYXEL_WO010_PHASE1_AB_CODE_AND_RLS_TESTS_READY_FOR_INDEPENDENT_HIGH_ASSURANCE_AUDIT`.

**Documentation admission STOP:** `SPRYXEL_WO010_PHASE1_AB_OWNER_ADMITTED_CONTEXT_LOCK_PREPARED_WAITING_PROTECTED_DOCS_MERGE`. **Codex execution permitted only after protected admission/lock docs merge and exact preflight**, with implementation STOP as specified above. Historical at issuance, before implementation PR #98 review: no independent audit of the implementation had yet run.


## Registro de implementação integrada e homologação documental (2026-10-19)

**Estado registrado:** somente o código/testes de Phase 1 A+B está integrado; a homologação documental está sob revisão; a conclusão canônica da WO-010 permanece pendente. Este registro não muda a admissão, o allowlist, as exclusões ou os critérios originais.

- PR #98 foi squash-merged em main SHA 7d0700921933d91d266d763ea17d8c9b632e9446, com pai 414691bd734f14a37a389a02ea29aca643d7388b.
- HEAD técnico revisado: 0ba0b78b15a533186415bfd6c4c5ae1354d357c8; tree revisado e integrado idêntico: 463fc8325d7d6b42fb29a126fd7315e55af030bf.
- Escopo de merge reconciliado: exatamente os 11 caminhos de implementação/teste listados no diff da PR #98; nenhum arquivo de governança entrou naquele merge.
- Os recibos locais dos testes no HEAD exato, a matriz A01–A04/B01–B08/B06-ARCH, os seis checks pós-merge e riscos estão consolidados em .engineering/evidence/SPRYXEL-WO-010-EVIDENCE.md.
- O review HIGH_ASSURANCE publicado em PR #98 review 5565529834 aceitou a fonte e evidências para o incremento bounded com limitações registradas. O estado GitHub do review é COMMENTED; esta atualização não converte esse registro em APPROVED nem afirma uma nova execução independente de PostgreSQL.
- O registro do review, suas limitações e a separação entre aceitação técnica e aprovação objetiva para promoção estão em .engineering/evidence/SPRYXEL-WO-010-INDEPENDENT-AUDIT.md.
- A proposta semântica, não aprovada e não promovida, está em .engineering/checkpoint-deltas/SPRYXEL-WO-010-PROPOSED.md.
- O Checkpoint canônico permanece em SPRYXEL_WO_009_COMPLETE. checkpointPromotion permanece NOT_AUTHORIZED; Phase C/D/E continuam NOT_ADMITTED. Nenhuma alteração é feita em CHECKPOINT.json ou CHECKPOINT.md.
- Esta PR documental foi preparada para revisão. Este Work Order não apresenta fonte verificável e independente de autorização do proprietário para sua criação; portanto, não afirma essa aprovação. Merge, promoção do Checkpoint, deploy, release e expansão do escopo permanecem fora da autoridade registrada aqui.

**Condição de fechamento:** não marcar esta WO como COMPLETE nem promover checkpoint até parecer objetivo APPROVED, aprovação/revisão protegida da proposta e autorização separada do proprietário sob D-0006.