# SPRYXEL-WO-004 — Matriz de dependências e escolhas em aberto

Status: CANONICAL PLANNING EVIDENCE — SPR-PLAN-007 approved by objective audit.

## Matriz de fronteiras

| Origem | Pode depender de | Não pode depender de | Responsabilidade delimitada |
| --- | --- | --- | --- |
| `apps/web` | `contracts`, `ui`, subconjunto público de `config`, `observability`, cliente HTTP | `db`, persistência, provider SDK/secrets, decisão de autorização ou regras de domínio | Apresentação, Next.js shell, navegação/URL state e consultas remotas |
| `apps/api` | `contracts`, `domain`, `db`, `config`, `observability`, adapters de borda | Cópias de regra em rotas, acesso não autorizado à persistência/provider, serialização direta de entidades | Fastify modular-monolith; valida, autoriza/orquestra, projeta resposta segura |
| `apps/worker` | `contracts`, `domain`, `db`, `config`, `observability`, adapters de borda | Web/UI, fila como fonte de verdade, retry ilimitado, mutação direta do ledger/TrustShield | Processo Node separado; consome referência transitória e executa limites aprovados |
| `packages/contracts` | tipos/esquemas neutros da plataforma | `db`, Drizzle, provider SDK/secrets, framework web/API | Esquemas versionados de fronteira, erros públicos e artefatos OpenAPI |
| `packages/domain` | tipos, portas e contratos neutros | Next.js, Fastify, Drizzle, Redis/S3/provider SDK, acesso direto a ambiente | Invariantes e casos de uso sem acoplamento a framework/provider |
| `packages/db` | portas/tipos de domínio mínimos e PostgreSQL/Drizzle/SQL | Next.js, provider comercial/IA, DTOs públicos como fonte de schema | Persistência canônica, migrações, constraints e RLS |
| `packages/config` | schemas de configuração e runtime mínimo | segredos versionados, política de domínio, cliente privilegiado do produto | Validação no startup, classificação e redação de configuração |
| `packages/observability` | interfaces neutras e bibliotecas de logs/telemetria na borda | payloads sensíveis sem redação, estado de negócio, backend pago obrigatório | IDs de correlação, logs estruturados, métricas/traces e redaction |
| `packages/ui` | tokens CSS semânticos, primitives acessíveis, tipos de apresentação | `db`, Node server, APIs privadas, invariantes de negócio | Design system canônico e composição de interface |
| `packages/testkit` | clientes de serviços efêmeros e fixtures sintéticas | dados de produção, serviço persistente compartilhado, mocks como única prova de invariantes | Infra descartável, isolamento, setup/teardown e fixtures de teste |

## Direção do grafo

```text
web ─────────────► contracts / ui / config-public / observability
api ─────────────► contracts / domain / db / config / observability / adapters
worker ──────────► contracts / domain / db / config / observability / adapters
db ──────────────► domain ports (quando necessário) + PostgreSQL/Drizzle/SQL
ui ──────────────► contracts de apresentação, sem imports server-side
domain ──────────► portas e tipos neutros, sem framework/provider
contracts ───────► schemas/tipos neutros, sem database/provider
```

Regras executáveis no futuro workspace: sem ciclos; imports proibidos conforme tabela; sem deep-import em API privada de outro pacote. Worker/API compartilham serviços de domínio e contratos, não regras duplicadas. O fluxo de autoridade é `boundary schema → autorização/orquestração → domínio → transação PostgreSQL → referência para fila/storage → evidência segura`.

## Matriz de decisões e estado

| Decisão | Estado no SPR-PLAN-007 | Razão limitada | Evidência/trabalho que ainda pode mudar o detalhe |
| --- | --- | --- | --- |
| TypeScript + Node.js 22 LTS-compatible (D-123) | Aprovado para planejamento | Runtime comum dos processos de produto | Preflight de versão/imagem compatível na implementação |
| npm workspaces e uma lockfile (D-124) | Aprovado; identidade GEF preservada | Mantém package manager existente | Wiring e manifestos só em IMP-001 |
| Orquestração compatível com Turborepo (D-125) | Família aprovada; versão aberta | Grafo/cache de tasks | Preflight e pin exato no IMP-001 |
| Next.js App Router / React / TS; Fastify API; Node worker (D-127, D-131, D-144) | Aprovado para planejamento | Shell, única API de negócio e processo assíncrono separado | Versões compatíveis e detalhes de runtime na implementação |
| CSS tokens / Tailwind / primitives headless; Query/URL/Zustand-compatible; ICU/next-intl-compatible (D-128…D-130) | Direção aprovada; versões abertas | Cumprir UX canônico e separar estado remoto/local | Compatibilidade, acessibilidade, licença e preflight de versão |
| JSON REST `/api/v1`, OpenAPI 3.1, Zod-compatible, RFC 9457 (D-132…D-134) | Fundação aprovada; catálogo/shape final aberto | Contrato de borda comum e seguro | Work Orders de endpoint/integração |
| Idempotência e UUIDv7-compatible (D-135…D-136) | Baseline aprovada | Replay e IDs duráveis opacos | Requisitos exatos por endpoint e implementação |
| PostgreSQL + Drizzle-compatible + SQL migrado (D-137…D-140) | Plataforma/convenções aprovadas; schema aberto | Estado canônico, controle tipado e RLS/SQL explícitos | Tabelas e migrações por domínio e preflight |
| Redis + BullMQ-compatible (D-141) | Mecanismo transitório aprovado; provider/version aberta | Coordenação sem retirar verdade durável do PostgreSQL | Compatibilidade/ops no IMP-001 |
| S3-compatible + MinIO local (D-142) | Adapter/local protocol aprovado; provider de produção aberto | Armazenamento privado substituível | Compatibilidade de API, terms/custo antes de produção |
| Auth adapter (D-143) | Provider deliberadamente NÃO FROZEN | Não bloquear fundação nem fingir identidade | Work Order de Identity/Tenancy antes do slice de identidade |
| Billing, GPU/modelo, object store de produção (D-145) | Providers abertos | Evitar dependência de termos/compatibilidade sem evidência atual | Work Order disparado + termos, licença, segurança e economics |
| Config tipada; Pino-compatible + OpenTelemetry-compatible (D-146…D-147) | Contrato aprovado; versões/exporter abertos | Startup seguro, correlação e operação | Implementação; nenhum backend pago obrigatório |
| Compose PostgreSQL/Redis/MinIO; GPU opcional/off (D-148) | Perfil planejado, não implantado | Caber em 24 GB; manter inference fora do caminho padrão | Imagens/limites exatos no IMP-001 |
| Paridade local/cloud (D-149) | Invariante aprovada | Evita comportamento incompatível por ambiente | Testes de adapter em Work Orders de execução |
| Vitest-compatible / serviços reais / Playwright-compatible (D-150) | Stack de teste aprovada; versões abertas | Diferenciar unitário e integrações reais | Pin, containers e fluxos críticos quando existirem |
| Limites de dependência (D-151) | Aprovados | Prevenir backend duplicado/ciclos/leak de provider | Import/cycle gate automatizado no IMP-001 |
| IMP-001 bootstrap (D-152) | Slice futuro especificado, não executado | Habilitar trabalho de produto com gates sem lógica de negócio | Work Order/Context Lock próprio e preflight |
| Sequência NECESSARY (D-153) | Ordem padrão aprovada | Segurança/tenancy e economia antecedem geração | Recompilável se evidência/dependência mudar |

## Escolhas explicitamente abertas

- Provider de autenticação e plano/termos; schema de identidade/tenant.
- Provider de billing/Merchant of Record e contrato de pagamento; impostos, preço, SC/pack, COGS e working capital continuam sem freeze.
- Provider GPU/modelo, licença elegível de produção, runtime/quantização e benchmark; nenhuma seleção ou benchmark foi criado por esta matriz.
- Provider S3 de produção, hosting PostgreSQL/Redis/telemetria e preços/limites externos.
- Versões exatas de todas as dependências de produto e imagens Docker; devem passar preflight atual e ser pinadas no Work Order de implementação.
- Catálogo de endpoint, OAuth scopes/metadata, CLI/MCP catalog, IDs específicos de domínio, paginação, retenção, schema físico e política por endpoint.

Nenhuma escolha aberta é resolvida por inferência, disponibilidade de pacote, recomendação de fornecedor ou necessidade de check verde.

## Auditoria

Matriz de fronteiras, grafo acíclico planejado e escolhas deliberadamente abertas foram confirmados no head `3a2c7015a90321ad6adc053c3984a3ee2461a770`.
