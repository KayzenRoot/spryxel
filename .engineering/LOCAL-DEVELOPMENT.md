# Local Development Contract

Status: CANONICAL — SPRYXEL-WO-004 / SPR-PLAN-007 approved by objective audit.

This document plans local infrastructure profiles; no Docker/Compose runtime file is created by SPRYXEL-WO-004. The resource baseline is 24 GB system RAM and RTX 5050 with 8 GB VRAM. Core control-plane work must not require a GPU or a paid external service.

The web/API/worker processes use the shared TypeScript + Node.js 22-compatible runtime and npm workspace graph. The planned boundaries are Next.js/React web, Fastify API and separate Node worker; PostgreSQL is canonical, Redis/BullMQ-compatible work coordination is transient, and SeaweedFS supplies the local S3-compatible test/development boundary. Exact tool/service versions are established by implementation preflight.

All processes propagate request/correlation IDs and use Pino-compatible redacted JSON logging with OpenTelemetry-compatible traces/metrics interfaces. No paid telemetry backend or production provider is needed to run the core local profile.

## Profiles

| Profile | Services | Intended use | Default |
| --- | --- | --- | --- |
| `infra` | PostgreSQL, Redis, SeaweedFS S3-compatible S3 endpoint | Core app/API/worker and integration development | Minimal local infrastructure profile |
| `test` | Disposable isolated PostgreSQL, Redis and S3-compatible endpoints, seeded only for the test run | Real-service integration tests and cleanup verification | Explicit opt-in per test command; never share mutable test state |
| `product` | Web, API and worker processes in containers when a work item needs that topology | Container parity and process-boundary debugging | Optional; host processes are the normal HMR path |
| `gpu` / `inference` | Local model runtime and GPU worker only when a separate inference task needs them | Model development/benchmarking | Off by default; optional and separately bounded |

The default local profile starts only PostgreSQL, Redis and SeaweedFS S3-compatible storage. GPU/inference services do not start by implication. Web/API/worker may run on the host for fast iteration or in containers for parity; both modes use the same contracts, IDs, error classes and durable-job semantics.

## Resource and data boundaries

- Keep the minimal services within the 24 GB RAM planning budget. Document bounded memory/CPU defaults and avoid starting model weights, browser suites and every service together without an explicit profile.
- Local Postgres uses the same migration path, constraints and RLS policy shape as production. Test profile uses isolated disposable volumes/containers and destroys only its own named resources.
- Redis carries transient queue state. A clean/reset local Redis must not erase canonical job history or operation ownership.
- SeaweedFS provides S3-compatible object operations for development/testing. Application tables store opaque bucket/key/version/metadata references; no SeaweedFS/provider-specific public URLs leak into product records.
- Use synthetic test data only. No production user, payment, trust or credential data is copied into local volumes.

## Process and configuration workflow

Each service reads typed validated config through the shared config package. Commit an `.env.example` only with variable names and safe placeholders/local defaults; real secrets stay in an external secret store or ignored local file. Startup fails closed for missing production-required values and logs a redacted config summary.

Planned developer workflow: check the pinned Node/npm preflight; start only `infra`; run checked-in migrations explicitly against a disposable database; start API/web/worker on host or the optional `product` profile; exercise the API health/readiness endpoints; run unit and focused integration suites; stop test-owned resources. The exact commands, image tags, port allocation, volume names and package scripts are pinned by IMP-001 after compatibility review, not guessed in this plan.

Never point a destructive migration or reset helper at a non-disposable database. A script must identify its profile/database and reject production-like targets. Migration runs are explicit, reviewable and forward-only; ordinary process startup does not mutate the schema.

## Local/cloud semantic parity

Local adapters preserve durable IDs, versioned contracts, bounded workflow budgets, idempotency, cost authorization hooks, QA/provenance shape and normalized error categories. Fake queues or object stores may be used for narrow unit tests, but they cannot be the only evidence for persistence, tenant, ledger or replay invariants. Development shortcuts must not create a product model incompatible with cloud adapters.


## Local S3 security supersession — D-154 / D-155

The MinIO-specific local/test implementation named by D-142/D-148 was rejected during SPRYXEL-WO-005 preflight after the public upstream repository became archived/read-only and current security evidence made the unmaintained community server unsuitable as a new required test dependency.

D-154/D-155 supersede only the local/test service choice. The architectural contract remains private S3-compatible storage behind a replaceable adapter; no production S3 provider is selected.

SeaweedFS is the current local/test default because the upstream project remains actively maintained, exposes an S3-compatible endpoint, publishes Docker guidance and release images, and uses an Apache-2.0 top-level license. Recompiled IMP-001 must pin an exact current release and immutable container digest after registry/security/license verification, and must verify the published image signature where supported. A future emulator replacement requires another explicit audited correction rather than silent substitution.
