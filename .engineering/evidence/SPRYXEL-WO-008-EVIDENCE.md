# SPRYXEL-WO-008 — Pacote de Evidências

## Aceitação final C-04B — 14/10/2026

**Resultado local:** gates funcionais C-04B PASS no código `2e6b394c991a7a96eb8749ec9870d6dc5dd8188d`. Como o Evidence Bundle é versionado antes de disparar seus próprios checks, o SHA final e os resultados hospedados são apresentados na atestação viva da PR #30. A PR fica aberta e sem merge.

- **Base/branch:** `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`; `codex/spryxel-wo-008-imp-004-asset-contract-jobs`.
- **Context Lock:** `FRESH`, HIGH_ASSURANCE, `39/39` fingerprints críticos correspondem à base; nenhuma fonte protegida foi modificada. Work Order/Correction-04 lidos integralmente.
- **Runtime:** Node `v22.23.3`, npm `10.9.9`; Docker Engine `28.4.0`; checkout Linux com `umask 0077`.
- **Inventário no HEAD de teste:** `infra/postgres/Dockerfile` e `scripts/postgres-test-harness.test.ts` são as duas alterações do delta de código C-04B. AuthKit/WorkOS, proxy, rotas protegidas, backend de produto, workflows, `.gef`, checkpoint, Work Order, Context Lock, ledger de decisões e GEF não foram editados.

### Verificação da imagem PostgreSQL sob umask restritivo

`infra/postgres/create-app-role.sh` permaneceu Git `100644`, mas materializou `0600` no checkout com `umask 0077`. Build sem cache pelo Docker Compose gerou `spryxel/postgres-test:18.6-alpine3.24`, image ID `sha256:d96528a1ca5a43b0733b87b8504a919b6c4b208c87d2e63cc217a32d16952324`. Na imagem/serviço, o hook `/docker-entrypoint-initdb.d/10-create-app-role.sh` é `0644`, `root:root` (`0:0`), legível e não executável pelo usuário OS `postgres` UID `70`. O container iniciou saudável com PostgreSQL `18.6`; log confirmou `sourcing` do hook e consulta real confirmou `spryxel_app,spryxel_worker`. A prova terminou com `docker compose down --volumes --remove-orphans` no projeto aleatório isolado, sem recursos residuais.

### Comandos funcionais no HEAD `2e6b394c991a7a96eb8749ec9870d6dc5dd8188d`

| Comando | Resultado, exit e duração | Escopo/prova |
|---|---|---|
| `npm ci --no-audit --no-fund` | PASS, `0`, 13 s | Instalação limpa, 227 pacotes, Node 22.23.3/npm 10.9.9; sem alteração de manifests/lockfile. |
| `npm run format:check` | PASS, `0`, 480 ms | Biome: 113 arquivos. |
| `npm run lint` | PASS, `0`, 625 ms | Biome: 113 arquivos. |
| `npm run typecheck -- --force` | PASS, `0`, 19.639 s | Turbo: 18/18 tarefas sem cache. |
| `npm run build -- --force` | PASS, `0`, 28.715 s | Turbo: 11/11 workspaces; rotas protegidas e callback incluídos no build. |
| `npm run architecture:check` | PASS, `0`, 1.253 s | 11 workspaces, 15 arestas internas, 21 arquivos Web; sem ciclos/arestas proibidas. |
| `npm run test:unit` | PASS, `0`, 5.215 s | Vitest: 22 arquivos, 94/94; inclui `scripts/postgres-test-harness.test.ts` e a regressão estática do modo Docker. |
| `npm run test:worker` | PASS, `0`, 992 ms | Smoke em processo Node separado, um consumidor bounded. |
| `npm run test:integration` | PASS, `0`, 108.789 s | PostgreSQL 18.6/RLS + Redis 8.10.2/BullMQ + SeaweedFS 4.48 reais; migrations, cross-tenant, roles, idempotência, claim/recovery, cancelamento, API e S3 autenticado. PGDATA em tmpfs Linux; teardown scoped PASS. |
| `npm run test:browser` — execução canônica 1 | PASS, `0`, 25.824 s | 20/20; Playwright reportou 1 worker automático, configuração `fullyParallel: true`, `retries: 0`, sem override. Portas padrão: web `3100`, API `3201`. |
| `npm run test:browser` — execução canônica 2 consecutiva | PASS, `0`, 26.332 s | 20/20; mesmos workers/defaults/portas. O teste `concurrent Jobs sessions isolate cancellation from independent overview state` passou nas duas execuções. Scopes/IDs das fixtures são determinísticos; sem seed aleatória. |
| `npm test` | PASS, `0`, 68.625 s | Comando agregado padrão; unit 94/94, worker, integração real e browser 20/20; nenhum override de workers. |
| `npm audit --audit-level=high` | PASS, `0`, 461 ms | Zero vulnerabilidades reportadas. |
| `git diff --check` | PASS, exit `0` | Executado sobre o diff de evidência; sem erros de whitespace. |

Uma primeira tentativa de bootstrap via `npx -c` retornou `EUSAGE` no `npm exec` do Playwright antes de iniciar specs (`0` testes). O comando equivalente de consulta falhou no ambiente do wrapper, enquanto os comandos canônicos executados diretamente pelos binários fixados Node 22/npm 10 passaram; não houve alteração no código/configuração nem override de Playwright por causa dessa tentativa. Apenas as duas execuções diretas acima contam como aceitação browser.

### GEF, status de publicação e gates pendentes

`npm run gef:doctor` no worktree de execução saiu `0`, `ok=true`, `effect=NONE`, mas reportou `GIT_DIRECTORY_NOT_A_DIRECTORY` e `WORKING_TREE_NOT_OBSERVED`; essa leitura degradada não é contabilizada como PASS. No mirror Git observável, com o mesmo HEAD e esta versão sincronizada do Evidence Bundle, GEF `@gef-bootstrap/cli@1.1.1` reportou doctor read-only exit `0`, `ok=true`, `effect=NONE`, `repository.observable=HEALTHY` e nenhum limite de observação. Duas chamadas `gef status --target . --json` read-only saíram `0` e foram byte-idênticas; status `DIRTY/OBSERVED`, sem limites, `operator.stale=true`, drift bruto `UNEXPECTED` (`changed=true`). Conforme D-0007, o drift é reconciliado contra WO-008 + Context Lock FRESH + delta Git autorizado; nenhum baseline ou arquivo `.gef` foi editado. O digest SHA-256 exato das leituras finais será publicado na PR para evitar autorreferência do Evidence Bundle.

Os sete checks hospedados observados no HEAD de código `2e6b394c991a7a96eb8749ec9870d6dc5dd8188d` estavam PASS (4 required workflows, SonarCloud e 2 Socket), 13 threads e 0 unresolved. Eles não substituem a checagem do commit final de evidências. `npm audit` local passou. Nesta aceitação, `npm test` e os browsers usaram comandos/configuração padrão, sem serialização ou `--workers=1`.

**STOP CONDITION:** C-04B local passa, mas só será `SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT` após evidência commitada, checks hospedados no exact final HEAD e confirmação final de zero threads pendentes. Sem merge/promoção de checkpoint.

## Registro histórico anterior — Correction-04, 13/10/2026

**Estado histórico do candidato anterior:** `IMPLEMENTED / ACCEPTANCE PENDING / CORRECTION REQUIRED`. Naquele candidato, a aceitação HIGH_ASSURANCE canônica com Playwright paralelo ainda não tinha sido executada; os resultados locais C-01…C-03 eram históricos.
**Work Order / incremento:** `SPRYXEL-WO-008` / `SPRYXEL-IMP-004`
**Risco:** `HIGH_ASSURANCE`
**Issue / PR:** [#29](https://github.com/KayzenRoot/spryxel/issues/29) / [#30](https://github.com/KayzenRoot/spryxel/pull/30)
**Base autorizada:** `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`
**Head inicial da aceitação documentada acima:** `2e6b394c991a7a96eb8749ec9870d6dc5dd8188d`.
**HEAD candidato e checks hospedados do candidato atual:** consultar a atestação viva na [PR #30](https://github.com/KayzenRoot/spryxel/pull/30). O Evidence Bundle não se autorreferencia: sua própria atualização gera novo commit/HEAD; checks anteriores permanecem históricos e não substituem aceitação local.

## Autoridade e preflight

- Context Lock `.engineering/context-locks/SPRYXEL-WO-008.json`: `FRESH`, risco `HIGH_ASSURANCE`, base exata confirmada e `39/39` fingerprints críticos válidos; blob do Context Lock `43c305917e8ef6d1c1608b13249bbb088291b9ed`; hash limpo do Work Order `4a74623e75f5de2819e7d912c11d4ac63a23b06e`; blob de Correction-03 `c7399e815aba682ef6eb1fc642f07be0625103e3`.
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

## Correction-03 — C-03-A: provenance imutável do executor em Job Attempt

Esta seção registra a implementação e a aceitação local de C-03-A sobre o candidato iniciado em `dbbdcecade592cbfbe0ce4839bcc8464a764ccda`. A migration forward-only `0008_job_attempt_executor_provenance.sql` adiciona `executor_kind` e `executor_version`, atribui deterministicamente os valores canônicos aos Attempts históricos (`spryxel.asset_contract.integrity_worker` / `v1`) e os torna obrigatórios e limitados por constraint. O trigger grava os valores canônicos na criação atômica do Attempt durante o claim e recusa sua alteração posterior (`42501`). A migration revoga DML de `PUBLIC`, `spryxel_app` e `spryxel_worker` sobre `platform.job_attempt`; a aplicação recebe somente `SELECT`, e o worker continua operando apenas pelas funções autorizadas. Não há DML genérico concedido ao worker.

O domínio e o contrato seguro tipam kind/version como literais do executor admitido; Job detail projeta esses dois campos seguros, sem expor `worker_id`. Fixtures da API/browser incluem a proveniência canônica. Nenhum executor registry, provider/model identity ou novo fluxo de produto foi introduzido.

Regressões na integração PostgreSQL real comprovaram: claim atômico persiste kind/version e número do Attempt; um UPDATE administrativo da proveniência é negado pelo trigger; `spryxel_app` e `spryxel_worker` não conseguem atualizar esses campos diretamente; delivery duplicado conserva um único Attempt/proveniência; crash/retry cria IDs distintos para cada tentativa e mantém `v1`; os cenários existentes de RLS/cross-tenant continuam executando na mesma suíte. Testes de contrato aceitam somente a proveniência semântica canônica e rejeitam `0.0.0` como versão.

### Acceptance HIGH_ASSURANCE — Correction-03

Runtime usado: Node `v22.23.3`, npm `10.9.9`. Os comandos foram executados contra o mesmo conteúdo-fonte C-03-A; a checagem de formato foi executada no espelho Linux porque o checkout Windows materializa LF como CRLF (`core.autocrlf=true`). No checkout Windows, `format:check` reportou divergências de fim de linha em arquivos de base não modificados; nenhuma alteração global de line endings foi introduzida. A versão efetiva do candidato no espelho foi conferida por hashes de arquivos idênticos aos do worktree autorizado.

| Verificação | Resultado local final |
|---|---|
| `npm ci --no-audit --no-fund` | PASS; instalação limpa sob Node `v22.23.3` / npm `10.9.9`; sem alteração de manifests ou lockfile |
| `npm run format:check` | PASS no espelho Linux; 113 arquivos. No checkout Windows, a execução reportou incompatibilidade LF/CRLF do `autocrlf` em arquivos de base; fontes do candidato não foram modificadas para mascarar a diferença |
| `npm run lint` | PASS; 113 arquivos |
| `npm run typecheck -- --force` | PASS; 18/18 tarefas |
| `npm run build -- --force` | PASS; 11/11 workspaces |
| `npm run architecture:check` | PASS; 11 workspaces, 15 arestas internas e 21 arquivos da aplicação Next inspecionados |
| `npm run test:unit` | PASS; 93/93 testes em 22 arquivos |
| `npm run test:worker` | PASS; worker smoke em processo Node separado |
| `npm run test:integration` | PASS com PostgreSQL 18.6/RLS, Redis/BullMQ e SeaweedFS reais; oito migrations e regressões de provenance, duplicate delivery, crash/retry, role privileges, RLS e cenários existentes IMP-004 |
| `npm run test:browser -- --workers=1` | PASS; 19/19. A execução paralela padrão repetiu uma corrida preexistente da fixture compartilhada Home/Projects; serializar Playwright fez a suíte inteira passar sem alterar código/configuração Playwright |
| `npm test -- -- --workers=1` | PASS; exit code 0; repetiu unit 93/93, worker, integração real e browser 19/19. Usou `SPRYXEL_E2E_PORT=3101`, pois a porta 3100 estava ocupada por `goodz-menu`; nenhum processo externo foi encerrado |
| `npm audit --audit-level=high` | PASS; zero vulnerabilidades |
| `git diff --check` | PASS após a atualização do Evidence Bundle; sem erros de whitespace |
| GEF doctor/status 1.1.1 | Doctor PASS no espelho Git Linux observável. O doctor no worktree Windows não conseguiu observar o checkout gerenciado (`GIT_DIRECTORY_NOT_A_DIRECTORY`); a limitação não foi tratada como PASS. Status é lido somente no espelho observável, duas vezes após conteúdo/evidência sincronizados; resultados brutos e SHA-256 registrados abaixo |

No espelho Linux, `gef doctor` reportou `ok=true`, `effect=NONE`, GEF 1.1.1, observabilidade do repositório saudável e nenhum limite de observação/remediação; os indicadores `dependency.provenance=unverified/REVIEW` e `github.immutableRef=false/REVIEW` permanecem informativos. Duas leituras `gef status` read-only, após sincronizar código e Evidence Bundle, foram byte-idênticas; SHA-256 da saída JSON: `addc1d16780f9193dee98816b053a7f121ef215671f0b33611a0d9b35de8b73d`. Estado observado `DIRTY/OBSERVED`, sem limites; `operator.stale=true` e drift bruto `UNEXPECTED` correspondem ao delta autorizado. Conforme D-0007, o estado é reconciliado contra Work Order, Context Lock e diff autorizado; nenhum baseline ou arquivo `.gef` foi editado. No worktree Windows, GEF não observa o `.git` indireto e esse resultado é reportado como limitação, não como aprovação.

O bundle versionado registra toda a evidência local; os IDs/URLs/conclusões de checks hospedados do exact head, SonarCloud, Socket e a contagem de review threads serão atestados na descrição viva da PR após o push. Nenhum resultado de SHA anterior será reutilizado; o próprio commit de evidência não afirma conter IDs de checks que só existem depois dele.

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

## Correction-02 — C-02-A…C-02-C

Esta seção substitui todas as tabelas e métricas históricas anteriores como aceitação final de C-02. As seções Correction-01 e anteriores permanecem como histórico, agora supersedido.

### C-02-A — bounds do Asset Contract

O compilador admite e congela estes valores para `asset_contract.integrity_check.v1`: `maxCandidates=1`, `maxRetries=2`, `maxRepairs=0` e `maxWallTimeMs=5000`. `maxRetries` conta tentativas adicionais, portanto o Job deriva `maxAttempts=3`; há uma única execução candidata, nenhuma reparação e deadline máximo de 5.000 ms. São limites operacionais conservadores para a operação de integridade sem geração; não representam custo, preço, modelo, GPU ou provider.

Os quatro limites fazem parte do envelope versionado, são congelados em runtime e entram na canonicalização/request identity. A migration forward-only `0007_asset_contract_bounds_and_cancel_safe_point.sql` persiste os valores na versão exata do contrato por defaults `NOT NULL` fixos e os valida independentemente por `CHECK` no PostgreSQL; roles de runtime não podem atualizar a versão. A função de criação conserva sua assinatura provider-neutral e não recebe limites do chamador. No `INSERT` de Job, trigger lê a versão exata do contrato e deriva `max_attempts = maxRetries + 1` e `max_wall_time_ms = maxWallTimeMs`; o worker obtém os bounds persistidos somente para seu claim ativo através de função restrita ao papel `spryxel_worker`, verifica a request identity e aplica hard cap interno de 5.000 ms.

Regressões de domínio cobrem valores determinísticos/congelados, identidade idêntica para entradas iguais e mudança da identidade para cada bound diferente. Integração PostgreSQL real cobre os quatro campos persistidos, escrita runtime negada, tampering e valores fora do limite rejeitados pelo `CHECK`, derivação Job/Attempt e assinatura de criação sem campos de bounds controláveis pelo chamador. O worker prova uso do limite persistido e clamp ao hard cap. Nenhum caminho de inferência, provider, GPU ou custo foi adicionado.

### C-02-B — cancelamento e lease

`running -> cancel_requested` preserva o lease ativo. Reconciliação não finaliza enquanto esse claim permanece válido. O worker finaliza `cancelled` no safe-point; se morrer após o pedido, a expiração do lease permite reconciliação terminal sem nova tentativa. Um finish de lease expirado/stale não pode alterar o estado terminal. Cancelamento queued continua imediato e cancelamento terminal permanece idempotente.

A integração real PostgreSQL/RLS demonstrou: trigger preserva lease e Attempt em `running -> cancel_requested`; reconciliação imediata não terminaliza enquanto lease está válida; wrapper `finish_job` autoriza o safe-point e conclui `cancelled` exatamente uma vez; crash após `cancel_requested` torna-se terminal após expiração sem nova execução; finish stale é recusado; cancelamento queued/terminal mantém semântica bounded. Apenas as funções públicas de worker `reconcile_jobs`, `claim_job`, `finish_job` e a leitura de bounds do claim ficam executáveis pela role; funções internas renomeadas não ficam diretamente acessíveis.

### Acceptance HIGH_ASSURANCE — Correction-02

Runtime oficial: Node `v22.23.3`, npm `10.9.9`. A suíte foi executada no espelho Linux Git observado pelo GEF, com o diff sincronizado ao worktree autorizado. `npm ci --no-audit --no-fund` instalou 227 pacotes sem alteração de manifests ou lockfile.

| Verificação | Resultado final local |
|---|---|
| `npm ci --no-audit --no-fund` | PASS; 227 pacotes, Node `v22.23.3`, npm `10.9.9` |
| `npm run format:check` | PASS; 113 arquivos |
| `npm run lint` | PASS; 113 arquivos |
| `npm run typecheck -- --force` | PASS; 18/18 tarefas |
| `npm run build -- --force` | PASS; 11/11 workspaces |
| `npm run architecture:check` | PASS; 11 workspaces e 15 arestas internas |
| `npm run test:unit` | PASS; 93/93 testes em 22 arquivos |
| `npm run test:worker` | PASS; worker smoke em processo Node separado |
| `npm run test:integration` | PASS com PostgreSQL/RLS, Redis/BullMQ e SeaweedFS reais; sete migrations, bounds, cancellation safe-point, recovery e restante dos cenários IMP-004 |
| `npm run test:browser` | PASS final; 19/19. Uma tentativa anterior teve falha intermitente no fluxo de criação de projeto (18/19); o caso passou isolado e a repetição integral passou sem alteração de Playwright/configuração |
| `npm test` | PASS final; exit code 0; repetiu unit (93/93), worker, integração real e browser (19/19). Uma tentativa anterior repetiu a mesma falha intermitente do browser e foi seguida por esta repetição integral PASS |
| `npm audit --audit-level=high` | PASS; zero vulnerabilidades |
| `git diff --check` | PASS; sem erros de whitespace |
| GEF doctor 1.1.1 | PASS; read-only, `ok=true`, observabilidade saudável, sem limites/remediação; dependency provenance `unverified/REVIEW` reportada pelo doctor |
| GEF status 1.1.1 | Duas leituras read-only byte-idênticas após código e Evidence Bundle, no snapshot pré-commit; SHA-256 `85ce6e474b371719e2abff4415689fe9d5a18f8106f8c07efd53e15f9f759edc`; `DIRTY/OBSERVED`, `operator.stale=true` e drift `UNEXPECTED` sob D-0007. O resumo/digest pós-commit será publicado na PR #30. |

Uma primeira tentativa do agregado teve uma falha transitória de navegação em um teste browser existente; o teste isolado e a execução agregada completa subsequente passaram. Nenhum código de produto, Playwright, porta ou configuração foi alterado para contornar essa tentativa. A aceitação final acima é a execução completa posterior com exit code zero.

### Exact-head e gates hospedados — Correction-02

O SonarCloud do head predecessor `65cfa42b2b1b0d478e021f93819e78768fd2d9f9` falhou o Quality Gate por 9,2% de duplicação ([resultado histórico](https://github.com/KayzenRoot/spryxel/runs/111452403358)); a migration foi refatorada para retirar cópias integrais de rotinas SQL e essa falha não será reutilizada como resultado do candidato atual. A descrição viva da [PR #30](https://github.com/KayzenRoot/spryxel/pull/30) carregará o SHA exato final e os IDs/URLs/conclusões dos quatro required checks, SonarCloud e Socket, além das threads pendentes. Checks de `65cfa42b2b1b0d478e021f93819e78768fd2d9f9`, `ba8cd741b86533ef8e5e1f72e07f2c0d7caa692e` ou qualquer SHA anterior não serão reutilizados. Os IDs de checks só são criados após o commit que os aciona; por isso o ciclo do exact head será documentado na PR sem alegar que o commit de evidência contém resultados que ainda não existiam quando foi criado.

**STOP CONDITION:** `SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT`

## Correction-04 — isolamento de fixtures paralelas (13/10/2026)

**Estado deste delta: IMPLEMENTED / ACCEPTANCE PENDING / CORRECTION REQUIRED.** Este registro não certifica APPROVED, não promove checkpoint e não substitui os acceptance runs HIGH_ASSURANCE exigidos pela Work Order.

### Identidade e escopo

- Work Order: `SPRYXEL-WO-008 / SPRYXEL-IMP-004`, risco HIGH_ASSURANCE, issue #29, PR #30.
- Base autorizada: `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`.
- Correction Delta: `.engineering/correction-deltas/SPRYXEL-WO-008-CORRECTION-04.md`.
- Evidência de revisão da correção C-03-A é preservada; C-04-A/B ainda requerem aceitação canônica.
- Mudanças de código/teste: `scripts/run-browser-api.ts` e `apps/web/app/page.spec.ts`, commits `785c647e6d95a90504351aed8a966427e1dcc7d4`, `6c21ed2323ccb07cf1a67d0bce7e2898d1b98d29` e ajuste de espaçamento `c8dc6f1faa7411c0026e7df73dc3cde019ce25dd`.

### Correção implementada, ainda sem prova de runtime

- A fixture `ensureJobsFixture` admite `jobs-populated-*` mantendo o estado inicial `queued` e identidade derivada de cada scope. Cada scope determina subject, tenant, projeto, job e URLs diferentes no test harness não produtivo.
- Os dois testes antes compartilhados foram isolados em `jobs-populated-cancellable` e `jobs-populated-overview`, impedindo que o cancelamento de um altere o Job observado pelo outro.
- Um novo teste explícito abre dois contextos independentes simultaneamente, usa scopes `jobs-populated-cancel-isolation` e `jobs-populated-read-isolation`, verifica URLs distintas, cancela o primeiro Job e exige que o segundo continue `queued` após reload.
- `playwright.config.ts` mantém `fullyParallel: true`, `retries: 0`, sem override global de workers; não houve sleeps, reconfiguração de testes, mudança de código produtivo, workflow, ruleset, provider, GEF/.gef, Work Order, Context Lock, D-001…D-161 ou checkpoint canônico.
- **Validação funcional ainda não executada sobre estes commits**: `npm run test:browser` duas vezes sem flags especiais; `npm test` sem flags especiais; instalação limpa, format, lint, typecheck, build, arquitetura, integração real PostgreSQL/RLS + Redis/BullMQ + SeaweedFS, audit, GEF e diff-check. O resultado serial 19/19 anterior é histórico e não comprova esta correção.
- Os checks hospedados do candidato **antes deste commit de Evidence Bundle** foram PASS em `c8dc6f1faa7411c0026e7df73dc3cde019ce25dd` (4 required, SonarCloud, 2 Socket; 0 review threads pendentes). São evidencia de um SHA anterior, **não** do futuro HEAD final deste commit. Os resultados do HEAD final e URLs ficam na descrição viva da PR após seu push.

### Gate restante

**CORRECTION REQUIRED** até a aceitação HIGH_ASSURANCE completa e determinística, incluindo o paralelismo canônico e a reauditoria independente. Sem `APPROVED`, não promover checkpoint, não fazer merge e não iniciar Credit Ledger/CostGuard.

**STOP CONDITION ainda não atingida:** `SPRYXEL_IMP_004_ASSET_CONTRACT_DURABLE_JOB_BACKBONE_READY_FOR_AUDIT`.

## Correction-05 — validação de cursor de paginação

**Estado:** finding `SPRYXEL-WO008-F-01` reproduzido, correção implementada e aceitação local concluída no source tree final; checks hospedados do commit exato aguardam o push.

**Correction Delta:** `.engineering/correction-deltas/SPRYXEL-WO-008-CORRECTION-05.md`
**Base / HEAD de reprodução:** `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c` / `5947f86439996c42e70486f18e527e2f1a93927d`.

### Finding reproduzido antes da edição

Com PostgreSQL 18.6 descartável, oito migrations, role `spryxel_app` e chamadas autenticadas à rota Fastify real, dois cursores chegaram aos casts do PostgreSQL e retornaram HTTP `503 job_store_unavailable`: um UUID textual de 36 hífens e uma data `2024-02-31T00:00:00Z`, normalizada pelo `Date.parse` para 2024-03-02. Nenhum arquivo do produto havia sido editado nessa reprodução. Uma sonda adicional do PostgreSQL confirmou que `0000-01-01T00:00:00Z` falha no cast para `timestamptz`, embora o round-trip JavaScript preserve ano `0000`. O container/volume/rede temporários foram removidos; credenciais aleatórias não foram impressas nem mantidas.

### Correção e regressões

`decodeJobCursor` agora exige grupos hexadecimais e hífens nas posições UUID aceitas pelo PostgreSQL. Também compara o prefixo UTC até segundos com a saída ISO normalizada e rejeita explicitamente ano `0000`, que JavaScript preserva mas PostgreSQL recusa. A fração original (até microssegundos) continua intacta e é enviada ao PostgreSQL; os testes existentes de paginação no mesmo milissegundo permaneceram passando. A integração envia os três cursores malformados (UUID, calendário normalizado e ano zero) às rotas global e project-scoped e exige HTTP 404 `job_not_found`, antes de casts SQL ou do falso 503.

### Aceitação local pós-correção

Ambiente: Node `v24.19.0`, npm `11.9.0`, Docker `28.4.0`, Docker Compose `2.40.3`; PostgreSQL/RLS, Redis/BullMQ e SeaweedFS reais no harness descartável. O projeto declara compatibilidade com Node 22; a acceptance histórica Node 22/npm 10 segue registrada acima, mas esta correção local foi executada no runtime disponível desta sessão. O teste integrado autentica pelo adaptador de teste; **não** é evidência de chamada real ao WorkOS.

| Comando | Resultado desta correção |
|---|---|
| Reprodução pré-edição com API autenticada + PostgreSQL descartável | **REPRODUZIDO**; dois casos HTTP 503. Sonda SQL separada confirmou ano zero rejeitado; harness exit 0, teardown exit 0 |
| `npm exec vitest -- run packages/db/src/index.test.ts apps/api/src/server.test.ts` | PASS; 16/16 testes; exit 0; 1 s |
| `npm run test:integration` | PASS; PostgreSQL/RLS, Redis/BullMQ e SeaweedFS reais; migrations, isolamento de tenant, idempotência, leases, cancelamento e 3 cursores × 2 rotas; PGDATA em tmpfs; teardown descartável PASS; exit 0; 39 s |
| `npm run format:check` | PASS; 113 arquivos; exit 0 |
| `npm run lint` | PASS; 113 arquivos; exit 0 |
| `npm run typecheck` | PASS; 18/18 tarefas; exit 0; 5 s |
| `npm run build` | PASS; 11/11 tarefas; exit 0 |
| `npm test` | PASS; exit 0; 94/94 unit, worker smoke, integração real e Playwright 20/20; 64 s |
| Integração real incluída em `npm test` | PASS; serviços reais e temporários, PGDATA em tmpfs, teardown PASS |
| `npm audit --audit-level=high` | PASS; zero vulnerabilidades; exit 0 |
| `git diff --check` | PASS; exit 0 |
| Quatro checks obrigatórios + SonarCloud/Socket no commit final | PENDENTE; aguardar publicação e readback do SHA hospedado exato |

Evidências de comandos desta correção estão em `/workspace/spryxel-wo008-audit/` e identificam seus comandos, exit codes e duração. O diff de produto não altera migrations, autenticação, WorkOS, proxy, layout, roles/RLS, workers ou dependências. Nenhum teste real de WorkOS/staging foi executado; os testes browser exercitam AuthKit somente pelo harness de teste. Os IDs, URLs e conclusões de todos os checks hospedados do commit final serão publicados na PR após o push; nenhum resultado anterior será reutilizado. Não houve merge ou promoção de checkpoint.

## Consolidação final — aceitação Node 22 e decisão independente (15/10/2026)

As seções de aceitação local C-05 acima registram o estado intermediário executado em Node 24.19.0. Elas são históricas e foram substituídas para a aceitação final pela execução consolidada em Node 22/npm 10, sobre o SHA exato `fe54bfac66bcb85c10d56c4c8a0c9c7526bec624`.

- Aceitação final: `.engineering/evidence/SPRYXEL-WO-008-FINAL-ACCEPTANCE.md`.
- Auditoria independente HIGH_ASSURANCE, decisão e matriz AC1–AC63: `.engineering/evidence/SPRYXEL-WO-008-INDEPENDENT-AUDIT.md`.
- Resultado Node `v22.23.3` / npm `10.9.9`: install, format, lint, typecheck 18/18, build 11/11, architecture, `npm test` (94 unitários, worker smoke, PostgreSQL/RLS + Redis/BullMQ + SeaweedFS reais, Playwright 20/20), npm audit sem vulnerabilidades e `git diff --check`: todos exit 0. Durações e logs reais estão no Evidence Bundle externo.
- Readback GitHub do exact HEAD: 7/7 check runs SUCCESS; 14/14 review threads resolvidas; ruleset ativo permite squash sem bypass.
- SonarCloud: Quality Gate PASS; 76 issues novos, 0 aceitos, 0 hotspots, cobertura nova 0.0%, duplicação 1.7%. O detalhe integral dos findings permanece `NOT_AVAILABLE` (HTTP 403); 50 annotations de GitHub são amostra parcial, não severidade Sonar. Nenhum blocker HIGH/CRITICAL foi demonstrado pela auditoria; isso não significa que os 76 foram integralmente classificados.
- Limitação LOW aceita sem ocultação: Jobs Center comunica o limite dos 50 resultados, mas não expõe navegação ao próximo cursor; a API continua bounded e paginada. WorkOS/staging real não foi exercitado.
- A auditoria independente concluiu `APPROVED` para o candidato de código. A promoção marca somente `APPROVED_PENDING_MERGE`; a conclusão `COMPLETE` requer os checks pós-merge no SHA resultante de `main`.

**STOP da aceitação final:** `SPRYXEL_WO008_FINAL_AUDIT_APPROVED_AND_PROTECTED_CLOSEOUT`.
