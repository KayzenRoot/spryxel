# SPRYXEL-WO-008 — Pacote de Evidências

**Estado:** `ACEITAÇÃO LOCAL PASSOU; validação hospedada vinculada ao exact head descrito na PR #30`
**Work Order / incremento:** `SPRYXEL-WO-008` / `SPRYXEL-IMP-004`
**Risco:** `HIGH_ASSURANCE`
**Issue / PR:** [#29](https://github.com/KayzenRoot/spryxel/issues/29) / [#30](https://github.com/KayzenRoot/spryxel/pull/30)
**Base autorizada:** `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`
**Head de origem desta execução:** `1b8ccbaee12bb5a5763aa9218218fb9eec958e45`
**Head candidato final e URLs dos checks:** registrados no corpo da PR #30 após o push; nenhum check de SHA anterior será reutilizado.

## Autoridade e preflight

- Context Lock `.engineering/context-locks/SPRYXEL-WO-008.json`: `FRESH`, risco `HIGH_ASSURANCE`, base exata confirmada e `39/39` fingerprints críticos válidos; hash limpo do Work Order `4a74623e75f5de2819e7d912c11d4ac63a23b06e`.
- `D-001…D-161` preservados. WO-005…WO-007, GEF 1.1.1, regras do repositório, provider WorkOS/AuthKit e source seed não foram alterados.
- Contexto GitHub confirmado para PR #30: base `main`, branch autorizada `codex/spryxel-wo-008-imp-004-asset-contract-jobs`; nenhuma mutação de ruleset/provider/workflow.
- Acceptance runtime: Node `v22.23.3`, npm `10.9.9`. `npm ci --no-audit --no-fund` passou. Não foi adicionada dependência externa: o worker usa somente os pacotes workspace já existentes `@spryxel/db` e `@spryxel/domain`; lockfile contém apenas esses vínculos locais.
- O checkout gerenciado do Codex usa `.git` como arquivo de worktree. Para GEF observar o repositório sem `WORKING_TREE_NOT_OBSERVED`, doctor/status foram executados read-only em espelho Linux Git do mesmo head/base e do mesmo delta autorizado. O espelho reportou o working tree como `DIRTY/OBSERVED`, sem limites de observação.
- Após o primeiro push, o SonarCloud encontrou dois bugs críticos de confiabilidade em ordenações sem comparador explícito. A canonicalização agora usa comparação ordinal UTF-16 independente de locale, com regressão Unicode. O teste de lease também substitui o atraso fixo por polling bounded do estado real no PostgreSQL (deadline de 5 s), preservando os limites e a máquina de estados de produção.

## Implementação entregue

- Migration forward-only `0005_asset_contract_jobs.sql`: `asset_contract`, versões imutáveis, `durable_job`, idempotência e `job_attempt`, todos com RLS `ENABLE` e `FORCE`.
- Compilador de contrato com canonical JSON e SHA-256 determinísticos, normalização NFC, ordenação estável, catálogo SKU admitido e limites: 65.536 bytes, profundidade 16, 2.048 nós, arrays de 128 itens e strings de 4.096 caracteres.
- State machine bounded de seis estados; UUIDv7; tentativas limitadas a 3 e wall time de 5.000 ms; replay concorrente idempotente; conflito para mesma chave com corpo diferente; cancelamento queued/running/terminal com corridas cobertas.
- Papel PostgreSQL de worker separado, `NOBYPASSRLS`, sem DML direto nas tabelas e limitado a funções de reconciliação, claim e finalização. Claim atômico usa lock concorrente e lease; recuperação após crash/lease expirado e esgotamento de tentativas cobertos em PostgreSQL real.
- PostgreSQL é a fonte canônica. Redis/BullMQ contém apenas referência mínima `{jobId, schemaVersion}`; perda da fila, reconstrução/replay e entrega duplicada foram exercitados com Redis/BullMQ reais.
- API lista/detalha/cancela Jobs no escopo autorizado; não existe rota pública de criação de Job/contrato arbitrário. UI inclui Jobs/Queue Center, detalhes/cancelamento e Jobs duráveis recentes em Home e Project Overview.
- A única operação executável é `asset_contract.integrity_check.v1`; não escreve bytes de asset e não infere custo, modelo ou provider.

## Acceptance e resultados locais

| Verificação | Resultado / evidência |
|---|---|
| `npm ci --no-audit --no-fund` | PASS; Node `v22.23.3`, npm `10.9.9` |
| `npm run format:check` | PASS; Node `v22.23.3`, npm `10.9.9`, espelho Linux para preservar LF canônico sem reformatar arquivos-base CRLF do checkout Windows |
| `npm run lint` | PASS |
| `npm run typecheck -- --force` | PASS |
| `npm run build -- --force` | PASS; 11 workspaces, incluindo `/jobs` e `/jobs/[jobId]` |
| `npm run architecture:check` | PASS; 11 workspaces, 15 edges internos, sem ciclos/arestas proibidas; web app inspecionado |
| `npm run test:unit` | PASS; 20 arquivos, 81 testes |
| `npm run test:worker` | PASS; worker smoke em processo Node separado |
| `npm run test:integration` | PASS com PostgreSQL/RLS, Redis/BullMQ e SeaweedFS reais |
| `npm run test:browser` | PASS; 15/15, incluindo Jobs, Home/Overview, estados, cancelamento, teclado, responsividade, tema e regressões AuthKit |
| `npm test` | PASS em Node `v22.23.3` / npm `10.9.9`; unidade (81), worker, integração real e browser (15/15); exit code `0` |
| `npm audit --audit-level=high` | PASS; zero vulnerabilidades reportadas |
| `git diff --check` | PASS; somente avisos de autocrlf do Git, sem whitespace errors |

A integração real provou: migrações/pristine status e idempotência; RLS sem contexto e entre tenants para Contract/Job/Attempt; isolamento de contexto tenant/project no pool; role matrix app/worker; concorrência/replay/conflito de idempotency key; entrega durável antes da projeção; duplicate delivery; perda e reconstrução do Redis; claim/Attempt atômicos; crash + lease expiry; limite de tentativas; cancelamento queued/running; API safe list/detail/cancel; ausência de corpo de contrato em payload/log; S3 autenticado e health/readiness no SeaweedFS. PGDATA foi confirmado em tmpfs Linux, sem bind mount/volume; teardown removeu somente recursos descartáveis isolados do harness.

Na primeira execução browser do espelho Linux, o Chromium não abriu porque faltavam bibliotecas de sistema (`libnspr4.so` e dependências). O runtime Playwright do WSL foi completado sem alterar o repositório; em seguida, os 15 testes browser isolados e o ciclo agregado `npm test` passaram. A execução oficial final foi Node `v22.23.3` / npm `10.9.9`.

## GEF e drift — D-0007

- GEF `@gef-bootstrap/cli@1.1.1`; `gef doctor --target . --json`: exit `0`, `ok=true`, `terminal=SUCCEEDED`, `effect=NONE`, Node `v22.23.3`, platform Git e observabilidade saudáveis, sem remediação; o espelho observou o checkout.
- Duas leituras `gef status --target . --json`: exit `0`, bytes idênticos; repositório `DIRTY/OBSERVED`, sem limites de observação, checkpoint legível; `operator.stale=true` e drift bruto `UNEXPECTED` preservados conforme D-0007 e o ciclo de promoção ainda não executado. O SHA-256 das leituras no exact head commitado será publicado no corpo da PR #30.
- `status` bruto classifica drift de projeto `UNEXPECTED` (`changed=true`). D-0007 prevê esse diagnóstico não autorizado na implementação v1.1.1. A autorização está vinculada ao WO-008 + Context Lock FRESH + diff Git exato + este Evidence Bundle. Não houve edição de `.gef`, baseline de drift, GEF ou checkpoint.
- O doctor informa proveniência de dependências `unverified`/`REVIEW` e contexto GitHub sem permissão de escrita/`REVIEW`; isso não é finding de vulnerabilidade. `npm audit` reportou zero vulnerabilidades e publicação/push foi executado pela credencial GitHub da sessão, sem mudar provider/ruleset.

## Escopo, segurança e compatibilidade

- Não alterados: `.gef`, GEF, checkpoint, Work Order, Context Lock, D-001…D-161, workflows, ruleset, provider, source seed, stack de dependências externas e implementações WO-005…WO-007.
- Fora do escopo e ausentes: Credit Ledger/CostGuard/billing/wallet, TrustShield, geração, modelos/GPU, providers de produção, escrita de assets/AssetVersion, Asset Library, QA/export e incremento posterior.
- Risco residual explícito: esta entrega fornece somente backbone local e execução de verificação de integridade sem bytes de output; provider, pricing, GPU e operação comercial seguem não congelados. Redis é transitório e recuperável a partir do PostgreSQL.
- Acceptance não promove checkpoint. `.engineering/checkpoint-deltas/SPRYXEL-WO-008-PROPOSED.md` continua apenas `PROPOSED_ONLY`.

## Gates hospedados e stop condition

A descrição da PR #30 contém o SHA exato do head candidato e, após conclusão, os URLs/conclusões dos quatro required checks (`Repository validation`, `Pipeline integrity`, `Gitleaks secrets`, `Trivy filesystem and configuration`) e SonarCloud no mesmo SHA. Nenhum resultado de outro SHA será reaproveitado. Não há merge nem promoção de checkpoint.

**STOP CONDITION:** `SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT`
