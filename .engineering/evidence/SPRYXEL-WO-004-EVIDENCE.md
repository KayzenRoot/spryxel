# SPRYXEL-WO-004 — Evidence Bundle

Status: EM EXECUÇÃO — SPR-PLAN-007; candidato para auditoria objetiva. Este arquivo registra somente evidência obtida pelo executor; a descrição da PR conterá a evidência pós-push do exact final head.

## Identificação e gate de autoridade

- Repositório: `KayzenRoot/spryxel`
- Work Order / incremento: `SPRYXEL-WO-004` / `SPR-PLAN-007`
- Issue / PR / branch: [#13](https://github.com/KayzenRoot/spryxel/issues/13) / [#14](https://github.com/KayzenRoot/spryxel/pull/14) / `codex/spryxel-wo-004-implementation-planning`
- Base de execução esperada e observada: `main@85173742325fa67fb6b4ea19e62871196eb7c210`
- HEAD observado antes da execução: `3080ed20f589378042942f170b77aad8d59ac425`
- Context Lock: `.engineering/context-locks/SPRYXEL-WO-004.json` = `FRESH`; repository, branch, issue, planning increment e GEF pin correspondem ao pedido.
- Fingerprints críticos: `26/26` conferidos contra a base exata; divergências `0`.
- Work Order blob: `9deb3b430f61066df8362f4e798f98d9bef152b0`; ledger baseline blob: `5a54ec65a6ad4a57ad95b8c514996dcda9749e48`.
- Permissão administrativa de repositório: presente. Ruleset `24340349`: ativo em `main`, sem bypass; mutation flags do Context Lock permanecem `false`. Nenhuma mutação provider/ruleset foi feita.
- Estado canônico lido: implementação `NOT_STARTED`; preço `NOT_FROZEN`; benchmark/COGS `NOT_RUN / NOT_AVAILABLE`; planejamento canônico até SPR-PLAN-006. O Context Lock preserva essas guardas.

## Decisões e cobertura

D-123…D-153 foram registrados uma vez no Decisions Ledger com títulos e texto de decisão exatamente iguais aos bullets do Work Order, estado `APPROVED FOR PLANNING` e fonte SPRYXEL-WO-004 / SPR-PLAN-007. A comparação de bytes do trecho D-001…D-122 contra `main` deu igualdade. O parser encontrou 153 headings D-001…D-153, sem duplicatas e sem IDs ausentes.

Os documentos de runtime/topologia, dados físicos, API, desenvolvimento local, arquitetura, teste, ordem de implementação e slice IMP-001 estão marcados como candidatos de planejamento. Escolhas de auth, billing, GPU/modelo, armazenamento de produção, versões exatas, preço, credit packs, schema físico e catálogo de endpoints permanecem explicitamente abertas. O Source Pack UX D-090…D-122, classes V1/V1.x/FUTURE, segurança, economia, TrustShield e limites de custo não são reclassificados.

## Paths alterados

O delta de `main` para o candidato tem duas fontes de admissão preexistentes no branch e 25 paths desta execução local. Todas pertencem ao escopo documental autorizado; nenhum arquivo de produto/provider foi alterado.

| Grupo | Paths | Razão da autorização |
| --- | --- | --- |
| Admissão já presente no branch | `.engineering/context-locks/SPRYXEL-WO-004.json`; `.engineering/work-orders/SPRYXEL-WO-004.md` | Context Lock e fonte normativa deste WO |
| Novos documentos de arquitetura | `.engineering/IMPLEMENTATION-ARCHITECTURE.md`; `.engineering/RUNTIME-STACK.md`; `.engineering/REPOSITORY-TOPOLOGY.md`; `.engineering/PHYSICAL-DATA-CONVENTIONS.md`; `.engineering/API-FOUNDATION-CONTRACT.md`; `.engineering/LOCAL-DEVELOPMENT.md`; `.engineering/IMPLEMENTATION-SEQUENCE.md`; `.engineering/FIRST-IMPLEMENTATION-SLICE.md` | Deliverables 1–8: planejamento compatível com D-123…D-153 |
| Evidência e checkpoint proposto | `.engineering/evidence/SPRYXEL-WO-004-DEPENDENCY-MATRIX.md`; `.engineering/evidence/SPRYXEL-WO-004-EVIDENCE.md`; `.engineering/checkpoint-deltas/SPRYXEL-WO-004-PROPOSED.md` | Deliverables 11–12; evidência e proposta sem promoção |
| Alinhamento de fontes existentes | `.engineering/DECISIONS-LEDGER.md`; `.engineering/PROJECT-OVERVIEW.md`; `.engineering/ARCHITECTURE.md`; `.engineering/REQUIREMENTS.md`; `.engineering/DATA-MODEL.md`; `.engineering/API-CONTRACTS.md`; `.engineering/INTEGRATION-CONTRACTS.md`; `.engineering/SECURITY.md`; `.engineering/MODEL-INFERENCE-STRATEGY.md`; `.engineering/DEPLOYMENT.md`; `.engineering/TEST-BENCHMARK-PLAN.md`; `.engineering/BACKLOG.md`; `.engineering/DEFINITION-OF-DONE.md`; `.engineering/SOURCE-HIERARCHY.md` | D-123…D-153 registrados e contratos existentes alinhados sem reclassificar scope/status |

O diff não inclui `apps/*`, `packages/*`, produto, `package.json`, `package-lock.json`, checkpoint, `.gef`, workflow, provider/ruleset ou source seed. `git diff --name-status` no commit final e a SHA exata constarão também na descrição da PR.

## Validações do executor

Resultados serão preenchidos após executar os comandos no HEAD candidato final. `PENDENTE` não significa aprovação.

| Validação | Resultado | Evidência exata |
| --- | --- | --- |
| Lock/base/26 fingerprints | PASS | base `85173742325fa67fb6b4ea19e62871196eb7c210`; 26/26; 0 divergências |
| D-001…D-122 preservados; D-123…D-153 únicos e texto/título idêntico | PASS | comparação binária do intervalo protegido e parser de headings contra os bullets do WO |
| Scope/classes e estados guardados | PASS | `SCOPE.md` e inventário UX não alterados; checkpoint continua em SPR-PLAN-006; `NOT_STARTED` / `NOT_FROZEN` / `NOT_RUN_NOT_AVAILABLE` |
| Matriz acíclica, imports proibidos documentados; IMP-001 sem exclusões | PASS | revisão das arestas do grafo; a fatia não inclui auth real, entidade, billing, créditos, TrustShield, geração, procurement ou AI path |
| Estrutura Markdown/JSON e links internos | PASS | 25 Markdown candidatos: fences balanceados e links locais existentes; checkpoint e Context Lock parseiam como JSON |
| Manifests, checkpoint, `.gef`, workflows e seed inalterados | PASS | hashes de `package.json`, `package-lock.json` e checkpoint iguais à base; diff dessas áreas = 0 paths |
| Secret-pattern scan e `git diff --check` | PASS | varredura regex não encontrou padrões de secret; `git diff --check` sem saída/erro |
| `npm ci --ignore-scripts --no-audit --no-fund` | PASS | exit 0; adicionou somente o pin de governança GEF já listado na root; `npm ls --depth=0` mostra apenas `@gef-bootstrap/cli@1.1.1` |
| GEF 1.1.1 assertion e `gef doctor --target . --json` | PASS | versão 1.1.1; doctor exit 0, terminal `SUCCEEDED`, findings toolchain/repository `HEALTHY` |
| Dois `gef status --target . --json` | PASS | exit 0 em ambos; byte-idênticos; SHA-256 UTF-8 `374BF5CC4B5776C05666C11DD599DB46D29A9C65CFEB6087A04B9A55B7B680B9`; `DIRTY`/`UNEXPECTED` reconciliado abaixo conforme D-0007 |
| Quatro checks requeridos no exact final head | PENDENTE | só os IDs/URLs que passarem após push do SHA final serão registrados na descrição da PR |

### Reconciliação GEF v1.1.1 / D-0007

O status bruto observa `repository=DIRTY` e `drift.class=UNEXPECTED`, pois GEF 1.1.1 usa `authorized:false` para comparar com o baseline imutável. O delta autorizado é exatamente o conjunto de 27 paths mapeado acima: 2 arquivos de admissão (WO/lock) e 25 paths de documentação/evidência desta execução, todos previstos no escopo do WO-004. Cada path foi classificado por grupo e finalidade. Nenhuma divergência fora desses grupos foi observada; `.gef`/receipt não foi editado. `operator.stale=true` espelha o checkpoint canônico ainda em SPR-PLAN-006, que o executor não pode promover; Context Lock continua `FRESH`. Assim, a classificação bruta `UNEXPECTED` não é tratada como autorização: a autorização decorre do Work Order, lock, diff exato e este bundle, nos termos de D-0007.

Os quatro checks vistos no HEAD inicial `3080ed20f589378042942f170b77aad8d59ac425` são somente evidência de admissão e **não** qualificam um HEAD posterior.

## Limites, riscos e finding status

- Código de produto, diretórios `apps/*`/`packages/*`, dependências de produto, Docker/Compose runtime, endpoints, migrations de produto, manifests, `.gef`, GEF, checkpoint, workflows, ruleset/provider e source seed não fazem parte desta mudança.
- IMP-001 não foi executado. Não foram escolhidos providers de produção nem executados benchmarks/COGS. Preço continua `NOT_FROZEN`.
- Findings CRITICAL: 0; HIGH: 0; MEDIUM: 0; LOW: 1 observação informativa do GEF doctor: proveniência da dependência `unverified` e integração GitHub `immutableRef=false` aparecem como `REVIEW` no diagnóstico local. O comando doctor encerrou `SUCCEEDED`; a observação não muda o pin GEF, não autoriza alteração de workflow/provider e não substitui os checks de segurança exatos da PR.
- Verdict candidato permanece pendente até todos os quatro checks do exact final head serem PASS.

## Checkpoint e conclusão

Checkpoint Delta proposto: [.engineering/checkpoint-deltas/SPRYXEL-WO-004-PROPOSED.md](../checkpoint-deltas/SPRYXEL-WO-004-PROPOSED.md). Checkpoint canônico não será alterado pelo executor.

STOP CONDITION do executor: `SPRYXEL_WO_004_IMPLEMENTATION_ARCHITECTURE_READY_FOR_AUDIT`. O estado final de auditoria será atualizado aqui e na descrição da PR com o exact base/head SHA, caminhos, comandos, resultados, timestamps e URLs dos quatro checks.


## Auditoria objetiva

- Veredito: `APPROVED`.
- Head de execução auditado: `3a2c7015a90321ad6adc053c3984a3ee2461a770`.
- D-001…D-122: preservadas byte a byte.
- D-123…D-153: 31/31 presentes exatamente uma vez e semanticamente iguais à Work Order.
- package.json/package-lock.json, CHECKPOINT.json/.md, .gef, workflows, ruleset/provider e source seed: inalterados pelo executor.
- Required checks no head auditado: Repository validation `110845340350`, Pipeline integrity `110845340400`, Gitleaks secrets `110845340454`, Trivy filesystem and configuration `110845340502`; todos PASS.
- Review threads não resolvidas: 0.
- O finding CodeRabbit de exact-head evidence foi avaliado como não aplicável ao contrato aprovado: a descrição da PR é a autoridade complementar pós-push para SHA/IDs/URLs, evitando um novo commit autorreferente.
- CRITICAL conhecido: 0; HIGH conhecido: 0.
- IMP-001: NOT EXECUTED.
- Product implementation: NOT_STARTED.
- Pricing: NOT_FROZEN.
- Benchmarks/COGS: NOT_RUN / NOT_AVAILABLE.

## Handoff de promoção

A promoção do checkpoint e dos documentos canônicos ocorre depois deste veredito APPROVED. Como fontes críticas mudam por ação autorizada do auditor, o Context Lock histórico de SPRYXEL-WO-004 passa a `STALE` por encerramento e não pode ser reutilizado. Merge permanece condicionado aos quatro required checks no head de promoção e zero review thread aberta.
