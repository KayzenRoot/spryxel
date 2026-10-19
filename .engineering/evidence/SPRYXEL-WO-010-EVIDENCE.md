# SPRYXEL-WO-010 — Evidence Bundle pós-merge
**Estado:** evidências do incremento Phase 1 A+B consolidadas para revisão documental; não representa aprovação objetiva de promoção nem conclusão canônica da Work Order.

## Identidade e autorização

- Repositório: KayzenRoot/spryxel; PR de implementação: [#98](https://github.com/KayzenRoot/spryxel/pull/98).
- Base protegida da PR: 414691bd734f14a37a389a02ea29aca643d7388b.
- HEAD de implementação auditado: 0ba0b78b15a533186415bfd6c4c5ae1354d357c8.
- Merge squash e main atual: 7d0700921933d91d266d763ea17d8c9b632e9446; o commit de merge tem um pai.
- Tree do HEAD auditado e do main pós-merge: 463fc8325d7d6b42fb29a126fd7315e55af030bf (idêntico).
- Esta PR documental está apresentada para revisão. Este registro não fornece uma fonte verificável e independente de autorização do proprietário para sua criação; não autoriza merge, promoção do checkpoint, deploy, release ou fases posteriores.
- A revisão HIGH_ASSURANCE confirmou 30/30 fingerprints críticos da base protegida de preflight e o blob de teste autorizado. Seis blobs de fontes pinadas mudaram no HEAD, todos dentro dos caminhos admitidos. Fonte: [review exato de PR #98](https://github.com/KayzenRoot/spryxel/pull/98#pullrequestreview-5565529834).
- O Context Lock de execução está preservado como FRESH; checkpointPromotion continua NOT_AUTHORIZED e Phase C/D/E continuam NOT_ADMITTED.

## Escopo integrado

A comparação entre a base 414691bd734f14a37a389a02ea29aca643d7388b e o merge 7d0700921933d91d266d763ea17d8c9b632e9446 contém exatamente 11 arquivos:

| Arquivo |
|---|
| packages/contracts/src/index.test.ts |
| packages/contracts/src/index.ts |
| packages/db/src/asset-core.ts |
| packages/db/src/index.ts |
| packages/db/src/migrations/0010_project_dna_asset_core.sql |
| packages/domain/src/index.test.ts |
| packages/domain/src/index.ts |
| scripts/architecture-guard.test.ts |
| scripts/architecture-guard.ts |
| scripts/asset-core-integration.ts |
| scripts/run-integration.ts |

Nenhum arquivo de governança foi incluído no merge de implementação. A fonte exata do diff e pós-merge é o [relatório de verificação pós-merge](https://github.com/KayzenRoot/spryxel/pull/98#issuecomment-6256677658).

## Recibos locais reutilizados do HEAD exato

Os logs anexados à [Evidence Bundle da PR #98](https://github.com/KayzenRoot/spryxel/pull/98#issuecomment-6256355377) e aos comentários de [integração](https://github.com/KayzenRoot/spryxel/pull/98#issuecomment-6256344629), [gates](https://github.com/KayzenRoot/spryxel/pull/98#issuecomment-6256344801), [trace 1/2](https://github.com/KayzenRoot/spryxel/pull/98#issuecomment-6256345108) e [trace 2/2](https://github.com/KayzenRoot/spryxel/pull/98#issuecomment-6256345379) foram produzidos em 2026-10-18 no HEAD exato 0ba0b78b15a533186415bfd6c4c5ae1354d357c8, Node v22.23.3 / npm 10.9.9. Não foram reexecutados para esta PR documental; o tree de código é idêntico ao main integrado.

| Comando | Exit code | Resultado registrado |
|---|---:|---|
| npm ci | 0 | instalação concluída |
| npm run architecture:check | 0 | PASS; 11 workspaces, 15 internal edges |
| npx vitest run scripts/architecture-guard.test.ts | 0 | 10/10 |
| npm run format:check | 0 | PASS |
| npm run lint | 0 | PASS |
| npm run typecheck | 0 | 18/18 tarefas; cache Turbo |
| npm run build | 0 | 11/11 tarefas; cache Turbo |
| npm run test:unit | 0 | 25 arquivos, 152 testes |
| npm run test:integration | 0 | Docker/PostgreSQL real e stack descartável; RLS, isolamento, ACL, idempotência, imutabilidade, pool reset e regressões reportados PASS |
| git diff --check | 0 | PASS |

O build interno da integração também reutilizou cache Turbo. Unidade, guard, arquitetura, format, lint e integração foram registrados como execuções frescas no bundle. A tentativa inicial sob Node 26 foi descartada; não é evidência de aceitação.

## Checks GitHub

No HEAD da PR #98, 7/7 checks concluíram SUCCESS: [SonarCloud](https://github.com/KayzenRoot/spryxel/runs/117808112222), [Socket PR Alerts](https://github.com/KayzenRoot/spryxel/runs/117808003306), [Socket Project Report](https://github.com/KayzenRoot/spryxel/runs/117807993179), [Gitleaks](https://github.com/KayzenRoot/spryxel/actions/runs/39172391682/job/117807994193), [Pipeline integrity](https://github.com/KayzenRoot/spryxel/actions/runs/39172391766/job/117807994522), [Repository validation](https://github.com/KayzenRoot/spryxel/actions/runs/39172391618/job/117807993890) e [Trivy](https://github.com/KayzenRoot/spryxel/actions/runs/39172391634/job/117807994087). Threads: 3/3 resolvidas, zero pendentes. A proteção main então ativa exigia quatro checks estritos, sem bypass e sem aprovação de review obrigatória.

Na main pós-merge, os seis checks de push disponíveis passaram: [SonarCloud](https://github.com/KayzenRoot/spryxel/runs/117824447732), [Socket Project Report](https://github.com/KayzenRoot/spryxel/runs/117824299224), [Trivy](https://github.com/KayzenRoot/spryxel/actions/runs/39177909278/job/117824296041), [Repository validation](https://github.com/KayzenRoot/spryxel/actions/runs/39177909289/job/117824295746), [Pipeline integrity](https://github.com/KayzenRoot/spryxel/actions/runs/39177909261/job/117824295703) e [Gitleaks](https://github.com/KayzenRoot/spryxel/actions/runs/39177909254/job/117824295446). Socket PR Alerts é específico do contexto de PR.

## Matriz A01–A04, B01–B08 e B06-ARCH

| Critério | Resultado documentado | Base |
|---|---|---|
| A01 schema estrito, limites, UUIDv7 e fail-closed | PASS | testes unitários e 32 negativos SQL de payload inválido |
| A02 JSON canônico e SHA-256 determinístico | PASS | digests persistidos; 120 variações não canônicas rejeitadas |
| A03 imutabilidade e restore em nova versão | PASS | Harness source asserts historical UPDATE/DELETE denied; executor reported assertion pass and local trace SQLSTATE 42501. Those calls are absent from the published excerpt; see SQL evidence classification below. |
| A04 idempotência/replay e conflito | PASS | replay preserva identidade; conflitos rejeitados |
| B01 migration 0010 forward-only | PASS | suite PostgreSQL validou caminho de migração 9→10 |
| B02 FORCE RLS e privilégios mínimos | PASS | integração e assertions de catálogo/ACL reportaram PASS |
| B03 isolamento tenant/projeto, guessed IDs, lineage e FK | PASS | negativos reais/agregados reportados PASS |
| B04 contexto transacional e pool reset | PASS | contexto isolado, sem principal obsoleto reportado |
| B05 regressões Asset Contract, Jobs, Ledger e CostGuard | PASS | integrações existentes reportaram preservação e default DENY |
| B06 format/lint/typecheck/unit/architecture/integração | PASS | recibos acima, todos exit 0 |
| B06-ARCH cinco tabelas exatas e negativos preservados | PASS | guard 10/10 e architecture:check |
| B07 checks, Sonar e Socket | PASS | 7/7 no HEAD; Sonar 22 MINOR, zero MAJOR ou superior |
| B08 review HIGH_ASSURANCE e merge protegido | PASS para o incremento integrado | review aceitou fonte/evidência com limitações; autorização e squash protegido documentados |

### Classificação da evidência SQL

- **Verificado no excerto publicado:** o reviewer parseou 188 registros únicos: 16 RPCs aceitas e 172 rejeições SQLSTATE 22023 (120 variantes não canônicas, 32 payloads malformados, 16 negativas de proveniência e quatro transições RESTORE proibidas). Os registros publicados incluem os digests de DNA `4fc07797075f5d83242ccd804d1a81296915508baccb87de06e0d81832c29dbf` e Asset `baf966928ef856dae4275825a92eb4a2d2dce0921a7956fe186f1d93f464b4ad` nos pares/create-append-replay observados, além das transições RESTORE publicadas.
- **Verificado na fonte:** o harness contém assertions que esperam SQLSTATE `42501` para UPDATE/DELETE da história imutável.
- **Reportado pelo executor, não publicado por chamada:** o executor relata que essas assertions passaram e que o trace completo local de 4.237 eventos continha as respostas `42501`. As chamadas individuais de UPDATE/DELETE não estão no excerto público de 188 eventos e não foram executadas independentemente pelo reviewer.

## Riscos residuais e follow-ups não bloqueantes

1. As 48 negativas gerais de payload/proveniência verificam SQLSTATE, não texto exato; os textos observados estavam corretos.
2. Não houve segunda execução independente do banco pelo reviewer; parte das provas de ACL, pool, isolamento e UPDATE/DELETE é assertion/resultado agregado ou trace local do executor, não valor por chamada no excerto público.
3. Typecheck/build reaproveitaram cache Turbo validado; o build interno de integração também foi cache hit.
4. Sonar registrou 22 MINOR, nenhum MAJOR+; new_lines_to_cover=0, portanto cobertura nova não foi medida e não é correto dizer “0% medido”.
5. pg reportou warning de query concorrente/depreciação, sem falha de teste.
6. O arquivo test-only scripts/asset-core-integration.ts tem cerca de 1.706 linhas.
7. Durante a execução no HEAD técnico auditado, Turbo 2.11.6 acrescentou um bloco gerenciado `turborepo-agent-rules` a `AGENTS.md` no worktree. O bloco permaneceu durante comandos posteriores e foi removido pelo executor com `git checkout -- AGENTS.md`; não entrou no commit e a worktree final foi registrada limpa. O repositório não define `agentGuidance`; decidir se configura esse comportamento permanece um follow-up. Fonte: [Evidence Bundle exato](https://github.com/KayzenRoot/spryxel/pull/98#issuecomment-6256355377).

Follow-ups separados: adicionar assertions de mensagens para negativas; capturar/republicar evidência per-call completa ou uma execução auditora independente se exigida; corrigir uso concorrente de client.query; triar 22 MINOR e acompanhar cobertura se houver novas linhas cobertas; avaliar modularização do harness; revisar o comportamento de `agentGuidance` e decidir separadamente se deve ser configurado. Nenhuma dessas tarefas foi iniciada nesta homologação.

## Estado e limite de promoção

Esta bundle registra a implementação integrada e evidências herdadas. Não é nova execução de testes, não é nova auditoria independente, não tem veredito objetivo APPROVED de promoção e não declara WO-010 COMPLETE. O [Checkpoint canônico atual](https://github.com/KayzenRoot/spryxel/blob/7d0700921933d91d266d763ea17d8c9b632e9446/.engineering/CHECKPOINT.json) segue em WO-009. Promoção exige parecer objetivo APPROVED, delta revisado e autorização separada do proprietário nos termos de D-0006. Nenhuma alteração do Checkpoint, merge, deploy, release, Fase C/D/E ou execução paga é autorizada por este registro.