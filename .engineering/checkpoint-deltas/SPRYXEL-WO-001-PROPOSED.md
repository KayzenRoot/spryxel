# Proposta de Delta de Checkpoint SPRYXEL-WO-001

Situação da proposta: PROPOSED_ONLY; NOT PROMOTED.

Alvo: .engineering/CHECKPOINT.json, schemaVersion 2.
Work Order: SPRYXEL-WO-001 / issue #2 / PR #3.
Base vinculada: main@10dca04e38cfcd2e07335faf9078cc6041766c02.
Evidência: .engineering/evidence/SPRYXEL-WO-001-EVIDENCE.md e o pacote de evidências do head exato na PR #3.

## Estado proposto na parada pronta para auditoria

Esta proposta descreve o estado de parada pronto para auditoria; não descreve um estado pós-auditoria.

- Manter status em SOURCE_PACK_CANDIDATE até que uma auditoria separada aprove uma atualização canônica do checkpoint.
- Definir stopState como SPRYXEL_WO_001_EXACT_HEAD_AND_PROVIDER_STATE_READY_FOR_AUDIT.
- Definir nextLegalStage como CHATGPT_OBJECTIVE_AUDIT_SPRYXEL_WO_001.
- Manter completedThroughModule em GEF_BOOTSTRAP_1_1_1_INSTALLED até que a auditoria aceite esta proposta de forma independente.
- Manter productImplementation=NOT_STARTED e productBaseline=NOT_BASELINED.
- Substituir rulesetBaseline=NONE_OBSERVED por ACTIVE_MAIN_RULESET_24340349 somente quando a auditoria aceitar a leitura de volta do provider.
- Preservar a política de drift D-0007: reconciliar caminhos do projeto com a evidência Git autorizada; nunca reescrever a baseline imutável do GEF.
- Após APPROVED, a promoção canônica do checkpoint cabe ao auditor, não ao executor.

Esta proposta não atualiza CHECKPOINT.json ou CHECKPOINT.md, não autoriza merge nem admite trabalho de produto. A promoção pós-APPROVED permanece sob autoridade do auditor.
