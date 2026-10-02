# SPRYXEL-WO-006 / SPRYXEL-IMP-002 — Evidence Bundle

**Estado:** candidato para reauditoria independente; não declara aprovação, merge ou promoção.

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

O preflight foi feito antes de `npm ci`. A instalação limpa usou Node `22.23.3` e npm `10.9.9`; engines e peers exigem Node `>=22.11.0`. As validações locais desta correção usaram Node `24.19.0` e npm `11.17.0`. Pins, peer ranges, licenças e advisories foram conferidos sem instalar versões beta.

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
- Evidência: este bundle. `D-001…D-161`, manifests/lockfile, provider, `.gef`, GEF, workflows, ruleset, seed e checkpoint não fazem parte da correção.
- Nenhum Project/Product Shell ou slice posterior foi iniciado.

## Validações locais

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

## Riscos, limitações e próximo gate

- Não houve smoke contra tenant WorkOS por falta de credenciais staging. Fixtures determinísticas e assinatura/JWKS de teste não podem ser selecionadas pelo config de produção.
- Antes de produção: confirmar billing/termos e audiência API no token template; aprovar e provar MFA para cada método permitido, inclusive SSO. Até essa prova, a política sensível falha fechada.
- Se o insert de auditoria falhar após a revogação WorkOS confirmada, a API retorna sucesso e emite log error-level seguro para reconciliação operacional; a projeção `session.revoked` do PostgreSQL pode permanecer pendente até remediação.
- `npm audit` não reporta finding HIGH/CRITICAL na árvore validada.
- Review threads só são resolvidas depois da validação do finding correspondente; contagem final é publicada na PR.
- O Checkpoint Delta `SPRYXEL-WO-006-PROPOSED.md` continua apenas proposto; não foi alterado, aceito ou promovido.
- PR permanece sem merge. Checkpoint não é promovido. Projects/Product Shell não é iniciado.

**STOP CONDITION:** `SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`.
