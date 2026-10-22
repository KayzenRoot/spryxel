# SPRYXEL PR #108 — EVD-003 CWD-FIX

## Resultado

FORMAT_PASS no HEAD exato d7867965133f406fae76dbee424a25dd6eb102d5. npm run format:check foi executado uma vez no clone temporário e terminou com exit code 0; Biome reportou Checked 135 files ... No fixes applied.

## Identidade e diretórios

- PR: https://github.com/KayzenRoot/spryxel/pull/108
- Branch da PR: feat/spryxel-phase-c-private-asset-contracts-clean-20261020
- HEAD local antes do npm, imediatamente antes do npm e após validação: d7867965133f406fae76dbee424a25dd6eb102d5, d7867965133f406fae76dbee424a25dd6eb102d5, d7867965133f406fae76dbee424a25dd6eb102d5.
- main remota antes e depois: 6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f e 6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f.
- evidence/spryxel antes da publicação: 90248de701e99f90f81622a1181babeadca8261f.
- Checkout: git clone --no-checkout, core.autocrlf=false e core.eol=lf aplicados antes do checkout destacado.
- Antes de cada operação, run_in_clone pwd -P correspondeu a cd "/repo" && pwd -P (3/3). Caminhos absolutos locais redigidos como [SCRATCH_ROOT].
- git ls-files --eol: antes e depois do npm, 304 arquivos de texto i/lf w/lf, 7 arquivos binários i/-text w/-text, 0 outras classificações; validadores exit 0.

## Comandos e exit codes

| Operação | Resultado |
|---|---:|
| npm ci --ignore-scripts --no-audit --no-fund | exit 0 |
| ./node_modules/.bin/biome --version | exit 0; versão 2.5.15 |
| npm run format:check | exit 0; 135 arquivos; nenhuma correção aplicada |

As três operações executaram em [SCRATCH_ROOT]/work/clone-0HhIYL/repo. Saídas completas de stdout/stderr e códigos individuais estão em raw/, sanitizados somente para remover caminhos locais.

## Ambiente e limitação registrada

- Node v26.4.0, requisito do pacote >=22.11.0.
- npm 11.17.0; o projeto declara npm@10.9.9. Há VERSION_DRIFT (npm local 11.17.0 vs. 10.9.9); nenhuma instalação global ou mudança de configuração foi feita.
- Git git version 2.55.0.windows.3; Biome exato 2.5.15.

## Integridade e privacidade

- git diff --check, git diff --exit-code, git diff --cached --exit-code: exit 0.
- git status --porcelain antes e depois: limpo; nenhum arquivo rastreado ou staged alterado.
- HEAD da PR e main permaneceram nos SHAs obrigatórios antes/depois.
- Cópias publicadas redigem o caminho local. Scan de padrões de segredos e caminhos locais: PASS; o resultado está em sensitive-scan.log.
- manifest.sha256 cobre todos os arquivos publicados exceto o próprio manifesto; sha256sum -c manifest.sha256 terminou com exit 0, conforme manifest-validation.log.

## Tentativas de preparação do coletor

Duas tentativas temporárias anteriores pararam antes de npm ci e format:check: uma falhou na serialização do comando Node do coletor (exit 36), outra na sintaxe do validador AWK do coletor (exit 38). Elas não são resultados de testes do projeto. Uma tentativa de invocar Git Bash com caminho malformado não chegou a iniciar processo. A execução válida acima é a única execução do format check; registros de preparação estão em collector-preparation-notes.log.

## Evidência da revisão de conteúdo staged

git diff --cached --check retornou exit 2 com 5 diagnósticos em logs stdout/stderr preservados. Eles indicam linhas em branco finais e um CR final no log de stdout do Node. Os bytes originais dos logs foram preservados; não foram reformatados para ocultar os avisos. A saída está em publication-diff-check.log.
## Decisão

Gate de formatação: PASS. Revisão independente do HEAD exato permanece pendente; este resultado não autoriza merge. Merge e deploy não foram executados.

STOP: SPRYXEL_PR108_EVD003_CWD_FIX_FORMAT_PASS_EVIDENCE_PUBLISHED_NO_MERGE