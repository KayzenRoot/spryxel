# SPRYXEL-WO-006 / SPRYXEL-IMP-002 — Evidence Bundle

**Estado:** C-09 e C-10 Path B implementados; acceptance HIGH_ASSURANCE local em Node 22/npm 10 concluída. Os required checks do novo exact final head serão registrados após o push. Não declara aprovação, merge ou promoção.

**Data:** 2026-10-02

## Identidade, autoridade e estado exato

- Repositório: `KayzenRoot/spryxel`; issue #23; PR #24; branch `codex/spryxel-wo-006-imp-002-identity-tenancy`.
- Work Order: `SPRYXEL-WO-006`; incremento: `SPRYXEL-IMP-002`; risco `HIGH_ASSURANCE`.
- Início desta execução de correção: `e25fab988246ce7348cafca7a29b794dbb5ada06`, conforme instrução do executor. O arquivo Correction-01 identifica `f51b5a5f3fee9de74a4e635f3212f8797f384752` como o candidato auditado anteriormente; nenhum check desse SHA é reaproveitado.
- Base imutável da Work Order: `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`.
- Context Lock conferido antes das alterações: `FRESH`; `27/27` fingerprints críticos; D-001…D-161 preservadas; Work Order, branch e base conferidos.
- GEF pin: `@gef-bootstrap/cli@1.1.1`, source SHA `1dc030f1358eab0347043a3d54c7fc311c7c2123`.
- Ruleset `24340349`, provider, workflows, required contexts, source seed, `.gef`, ledger e checkpoint canônico permanecem inalterados.
- O HEAD final e os quatro checks GitHub com IDs/URLs exclusivos desse HEAD constam na seção pós-push da descrição da [PR #24](https://github.com/KayzenRoot/spryxel/pull/24), que é o registro autoritativo para evidência gerada após publicar o SHA. Nenhum resultado de SHA anterior é herdado.

## Preflight HIGH_ASSURANCE

O preflight foi feito antes de `npm ci`. A instalação limpa inicial usou Node `22.23.3` e npm `10.9.9`; engines e peers exigem Node `>=22.11.0`. O primeiro run de validações foi feito em Node `24.19.0`/npm `11.17.0`, mas não conta como acceptance run. A acceptance run oficial exigida pelo Correction Delta 02 foi executada em Node `22.23.3`/npm `10.9.9` e está registrada integralmente na seção própria abaixo. Pins, peer ranges, licenças e advisories foram conferidos sem instalar versões beta.

| Dependência direta | Pin / licença | Compatibilidade verificada | Owner e justificativa arquitetural |
| --- | --- | --- | --- |
| `@workos-inc/authkit-nextjs` | `4.4.0` / MIT | Node `>=22.11.0`; Next `^13.5.9 \|\| ^14.2.26 \|\| ^15.2.3 \|\| ^16`; React 18/19; peer oficial de `@workos-inc/node` aceita 9/10 | `apps/web`: PKCE, state/CSRF, callback e cookie de sessão no edge oficial App Router |
| `@workos-inc/node` | `10.14.0` / MIT | Node `>=22.11.0`; faixa peer oficial compatível com AuthKit selecionado | `apps/api`: JWKS/session adapter e peer do edge AuthKit |
| `jose` | `6.2.12` / MIT | WebCrypto/API compatíveis com Node 22; sem peer conflitante | `apps/api`: assinatura JWT, issuer, audience, exp e nbf |
| `uuid` | `14.0.2` / MIT | Node 22; UUIDv7 para IDs internos opacos | `packages/db`: emitir IDs internos de identidade, tenant e evento |

O major 11 de `@workos-inc/node` não foi usado porque não atende ao peer range publicado pelo AuthKit fixado. A combinação permanece WorkOS/AuthKit, sem troca de provider. Produção exige informação de cobrança e confirmação dos termos comerciais; a configuração de `aud` para o resource server deve ser aplicada ao token template. PKCE e validação state/CSRF permanecem no SDK oficial. Não havia credencial staging para smoke real.

Fontes oficiais revistas em 2026-10-02: [pricing](https://workos.com/pricing), [produção](https://workos.com/docs/authkit/environments), [sessões](https://workos.com/docs/authkit/sessions), [API de sessões e cursores](https://workos.com/docs/reference/authkit/session), [MFA](https://workos.com/docs/authkit/mfa), [reauthentication/auth_time/max_age](https://workos.com/docs/authkit/reauthentication), [SDK Next.js](https://workos.com/docs/sdks/authkit-nextjs), [SDK Node](https://workos.com/docs/sdks/node) e [verificação JWT/JWKS](https://workos.com/blog/verify-workos-access-tokens-in-your-own-api).

## Correction Delta — C-01…C-08

| Finding | Correção e prova |
| --- | --- |
| C-01 / C-05 — papel PostgreSQL e pool | A API cria um único pool runtime compartilhado; valida o papel uma vez antes do bind/listen e fecha o pool pelo lifecycle Fastify. Só `spryxel_app` com privilégios mínimos, sem superuser/BYPASSRLS/membership privilegiado/ownership incompatível, passa. URL privilegiada/de migration é recusada antes de servir; `spryxel_app NOBYPASSRLS` inicia. O teste PostgreSQL reutiliza conexão e confirma que GUCs RLS locais a transação não vazam para a transação seguinte. |
| C-02 — fronteira WorkOS | O checker usa AST TypeScript e detecta import/export estático, side-effect import, `import()`, `require`, `module.require`, `require.resolve` e alias de `createRequire`. Fixtures negativas exercitam as formas não autorizadas e comentários/strings não viram falso positivo; os edges admitidos permanecem allowlisted. |
| C-03 — JWT/JWKS | Somente códigos de token/JWS inválido e ausência de chave correspondente viram `401 invalid_access_token`. Erro de rede, timeout ou infraestrutura/JWKS propaga para `503 authentication_unavailable`, com corpo sem detalhe do provider. Há teste direto de `verifyWorkOSAccessToken` para ambas as classes. |
| C-04 — revogação e auditoria | Identidade e suspensão são verificadas antes do provider; sessão é provada como ativa e pertencente ao usuário antes do revoke. Suspensão responde `403` sem efeito externo. Se apenas a gravação posterior do projection `session.revoked` falhar após confirmação do provider, o resultado continua `204` e o logger registra evento error-level distinto, com IDs internos/tipo seguro e sem erro bruto, token ou referência de sessão. |
| C-06 — paginação de sessões | O adapter usa cursor `listMetadata.after`, 100 sessões por página, no máximo 10 páginas/1.000 sessões, deadline total de 5 s e proteção contra cursor repetido. Listagem incompleta falha fechada e não revoga. Testes cobrem alvo na segunda página, limite e deadline. |
| C-07 — prova de autenticação forte | `auth_time` continua baseado no contrato WorkOS e respeita janela de `max_age`. `amr` livre/inventado é ignorado e não produz MFA verificado. Sem sinal WorkOS confiável documentado para o fluxo, o gate de ação sensível continua negando por falta de MFA e a política MFA/SSO de produção fica como gate explícito; D-083/D-160 não foram enfraquecidas. |
| C-08 — evidência | A tabela Markdown escapa os pipes literais nos peer ranges. O HEAD e os IDs/URLs pós-push são registrados na descrição da PR, que evita uma referência circular no commit versionado e não usa checks anteriores. |

O contrato oficial documenta `auth_time` e `max_age` para reautenticação. A documentação de MFA informa que a política MFA hospedada não se aplica a usuários SSO; portanto não se presume equivalência MFA por `amr` nem se permite ação sensível sem sinal verificado. Antes de produção deve existir política aprovada que prove MFA em cada fluxo autorizado, inclusive SSO.

## Arquivos e fronteiras alterados

- API/JWT/sessão: `apps/api/src/main.ts`, `apps/api/src/server.ts`, adapters WorkOS/PostgreSQL e regressões focadas.
- DB runtime: `packages/db/src/index.ts` e regressões do pool/papel.
- Architecture enforcement: `scripts/check-architecture.ts` e fixtures negativas.
- Integration harness: `scripts/run-integration.ts` inicia PostgreSQL antes de Redis/SeaweedFS para evitar contenção durante a inicialização; os testes seguem usando PostgreSQL, Redis e SeaweedFS reais, sem simulação.
- C-09 acrescenta a migração `packages/db/src/migrations/0003_session_revocation_reconciliation.sql` e usa `apps/api/src/server.ts`, `apps/api/src/server.test.ts`, adapters WorkOS, `packages/db/src/index.ts`, `packages/identity/src/index.ts` e `scripts/run-integration.ts` para intent durável, retry e finalização idempotente.
- Evidência: este bundle. `D-001…D-161`, manifests/lockfile, provider, `.gef`, GEF, workflows, ruleset, seed e checkpoint não fazem parte da correção.
- Nenhum Project/Product Shell ou slice posterior foi iniciado.

## Validações locais históricas — run prévio em Node 24

| Validação | Resultado observado nesta correção |
| --- | --- |
| Regressões focadas C-01…C-08 | PASS — 6 arquivos, 28 testes. |
| `npm run format:check` | PASS — 84 arquivos; sem alterações. |
| `npm run lint` | PASS — 84 arquivos; sem findings. |
| `npm run typecheck` | PASS — 18 tarefas. |
| `npm run build` | PASS — 11 workspaces. |
| `npm run architecture:check` | PASS — 11 workspaces, 13 edges, sem ciclos; 8 fontes em `apps/web/app` examinadas. |
| `npm run test:unit` | PASS — 15 arquivos / 48 testes. |
| `npm run test:worker` | PASS — smoke em processo Node separado; sem consumidores de produto. |
| `npm run test:integration` | PASS — PostgreSQL real: migrations/idempotência, startup privilegiado recusado antes do bind, `spryxel_app NOBYPASSRLS` aceito, pool API compartilhado, isolamento do contexto RLS, bootstrap concorrente, limites cross-tenant, eventos seguros; Redis/BullMQ autenticado; SeaweedFS S3 autenticado; health/readiness e teardown. |
| `npm run test:browser` | PASS — Playwright 7/7; rotas AuthKit, CSRF/PKCE, sign-out e armazenamento sem tokens. |
| `npm test` | PASS — 48 unitários, worker, integração real e Playwright 7/7. Nesta máquina, a execução agregada usou temporariamente a porta local `41871` porque `127.0.0.1:3100` pertencia ao servidor do projeto separado `D:\Projects\goodz-menu`; a configuração foi restaurada depois. Asserções e código de teste não foram alterados. |
| `npm audit --audit-level=high` | PASS — zero vulnerabilidades. |
| `git diff --check` | PASS após revisar o diff e antes do commit. |
| GEF 1.1.1 `doctor/status` | Duas leituras read-only e seu estado bruto descritos abaixo, sem editar `.gef`. |

## GEF / D-0007

`gef doctor --target . --json`: terminal `SUCCEEDED`, read-only; Node/platform/Git `HEALTHY`; `repository.observable=FINDING`; limites `GIT_DIRECTORY_NOT_A_DIRECTORY` e `WORKING_TREE_NOT_OBSERVED`. Duas leituras `gef status --target . --json` tiveram o mesmo `statusDigest` (`113b1bab4bf8ed942123aa11f6e7f2d3f2d394f30542922254666b6cae04673a`): estado read-only, `dirtiness=UNKNOWN`, `operator.stale=true`, drift bruto `UNEXPECTED` (`before=8e6af789ede5f95e3a8022d8e084f3775da9d76b940fd83ca8d8c6f30e541954`, `after=dbe81ee345172e46a3f494ff7511e4df3568fa79d8996341184b09d259db4fe0`). O checkpoint continua declarando Identity/Tenancy `NOT_ADMITTED` até sua promoção autorizada. D-0007 exige preservar a limitação e reconciliar com a Work Order/diff autorizados; não foi editado `.gef`, checkpoint, receipts ou baseline, nem aplicada remediação.

No Windows deste executor, `core.autocrlf=true`; Biome exigiu LF no checkout local. Após `format:check` PASS, os arquivos sem mudança semântica fora da lista de escopo foram restaurados para o estado versionado. O commit de correção contém apenas os caminhos semânticos listados acima, sem normalização ampla de arquivos.

## Correction Delta 02 — acceptance run oficial em Node 22/npm 10

Esta é a acceptance run oficial de runtime para HIGH_ASSURANCE. O checkout estava no exact head `09f393314c0426c6149815d4ecfcd4c8ea7e9a40` durante todas as execuções. Node `v22.23.3` e npm `10.9.9` foram verificados com `node --version` e `npm --version`; a distribuição [oficial Windows x64 Node.js v22.23.3](https://nodejs.org/en/download/archive/v22.23.3), arquivo `node-v22.23.3-win-x64.zip`, teve SHA-256 `2b0ff57b049cda1bbcea2240eec20467018713c1efe1f7360c2681859b90ed71`, igual ao checksum publicado pelo Node.js. O binário ficou em diretório temporário fora do repositório. O head `09f3933` contém o Correction Delta 02 e não alterou produto ou dependências.

| Validação — Node 22.23.3 / npm 10.9.9 | Resultado da acceptance run oficial |
| --- | --- |
| `npm ci --no-audit --no-fund` | PASS — instalação limpa; 218 pacotes adicionados; manifests/lockfile sem alteração. |
| `npm run format:check` | PASS — 84 arquivos. No Windows, a primeira leitura com `core.autocrlf=true` apontou somente finais CRLF; após normalização temporária para LF o check passou. `git diff --ignore-space-at-eol` confirmou ausência de mudanças semânticas e os arquivos foram restaurados ao estado do checkout antes da atualização desta evidência. |
| `npm run lint` | PASS — 84 arquivos. |
| `npm run typecheck -- --force` | PASS — 18/18 tarefas executadas, sem resultados Turbo em cache. |
| `npm run build -- --force` | PASS — 11/11 workspaces executados, sem resultados Turbo em cache; Next compilou e gerou as rotas. |
| `npm run architecture:check` | PASS — 11 workspaces, 13 edges, sem ciclos; 8 fontes de `apps/web/app` examinadas. |
| `npm run test:unit` | PASS — 15 arquivos / 48 testes. |
| `npm run test:worker` | PASS — smoke em processo Node separado. |
| `npm run test:integration` | PASS — PostgreSQL real (migrations/idempotência, startup privilegiado recusado antes do bind, `spryxel_app NOBYPASSRLS` aceito, shared pool/RLS, bootstrap e cross-tenant), Redis/BullMQ autenticado, SeaweedFS S3 autenticado, API health/readiness e teardown descartável. |
| `npm run test:browser` | PASS — Playwright 7/7. |
| `npm test` | PASS — agregado completo: unitários 48/48, worker, integração real dos três serviços e browser 7/7. |
| `npm audit --audit-level=high` | PASS — zero vulnerabilidades. |
| `git diff --check` | PASS — sem erro de whitespace. |
| GEF 1.1.1 `doctor/status` | `doctor`: terminal `SUCCEEDED`, read-only; toolchain Node/platform/Git healthy e `repository.observable=FINDING`. Duas leituras `status` byte-idênticas, `statusDigest=113b1bab4bf8ed942123aa11f6e7f2d3f2d394f30542922254666b6cae04673a`; repositório `dirtiness=UNKNOWN`, limites `GIT_DIRECTORY_NOT_A_DIRECTORY`/`WORKING_TREE_NOT_OBSERVED`, `operator.stale=true`, drift bruto `UNEXPECTED` (`before=8e6af789ede5f95e3a8022d8e084f3775da9d76b940fd83ca8d8c6f30e541954`, `after=dbe81ee345172e46a3f494ff7511e4df3568fa79d8996341184b09d259db4fe0`). Tratado como limitação observacional conforme D-0007; `.gef` e checkpoint não foram alterados. |

O aceite de execução Node 22 acima substitui o run Node 24 como evidência oficial. O delta é proof-only: nenhum comportamento, dependência, manifest/lockfile, D-001…D-161, provider WorkOS/AuthKit, checkpoint, `.gef`, GEF, workflow, ruleset ou source seed foi alterado. O exact final head do commit documental e os quatro required checks desse mesmo SHA são registrados no corpo pós-push da PR #24; nenhum check de SHA anterior é reutilizado.

## Correction Delta 03 — C-09: reconciliação durável de revogação

Esta execução partiu do candidate head `8e004ded243326dd36644561cfad8231c4997077`, na base imutável `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`. A correção substitui a dependência exclusiva de log operacional após revogação WorkOS confirmada por um handle canônico em PostgreSQL, criado depois da validação de identidade/suspensão e da propriedade da sessão, mas antes do efeito externo. Se a persistência do intent falhar, o provider não é chamado e a API falha com a semântica segura de disponibilidade existente.

A acceptance local foi executada contra o código C-09 antes da atualização documental que registra seu resultado. O commit `7c28d9bf41425588ecdb6fce5b04da0b3d40a1ae` contém somente a implementação C-09, os testes e a primeira versão deste Evidence Bundle; esta revisão documental posterior não altera código ou comportamento. O exact final head e os required checks correspondentes são sempre os da descrição atual da PR #24.

O estado do intent distingue `pending`, `retryable`, `provider_confirmed` e `finalized`, com códigos seguros de falha; nenhuma mensagem bruta do provider, token, cookie, credencial ou segredo é persistida. Falha do provider deixa intent recuperável e não cria `session.revoked`. Após confirmação, falha de finalização preserva o intent `provider_confirmed`, mantém resposta `204` e permite retry determinístico pelo DELETE existente. A finalização grava evento e estado final de forma idempotente; a restrição única impede eventos duplicados. RLS, `FORCE ROW LEVEL SECURITY`, vínculo composto de tenant/subject e permissões mínimas de `spryxel_app` mantêm o isolamento.

As regressões demonstram falha segura sem chamada ao provider quando o intent não é persistido, identidade suspensa e sessão não pertencente sem efeito destrutivo, falha do provider sem falso evento, resposta `204` com intent durável após falha PostgreSQL injetada na auditoria, retry que finaliza e repetição sem duplicatas. A integração usa PostgreSQL real para acesso cross-tenant negado, contexto RLS transacional sem vazamento em pool reutilizado e recuperação HTTP com falha de trigger removida; Redis/BullMQ e SeaweedFS autenticados também passaram.

### Acceptance run oficial — Node 22.23.3 / npm 10.9.9

`node --version` reportou `v22.23.3`; `npm --version` reportou `10.9.9`. `npm ci --no-audit --no-fund` concluiu com 218 pacotes instalados; `package.json` e `package-lock.json` não mudaram. Todas as validações abaixo foram executadas após corrigir duas importações duplicadas no harness C-09. Nenhum resultado de check GitHub de SHA anterior foi reutilizado.

| Validação | Resultado observado |
| --- | --- |
| `npm run format:check` | PASS — 84 arquivos. Para acomodar `core.autocrlf=true` no checkout Windows, os finais de linha foram normalizados temporariamente para LF; após o check, arquivos fora do delta semântico foram restaurados ao estado do índice. |
| `npm run lint` | PASS — 84 arquivos, sem findings. |
| `npm run typecheck -- --force` | PASS — 18/18 tarefas, sem cache. |
| `npm run build -- --force` | PASS — 11/11 workspaces, sem cache; build Next.js completou geração de rotas. |
| `npm run architecture:check` | PASS — 11 workspaces, 13 edges, sem ciclos; oito fontes de `apps/web/app` inspecionadas. |
| `npm run test:unit` | PASS — 15 arquivos / 52 testes. |
| `npm run test:worker` | PASS — smoke em processo Node separado. |
| `npm run test:integration` | PASS — PostgreSQL real: migrations/idempotência, startup privilegiado recusado antes do bind, `spryxel_app NOBYPASSRLS` permitido, pool compartilhado e isolamento RLS, bootstrap concorrente, isolamento cross-tenant, estados duráveis de retry, falha injetada na finalização HTTP com recuperação sem duplicatas; Redis/BullMQ autenticado e SeaweedFS S3 autenticado; teardown dos containers/volumes descartáveis. |
| `npm run test:browser` | PASS — Playwright 7/7. |
| `npm test` | PASS — agregado completo: unit 52/52, worker, integração real PostgreSQL/Redis/SeaweedFS e browser 7/7. |
| `npm audit --audit-level=high` | PASS — zero vulnerabilidades. |
| `git diff --check` | PASS — sem erro de whitespace no delta C-09. |
| GEF 1.1.1 `doctor/status` | `doctor`: terminal `SUCCEEDED`, efeito `NONE`, toolchain Node/platform/Git `HEALTHY`, `repository.observable=FINDING`; limitações `GIT_DIRECTORY_NOT_A_DIRECTORY` e `WORKING_TREE_NOT_OBSERVED`. Duas leituras read-only de `status` foram byte-idênticas (6.109 bytes; SHA-256 `abf75c06e3bdd72887b7b27dd8abf56146ce921e2b13948ab42e972ac30c6fdf`), com `statusDigest=113b1bab4bf8ed942123aa11f6e7f2d3f2d394f30542922254666b6cae04673a`, `dirtiness=UNKNOWN`, `operator.stale=true` e drift bruto `UNEXPECTED` (`before=8e6af789ede5f95e3a8022d8e084f3775da9d76b940fd83ca8d8c6f30e541954`, `after=dbe81ee345172e46a3f494ff7511e4df3568fa79d8996341184b09d259db4fe0`). Tratado conforme D-0007: autorização é demonstrada por Work Order, Context Lock e diff; `.gef` e checkpoint não foram alterados. |

O commit de código será aceito somente com os quatro required checks PASS no novo exact final head: `Repository validation`, `Pipeline integrity`, `Gitleaks secrets` e `Trivy filesystem and configuration`. URLs/IDs, SHA publicado e contagem de threads não resolvidas serão registrados no corpo pós-push da PR #24; esta evidência não herda status de checks anteriores.

## Riscos, limitações e próximo gate

- Não houve smoke contra tenant WorkOS por falta de credenciais staging. Fixtures determinísticas e assinatura/JWKS de teste não podem ser selecionadas pelo config de produção.
- Antes de produção: confirmar billing/termos e audiência API no token template; aprovar e provar MFA para cada método permitido, inclusive SSO. Até essa prova, a política sensível falha fechada.
- Se a gravação de confirmação falhar depois do sucesso WorkOS, a API retorna sucesso e conserva a intent `pending` para reconciliação do evento; se só a finalização falhar, conserva `provider_confirmed`. Ambos os estados têm recuperação determinística e a chave única da intent impede duplicação de `session.revoked`.
- `npm audit` não reporta finding HIGH/CRITICAL na árvore validada.
- Review threads só são resolvidas depois da validação do finding correspondente; contagem final é publicada na PR.
- O Checkpoint Delta `SPRYXEL-WO-006-PROPOSED.md` continua apenas proposto; não foi alterado, aceito ou promovido.
- PR permanece sem merge. Checkpoint não é promovido. Projects/Product Shell não é iniciado.

## Correction Delta 04 — C-10: reconciliar resultado sem replay do revoke

**Decisão de caminho:** Path B. A referência oficial do endpoint exato `POST /user_management/sessions/revoke` documenta a operação e seu parâmetro `session_id`, mas não promete que repetir a operação seja idempotente ou seguro. Não usamos um endpoint de outro produto WorkOS para inferir esse contrato.

O mesmo SDK WorkOS já fixado (`@workos-inc/node@10.14.0`) oferece `events.listEvents`. A recuperação de uma intent `pending` consulta somente `session.revoked`, usando `created_at` durável da intent como início do intervalo, com margem de 60 s para skew. A consulta é limitada a 100 eventos por página, 10 páginas no total e deadline global de 5 s; os intervalos são divididos em janelas de até 30 dias e não excedem a retenção oficial de 90 dias. A confirmação exige correspondência exata de `event`, `data.id` e `data.user_id` com sessão e subject WorkOS da intent. Sem evento correspondente, indisponibilidade, cursor ambíguo ou limite excedido, o fluxo falha fechado: responde indisponível, preserva a intent e não repete o revoke. Uma próxima requisição autenticada do mesmo subject — inclusive usando uma sessão diferente quando a sessão original era a atual — pode reconciliar o resultado.

Intents `retryable` por falha anterior do provider permanecem distinguíveis: a reconciliação de evento é tentada primeiro; se não confirmar, o caminho de retry existente de C-09 permanece restrito a esse status. Uma intent `pending`, que pode representar sucesso externo com falha de persistência, nunca chama o endpoint de revoke novamente. C-01…C-09, RLS, papel runtime, WorkOS/AuthKit, dependências, workflows, ruleset, `.gef`, GEF, source seed e checkpoint permanecem preservados.

Fontes oficiais WorkOS consultadas em 2026-10-03:

- [Session API — endpoint exato de revoke](https://workos.com/docs/reference/authkit/session): documenta `POST /user_management/sessions/revoke` e `session_id`, sem garantia publicada de idempotência.
- [Events API — consulta e filtros](https://workos.com/docs/reference/events): documenta `events`, `range_start`, `range_end`, `limit`, `after` e `order`.
- [AuthKit Events — `session.revoked`](https://workos.com/docs/events): evento identifica sessão e usuário e é emitido quando uma sessão é revogada.
- [Events API data-syncing](https://workos.com/docs/events/data-syncing/events-api): cursor via `after`, retenção de até 90 dias e intervalo de até 30 dias por solicitação.

### Regressões C-10

- Adapter WorkOS: evento correspondente numa página seguinte, evento de outro usuário e tipo não correspondente; paginação limitada falha fechado e não invoca revoke.
- API: sucesso WorkOS seguido de falha transitória ao gravar `provider_confirmed` mantém intent `pending` e retorna `204` sem detalhe interno. Uma requisição com uma sessão atual nova reconcilia o evento, finaliza e, após chamadas repetidas, mantém um único `session.revoked`; não reexecuta revoke nem depende do bearer original.
- API: evento ausente em intent `pending` retorna `503` seguro e não confirma, finaliza nem chama revoke/retry.
- Integração PostgreSQL real: trigger falha uma vez na gravação `pending → provider_confirmed`; a primeira resposta deixa a intent persistida como `pending` sem evento; a requisição com nova sessão usa a reconciliação de evento, finaliza e as chamadas repetidas mantêm exatamente um evento. A falha prévia do provider continua testada separadamente como estado `retryable`.
- Acceptance HIGH_ASSURANCE integral em Node `22.23.3` / npm `10.9.9`, seus resultados e os quatro required checks serão registrados no pós-push para o novo exact final head. Nenhum resultado de SHA anterior será reutilizado.

**STOP CONDITION:** `SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`.

### Tentativa de acceptance C-10 — resultado local bloqueado (2026-10-03)

Runtime oficial confirmado nesta tentativa: Node `v22.23.3` e npm `10.9.9`. O ZIP oficial Windows x64 foi validado pelo SHA-256 publicado (`2b0ff57b049cda1bbcea2240eec20467018713c1efe1f7360c2681859b90ed71`) e mantido fora do repositório. A regressão de integração envia explicitamente `x-request-id`, como exige a asserção do evento de auditoria.

| Gate local no runtime oficial | Resultado observado |
| --- | --- |
| `npm ci --no-audit --no-fund` | PASS — 218 pacotes; manifest e lockfile sem alteração. |
| `npm run format:check` | PASS — 84 arquivos após normalização temporária CRLF→LF; todos os bytes foram restaurados ao fim do comando. |
| `npm run lint` | PASS — 84 arquivos. |
| `npm run typecheck -- --force` | PASS — 18/18 tarefas, sem cache. |
| `npm run build -- --force` | PASS — 11/11 workspaces. |
| `npm run architecture:check` | PASS — 11 workspaces, 13 arestas, sem ciclos; oito fontes `apps/web/app`. |
| `npm run test:unit` | PASS — 15 arquivos / 57 testes. |
| `npm run test:worker` | PASS — smoke em processo Node separado. |
| `npm run test:integration` | PASS — PostgreSQL/RLS real, migrations, startup privileged-role gate, recuperação C-10 com uma auditoria, Redis/BullMQ e SeaweedFS S3 autenticados; teardown descartável PASS. |
| `npm run test:browser` | PASS — Playwright 7/7. |
| `npm test` | **BLOCKED / exit 1** — o agregado passou unit e worker, mas o Compose marcou PostgreSQL descartável como `unhealthy` antes dos testes de integração. A execução isolada de `test:integration` passou no mesmo runtime. Este gate agregado não é declarado PASS. |
| `npm audit --audit-level=high` | PASS — zero vulnerabilidades. |
| `git diff --check` | PASS — sem erros de whitespace. |
| GEF 1.1.1 `doctor/status` | `doctor` terminal `SUCCEEDED`, efeito `NONE`; toolchain saudável e `repository.observable=FINDING`. Duas leituras `status` byte-idênticas (SHA-256 `12a1a20a93e3a409a7fdc4713df0ea4036f0d6322980c4460aeb90a402750f6d`, `statusDigest=113b1bab4bf8ed942123aa11f6e7f2d3f2d394f30542922254666b6cae04673a`). `dirtiness=UNKNOWN`, `operator.stale=true` e drift bruto `UNEXPECTED`, reconciliado somente pelo delta autorizado sob D-0007; `.gef` e checkpoint permanecem intactos. |

Esta tentativa está **BLOCKED antes da STOP CONDITION**. O checkout local continua sobre `492f169aad5f4e95c66ca5a34241d3381df14640`, com mudanças C-10 sem commit; a PR #24 continua apontando para esse SHA e base `95ae64d1951ca285c67014fcedbb00e74c3d163d`. Não há novo exact final head nem required checks executados nesse candidato. Os checks do SHA anterior não foram reutilizados, e a descrição da PR não foi alterada enquanto o agregado obrigatório está pendente.

### Recuperação do único gate pendente — acceptance agregada (2026-10-03)

O bloqueio agregado acima foi reavaliado sem tocar no processo/projeto que anteriormente ocupava a porta, sem alterar portas, Playwright, Docker, dependências, configuração ou código de produto. Antes da execução, `127.0.0.1:3100` estava livre. Runtime oficial: Node `v22.23.3` e npm `10.9.9`.

| Gate | Resultado observado |
| --- | --- |
| `npm test` | **PASS / exit 0** — agregado executado nesta worktree; unit 15 arquivos / 57 testes; worker self-test em processo separado; integração real PostgreSQL (migrations/idempotência, startup privilegiado recusado antes do bind, `spryxel_app NOBYPASSRLS` aceito, pool compartilhado e isolamento RLS, bootstrap concorrente, limites cross-tenant e recuperação C-10); Redis/BullMQ autenticado; SeaweedFS S3 autenticado; health/readiness; teardown Compose descartável PASS; Playwright 7/7. |

Antes de registrar este resultado, SHA-256 do diff C-10 completo em estado local (incluindo a versão anterior deste Evidence Bundle): `efc2433b3f37b84f06c70521970d3b11cec24070a70b14aa908eac78073a3d37`. Esse conteúdo C-10 permaneceu intacto durante `npm test`; a única alteração posterior à medição é este registro documental do PASS. Após a atualização documental, SHA-256 do patch apenas dos sete arquivos C-10 de código/teste: `2a1def2e27e05e95a0bb2c484d24542bdc62a64b6f920722bf80919893072bb3`; será conferido novamente imediatamente antes do commit. O candidate local ainda parte de `492f169aad5f4e95c66ca5a34241d3381df14640`, base `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`; o SHA final, required checks e estado de review threads serão registrados após commit/push e verificação exclusiva do novo exact head. Nenhum check de SHA anterior será reutilizado.

## Correction Delta 05 — C-11: retry somente com prova positiva de sessão ativa

Esta correção parte do candidate `b08024da1ee9f5123722c0cd6af824028cc87be1`, na branch `codex/spryxel-wo-006-imp-002-identity-tenancy`, PR #24, com base imutável `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`. O Context Lock foi validado `FRESH`; os 27 fingerprints críticos correspondem à base imutável e o blob do Work Order no candidate é `98b68423eeedb5a3fc3957c95d06966a934205b4`. A execução limita-se ao C-11 e preserva C-01…C-10.

Após falha ambígua do revoke, a API primeiro procura o evento `session.revoked` correspondente. Se o evento existir, a intent é finalizada sem novo revoke. Se não houver confirmação imediata, o adapter WorkOS consulta a listagem existente de sessões usando a paginação limitada, prazo global e detecção de cursor repetido. Somente uma listagem completa que contenha o identificador exato com status `active` permite um novo revoke. Sessão ausente/inativa, listagem incompleta, limite, deadline ou falha do provider não provoca replay: a intent permanece recuperável e o fluxo falha fechado. Um evento que se torna visível depois finaliza a intent uma vez, sem novo revoke. A recuperação continua exigindo uma requisição autenticada válida, podendo usar uma sessão nova.

Arquivos C-11 alterados: `apps/api/src/adapters/workos-auth.ts`, `apps/api/src/adapters/workos-auth.test.ts`, `apps/api/src/server.test.ts`, `packages/identity/src/index.ts` e `scripts/run-integration.ts`. Os testes do adapter cobrem sessão exata ativa em página posterior; ausência, sessão diferente e estado inativo; cap de páginas, deadline e indisponibilidade do provider. A regressão da API comprova a verificação antes do retry. A integração com PostgreSQL real comprova intent `retryable` durável após erro ambíguo, ausência do alvo sem retry/sem falso evento, evento atrasado finalizado exatamente uma vez e recuperação por sessão autenticada nova.

O SHA-256 do patch binário dos cinco arquivos de código/teste C-11, antes do commit, é `0d101079e7f915bdd23bf455036dc451f9ef5aa5fdc25a03120ac4bd5ae46877`. O delta não altera os commits nem os arquivos históricos C-01…C-10.

### Acceptance HIGH_ASSURANCE oficial — Node 22.23.3 / npm 10.9.9

`node --version`: `v22.23.3`; `npm --version`: `10.9.9`. `npm ci --no-audit --no-fund` passou, instalando 218 pacotes; manifests e lockfile não foram alterados. A primeira execução direta de `format:check` identificou 53 diagnósticos de CRLF no checkout Windows. A execução reaplicada com normalização temporária CRLF→LF passou para 84 arquivos; os bytes originais foram restaurados e verificados após o check. Nenhum arquivo fora do diff autorizado foi mantido alterado.

| Gate | Resultado observado |
| --- | --- |
| `npm ci --no-audit --no-fund` | PASS — 218 pacotes; manifests/lockfile preservados. |
| `npm run format:check` | PASS — 84 arquivos após normalização temporária de finais de linha; arquivos restaurados byte a byte. A tentativa sem normalização reportou 53 diagnósticos CRLF. |
| `npm run lint` | PASS — 84 arquivos. |
| `npm run typecheck -- --force` | PASS — 18/18 tarefas, sem cache. |
| `npm run build -- --force` | PASS — 11/11 tarefas, sem cache. |
| `npm run architecture:check` | PASS — 11 workspaces, 13 arestas, sem ciclos; oito fontes `apps/web/app` inspecionadas. |
| Testes focados do adapter WorkOS | PASS — 28/28 testes no arquivo de adapter. |
| `npm run test:unit` | PASS — 15 arquivos / 61 testes. |
| `npm run test:worker` | PASS — smoke do worker em processo separado. |
| `npm run test:integration` | PASS — PostgreSQL/RLS real, Redis/BullMQ autenticado e SeaweedFS S3 autenticado; C-11 ambíguo, sessão ausente sem replay e evento atrasado finalizado uma vez; teardown descartável PASS. |
| `npm run test:browser` | PASS — Playwright 7/7. |
| `npm test` | PASS — agregado completo com unitários 61/61, worker, integração real PostgreSQL/Redis/SeaweedFS e Playwright 7/7. |
| `npm audit --audit-level=high` | PASS — zero vulnerabilidades. |
| `git diff --check` | PASS — sem erros de whitespace. |
| GEF 1.1.1 `doctor/status` | `doctor`: terminal `SUCCEEDED`, read-only, efeito `NONE`; runtime/toolchain saudável, `repository.observable=FINDING` por `GIT_DIRECTORY_NOT_A_DIRECTORY` e `WORKING_TREE_NOT_OBSERVED`. Duas leituras de `status` byte-idênticas: SHA-256 `37459FEFD1643174435A4FD032221BD9BA8A0D028A034778EB17A65E8B8B6ADB`, `statusDigest=113b1bab4bf8ed942123aa11f6e7f2d3f2d394f30542922254666b6cae04673a`, `dirtiness=UNKNOWN`, `operator.stale=true`, drift bruto `UNEXPECTED` (`before=8e6af789ede5f95e3a8022d8e084f3775da9d76b940fd83ca8d8c6f30e541954`, `after=dbe81ee345172e46a3f494ff7511e4df3568fa79d8996341184b09d259db4fe0`). Limitação mantida conforme D-0007; `.gef` e checkpoint não foram alterados. |

Nenhuma dependência, manifest/lockfile, decisão D-001…D-161, WorkOS/AuthKit, workflow, ruleset/provider, `.gef`, GEF, source seed ou checkpoint foi alterado. A evidência do exact final head e dos quatro required checks será acrescentada à descrição da PR #24 após publicar o commit; checks de SHA anterior não serão reutilizados. A contagem de review threads também será conferida após push.

**STOP CONDITION:** `SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`.
