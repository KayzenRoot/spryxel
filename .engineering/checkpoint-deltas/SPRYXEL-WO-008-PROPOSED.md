# SPRYXEL-WO-008 — Proposed Checkpoint Delta

**Status:** ACCEPTED_BY_INDEPENDENT_AUDIT; PROMOTED_AND_POST_MERGE_VALIDATED.

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

O commit de promoção não era evidência de merge. A PR #30 recebeu squash merge protegido somente após:

- os quatro required checks passam no exact promotion head, sem reutilizar checks de SHA anterior;
- Sonar Quality Gate e checks de segurança do candidato passam;
- não há review thread pendente nem novo blocker demonstrado.

PR #30 foi squash-mergeada em `main@75054119d4f0f110ed766b8094f1d3c1f17e59f3`; o tree `c90aaf22290fd04f19bd8b8d61ecf39d3ae2b006` é idêntico ao tree da promoção. No SHA exato passaram Repository validation `116394735439`, Pipeline integrity `116394679485`, Gitleaks `116394677268`, Trivy `116394678499`, SonarCloud `116394955206` e Socket Project Report `116394711114`. A WO-008 está COMPLETE; credit ledger/costguard permanece NOT_ADMITTED.

## Fora de escopo preservado

Nenhuma implementação de Credit Ledger/CostGuard, inferência/modelo/GPU, execução por provider, Asset/DNA/QA/export downstream, WorkOS/provider, ruleset/workflow, `.gef`, Decision Ledger ou source seed foi incluída nesta promoção documental.


## Fechamento pós-merge (15/10/2026)

- Promotion head: `2e3d9cdd09ed1ff31655183e54f6d23bd3c0716e`.
- Squash merge: `main@75054119d4f0f110ed766b8094f1d3c1f17e59f3`.
- Verificação de árvore: promoção e `main` pós-merge compartilham tree `c90aaf22290fd04f19bd8b8d61ecf39d3ae2b006`.
- Checks pós-merge no exact `main`: Repository validation `116394735439`, Pipeline integrity `116394679485`, Gitleaks `116394677268`, Trivy `116394678499`, SonarCloud `116394955206`, Socket Project Report `116394711114`: SUCCESS.
- Estado canônico: `SPRYXEL_WO_008_COMPLETE`; próxima sequência NECESSARY Credit Ledger + CostGuard authorization, `NOT_ADMITTED` até novo Work Order/Context Lock.
