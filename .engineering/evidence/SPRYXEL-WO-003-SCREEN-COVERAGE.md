# Evidência de cobertura de módulos e superfícies

Work Order: SPRYXEL-WO-003

Incremento: SPR-PLAN-006

Status: candidato à auditoria; este documento não promove o checkpoint.

## Matriz NECESSARY V1

As 20 linhas abaixo seguem a classificação registrada em SCOPE.md. Cada módulo possui uma superfície de UX própria ou uma exposição operacional integrada e protegida. Superfície nomeada não altera escopo, status de implementação ou autorização.

| Módulo | Classificação em Scope | Superfície proprietária | Contexto / papel | Cobertura |
| --- | --- | --- | --- | --- |
| M-01 Home / Command Center | NECESSARY | Home com próximos passos, projetos e jobs recentes | Global / membro autenticado | PASS |
| M-02 Projects | NECESSARY | Lista, criação e visão geral do projeto | Global → projeto / membro | PASS |
| M-03 Spryxel DNA Studio | NECESSARY | Configuração guiada, versões e comparação de DNA | Projeto / membro autorizado | PASS |
| M-04 Generate Studio | NECESSARY | Solicitação, contrato/perfil, orçamento, job, candidatos e QA | Studio / membro do projeto | PASS |
| M-05 Character Studio | NECESSARY | Geração de personagem com identidade/anatomia + grammar compartilhada | Studio / membro do projeto | PASS |
| M-06 World Studio | NECESSARY | Produção de ativos de mundo/ambiente | Studio / membro do projeto | PASS |
| M-07 Tileset Studio | NECESSARY | Tileset, dimensões/transições/seams, job e QA | Studio / membro do projeto | PASS |
| M-08 Items & Props Studio | NECESSARY | Itens/props, família, candidatos e variações | Studio / membro do projeto | PASS |
| M-14 Asset Library | NECESSARY | Busca, inspeção, linhagem, versão e aprovação | Projeto / membro autorizado | PASS |
| M-15 Asset Graph | NECESSARY | Linhagem e dependências com links a asset/job | Projeto / membro autorizado | PASS |
| M-17 QA Center | NECESSARY | Integrity Gate, evidências, reparo, revisão e aprovação | Projeto / membro ou revisor autorizado | PASS |
| M-18 Export Center / EngineBridge | NECESSARY | Perfil Godot/Unity, inclusão, validação, compatibilidade e proveniência | Projeto / membro autorizado | PASS |
| M-19 Developer Platform / AgentBridge | NECESSARY | API/MCP/CLI: escopo, vínculo, expiração, orçamento, uso e revogação | Global + projeto / desenvolvedor autorizado | PASS |
| M-20 Jobs / Queue Center | NECESSARY | Jobs duráveis, estágios, cancelamento elegível e resultado | Global + projeto / membro autorizado | PASS |
| M-21 Credits / Billing | NECESSARY | Créditos/ledger e compra/recibo quando habilitados | Global / titular autorizado | PASS |
| M-22 CostGuard | NECESSARY | Estimativa e bloqueio seguro no fluxo; controles restritos no Ops | Membro vê resultado; owner vê controles permitidos | PASS |
| M-23 TrustShield | NECESSARY | Mensagem segura de elegibilidade; revisão restrita quando autorizada | Membro recebe resultado; revisor autorizado vê caso | PASS |
| M-24 RevenueShield | NECESSARY | Risco financeiro/promoções em operação restrita | Owner/operator autorizado | PASS |
| M-25 Admin / Owner Console | NECESSARY | Administração isolada, MFA/reauth, confirmação e auditoria | Owner/Admin autorizado | PASS |
| M-26 Observability & Economics | NECESSARY | Painel de operação e evidências econômicas | Owner/operator autorizado | PASS |

## Regras de preservação e revisão

- M-09 a M-13, M-16 e M-28 a M-37 permanecem IMPORTANT, incluindo os studios de mapas e UI/HUD como V1.x; não são promovidos para NECESSARY V1.
- M-27 permanece FUTURE e não recebe promessa de tela V1.
- CostGuard/TrustShield/RevenueShield não ganham telas públicas com controles ou sinais internos: controles e evidências são limitados pelo papel.
- A superfície de usuário para custo/política mostra somente motivo acionável e remediation permitida; não revela margem interna, thresholds, device hashes, IDs vinculados, grafos ou regras antifraude.
- Todas as telas de studio usam a gramática de job/contrato/custo/QA/versão/export aplicável e mantêm backend, ledger e registros canônicos como fonte de verdade.
- Em larguras abaixo de 1024 px, edição complexa permanece fora da promessa V1; o companion limita-se a monitoramento, revisão/aprovação, notificações, conta/billing, navegação leve e ações simples seguras.

## Resultado documental

20/20 módulos NECESSARY V1 mapeados a superfícies; nenhuma lacuna exige justificativa system-only. O inventário completo, incluindo módulos IMPORTANT/FUTURE e modos responsivos, está em SCREEN-INVENTORY.md.
