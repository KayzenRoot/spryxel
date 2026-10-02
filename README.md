# Spryxel platform foundation

This repository contains the bounded SPRYXEL-IMP-001 platform bootstrap: a minimal web shell, health/readiness API, separate worker process, and shared technical packages. Product authentication, tenancy, billing, generation, asset workflows, AI/model execution, and production storage providers are outside this slice.

## Local runtime

- Node.js `22.23.3` and npm `10.9.9` are the validated runtime/tool versions.
- Install the single workspace graph with `npm ci --ignore-scripts`.
- Start the local PostgreSQL, Redis, and authenticated S3-compatible SeaweedFS profile with `npm run infra:up`. It binds service ports to loopback and writes generated local credentials to the ignored `.env.local-infra` file.
- Stop those containers with `npm run infra:down`. The local named data volumes and ignored credentials stay in place.
- Start the web shell, API, and idle worker with `npm run dev`.

The API reads typed values documented in `.env.example`; secret values are not committed. The worker starts with no product job consumers. Database migrations run only through the explicit `npm run db:migrate` command against a configured database.

## Validation

Run `npm run format`, `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run architecture:check`, and `npm test`. The integration suite builds isolated, randomized Docker services, checks authenticated S3 operations and real PostgreSQL/Redis connections, then removes its containers and named volumes. The browser smoke suite uses headless Chromium.

GEF remains pinned at `@gef-bootstrap/cli@1.1.1`; its doctor and status commands remain available as `npm run gef:doctor` and `npm run gef:status`.


## Canonical implementation status

SPRYXEL-IMP-001 is COMPLETE under SPRYXEL-WO-005 after objective audit, canonical promotion, squash merge and post-merge validation. This repository contains the canonical platform foundation only. Identity/Tenancy and later product capabilities are not yet admitted.
