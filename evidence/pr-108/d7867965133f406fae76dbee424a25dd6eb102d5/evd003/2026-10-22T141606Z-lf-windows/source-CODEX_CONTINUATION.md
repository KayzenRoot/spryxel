# Codex: missão SPRYXEL-PR108-EVD-003 (continuação somente evidências)

Executar **somente** em ambiente autorizado com GitHub e npm acessíveis, e somente se o custo incremental da execução for zero. Respeitar STOP CONDITIONS; não mudar código, branches ou PRs.

**Repositório:** KayzenRoot/spryxel
**PR:** 108
**HEAD fixado:** `d7867965133f406fae76dbee424a25dd6eb102d5`
**main fixada:** `6a6b0fe3263e8af9daa026f94d0e9d7ca48b9b2f`

1. Inspecione `collector_readonly.sh` e `AUDIT_README.md` deste ZIP; confirme a procedência e que o coletor usa `git ls-remote`, clone temporário, checkout detached, `npm ci`, `./node_modules/.bin/biome --version`, `npm run format:check`, verifica ausência de dirty diff e SHAs antes/depois. Não execute se algum comando violar uma restrição.
2. Rode no shell que suporta Bash (Git Bash/WSL/Linux/macOS):
   ```bash
   export EVD_OUT="$HOME/SPRYXEL_PR108_EVD003_d7867965"
   bash ./collector_readonly.sh
   echo "collector_exit=$?"
   (cd "$EVD_OUT" && sha256sum -c manifest.sha256)
   ```
   Se houver falha de DNS, permissão ou dependência, entregue o erro bruto real e classifique BLOCKED; não altere proxy, DNS, credenciais, CI, arquivos de projeto ou configs para contornar.
3. Somente com `EXIT_biome_version=0`, Biome 2.5.15, `EXIT_format_check=0`, SHA íntegro, `git status` vazio, todos os hashes válidos e rechecagem dos refs remotos, classifique `FORMAT_EVIDENCE_PASS`.
4. Revise a PR 108 substantivamente por um **revisor independente** e não o executor ou autor. Verifique custo adicional zero, elegibilidade e uso permitido antes de solicitar revisão. Sem prova de gratuidade, não invoque CodeRabbit/Copilot e registre `INDEPENDENT_REVIEW_PENDING`. Solicitação pendente não é aprovação. Um relatório de outro agente controlado pelo mesmo executor só é "revisão independente" se a independência for objetivamente justificada e o usuário aceitar explicitamente o padrão; caso contrário é second pass técnico, não approval externo.
5. Entregue logs BRUTOS (`*.raw.log`), recibo, manifesto SHA-256, resultados dos checks, URL/identidade/commit da revisão externa se houver, e veredito. Nunca invente exit code. Retorne para auditoria ChatGPT, sem merge/deploy.

**STOP:** `SPRYXEL_PR108_EVD003_EVIDENCE_READY_FOR_READONLY_REAUDIT` se tudo comprovado; caso contrário `SPRYXEL_PR108_EVD003_BLOCKED_EVIDENCE`, preservando estado remoto.
