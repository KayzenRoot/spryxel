# SPRYXEL-WO-008 — Proposed Checkpoint Delta

**Status:** ACCEPTED_BY_INDEPENDENT_AUDIT; PROMOTED_PENDING_PROTECTED_MERGE.

## Preconditions satisfied for promotion

- Auditoria independente objetiva retornou `APPROVED` para PR #30 no exact code head `fe54bfac66bcb85c10d56c4c8a0c9c7526bec624` e revisou o Evidence Bundle.
- Work Order/Context Lock permaneceram válidos para `main@08bd429bb924e26f7d5266ee9b556cc8da2c8b8c`; 39/39 fingerprints da base conferem e o blob do Work Order corresponde ao lock.
- D-001…D-161 preservados; nenhuma regra, provider, workflow, GEF/.gef ou fonte canônica de decisão foi reescrita.
- HIGH_ASSURANCE executado em Node 22.23.3/npm 10.9.9 no exact code head; logs, exit codes e durações constam no Evidence Bundle.
- Quatro required checks, Sonar e dois checks Socket passaram no candidate head; 14/14 threads resolvidas.
- Auditoria não demonstrou blocker HIGH/CRITICAL. Detalhes completos dos 76 issues Sonar estão `NOT_AVAILABLE` (HTTP 403), com limite explicitado no relatório; não houve classificação inventada nem dismiss em lote.
- Nenhum módulo hard-out-of-scope foi implementado.

## Delta semântico promovido (estado ainda condicionado ao merge protegido)

1. Aprovar `SPRYXEL-WO-008 / SPRYXEL-IMP-004` para promoção canônica, com merge e validação pós-merge ainda pendentes.
2. Registrar Asset Contract versionado e imutável como base canônica; PostgreSQL como fonte de Job/Attempt/idempotência/estado; Redis/BullMQ somente projeção transitória reconstruível.
3. Registrar worker separado de menor privilégio, bounds, claims/leases, recuperação, tentativas e cancelamento validados.
4. Registrar Jobs/Queue Center e estados duráveis Home/Project Overview como implementados; limitações UX e evidências parciais do Sonar ficam visíveis no relatório final.
5. Preservar toda implementação canônica até WO-007 e D-001…D-161, WorkOS/AuthKit, GEF 1.1.1, ruleset, workflows, provider e source seed.
6. Após o closeout pós-merge, Credit Ledger + CostGuard authorization foundation será o próximo incremento NECESSARY, mas permanece `NOT_ADMITTED` até novo Work Order/Context Lock.

## Gate de merge

Este commit de promoção não é evidência de merge. PR #30 só pode receber squash merge se:

- os quatro required checks passam no exact promotion head, sem reutilizar checks de SHA anterior;
- Sonar Quality Gate e checks de segurança do candidato passam;
- não há review thread pendente nem novo blocker demonstrado.

Após squash merge, aceitação pós-merge deve ser coletada no SHA exato de `main`; checks do candidato não substituem essa evidência. Só então a WO-008 pode ser marcada COMPLETE.

## Fora de escopo preservado

Nenhuma implementação de Credit Ledger/CostGuard, inferência/modelo/GPU, execução por provider, Asset/DNA/QA/export downstream, WorkOS/provider, ruleset/workflow, `.gef`, Decision Ledger ou source seed foi incluída nesta promoção documental.
