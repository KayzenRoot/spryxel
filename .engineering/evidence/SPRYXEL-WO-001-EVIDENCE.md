# Pacote de Evidências SPRYXEL-WO-001

Situação: READY_FOR_AUDIT após a conclusão dos checks de SHA exato.

## Vinculação

- Repositório: KayzenRoot/spryxel
- Issue: #2
- PR: #3
- Branch: codex/spryxel-wo-001-gef-github-governance
- Base de execução vinculada: main@10dca04e38cfcd2e07335faf9078cc6041766c02
- Context Lock: .engineering/context-locks/SPRYXEL-WO-001.json, status FRESH na verificação inicial; as nove impressões digitais críticas do Git conferiram.
- GEF: @gef-bootstrap/cli 1.1.1; commit do código-fonte 1dc030f1358eab0347043a3d54c7fc311c7c2123.
- Implementação de produto: NOT_STARTED.

A primeira cabeça que passou nos quatro contexts pretendidos do GitHub Actions antes da alteração do provider foi 17e7bdc52c02fb08ae69ccc23be89db767e33164. Este arquivo reúne evidências locais e resultados históricos de validação. O SHA do head final e os IDs/URLs dos quatro check-runs executados nesse commit são associados na descrição da PR #3 depois que os workflows terminam, pois esses dados só existem após o commit ser enviado e os checks concluírem. Essa divisão evita uma auto-referência impossível no arquivo.

## Caminhos alterados

### Source Pack preexistente na PR #3 antes desta execução

Estes arquivos foram introduzidos pelos commits de planejamento/source-pack admitidos e não foram alterados por esta execução:

- AGENTS.md
- README.md
- .engineering/ARCHITECTURE.md
- .engineering/BACKLOG.md
- .engineering/CHECKPOINT.json
- .engineering/CHECKPOINT.md
- .engineering/DECISIONS-LEDGER.md
- .engineering/DEFINITION-OF-DONE.md
- .engineering/DEPLOYMENT.md
- .engineering/PROJECT-OVERVIEW.md
- .engineering/REQUIREMENTS.md
- .engineering/SCOPE.md
- .engineering/SECURITY.md
- .engineering/SOURCE-HIERARCHY.md
- .engineering/TEST-BENCHMARK-PLAN.md
- .engineering/context-locks/SPRYXEL-WO-001.json
- .engineering/work-orders/SPRYXEL-WO-001.md

### Caminhos de execução e evidência SPRYXEL-WO-001

- .github/CODEOWNERS
- .github/ISSUE_TEMPLATE/work-order.yml
- .github/dependabot.yml
- .github/pull_request_template.md
- .github/scripts/pipeline-integrity.rb
- .github/workflows/gef-bootstrap-install.yml (removido)
- .github/workflows/gitleaks.yml
- .github/workflows/pipeline-integrity.yml
- .github/workflows/repository-validation.yml
- .github/workflows/trivy.yml
- .engineering/evidence/SPRYXEL-WO-001-EVIDENCE.md
- .engineering/checkpoint-deltas/SPRYXEL-WO-001-PROPOSED.md

Nenhum código de produto/runtime, package manifest, package lock, checkpoint, Context Lock ou estado gerenciado por .gef foi alterado por esta execução.

## Baseline do GEF e reconciliação do drift

- Impressão digital imutável da observação de inicialização: ae52168e19d137ddb1c4d5d1473c5409d41f30c1d3cd4ca011119969a00533c1 (model PROJECT_DRIFT_V1), registrada em .gef/init-state.json para a execução run-1-fb5489f151fc.
- Projeção determinística atual do status: before 8e6af789ede5f95e3a8022d8e084f3775da9d76b940fd83ca8d8c6f30e541954; after acc1557694c599a2820bee1afe1f2d3d85a1d899c919c1e0a7ba3883c431bd63; changed=true; class=UNEXPECTED.
- A classe bruta UNEXPECTED é esperada no GEF 1.1.1 exato: o detector da raiz do projeto exclui .gef e .gef-private e então chama detectDrift com authorized=false. Consulte o [código-fonte do registro do GEF](https://github.com/KayzenRoot/gef-bootstrap/blob/1dc030f1358eab0347043a3d54c7fc311c7c2123/packages/cli/src/registry.ts) fixado e [D-0007](../DECISIONS-LEDGER.md).
- A inicialização foi aplicada na PR #1 depois da observação registrada. O commit de inicialização ea9a5504162305bd5522511b417d8b07448e033b tem como pai pré-aplicação a4d7a8ebddb1abd7613da87dc5c5f64e99c7b2cd. Nesse pai, as entradas rastreadas da raiz eram .github, .gitignore, README.md, package-lock.json e package.json; o workflow de inicialização do GEF já executava npm ci antes de gef init. As entradas atuais de runtime .git e node_modules já existiam no ambiente observado. .gef é excluído da impressão digital da raiz do projeto.
- As únicas novas entradas atuais na raiz do projeto em relação àquele estado observado são .engineering e AGENTS.md. Ambas são caminhos autorizados de governança do Source Pack/Work Order, introduzidos na PR #3. README.md foi alterado como parte do mesmo Source Pack, mas sua entrada na raiz já existia, portanto não acrescenta uma diferença de nomes na raiz.
- Todos os caminhos .engineering listados acima, incluindo Work Order e Context Lock, são alterações do Source Pack na PR #3; não contêm implementação de produto. A WO atual acrescenta somente caminhos de governança/CI em .github e os dois caminhos de evidência autorizados.
- .gef/init-state.json e .gef/receipts/run-1-fb5489f151fc.json foram criados pelo bootstrap do GEF na PR #1 após sua observação e são evidências gerenciadas de bootstrap, fora da projeção da raiz do projeto. Não foram alterados por esta WO. O git diff da base main vinculada não mostra caminhos .gef.
- .github existia na baseline registrada. Substituir o workflow de bootstrap mutável, com contents:write, por workflows de governança somente leitura e fixados por SHA altera caminhos abaixo dessa raiz existente e não adiciona outra entrada à raiz do projeto.
- Nenhuma baseline do GEF, estado de adoção ou receipt foi editado manualmente ou rebaselineado.

## Validação local

| Verificação | Resultado |
| --- | --- |
| npm ci --ignore-scripts --no-audit --no-fund | PASS; um pacote exato instalado |
| npx --no-install gef --version --json | PASS; versão 1.1.1; Node v24.19.0 local |
| npx --no-install gef doctor --target . --json | PASS; terminal SUCCEEDED; checkpoint presente, legível e válido |
| Duas saídas consecutivas de gef status --target . --json | PASS; idênticas byte a byte; repositório limpo no momento da observação |
| .engineering/CHECKPOINT.json | PASS; JSON schemaVersion 2 |
| Parsing de package.json, package-lock.json, Context Lock, init state e GEF receipt JSON | PASS |
| git diff --check 2b2ba580993f644c2d687ed89055363610e2b4c8..HEAD | PASS para o delta de execução da WO |
| Diff de .gef a partir da base main vinculada | PASS; vazio |

O diff de todo o repositório a partir de main também aponta espaços finais em Markdown nos arquivos preexistentes e bloqueados por impressão digital CHECKPOINT.md e SPRYXEL-WO-001.md do source-pack. Esses arquivos não foram alterados porque isso invalidaria o Context Lock vinculado. O workflow de CI valida o delta de execução sem transformar esse problema preexistente de formatação em uma falha falsa da WO.

O GEF doctor informa estado de segurança REVIEW para proveniência npm não verificada e para sua entrada vazia de evidência GitHub, embora o comando doctor seja concluído com sucesso. O GEF 1.1.1 exato não descobre os pins de workflow por meio dessa entrada. A imposição de Actions imutáveis e a política de workflow são comprovadas de forma independente abaixo.

## Checks do head exato antes da alteração do provider

Os quatro contexts foram concluídos com sucesso no head 17e7bdc52c02fb08ae69ccc23be89db767e33164 pelo GitHub Actions integration 15368:

| Contexto | Resultado | Execução |
| --- | --- | --- |
| Repository validation | PASS | [110638305698](https://github.com/KayzenRoot/spryxel/actions/runs/36942905418/job/110638305698) |
| Pipeline integrity | PASS | [110638305766](https://github.com/KayzenRoot/spryxel/actions/runs/36942905452/job/110638305766) |
| Gitleaks secrets | PASS | [110638305733](https://github.com/KayzenRoot/spryxel/actions/runs/36942905527/job/110638305733) |
| Trivy filesystem and configuration | PASS | [110638305600](https://github.com/KayzenRoot/spryxel/actions/runs/36942905463/job/110638305600) |

Pipeline integrity analisou os seis arquivos YAML do GitHub e passou oito fixtures de política, incluindo casos negativos para actions mutáveis, write-all, pull_request_target e actions locais ocultas. Gitleaks analisou o intervalo de commits da PR com saída redigida e não encontrou segredo bloqueante. A análise de filesystem e misconfiguration do Trivy não relatou resultado HIGH ou CRITICAL. Os check-runs do head final após este commit de evidência são listados na descrição da PR #3.

## Estado do provider

### Antes

- Visibilidade do repositório: public.
- Branch padrão: main.
- Rulesets do repositório: nenhum; o endpoint de proteção legada de main retornou Branch not protected (404).
- GitHub Actions: enabled; allowed_actions=all; sha_pinning_required=false.
- allow_update_branch=false; allow_squash_merge=true; allow_merge_commit=true; allow_rebase_merge=true; delete_branch_on_merge=false; allow_auto_merge=false.
- Secret scanning e push protection já estavam habilitados. Dependabot security updates estavam desabilitados.
- As labels gef-managed e governed não existiam.

### Depois, com leitura de volta do GitHub

- A visibilidade permanece public; a branch padrão permanece main.
- GitHub Actions: enabled; allowed_actions=all; sha_pinning_required=true.
- allow_update_branch=true para suportar a política de verificação estrita de atualização do ruleset. Os métodos de merge existentes, auto-merge, exclusão de branch, secret scanning e push protection não foram alterados.
- Ruleset ativo do repositório ID 24340349, nome SPRYXEL main governance, target branch, include exato refs/heads/main, sem refs excluídas e sem bypass actors; current_user_can_bypass=never.
- Regras: exclusão bloqueada; non-fast-forward bloqueado; pull request obrigatório; required_approving_review_count=0; required_review_thread_resolution=true; code-owner review, last-push approval, dismiss stale reviews e extra approval for unattributed changes desabilitados.
- Required status checks, cada um associado ao GitHub Actions integration 15368: Repository validation; Pipeline integrity; Gitleaks secrets; Trivy filesystem and configuration.
- Uma sondagem negativa de liveness adicionou um context sintético intencionalmente ausente ao conjunto obrigatório e o detectou como ausente; os quatro contexts configurados tiveram execuções bem-sucedidas no head exato e missingRequiredContexts=[].
- Labels criadas e verificadas por leitura: gef-managed (ID 12501767532) e governed (ID 12501767627). A issue #2 tem governed; a PR #3 tem ambas.
- A configuração do Dependabot propõe apenas atualizações semanais de GitHub Actions. Atualizações de pacote npm/GEF foram excluídas porque GEF 1.1.1 está congelado por D-0001 e upgrades exigem uma futura Work Order.

## Achados, riscos e encerramento

- Achados CRITICAL: nenhum observado.
- Achados HIGH: nenhum observado.
- O drift diagnóstico do GEF permanece true/UNEXPECTED por definição e está reconciliado acima; não foi suprimido.
- Os espaços finais em Markdown do source-pack permanecem inalterados e fora do delta desta execução.
- As iterações iniciais de CI encontraram e corrigiram um acumulador obsoleto de fixtures negativas no teste de política do pipeline e uma verificação de whitespace ampla demais para toda a PR. Nenhum check obrigatório final usa context inexistente ou filtrado.
- O checkpoint local do repositório permanece inalterado. A proposta de delta separada não foi promovida.
- O SHA exato final da PR, os IDs/URLs dos check-runs finais e suas conclusões são registrados na descrição da PR #3 depois que os workflows do commit de evidência terminam.

STOP CONDITION: SPRYXEL_WO_001_EXACT_HEAD_AND_PROVIDER_STATE_READY_FOR_AUDIT
