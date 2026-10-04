# SPRYXEL-WO-007 — Evidence Bundle

**Veredito local:** `ACCEPTANCE_PASS; EXACT_HEAD_GATES_PENDING`
**Work Order / incremento:** `SPRYXEL-WO-007` / `SPRYXEL-IMP-003`
**Risco:** `HIGH_ASSURANCE`
**Issue / PR:** [#26](https://github.com/KayzenRoot/spryxel/issues/26) / [#27](https://github.com/KayzenRoot/spryxel/pull/27)
**Base autorizada:** `main@704b17f015f2bf0021730779f94bed38c45eeae5`
**Branch:** `codex/spryxel-wo-007-imp-003-projects-shell`
**Context Lock:** `.engineering/context-locks/SPRYXEL-WO-007.json` (`FRESH` no preflight; 31/31 fingerprints críticos válidos)
**Head remoto e URLs dos checks:** publicados na descrição da PR após este Evidence Bundle; os checks listados ali devem apontar para o mesmo SHA completo final. Nenhum check de SHA anterior é reutilizado.

## Autoridade, escopo e preservação

- SPRYXEL-WO-007 estava `ADMITTED_FOR_EXECUTION`; a base, branch e repositório conferiram com o Context Lock antes da primeira mutação. O head inicial era `1a65a68bea0e71f257e7f20320707ae2a3f93552`.
- D-001…D-161, Work Order, Context Lock, checkpoint, GEF 1.1.1, `.gef`, provider WorkOS, ruleset, workflows, status contexts e source seed permaneceram intactos.
- O diff não altera `package.json` nem `package-lock.json`; não introduz dependência.
- A proposta `.engineering/checkpoint-deltas/SPRYXEL-WO-007-PROPOSED.md` continua `PROPOSED_ONLY; NOT_ACCEPTED; NOT_PROMOTED`. Nenhum checkpoint foi promovido.

## Correction-01 — harness PostgreSQL de integração

- A reprodução inicial do harness anterior terminou com Compose exit code 126 durante startup. A inspeção registrou a imagem real PostgreSQL `18.6-alpine3.24`, `PGDATA=/var/lib/postgresql/18/docker`, configuração de healthcheck, mounts, estado de container/processo e logs.
- Um probe com `PGDATA` em tmpfs Linux completou `initdb` e tornou PostgreSQL healthy; a falha subsequente identificou CRLF no shebang do init hook. O build normaliza o hook dentro da imagem de teste. O startup seguinte identificou CRLF no launcher SeaweedFS montado; somente sua cópia descartável é normalizada antes da execução.
- O serviço de integração PostgreSQL usa o mesmo PostgreSQL real e fixado, com tmpfs Linux em `/var/lib/postgresql` (384 MiB, `rw,noexec,nosuid`, UID/GID 70, modo 0700), sem volume persistente ou bind mount cobrindo `PGDATA`. A configuração foi verificada por Docker inspect e `/proc/mounts`. O PostgreSQL do perfil local `infra` segue persistente.
- Startup, diagnóstico e cleanup têm limites explícitos. Em erro, o harness captura status Compose, inspect, processos (`STAT`) e logs antes da limpeza. Cada run tem projeto Compose exclusivo; o cleanup remove apenas esse projeto e verifica ausência de containers, volumes e redes residuais.
- Regressões do harness: 3/3 PASS. A integração real executou migrations, RLS e handshakes de PostgreSQL, Redis/BullMQ e SeaweedFS S3 autenticado. Nenhum mock ou etapa de PostgreSQL/RLS/migration foi usado ou omitido.
- A suíte HIGH_ASSURANCE da baseline passou antes da primeira mutação de produto. No primeiro teste unitário houve timeout de liveness transitório (63/64); o retry sem mudanças passou 64/64.

## Implementação SPRYXEL-IMP-003

### Persistência, autorização e API

- Nova migration forward-only `0004_projects.sql`: `platform.project` com UUIDv7, tenant e criador internos, nome limitado e timestamps; tabela mínima de idempotência por sujeito/tenant/operação; referência de tenant/subject íntegra; índices necessários.
- `project` e `project_create_idempotency` usam RLS `ENABLE` + `FORCE`. Ausência de contexto nega acesso. Leitura requer associação ativa ao tenant; criação exige OWNER/ADMIN ativo e `created_by_subject_id` igual ao sujeito autenticado. `MEMBER` pode listar/ler no tenant, mas não criar. A role `spryxel_app` permanece NOBYPASSRLS e com privilégios limitados; o runtime-role proof inclui as duas tabelas novas e as cinco funções SQL de política com `EXECUTE` explícito.
- Repositório PostgreSQL aplica contexto de sujeito/tenant com `set_config(..., true)` dentro de transações, sem persistência de contexto na conexão pooled. Operações suportadas: criar, listar e obter projeto por ID.
- `POST /api/v1/projects` valida corpo e `Idempotency-Key`; armazena hashes, replay com chave/corpo iguais retorna o registro original e chave reutilizada com corpo diferente falha sem criar outro projeto. O registro e o evento são transacionais.
- `project.created` é a única extensão do contrato de evento nesta fatia. A migration vincula projeto, tenant e criador e impede eventos duplicados por projeto; não armazena credenciais nem erros brutos de provider.
- Rotas `GET /api/v1/projects`, `POST /api/v1/projects` e `GET /api/v1/projects/:projectId` passam pela autenticação existente, resolução de identidade/membership, autorização da aplicação e repository RLS. Erros retornam Problem Details seguro, com request ID; ID direto de outro tenant não revela existência.

### Shell e experiência

- Home autenticada mostra contexto, estados vazio/com projetos/degradado, ações de criar/abrir e informação recente baseada apenas em projetos autorizados. Jobs e assets aparecem como indisponíveis/estado vazio, sem dados fictícios.
- Shell global oferece Home, Projects, contexto/troca de projeto, conta/sessão, notificações explicitamente indisponíveis e affordance de busca/command. Capacidades futuras aparecem somente como não disponíveis, sem ação funcional.
- Projects implementa listagem, criação mínima, seleção/abertura e overview por ID. A overview mantém o projeto visível e declara DNA não configurado, sem persistência de DNA, assets ou jobs.
- Web usa cliente API server-side e ações de apresentação; não importa `packages/db` nem contém decisão canônica de autorização. O teste autenticado determinístico usa mecanismo exclusivo de ambiente de teste, desativado/recusado em produção; não usa tokens em localStorage/sessionStorage. A rota sem autenticação continua no edge AuthKit.
- Foram mantidos tokens de tema existentes e controles semânticos/teclado/foco, layout responsivo e estados honestos. Nenhuma dependência de produto foi adicionada.

### Arquivos e componentes

- Correção do harness: `infra/compose.yml`, `infra/postgres/Dockerfile`, `scripts/run-integration.ts`, `scripts/postgres-test-harness.test.ts`, `.engineering/correction-deltas/SPRYXEL-WO-007-CORRECTION-01.md`.
- Domínio/contratos/repositório/schema: `packages/domain/src`, `packages/contracts/src`, `packages/db/src/index.ts`, `packages/db/src/migrations/0004_projects.sql`.
- API: `apps/api/src/server.ts`.
- Web: `apps/web/app`, `apps/web/src/auth`, `apps/web/src/projects`, `apps/web/proxy.ts`, `apps/web/next.config.ts`, `apps/web/tsconfig.json`.
- Integração de testes/arquitetura: `scripts/run-integration.ts`, `scripts/architecture-guard.ts`, `scripts/architecture-guard.test.ts`, `scripts/run-browser-api.ts`, `scripts/check-architecture.ts`, `playwright.config.ts`.
- Evidência: este arquivo. Arquivos de manifest/lock, decisões, checkpoint, Context Lock, workflows, ruleset, provider e source seed não foram alterados.

## Acceptance local — Node 22 / npm 10

Ambiente oficial: Node `v22.23.3`; npm `10.9.9`.

| Verificação | Resultado |
|---|---|
| `npm ci --no-audit --no-fund` | PASS; 218 pacotes instalados do lock existente |
| `npm run format:check -- --line-ending=crlf` | PASS no checkout Windows com `core.autocrlf=true`; não reformatou o baseline |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npm run architecture:check` | PASS; inclui inspeção dos 14 arquivos da aplicação Web |
| `npm run test:unit` (via `npm test`) | PASS; 71/71 testes |
| `npm run test:worker` (via `npm test`) | PASS; worker smoke |
| `npm run test:integration` (via `npm test`) | PASS; serviços reais PostgreSQL/migrations/RLS, Redis/BullMQ e SeaweedFS S3 autenticado |
| `npm run test:browser` (via `npm test`) | PASS; Playwright 10/10 |
| `npm test` | PASS agregado em Node 22.23.3/npm 10.9.9 |
| `npm audit --audit-level=high` | PASS; 0 vulnerabilidades encontradas |
| `git diff --check` | PASS |
| GEF 1.1.1 `doctor` read-only | Comando `SUCCEEDED`; plataforma/toolchain healthy. Observação do repositório tem limites de worktree: `GIT_DIRECTORY_NOT_A_DIRECTORY`, `WORKING_TREE_NOT_OBSERVED` |
| GEF 1.1.1 `status` read-only | Comando `SUCCEEDED`; dirtiness `UNKNOWN`, drift `UNEXPECTED`; `.gef` permaneceu intacto |

A aceitação local de formatação usa apenas o parâmetro CRLF necessário ao checkout Windows. A checagem canônica Linux continua sem override no workflow e deve passar no novo exact head.

## Correção do SonarCloud no candidato

- O primeiro commit publicado, `f73606aa0f4449d50e159537dd5f4c230489d08e`, falhou no Quality Gate por `D Reliability Rating on New Code`. A análise do Sonar indicou o bug `typescript:S2871` no ordenamento do architecture checker e apontou literais repetidos classificados como críticos em `0004_projects.sql`.
- O comparador do checker agora usa `localeCompare`. A migration centraliza leitura de contexto, membership ativa, autorização OWNER/ADMIN e identificação do evento `project.created` em funções SQL explícitas, com `search_path` restrito e `EXECUTE` concedido somente a `spryxel_app`; as expressões de RLS continuam fail-closed e a integração real pós-alteração passou.
- Uma tentativa focada executada em paralelo com `npm run test:integration` colidiu nos builds do Next (`Another next build process is already running`). Essa tentativa foi descartada como evidência de acceptance. Depois a sequência completa abaixo foi executada serialmente e passou.
- A análise Sonar e os quatro required checks devem ser avaliados novamente no novo exact head; o resultado falho de `f73606a` não é reutilizado para o candidato posterior.

## Segurança, compatibilidade e limites

- Nenhuma nova dependência, provider, autorização WorkOS alternativa, tabela de billing/job/assets ou capability de produção foi introduzida.
- PostgreSQL é a fonte canônica de projetos; autenticação e membership precedem acesso; RLS continua como segunda barreira. A suíte de integração testa cross-tenant, membership/roles, idempotência concorrente, contexto ausente, runtime-role e isolamento entre conexões.
- SeaweedFS, Redis e PostgreSQL são reais no harness; SeaweedFS permanece autenticado e fixado conforme baseline.
- Existe uma thread externa menor do CodeRabbit no texto do Work Order (critério 29, cookie store AuthKit). Ela permanece sem resolução: o Work Order e seu blob fazem parte do Context Lock; editar sua redação nesta execução invalidaria a autoridade fingerprintada. Não é finding HIGH/CRITICAL e não altera comportamento de produto. Nenhuma thread foi marcada resolvida sem correção correspondente.
- GEF não observa a árvore desta worktree corretamente; por D-0007, o estado é reconciliado pelo delta Git autorizado. Não afirmamos árvore limpa observada pelo GEF.
- O executor não declara aprovação independente. A decisão de auditoria permanece externa.

## Gates remotos e encerramento

Após o push, a descrição da PR #27 registra o SHA completo final, os quatro required checks e seus IDs/URLs exatos no mesmo SHA: `Gitleaks secrets`, `Pipeline integrity`, `Repository validation`, `Trivy filesystem and configuration`. Também registra SonarCloud/Quality Gate e os outros resultados disponíveis para esse HEAD. Nenhum check de SHA anterior é aceito como evidência do candidato final.

**Checkpoint Delta:** `.engineering/checkpoint-deltas/SPRYXEL-WO-007-PROPOSED.md`, apenas proposto; não aceito nem promovido.
**Próxima fatia:** Asset Contract + durable Job backbone segue `NOT_ADMITTED`.
**Condição de parada:** `SPRYXEL_IMP_003_PROJECTS_CANONICAL_SHELL_HOME_READY_FOR_AUDIT`.

Não fazer merge. Não promover checkpoint. Não iniciar incremento posterior.
