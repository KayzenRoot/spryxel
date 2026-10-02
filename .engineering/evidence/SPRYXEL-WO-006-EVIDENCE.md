# SPRYXEL-WO-006 / SPRYXEL-IMP-002 — Evidence Bundle

**Estado:** CANDIDATE_READY_FOR_AUDIT; nenhuma aprovação ou promoção é declarada.

**Data:** 2026-10-02

## Identidade, autoridade e estado exato

- Repositório: `KayzenRoot/spryxel`; issue #23; PR #24; branch `codex/spryxel-wo-006-imp-002-identity-tenancy`.
- Work Order: `SPRYXEL-WO-006`; incremento: `SPRYXEL-IMP-002`; risco `HIGH_ASSURANCE`.
- Base exigida e pai do candidato inicial: `main@95ae64d1951ca285c67014fcedbb00e74c3d163d`.
- Candidato começou exatamente em `25f0fe4e2095284f602c82bc6b6f1c840ac2d1f8`.
- Context Lock no preflight: `FRESH`; `27/27` fingerprints críticos; decisões protegidas D-001…D-161; blob da Work Order e base conferidos.
- GEF pin: `@gef-bootstrap/cli@1.1.1`, release source SHA `1dc030f1358eab0347043a3d54c7fc311c7c2123`.
- Ruleset `24340349`, provider, workflows, required contexts, source seed, ledger e checkpoint canônico não foram alterados.
- O HEAD final, URLs/IDs dos checks e estado de revisão estão registrados na descrição atual da PR #24. Checks de SHA anterior não são reutilizados.

## Preflight HIGH_ASSURANCE antes da instalação

Preflight executado antes de `npm ci`; lockfile gerado com pins exatos, sem beta e sem segundo package manager. Node 22.23.3/npm 10.9.9 foram usados no preflight e instalação limpa; engines e peers exigem Node compatível com `>=22.11.0`. As verificações finais locais ocorreram com o runtime host Node 24.19.0/npm 11.17.0; os checks da PR permanecem a autoridade para o HEAD final e o runtime CI.

| Dependência direta nova | Pin / licença | Compatibilidade verificada | Owner e razão arquitetural |
| --- | --- | --- | --- |
| `@workos-inc/authkit-nextjs` | `4.4.0` / MIT | Node `>=22.11.0`; Next `^13.5.9 || ^14.2.26 || ^15.2.3 || ^16`; React 18/19; peer oficial de `@workos-inc/node` aceita 9/10 | `apps/web`: PKCE, state/CSRF, callback e cookie de sessão no edge oficial App Router |
| `@workos-inc/node` | `10.14.0` / MIT | Node `>=22.11.0`; mantido na faixa peer oficial da versão AuthKit selecionada | `apps/api` JWKS/session adapter e peer provider do edge Next |
| `jose` | `6.2.12` / MIT | APIs e WebCrypto compatíveis com Node 22; sem peer conflitante | `apps/api`: verificar assinatura JWT, issuer, audience, exp e nbf independentemente |
| `uuid` | `14.0.2` / MIT | Node 22; UUIDv7 para IDs internos opacos | `packages/db`: emitir identidade, tenant e evento com IDs Spryxel |

O AuthKit Next atual ainda exclui o major 11 do peer de `@workos-inc/node`; a combinação fixada usa a versão estável compatível, sem trocar de provider. `npm ci --no-audit --no-fund` concluiu com o lock exato após o preflight. `npm audit --audit-level=high` final: zero vulnerabilidades reportadas.

Termos observados na fonte oficial em 2026-10-02: primeiro 1.000.000 de usuários ativos do AuthKit sem cobrança; ambiente de produção exige billing information; SSO/conexões de diretório enterprise podem ter cobrança separada. O contrato comercial deve ser confirmado antes da ativação de produção. WorkOS não fornece `aud` apropriado para este resource server por padrão: o token template deve emitir a audiência API configurada, e Fastify rejeita tokens sem ela. A origem do issuer é configurada explicitamente; o SDK oficial resolve/cacha JWKS. PKCE e verificação state/CSRF ficam no SDK oficial. Nenhuma beta foi usada.

Referências primárias revistas: [AuthKit pricing](https://workos.com/pricing), [production environments](https://workos.com/docs/authkit/environments), [sessions](https://workos.com/docs/authkit/sessions), [session API](https://workos.com/docs/reference/authkit/session), [MFA](https://workos.com/docs/authkit/mfa), [reauthentication](https://workos.com/docs/authkit/reauthentication), [Next.js SDK](https://workos.com/docs/sdks/authkit-nextjs), [Node SDK](https://workos.com/docs/sdks/node), [JWT verification/JWKS](https://workos.com/blog/verify-workos-access-tokens-in-your-own-api).

## Implementação e fronteiras

- `packages/identity` contém contratos provider-neutral, membership OWNER/ADMIN/MEMBER e políticas puras de membership, papel, autenticação recente e evidência MFA.
- WorkOS só aparece nos edges autorizados da Web e nos adapters da API; o architecture checker valida o allowlist, dependências internas e ausência de ciclos.
- Fastify verifica somente JWT RS256, assinatura via JWKS, issuer/audience exatos, exp/nbf, subject, session ID, `auth_time`, contexto de token e alegações de impersonation. Erros de auth retornam problemas RFC 9457 seguros; credenciais e claims de papel/org não viram autoridade local.
- PostgreSQL mantém UUIDv7 interno, mapping provider/subject, tenant, membership e security event. Bootstrap usa transação e advisory lock para replay/concurrency; eventos guardam referências seguras, nunca token/cookie.
- Conexão normal usa `spryxel_app` com `NOBYPASSRLS`; a URL admin de migration só é lida pelos comandos explícitos de migration/status. Policies RLS são `ENABLE` e `FORCE` também para identidade e mapping externo; contexto usa `set_config(..., true)` por transação, e contexto ausente/cross-tenant/cross-identity falha fechado.
- API mínima cobre principal, memberships e sessões próprias/revogação. A revogação valida a sessão ativa do usuário antes de chamar WorkOS. Adapter expõe apenas referências e marcador booleano de impersonation, sem IP/user-agent/ator.
- Sign-in/callback/sign-out usam AuthKit oficial; cookie PKCE é HttpOnly/SameSite=Lax, callback inválido retorna problema genérico 400 e sessão/tokens não são persistidos no Web Storage.
- O gate de Owner/Admin exige `auth_time` recente e `amr=mfa`; não existe rota de alteração administrativa neste slice. WorkOS MFA Dashboard não força MFA para usuários SSO; a implantação precisa de política MFA SSO/equivalente, e o gate falha fechado até haver claim verificado.
- Não foram criados Projects, billing, créditos, TrustShield, multi-account, Turnstile, geração/assets, AI/model/GPU, API keys/MCP OAuth, produção fake identity ou próximo slice. A troca de provider não foi feita.

## Validações executadas

| Validação | Resultado observado |
| --- | --- |
| `npm ci --no-audit --no-fund` após preflight | PASS; lock exato, Node 22.23.3/npm 10.9.9 |
| `npm run format:check` | PASS, 84 arquivos. O checkout Windows usava CRLF global; `npm run format` normalizou e o check passou sem diff semântico fora do escopo. |
| `npm run lint` | PASS, sem findings após corrigir o aviso reportado |
| `npm run typecheck` | PASS, 18 tarefas Turbo |
| `npm run build` | PASS, 11 workspaces; web, API, worker, rotas AuthKit e proxy compilados |
| `npm run architecture:check` | PASS, 11 workspaces / 13 arestas, sem ciclos; 8 arquivos `apps/web/app` examinados |
| `npm run test:unit` | PASS, 15 arquivos / 40 testes, incluindo JWT/JWKS positivo/negativo, adapter de sessões, policy, redaction e API 401/403 |
| `npm run test:worker` | PASS em processo separado; zero consumidores de produto |
| `npm run test:integration` | PASS em PostgreSQL/Redis/SeaweedFS reais; migrations/status/idempotência, papel NOBYPASSRLS, bootstrap concorrente/replay, RLS identity/mapping/membership sem contexto e cross-tenant, auditoria bootstrap/revogação sem campos de credenciais, S3 autenticado e negação anônima, BullMQ, API health/readiness e teardown |
| `npm run test:browser` | PASS, 7/7; tema/teclado, proteção signed-out, sign-in PKCE/cookie flags, callback seguro, sign-out e ausência de tokens no Web Storage |
| `npm test` | PASS agregado: unit 40/40, worker, integração real com auditoria segura e browser 7/7 |
| `npm audit --audit-level=high` | PASS, `found 0 vulnerabilities` |
| Gitleaks / Trivy / Repository validation / Pipeline integrity | Estado e URLs atuais no HEAD exato estão na descrição da PR; nenhum check de SHA anterior foi herdado. |
| `git diff --check` | PASS, registrado antes do commit |
| `gef doctor --target . --json` | Comando PASS/read-only, GEF 1.1.1; invariantes de toolchain PASS. Reportou `repository.observable=FINDING`; não aplicou remediação. |
| `gef status --target . --json` (duas leituras) | Ambas terminaram read-only e byte-idênticas. GEF v1.1.1 não observou linked worktree (`GIT_DIRECTORY_NOT_A_DIRECTORY`, `WORKING_TREE_NOT_OBSERVED`), marcou `operator.stale=true` e drift bruto `UNEXPECTED`; isso é reportado, não reinterpretado como clean. |

### Interpretação de drift sob D-0007

D-0007 mantém o baseline instalado imutável: `gef status` usa comparação de drift não autorizada e pode marcar `UNEXPECTED` mesmo para uma WO válida. A autoridade deste delta está vinculada a WO-006, Context Lock FRESH, base exata, diff e este Evidence Bundle. A limitação observacional de linked worktree é preservada como finding. Nenhum `.gef`, recibo, baseline ou checkpoint foi editado e nenhuma remediação automática foi aceita.

## Riscos, limitações e conclusão solicitada

- WorkOS staging credentials não estavam disponíveis; não houve smoke real contra tenant WorkOS. Fixtures locais usam chave/JWKS assinados determinísticos e não podem ser selecionados pela configuração de produção.
- Produção precisa concluir audience no token template, confirmar billing/termos e garantir MFA para SSO; sem claims de step-up aprovados, operações sensíveis de Owner/Admin permanecem negadas.
- Nenhum finding HIGH/CRITICAL aplicável permaneceu no `npm audit`; o candidato continua sujeito ao veredito independente e aos quatro required checks exatos.
- Checkpoint não foi promovido, PR não foi mergeada e Projects/Product Shell não foi iniciado.

**STOP CONDITION:** `SPRYXEL_IMP_002_IDENTITY_TENANCY_SECURITY_BASELINE_READY_FOR_AUDIT`.
