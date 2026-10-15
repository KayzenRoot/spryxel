# SPRYXEL-WO-008 — Aceitação final consolidada

**Veredito independente:** `APPROVED` para o candidato de código.
**STOP desta evidência:** `SPRYXEL_WO008_FINAL_AUDIT_APPROVED_AND_PROTECTED_CLOSEOUT`.
**Repositório / issue / PR:** `KayzenRoot/spryxel` / #29 / #30.
**Base autorizada:** `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`.
**HEAD de código auditado e testado:** `fe54bfac66bcb85c10d56c4c8a0c9c7526bec624`.
**Árvore Git do HEAD:** `b7d588815a8888ea3980352749936fd57e249d1a`.
**Branch:** `codex/spryxel-wo-008-imp-004-asset-contract-jobs`.

## Resultado da aceitação local

Executada pelo coordenador no worktree autorizado, sem alteração de código após o HEAD acima. Runtime exato: Node `v22.23.3`, npm `10.9.9`. A distribuição oficial Node foi baixada e seu SHA-256 conferido com o arquivo oficial `SHASUMS256.txt`; SHA-256 `df450af89261115ef9f9e3830c3eeb2cc9213b63c720b1af623cb5dcbe2e02de`. O `package-lock.json` permaneceu byte-idêntico, SHA-256 `877d499d2436da791b4abe4b9a2ceb447b961ca37c97d94f0d0aefd2b8278db2`.

| Comando | Exit code | Duração | Resultado |
|---|---:|---:|---|
| `npm ci --no-audit --no-fund` | 0 | 10.699 s | PASS; lockfile inalterado |
| `npm run format:check` | 0 | 0.132 s | PASS; 113 arquivos |
| `npm run lint` | 0 | 0.239 s | PASS; 113 arquivos |
| `npm run typecheck -- --force` | 0 | 19.239 s | PASS; 18/18 tarefas |
| `npm run build -- --force` | 0 | 28.685 s | PASS; 11/11 tarefas |
| `npm run architecture:check` | 0 | 0.821 s | PASS; 11 workspaces / 15 arestas |
| `npm test` | 0 | 68.728 s | PASS; 94/94 unitários, worker smoke, integração real e Playwright 20/20 |
| `npm audit --audit-level=high` | 0 | 0.439 s | PASS; zero vulnerabilidades |
| `git diff --check` | 0 | 0.003 s | PASS; worktree limpo |

`npm test` usou o paralelismo padrão do projeto (`fullyParallel: true`, `retries: 0`, nenhum override de workers). O ambiente relatou um worker por padrão; não houve serialização forçada. A integração usou PostgreSQL/RLS, Redis/BullMQ e SeaweedFS reais e descartáveis; incluiu isolamento entre tenants, idempotência, claims/leases, crash recovery, cancelamento, reconstrução após perda Redis e isolamento de contexto no pool. A matriz de cursores C-05 cobriu UUID inválido, data normalizada e ano zero nas rotas global e por projeto. O browser executou 20/20 testes.

Comandos completos, exit codes, durações e logs estão no Evidence Bundle anexado à conversa e vinculados por SHA-256. Não há segredo nos logs revisados. O diretório temporário GEF espelhado não integra o pacote; somente seus recibos read-only foram incluídos.

## Fonte, GEF e escopo

- Context Lock `.engineering/context-locks/SPRYXEL-WO-008.json`: `FRESH`; 39/39 fingerprints da base autorizada e hash do Work Order conferidos.
- D-001…D-161 e `DECISIONS-LEDGER.md`: byte-idênticos entre base e candidato.
- PR #30: 55 paths contra a base; nenhum path hard-out-of-scope. WorkOS provider, `apps/web/proxy.ts`, `apps/web/app/layout.tsx`, migrations de identidade/tenancy, workflows, `.gef`, regras ou GEF não foram alterados. A página Home em `apps/web/app/page.tsx` faz parte da superfície admitida para Jobs/estado durável.
- GEF no worktree indireto não observou adequadamente o `.git`; por isso o doctor/status normalizado foi repetido em clone-espelho read-only no HEAD exato. Doctor: `ok=true`; status executado duas vezes com SHA idêntico `072a777bd253f4aa17d8629238778fe56fcffedacccf9e7c175bd1cc2a9bddc3`, repositório limpo/observado e sem limites de observação. O drift bruto `UNEXPECTED` foi reconciliado conforme D-0007 com Work Order, Context Lock, diff e evidência autorizados; baseline GEF/.gef não foi reescrita.
- Nenhum teste real contra WorkOS/staging foi executado; autenticação nos testes ocorreu pelo harness previsto. Nenhuma alteração no provider/auth foi necessária.

## GitHub e SonarCloud no HEAD exato

Readback direto de GitHub: PR aberta, base `main@08bd429…`, `mergeable=true`, ruleset ativo `24340349` permite squash, exige os quatro contextos abaixo e resolução de threads, sem bypass; 14/14 threads estão resolvidas.

| Check no HEAD `fe54bfac…` | ID | Resultado |
|---|---:|---|
| Repository validation | `116220412296` | SUCCESS |
| Pipeline integrity | `116220412316` | SUCCESS |
| Gitleaks secrets | `116220412460` | SUCCESS |
| Trivy filesystem and configuration | `116220412164` | SUCCESS |
| SonarCloud Code Analysis | `116220592964` | SUCCESS |
| Socket Security: Project Report | `116220432390` | SUCCESS |
| Socket Security: Pull Request Alerts | `116220450449` | SUCCESS |

O sumário hospedado do Sonar registra Quality Gate `PASS`, 76 issues novos, 0 aceitos, 0 security hotspots, cobertura nova 0.0% e duplicação nova 1.7%. O acesso autenticado aos detalhes completos dos issues retornou HTTP 403 na investigação anterior. O fallback GitHub fornece 50 annotations para 76 issues; essa amostra não equivale à classificação integral nem à severidade Sonar. Não foi inferida gravidade a partir dos níveis `failure`/`warning` das annotations. O relatório independente conclui que **nenhum blocker HIGH/CRITICAL foi demonstrado**, sem afirmar que os 76 registros foram todos classificados. Conforme a ordem do owner, a API indisponível não é, sozinha, bloqueio de aceitação.

## Auditoria independente e limitações

O relatório `.engineering/evidence/SPRYXEL-WO-008-INDEPENDENT-AUDIT.md` contém veredito, verificações e matriz AC1–AC63. A auditoria foi conduzida por agente separado em modo read-only; não editou o produto nem executou os testes. As execuções deste documento são `EXECUTED` pelo coordenador e `OBSERVED` pelo auditor independente.

Limitações registradas sem ocultação:

1. A interface Jobs busca os 50 resultados mais recentes e informa esse limite, mas não oferece navegação ao próximo cursor; a API permanece bounded/cursor-paginada. O auditor classificou essa limitação UX como LOW e não bloqueante para os critérios desta Work Order. Referências: `apps/web/app/jobs/page.tsx:30,95`.
2. A severidade/status completos dos 76 issues Sonar são `NOT_AVAILABLE`; apenas Quality Gate, métricas e 50 annotations parciais foram observados.
3. WorkOS/staging real e a integração semântica futura da PR #80 não foram testados por este batch.
4. As evidências locais foram executadas no HEAD de código `fe54bfac…`; o tree do merge protegido em `main` é idêntico (`c90aaf22…`). Os checks hospedados passaram tanto no HEAD de promoção quanto no SHA exato pós-merge.

**Decisão:** `APPROVED`; não há defeito material reproduzido nem finding HIGH/CRITICAL demonstrado que exija correção. A PR só pode ser squash-mergeada após a promoção documental receber os checks exatos e threads resolvidas; o checkpoint só será marcado `COMPLETE` após validar o `main` pós-merge.


## Fechamento pós-merge em `main`

PR #30 foi squash-mergeada sem bypass em `2026-10-15T11:22:09Z`. Promotion head `2e3d9cdd09ed1ff31655183e54f6d23bd3c0716e`; merge SHA `75054119d4f0f110ed766b8094f1d3c1f17e59f3`; parent/base `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`. A árvore pós-merge é `c90aaf22290fd04f19bd8b8d61ecf39d3ae2b006`, igual à árvore do HEAD promovido, portanto o código validado localmente não mudou.

| Check em `main@75054119…` | ID | Conclusão |
|---|---:|---|
| Repository validation | `116394735439` | SUCCESS |
| Pipeline integrity | `116394679485` | SUCCESS |
| Gitleaks secrets | `116394677268` | SUCCESS |
| Trivy filesystem and configuration | `116394678499` | SUCCESS |
| SonarCloud Code Analysis | `116394955206` | SUCCESS / Quality Gate PASS |
| Socket Security: Project Report | `116394711114` | SUCCESS |

O resumo Sonar da branch `main` reporta 166 issues novos, 0 aceitos, 0 hotspots, cobertura nova 0.0% e duplicação 0.7%. Esse escopo é a análise da branch principal, distinto dos 76 issues e 1.7% de duplicação no check de PR #30; a classificação individual permanece `NOT_AVAILABLE` e não foi inferida.

**Estado final da Work Order:** `SPRYXEL_WO_008_COMPLETE`. O seguinte incremento NECESSARY, Credit Ledger + CostGuard authorization, permanece `NOT_ADMITTED`; nenhum WO-009 foi iniciado.
