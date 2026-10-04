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

## Correction-01 — C-01-A…C-01-J

Todos os dez findings do Correction Delta 01 foram corrigidos, preservando o IMP-004 existente e os baselines WO-005…WO-007. O Work Order, Context Lock, D-001…D-161, .gef, checkpoint, GEF 1.1.1, workflows, ruleset, provider e source seed permaneceram inalterados. Nenhuma dependência ou lockfile foi alterado.

- **C-01-A/B:** cancelamento trata somente JobApiError conhecido e retorna ao detalhe para recarregar estado durável; listagem de projetos preserva 401/403/404/502/503 seguros, validando ProjectApiError e propagando erros inesperados. Regressões cobrem corrida terminal, falha transitória e os estados de autorização/dependência.
- **C-01-C:** worker usa conexão Redis blocking dedicada sem commandTimeout curto; conexões auxiliares continuam limitadas. Erros de Queue/Worker passam por telemetria segura, sanitizada e limitada por taxa. Teste real manteve o worker ocioso por 1,25 s sem erro artificial nem tempestade de logs.
- **C-01-D:** configuração de produção do worker exige somente a credencial DB dedicada do worker; testes cobrem sucesso sem credencial app e falha quando falta a credencial worker.
- **C-01-E:** cursor preserva microssegundos de PostgreSQL e tem validação bounded. Paginação em PostgreSQL real percorreu Jobs no mesmo milissegundo sem omissão ou duplicação; cursor excessivo é rejeitado.
- **C-01-F/G:** migration forward-only 0006_asset_contract_canonical_bytes.sql mede e valida no PostgreSQL a mesma representação UTF-8 canônica usada pelo domínio (limite 65.536 bytes). Testes reais cobrem 65.535/65.536/65.537 bytes, hash, NUL, surrogates inválidos, colisão NFC e chaves __proto__/similares. O teste de envelope oversized agora usa múltiplas strings individualmente válidas e exercita specification_too_large.
- **C-01-H:** infra:up reconcilia de forma idempotente a role spryxel_worker em banco inicializado, sem reset de volume; regressão remove/recria a role no PostgreSQL descartável, roda migrations e valida least privilege.
- **C-01-I/J:** fixture fora de Jobs não cria projeto de demonstração, inclusive com cenários em ordem alternada; falha de ROLLBACK não substitui a exceção original da integração.
- Regressões pré-existentes do IMP-004 continuam passando: idempotência/replay concorrente, RLS e isolamento cross-tenant, projeção/reconciliação Redis, claim/lease/crash recovery, retries limitados, cancelamento, API e S3 autenticado.

### Acceptance HIGH_ASSURANCE após Correction-01

Runtime oficial: Node v22.23.3 e npm 10.9.9, no espelho Linux observável pelo GEF; a execução de aceitação após as correções é a evidência oficial desta entrega.

| Verificação | Resultado |
|---|---|
| npm ci --no-audit --no-fund | PASS; instalação limpa concluída; sem mudança de dependências/lockfile |
| npm run format:check | PASS; 111 arquivos |
| npm run lint | PASS; 111 arquivos |
| npm run typecheck -- --force | PASS; 18 tarefas |
| npm run build -- --force | PASS; 11 workspaces |
| npm run architecture:check | PASS; 11 workspaces/15 arestas internas; sem ciclos ou arestas proibidas |
| npm run test:unit | PASS; 87/87 testes em 21 arquivos |
| npm run test:worker | PASS; smoke em processo Node separado |
| npm run test:integration | PASS; PostgreSQL/RLS, Redis/BullMQ e SeaweedFS reais, incluindo regressões C-01-E/F/G/H/J |
| npm run test:browser | PASS; 19/19, incluindo estados de erro, cancelamento, isolamento das fixtures e regressões AuthKit |
| npm test | PASS, exit code 0; repetiu unidade (87), worker, integração real e browser (19/19) |
| npm audit --audit-level=high | PASS; zero vulnerabilidades |
| git diff --check | PASS; sem erros de whitespace |

A integração reportou seis migrations aplicadas e validou limites do contrato no banco, concorrência/replay, RLS, role matrix, crash/lease, cancelamento, API segura, perda/reconstrução Redis e SeaweedFS S3 autenticado. O harness removeu somente containers, volumes e redes descartáveis isolados; PostgreSQL usou PGDATA em tmpfs Linux.

### GEF e candidato desta correção

gef doctor --target . --json: exit 0, ok=true, terminal=SUCCEEDED, effect=NONE, versão 1.1.1; Node, Git, plataforma e observabilidade HEALTHY, sem limites de observação ou remediação. Duas leituras gef status --target . --json no espelho tiveram bytes idênticos; saída bruta DIRTY/OBSERVED, sem limites, checkpoint legível, operator.stale=true e drift bruto UNEXPECTED. A interpretação e autorização seguem D-0007: Work Order + Context Lock + diff autorizado; nenhum baseline foi reescrito. Após o commit, as leituras determinísticas no exact final head e seu SHA-256 serão registrados no corpo da PR #30.

O exact final HEAD, URLs e conclusões dos quatro required checks, Sonar/Socket e contagem de review threads serão registrados no corpo da PR #30 após o push. Nenhum check de SHA anterior será reutilizado.

## Reexecução após finding do Sonar — hardening C-01-H

A análise hospedada do head predecessor a1ea8eb identificou uma vulnerabilidade S4036 no lançamento da CLI Docker pelo nome simples, sujeito à resolução via PATH herdado. O código de infra local agora seleciona somente caminhos absolutos fixos suportados para Windows/macOS/Linux, ou exige DOCKER_CLI como caminho absoluto existente. Quatro testes cobrem override absoluto, rejeição de nome relativo, escolha do local Windows e ausência/falha de candidatos. A alteração permanece dentro da reconciliação local do C-01-H; não adiciona dependências nem muda manifests.

Toda a acceptance HIGH_ASSURANCE foi reiniciada em Node v22.23.3/npm 10.9.9 após esse ajuste. Este resultado supersede os números anteriores da tabela acima:

| Verificação final pós-hardening | Resultado |
|---|---|
| npm ci --no-audit --no-fund | PASS; 227 pacotes instalados a partir do lockfile, sem mudanças nos manifests |
| npm run format:check / npm run lint | PASS; 113 arquivos |
| npm run typecheck -- --force | PASS; 18/18 tarefas |
| npm run build -- --force | PASS; 11/11 workspaces |
| npm run architecture:check | PASS; 11 workspaces, 15 arestas internas |
| npm run test:unit | PASS; 91/91 em 22 arquivos, incluindo 4 testes de resolução Docker |
| npm run test:worker | PASS |
| npm run test:integration | PASS; PostgreSQL/RLS, Redis/BullMQ e SeaweedFS reais; seis migrations e todos os cenários IMP-004 |
| npm run test:browser | PASS; 19/19 |
| npm test | PASS; exit code 0; repetiu os 91 unit, worker, integração real e browser 19/19 |
| npm audit --audit-level=high | PASS; zero vulnerabilidades |
| git diff --check | PASS |

Após o push deste hardening, o exact final HEAD e os quatro required checks, SonarCloud, Socket e estado das review threads serão registrados no corpo da PR #30. Checks do predecessor a1ea8eb não serão reutilizados; nenhuma promoção ou merge ocorrerá.
