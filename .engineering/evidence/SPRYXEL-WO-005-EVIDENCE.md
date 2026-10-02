# SPRYXEL-WO-005 R2 — Evidence Bundle

**Estado:** candidato para auditoria objetiva; executor não aprova nem promove o checkpoint.

**Data:** 2026-10-02

## Correction Delta 02 — C-09/C-10

Esta correção partiu exatamente de `10fb53aa62974e877f358287eb2ac577e5e8c451`, na PR #20/branch R2, com Context Lock `FRESH`, base `main@31e6aec13bcc427ec8449d68da1a420979488b06` e 24/24 fingerprints críticos correspondentes. O Work Order blob e o ledger D-001…D-155 continuam iguais às fontes fixadas; nenhuma decisão, checkpoint, `.gef`, dependência, workflow, ruleset/provider, SeaweedFS ou source seed foi alterado por este delta.

- **C-09:** verificação pós-cleanup agora usa `SCAN` com cursor, `MATCH bull:${name}:*` e `COUNT 100`. Avança página a página, para no primeiro resultado e preserva a ordem de cleanup, wrapper best-effort, deadline global e erro existente. A regressão focada prova o escopo do padrão, parada no primeiro resíduo, duas páginas no máximo e zero chamadas a `KEYS`. A integração executada contra Redis real repetiu o probe duas vezes; ambas terminaram sem chaves no namespace descartável.
- **C-10:** o wording do registro pós-push foi corrigido para presente. Ele continua apontando a descrição da PR como o registro pós-push de HEAD/checks/threads e declara que checks de SHAs anteriores não são reutilizados. IDs/URLs permanecem na descrição da PR; não são duplicados aqui.

### Revalidação da Correction Delta 02

Runtime local: Node `24.19.0` / npm `11.17.0`; nenhuma dependência foi instalada ou alterada. Resultados no código desta correção:

| Comando | Resultado observado |
| --- | --- |
| Regressão focada `vitest run apps/worker/src/queue-probe.test.ts` | PASS, 1 arquivo / 2 testes; nenhum `KEYS`, parada no primeiro resíduo |
| `npm run format:check` | PASS, 71 arquivos |
| `npm run lint` | PASS, 71 arquivos, nenhum finding |
| `npm run typecheck` | PASS, 16/16 tarefas Turbo |
| `npm run build` | PASS, 10/10 workspaces; Next build e prerender PASS |
| `npm run architecture:check` | PASS, 10 workspaces/11 arestas; varreu 4 arquivos em `apps/web/app` |
| `npm run test:unit` | PASS, 12 arquivos / 23 testes |
| `npm run test:worker` | PASS, processo separado e zero product consumers |
| `npm run test:integration` | PASS com PostgreSQL, Redis e SeaweedFS reais; duas probes BullMQ repetidas sem chaves residuais e teardown descartável concluído |
| `npm run test:browser` | PASS, 4/4. Uma primeira tentativa expirou aguardando readiness Next em 120 s; sem mudar código/configuração, o servidor local respondeu HTTP 200 e a repetição no comando configurado passou. |
| `npm test` | PASS agregado: unit 23/23, worker, integração real e browser 4/4 |
| `npm audit --audit-level=high` | PASS, 0 vulnerabilidades |
| `git diff --check` | PASS |
| GEF 1.1.1 `doctor` / `status` | Ambos PASS read-only, `effect=NONE`; observações atuais abaixo. Nenhuma escrita em `.gef` ou checkpoint. |

O `doctor` reportou toolchain/repositório saudáveis, proveniência de dependências e GitHub `REVIEW`. A leitura `status` durante a edição reportou árvore `DIRTY`; a leitura pós-commit reportou `CLEAN`. Em ambas, `operator.stale=true` e drift `UNEXPECTED` face ao checkpoint ainda em WO-004. Conforme D-0007, isso permanece diagnóstico bruto; o delta está delimitado por Work Order, Context Lock, diff e Evidence Bundle, sem reescrever GEF baseline. Nenhuma reconciliação foi gravada.

## Correction Delta 01 — reauditoria

Esta seção atualiza e, para C-01, **substitui explicitamente** a afirmação anterior de que `architecture:check` já cobria o App Router. A correção começou no HEAD exato `a3dd49d720a18e5e415eaa51c1ff686f8df7d76d`; base mantida em `main@31e6aec13bcc427ec8449d68da1a420979488b06`. Context Lock R2 permaneceu `FRESH`; os 24 fingerprints críticos e D-001…D-155 foram reconferidos. O diff limita-se aos oito findings C-01…C-08, regressions, harness de integração e esta evidência. Nenhuma alteração foi feita em decisões, checkpoint, `.gef`, GEF, dependências/manifests, workflows, ruleset/provider ou source seed.

### Findings e regressions

- **C-01:** o architecture checker percorre a árvore fonte inteira de cada workspace e exclui diretórios gerados/vendor. `scripts/check-architecture.test.ts` injeta import proibido em `apps/web/app/page.tsx` e confirma a falha; a execução real reportou `Scanned @spryxel/web app source files: 4` e PASS para 10 workspaces/11 arestas, sem ciclos.
- **C-02:** o parser RESP separa linhas completas do fragmento TCP pendente. `apps/api/src/redis-probe.test.ts` fragmenta respostas autenticadas `+OK`/`+PONG` entre eventos e confirma o round-trip.
- **C-03:** o probe BullMQ aplica um deadline único a readiness, add, conclusão e limpeza; o timeout força a desconexão dos clientes Redis/BullMQ próprios. `apps/worker/src/queue-probe.test.ts` prova retorno dentro do limite e fechamento dos sockets contra um servidor Redis que nunca responde.
- **C-04:** a limpeza encerra Worker e QueueEvents, executa `obliterate({force:true})` com a conexão da Queue disponível e verifica ausência de chaves antes de fechar Queue/conexões; falhas de limpeza não escondem a falha original. A integração repete o probe duas vezes contra Redis real e termina sem chaves do namespace técnico.
- **C-05:** `getMigrationStatus` reconhece a ausência da tabela e retorna migrations não aplicadas, mantendo a comparação de checksum quando a tabela existe. A integração PostgreSQL consulta o banco descartável pristine antes da primeira migration e verifica `applied=false`.
- **C-06:** o tema salvo/preferido é aplicado por um script estático local, síncrono e sem código inline, colocado no `<head>` antes do primeiro quadro. Playwright verifica tema persistido após reload, fallback `prefers-color-scheme` no primeiro frame e ausência de warnings de hidratação.
- **C-07:** leituras/escritas de localStorage são protegidas; DOM e estado React atualizam mesmo se o browser lança `SecurityError`. Playwright confirma que o toggle continua funcional sem persistência.
- **C-08:** o fechamento da API captura rejeição, registra somente erro estruturado sanitizado e retorna exit code não zero. `apps/api/src/shutdown.test.ts` cobre falha, ausência de vazamento da mensagem e fechamento normal.

### Suíte e ambiente da correção

A admissão/preflight anterior à instalação permanece conforme a seção acima (Node 22/npm 10). A execução local desta revalidação ocorreu no runtime disponível do host, Node `24.19.0` / npm `11.17.0`; não houve instalação ou alteração de dependências nesta correção. O candidato foi validado assim:

| Comando | Resultado observado |
| --- | --- |
| `npm run format:check` | PASS, 71 arquivos |
| `npm run lint` | PASS, 71 arquivos, nenhum finding |
| `npm run typecheck` | PASS, 16/16 tarefas Turbo |
| `npm run build` | PASS, 10/10 workspaces; Next build e prerender PASS |
| `npm run architecture:check` | PASS; inclui 4 arquivos `apps/web/app`, 10 workspaces e 11 arestas internas |
| `npm run test:unit` | PASS, 12 arquivos e 22 testes |
| `npm run test:worker` | PASS em processo Node separado; zero product consumers |
| `npm run test:integration` | PASS com PostgreSQL/Redis/SeaweedFS reais em Compose descartável; pristine migration status, migration/idempotência, S3 autenticado e anônimo negado, dois probes BullMQ sem chaves, API health/readiness e teardown |
| `npm run test:browser` | PASS, 4/4; primeiro frame, reload, preferência do sistema, sem warnings de hidratação, storage bloqueado e shell/teclado |
| `npm test` | PASS agregado: unit, worker, integração e browser |
| `npm audit --audit-level=high` | PASS, `found 0 vulnerabilities` |
| `git diff --check` | PASS, sem erro de whitespace |
| GEF 1.1.1 `doctor` / `status` | Leitura `effect=NONE`; estado pós-diff documentado abaixo. `.gef` e checkpoint não foram reconciliados nem escritos. |

O `architecture:check` antigo do HEAD auditado está supersedido: a evidência atual prova a fixture de falha sob `apps/web/app` e a varredura real de quatro arquivos. O HEAD final, IDs/URLs dos quatro required checks no SHA exato e estado das review threads estão registrados na descrição atualizada da PR #20; checks de SHAs anteriores não são reutilizados.

### Estado GEF observado na revalidação

`gef doctor` terminou com sucesso read-only e toolchain/repositório observáveis saudáveis; proveniência de dependências/GitHub continua em `REVIEW`, sem remediação. `gef status` terminou como leitura e reportou árvore `DIRTY`, `operator.stale=true` e drift `UNEXPECTED`, compatíveis com execução ainda não incorporada/promovida contra checkpoint de WO-004. Isso supersede a classificação `BLOCKED/MISSING_HEAD` registrada no relato histórico abaixo. Nenhuma linha de base `.gef` ou checkpoint foi alterada.

## Identificação e autoridade

- Repositório: `KayzenRoot/spryxel`.
- Work Order / incremento: `SPRYXEL-WO-005` / `SPRYXEL-IMP-001`.
- Issue / PR / branch: [#17](https://github.com/KayzenRoot/spryxel/issues/17) / [#20](https://github.com/KayzenRoot/spryxel/pull/20) / `codex/spryxel-wo-005-imp-001-platform-foundation-r2`.
- Base exata: `main@31e6aec13bcc427ec8449d68da1a420979488b06`.
- HEAD observado na admissão: `f2c99ee7ab6e6e20212277b4a899fecc692743a9`.
- Context Lock `.engineering/context-locks/SPRYXEL-WO-005.json`: `FRESH`, R2, branch e issue corretas; Work Order blob `6d436483a78e3aa76492d16e03bdfdc7fca177ea`; ledger baseline `baededa4e20737851e2ed2100e6bafccd2f4699d`.
- Fingerprints críticos comparados à base exata: **24/24**. Decisões `D-001…D-155`: 155 IDs presentes uma vez cada, sem lacunas; ledger permanece byte a byte igual à base.
- Identidade GEF preservada: `@gef-bootstrap/cli@1.1.1`, `.gef/init-state.json` `productVersion=1.1.1`, lockfile `1.1.1`. Nenhuma edição em `.gef` ou nos arquivos GEF.
- `gh` autenticado como `KayzenRoot`; `permissions.admin=true`. PR #20 observada aberta, base `main`, head de admissão na branch autorizada.
- Ruleset `24340349` lido antes da publicação: `active`, somente `main`, sem bypass e com resolução de threads obrigatória. Os quatro contexts continuam sendo `Repository validation`, `Pipeline integrity`, `Gitleaks secrets` e `Trivy filesystem and configuration`, todos via GitHub Actions (`integration_id=15368`). Nenhuma mutação de provider, ruleset, workflow ou context foi feita.
- A admissão R1/PR #18 não foi usada: permanece encerrada e seu Context Lock está `STALE`. R2/PR #20 é a única autoridade de execução.

## Preflight anterior à instalação

O preflight foi concluído sobre manifests/lock candidate antes de `npm ci`. O runtime foi Node `22.23.3` (checksum oficial verificado) e npm `10.9.9`; o lock é npm v3, tem um único root `package-lock.json`, dez workspaces e versões diretas exatas. `npm ci --ignore-scripts --no-audit --no-fund` depois concluiu com exit 0 sem executar lifecycle scripts. A resolução de peers/engines foi conferida nos manifests oficiais e validada pelo install, typecheck e builds.

### Dependências diretas externas

| Pin exato | Owner | Razão única nesta fatia | Licença declarada |
| --- | --- | --- | --- |
| `@biomejs/biome@2.5.15` | root/toolchain | format e lint | MIT OR Apache-2.0 |
| `@playwright/test@1.63.0` | root/testes | browser smoke da shell | Apache-2.0 |
| `@types/node@22.20.5` | root/toolchain | tipos Node | MIT |
| `@types/react@19.3.0` | root/toolchain | tipos React | MIT |
| `@types/react-dom@19.3.0` | root/toolchain | tipos React DOM | MIT |
| `tsx@4.23.15` | root/scripts | execução dos scripts TypeScript delimitados | MIT |
| `turbo@2.11.6` | root/workspaces | grafo de tarefas de workspace | MIT |
| `typescript@6.0.3` | root/toolchain | compilação e typecheck | Apache-2.0 |
| `vite@8.3.2` | root/testes | peer engine exato do runner Vitest | MIT |
| `vitest@5.0.3` | root/testes | testes unitários determinísticos | MIT |
| `@aws-sdk/client-s3@3.1145.0` | `apps/api` | adapter S3 compatível privado | Apache-2.0 |
| `fastify@5.12.5` | `apps/api` | processo HTTP e health/readiness | MIT |
| `next@16.3.8` | `apps/web` | shell App Router | MIT |
| `react@19.3.0`, `react-dom@19.3.0` | `apps/web`; peer de `packages/ui` | renderização da shell e primitive acessível | MIT |
| `@tailwindcss/postcss@4.3.3`, `tailwindcss@4.3.3` | `apps/web` | utilitários sobre os tokens canônicos | MIT |
| `bullmq@6.3.11`, `ioredis@6.0.0` | `apps/worker` | round-trip técnico Redis/BullMQ sem consumers de produto | MIT |
| `zod@4.6.5` | `packages/contracts` | schemas runtime compartilhados | MIT |
| `drizzle-orm@0.45.3`, `pg@8.23.1`, `@types/pg@8.23.1` | `packages/db` | conexão PostgreSQL e migration harness tipados | Apache-2.0; MIT; MIT |
| `@opentelemetry/api@1.9.1`, `pino@10.3.1` | `packages/observability` | interface de tracing e logging JSON/redaction | Apache-2.0; MIT |
| `@radix-ui/react-slot@1.3.3` | `packages/ui` | composição acessível do botão base | MIT |

Os workspaces `@spryxel/*` são código local versionado como `0.0.0`; suas arestas estão limitadas pelo allowlist/cycle checker. `@gef-bootstrap/cli@1.1.1` é o pin de governança preexistente, preservado e fora da seleção de dependências de produto.

Segurança de dependências: `npm audit --audit-level=high` retornou `found 0 vulnerabilities` (zero INFO/LOW/MODERATE/HIGH/CRITICAL na auditoria do lock completo). Versões exatas, owners e licenças acima foram lidas dos manifests exatos instalados, que correspondem ao lock preflightado. O Node mínimo declarado pelos pacotes de runtime é compatível com Node 22; instalação, typecheck e builds de todas as 10 workspaces passaram.

### SeaweedFS e serviços locais

- SeaweedFS upstream `4.48`, release de 2026-09-28, commit `530be3e37337488ecc34d58441e0bc476e121c93`; repositório/release ativos na data do preflight. Referências primárias: [release 4.48](https://github.com/seaweedfs/seaweedfs/releases/tag/4.48), [Docker release guidance](https://github.com/seaweedfs/seaweedfs/blob/4.48/docker/README.md), [licença](https://github.com/seaweedfs/seaweedfs/blob/4.48/LICENSE) e [security advisories](https://github.com/seaweedfs/seaweedfs/security/advisories).
- Compose fixa `chrislusf/seaweedfs:4.48@sha256:4e61d15fd35994cb1e43e1e553dff106794841fd9a99ade2fc8c8bfce4d7872d` (manifest multiarch imutável). `weed version` confirmou `4.48`, commit e `linux amd64`.
- Cosign `v3.1.3` oficial teve checksum verificado. Verificação keyless da assinatura do digest passou com issuer `https://token.actions.githubusercontent.com` e identity da workflow oficial `seaweedfs/seaweedfs/.github/workflows/container_release_unified.yml@refs/tags/4.48`; claims e transparency log foram validados. A API de Artifact Attestation não é o mecanismo de proveniência usado por este release; a assinatura/proveniência oficial Cosign foi a evidência aprovada.
- Licença upstream do SeaweedFS: Apache-2.0. O scan de licença da imagem também observou componentes Alpine GPL/LGPL; a imagem fica restrita a infra/test local e não é redistribuída pelo projeto.
- Advisories oficiais publicados foram comparados às versões afetadas: os limites observados terminam em `4.45` ou anterior, incluindo `4.43–4.44`; SeaweedFS `4.48` está fora dessas faixas. Isso não substitui o scan de imagem atual.
- Trivy `0.75.0`, DB de 2026-10-02: SeaweedFS por digest = **0 HIGH / 0 CRITICAL**; residual identificado: 1 MEDIUM (`CVE-2026-58055`, `nghttp2-libs 1.69.0-r0`, corrigido em `1.70.0-r0`) e 1 advisory Go `UNKNOWN` (`GO-2026-5932`, `golang.org/x/crypto/openpgp`). Os dois são registrados como limitações de infra local/test; nenhum HIGH/CRITICAL permaneceu.
- Redis local/test: `redis:8.10.2-alpine@sha256:3811787313eba226a2ef38658c6ccb91cd5e110edc89c37767de373120a0e5a0`, release atual verificada, licença declarada RSALv2/SSPLv1/AGPLv3, não redistribuído; Trivy encontrou 0 HIGH/CRITICAL.
- PostgreSQL local/test usa base `postgres:18.6-alpine3.24@sha256:77f585114c32fbca283dc835b0596f4e52b51b4c6662d7810b2f4084f60a1873`. A imagem de teste deriva apenas desta base, remove `gosu` não usado e executa como `postgres`; Trivy na imagem construída = 0 HIGH/CRITICAL. O teste real confirmou a conexão com a role isolada `spryxel`.
- Redis e SeaweedFS aceitam somente credenciais aleatórias geradas em runtime. SeaweedFS usa identidade S3 com segredo em arquivo temporário `0400`; acesso anônimo recebe `401/403`. Nada disso é uma seleção de provider de produção.
- Portas publicadas são loopback-only. A rede bridge padrão é necessária para as aplicações host alcançarem as portas publicadas no Docker desta plataforma; serviços e dados locais/test não são produção. GPU continua ausente/desligada.

## Paths da mudança

- Root: `.gitignore`, `README.md`, `package.json`, `package-lock.json`, `biome.json`, `turbo.json`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.env.example`.
- Aplicações: `apps/web` (shell/tokens sem estado de produto), `apps/api` (Fastify e health/readiness), `apps/worker` (processo técnico sem consumers de produto).
- Pacotes compartilhados: `packages/contracts`, `domain`, `db`, `config`, `observability`, `ui`, `testkit`.
- Infra/scripts: `infra/compose.yml`, `infra/postgres/Dockerfile`, `infra/seaweedfs/start.sh`, `scripts/*`.
- Artefatos de evidência deste Work Order: este arquivo e `.engineering/checkpoint-deltas/SPRYXEL-WO-005-PROPOSED.md`.
- `apps/web/AGENTS.md`, `apps/web/CLAUDE.md` e `apps/web/next-env.d.ts` foram gerados pelo Next.js; o build incremental `*.tsbuildinfo` permanece ignorado.

Não há diff em `.gef`, GEF-managed state, checkpoint, Decisions Ledger, Context Lock/Work Order, source seed, `.github/workflows`, ruleset ou provider. O único SQL cria o schema técnico `platform`; o runner mantém a tabela técnica de migrações. Não há auth, signup/session, tenant/project/member, billing/pagamentos/créditos/wallet/ledger, TrustShield, assets/generation/jobs/QA/export, IA/model/GPU, procurement ou provider de produção. MinIO não é usado.

## Verificações executadas

Todas as verificações locais abaixo foram executadas no candidato de código deste PR antes do commit de evidência, sem alterações posteriores em código de produto:

| Comando/área | Resultado observado |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS, exit 0, Node 22/npm 10 exatos |
| `npm audit --audit-level=high` | PASS, `found 0 vulnerabilities` |
| `npm run format:check` | PASS, 65 arquivos Biome; `next-env.d.ts` gerado é excluído |
| `npm run lint` | PASS, 65 arquivos, nenhum finding |
| `npm run typecheck` | PASS, 16/16 tarefas Turbo |
| `npm run build` | PASS, 10/10 workspaces; Next prerenderizou `/` e `/_not-found` |
| `npm run architecture:check` | PASS: 10 workspaces, 11 arestas internas, zero ciclos/deep-imports/persistência proibida/tabelas de produto |
| `npm run test:unit` | PASS: 8 arquivos, 17/17 testes |
| `npm run test:worker` | PASS em processo Node separado; `productConsumers=0` |
| `npm run test:integration` | PASS: handshake PostgreSQL/Drizzle; migração aplicada, repetida e status idempotente; somente tabela técnica; Redis autenticado + BullMQ round-trip; SeaweedFS S3 assinado List/Create/Put/Get/Delete; anônimo negado; `/healthz` e `/readyz` com 3 adapters prontos e sem segredo; containers/volumes aleatórios removidos |
| `npm run test:browser` | PASS: Playwright/Chromium, 1/1 shell smoke, teclado/tema/focus |
| `npm test` | PASS agregado: unit, worker, integração real e browser smoke |
| `npm run gef:doctor` | PASS, read-only `effect=NONE`, GEF 1.1.1; relatório inclui estado `REVIEW` para proveniência GEF não verificada/ref imutável, sem mutação autorizada |
| `npm run gef:status` | PASS como leitura, mas reporta `operator.stale=true`, `repository=BLOCKED/MISSING_HEAD`, árvore observada dirty e drift `UNEXPECTED`; isso reflete candidato local não promovido/checkpoint ainda em WO-004. `.gef` e checkpoint não foram reconciliados por escrita. A autoridade de execução e o delta autorizado são este Work Order/Context Lock e o diff mapeado acima. |
| `git diff --check` | PASS, sem erro de whitespace |

O teste de integração falhou inicialmente enquanto a rede Compose era `internal` (o host não alcançava as portas publicadas); essa rede foi corrigida para bridge e o endpoint IAM administrativo desnecessário do SeaweedFS foi desativado. O teste completo foi repetido e passou. A integração mantém os serviços em projeto aleatório, credenciais aleatórias, portas efêmeras e teardown `down --volumes`.

### Checks obrigatórios no candidato final

O SHA candidato final, os IDs/URLs e estados dos quatro required checks após o push estão registrados na descrição pós-push da [PR #20](https://github.com/KayzenRoot/spryxel/pull/20). Eles qualificam somente o `headRefOid` exato indicado ali; verificações anteriores ao commit não são reutilizadas.

## Riscos, checkpoint e conclusão

- Risco conhecido: findings MEDIUM/UNKNOWN no SeaweedFS são limitados ao serviço local/test selecionado e permanecem registrados; HIGH/CRITICAL = 0 nos scans de dependências/imagens realizados. A bridge Docker tem egress padrão; serviços continuam publicados só em loopback e não têm dados de produto.
- Preço continua `NOT_FROZEN`; benchmark/COGS não executado; providers de produção não selecionados. Não implementar Identity/Tenancy faz parte da fronteira desta fatia.
- Checkpoint canônico continua em `SPRYXEL_WO_004_COMPLETE`; nenhuma promoção ou merge foi feito pelo executor. Delta conceitual está em `.engineering/checkpoint-deltas/SPRYXEL-WO-005-PROPOSED.md`.
- PR #20 permanece aberta para auditoria. O HEAD exato/checks/URLs estão na descrição da PR, que é a evidência pós-push para o commit versionado.

**STOP CONDITION:** `SPRYXEL_IMP_001_PLATFORM_FOUNDATION_BOOTSTRAP_READY_FOR_AUDIT`.
