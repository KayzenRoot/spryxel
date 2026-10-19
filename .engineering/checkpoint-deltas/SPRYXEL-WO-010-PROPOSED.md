# SPRYXEL-WO-010 — Proposta de Checkpoint Delta, Phase 1 A+B

**STATUS: PROPOSED / NOT APPROVED / NOT PROMOTED.** Esta proposta não modifica o Checkpoint nem declara WO-010 canonicamente concluída.

## Snapshot canônico atual

Em main 7d0700921933d91d266d763ea17d8c9b632e9446, o Checkpoint mantém:

- phase: CREDIT_LEDGER_COSTGUARD_AUTHORIZATION_FOUNDATION_COMPLETE
- stopState: SPRYXEL_WO_009_COMPLETE
- completedThroughModule: SPRYXEL_IMP_005_CREDIT_LEDGER_COSTGUARD_FOUNDATION
- nextLegalStage: SPRYXEL_DNA_ASSET_CORE_WORK_ORDER_REQUIRED
- nextImplementationIncrementStatus: NOT_ADMITTED

PR #98 integrou o código da WO-010 Phase 1 A+B por squash em 7d0700921933d91d266d763ea17d8c9b632e9446. O HEAD técnico revisado é 0ba0b78b15a533186415bfd6c4c5ae1354d357c8 e compartilha a árvore 463fc8325d7d6b42fb29a126fd7315e55af030bf com main. A revisão HIGH_ASSURANCE aceitou a fonte e evidências para o incremento bounded com limitações explícitas. Isso não equivale a APPROVED para promoção canônica.

## Separação das três etapas

1. **Implementação integrada:** PASS para somente Phase 1 A+B, PR #98 merged; sem API, worker, UI, providers, deployment ou gasto real.
2. **Homologação documental:** esta PR propõe Evidence Bundle, registro fiel da revisão anterior e este delta; aguarda revisão/decisão do proprietário. O registro de review é COMMENTED e não substitui uma decisão objetiva independente de promoção.
3. **Promoção canônica:** ainda NÃO autorizada. Só ocorre após auditoria objetiva APPROVED, delta revisado, autorização explícita e separada do proprietário sob D-0006, PR documental protegida e checks pós-merge.

## Delta semântico proposto, condicionado aos gates

Após os gates acima, um auditor/promotor poderia atualizar .engineering/CHECKPOINT.json e .engineering/CHECKPOINT.md para registrar que:

- SPRYXEL-WO-010 / IMP-006 Phase 1 A+B foi objetivamente aprovada e integrada;
- o HEAD técnico revisado é 0ba0b78b15a533186415bfd6c4c5ae1354d357c8, main integrada é 7d0700921933d91d266d763ea17d8c9b632e9446, e tree é 463fc8325d7d6b42fb29a126fd7315e55af030bf;
- Evidence Bundle, audit record, critérios, recibos pós-merge e limitações estejam vinculados;
- Phase C, D e E continuem NOT_ADMITTED e precisem de seus próprios Work Orders/Context Locks;
- Asset Core continue sem upload público, geração real, provider pago ou ativação comercial; CostGuard permaneça default DENY.

Sugestão de sequência: manter status CANONICAL; avançar o estado de incremento concluído até SPRYXEL-IMP-006-PHASE-1-AB; atualizar stopState para uma identidade estável de WO-010 Phase 1 A+B; preservar nextLegalStage como necessidade de autorização documental/Work Order separado para qualquer Fase C. Os valores literais finais de phase, stopState e nextLegalStage ficam deliberadamente sujeitos a confirmação do auditor/promotor e do proprietário; não inventar uma nova admissão.

## Não aplicar agora

- Não editar .engineering/CHECKPOINT.json nem .engineering/CHECKPOINT.md.
- Não mudar checkpointPromotion=NOT_AUTHORIZED no Context Lock.
- Não declarar WO-010 COMPLETE apenas porque o código foi merged e os checks passaram.
- Não iniciar fases C/D/E, novas mudanças de código/testes, deployment, release, provider pago ou merge.
- Não substituir o review COMMENTED por um status APPROVED inexistente.

**Decision required:** auditor objetivo deve emitir APPROVED (ou findings); proprietário deve então decidir, em autorização explícita separada, se aprova a promoção proposta. Até lá, o estado canônico permanece WO-009.