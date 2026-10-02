# SPRYXEL-WO-002 — Checkpoint Delta proposto

Estado: PROPOSTA; não aplicado.
Autoridade atual preservada: checkpoint v2 em main@0a90e1c93d81f6f0ac861847a5434030d96f0307.
Checkpoint.json blob na base: baebc5902ee8192e5ad15ccf6f1b61c3153f2ab3.
Checkpoint.md blob na base: df9862906e3d186949b2f74f3a2b47b214030a49.

## Evidência que fundamenta a proposta

- SPRYXEL-WO-002 importa o Product Master v0.6.0, fingerprint SHA-256 1c2bf605cb4851300e7f1cc64071b1eaa4cf6d814187dcc95ebe7366d5ec2a8e, Git blob cbb93ec44886eba6cc9b24a072eb23e0ad5ea05a.
- O inventário cobre D-001…D-089 e os incrementos aprovados SPR-PLAN-001…005, mais SPR-SPECIAL-001/002.
- O delta proposto de produto continua SOURCE_PACK_CANDIDATE até auditoria objetiva e autorização de promoção.

## Valores propostos para o próximo checkpoint autorizado

- Registrar a decomposição do Product Master v0.6.0 como fonte seed imutável e o Source Pack do repositório como candidato auditável; após auditoria/promoção, o Source Pack passa a ser a autoridade canônica atual e o seed permanece evidência histórica.
- Registrar planning concluído até SPR-PLAN-005, mantendo os status/versões do master e SPR-SPECIAL-001/002.
- Registrar SPR-PLAN-006 — Product UX, Design System & Information Architecture como próximo incremento NECESSARY proposto, ainda não executado.
- Manter product implementation = NOT_STARTED.
- Manter benchmarks de modelo/produção e COGS medido = NOT_RUN / NOT_AVAILABLE.
- Manter modelo de produção pago e provider de pagamento sem seleção/contrato final.
- Manter preços e quantidades de créditos = NOT FROZEN / SIMULATION_ONLY.
- Manter public free-cloud budget default = 0, Turnstile como candidato de planejamento e controles TrustShield como arquitetura planejada; implementação/validação continuam pendentes.
- Preservar a versão GEF 1.1.1, baseline de governança, os quatro checks obrigatórios e a política de drift D-0007.
- Registrar o estado deste Work Order como SPRYXEL_WO_002_PRODUCT_MASTER_DECOMPOSED_READY_FOR_AUDIT apenas quando o HEAD candidato cumprir seus gates.

## Limite de aplicação

Esta proposta não altera CHECKPOINT.json ou CHECKPOINT.md, não muda o GEF checkpoint/receipts, não promove estado e não autoriza merge ou implementação. A promoção exige auditoria objetiva posterior e ação autorizada separada.
