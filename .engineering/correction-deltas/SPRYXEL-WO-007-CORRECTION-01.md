# SPRYXEL-WO-007 — Correction Delta 01

**Work Order:** `SPRYXEL-WO-007`
**Increment:** `SPRYXEL-IMP-003`
**PR:** #27
**Risk:** `HIGH_ASSURANCE`
**Status:** `SATISFIED`

## Objective

Make the disposable PostgreSQL integration harness deterministic and diagnostically useful without weakening the Work Order acceptance, replacing PostgreSQL, skipping migrations/RLS, changing product behavior, or altering any protected governance source.

## Authorized correction scope

- Keep persistent local-development PostgreSQL under the `infra` profile.
- Run disposable integration PostgreSQL under the `test` profile with Linux tmpfs at `/var/lib/postgresql`, covering `PGDATA`; do not use a Windows bind mount or persistent test volume for PostgreSQL.
- Keep the pinned real PostgreSQL image, role initialization, real migrations, RLS, and all service handshakes.
- Bound Compose start, diagnostics, cleanup and child-process waits. Preserve the unique per-run Compose project and secret redaction.
- On integration failure, capture Compose service status, PostgreSQL container state, configured tmpfs/mounts, process state (`STAT`) and bounded PostgreSQL startup logs before cleanup.
- Tear down only the unique test Compose project, including its volumes/orphans, and verify that its containers, volumes and networks are absent.
- Normalize the PostgreSQL init hook to LF inside the built image and the bind-mounted SeaweedFS launcher before execution, so a Windows `core.autocrlf=true` checkout cannot change Linux shell interpreter lines. The SeaweedFS image, version, digest and authenticated S3 path remain unchanged.
- Add harness regression coverage and record results in the PT-BR Evidence Bundle.

## Prohibited changes

No product logic, acceptance relaxation, mocks, skipped PostgreSQL/RLS/migrations, new dependency, D-001…D-161 mutation, Context Lock rewrite, `.gef`/GEF change, ruleset/provider/workflow/source-seed/checkpoint mutation, merge, checkpoint promotion or next increment.

## Acceptance and stop rules

1. Reproduce and record the pre-correction integration failure and inspect the image, PGDATA, Compose mount, healthcheck, container state, process state and startup logs.
2. Prove the test PostgreSQL data mount is Linux tmpfs and that local `infra` PostgreSQL remains persistent.
3. Prove real PostgreSQL becomes healthy, the migrations and RLS integration execute, Redis and SeaweedFS retain real-service health/handshakes, and the project-scoped cleanup leaves no test container, volume or network.
4. Run the complete baseline before any SPRYXEL-IMP-003 product mutation. Continue WO-007 only if that baseline is healthy.
5. If `initdb` still remains in uninterruptible `D` state with PGDATA on tmpfs and an otherwise minimal container, stop `BLOCKED`, preserve the evidence, and do not change product code to mask a Docker/WSL I/O failure.

## Initial reproduction evidence

At candidate head `1a65a68bea0e71f257e7f20320707ae2a3f93552`, Node `v22.23.3` / npm `10.9.9`, `npm run test:integration` exited 1 while Compose reported disposable `postgres` exit code 126 during health-gated startup. The runner's prior error path mislabeled PostgreSQL startup as a SeaweedFS failure and did not retain PostgreSQL `inspect`/process/log diagnostics.

A direct probe of the pinned derived image `spryxel/postgres-test:18.6-alpine3.24` with `/var/lib/postgresql` mounted tmpfs reached `initdb: ... post-bootstrap initialization ... ok`, `database system is ready to accept connections`, and `CREATE DATABASE`; startup then exited 126 because the copied init hook had a CRLF shebang (`/bin/sh^M`). The image was `sha256:afaac66e44125f5582d53256016b0b5af8363dca42a2a40a1e96d04f5c98937b`, built from the pinned PostgreSQL base image in `infra/postgres/Dockerfile`. No `D` state was observed in that tmpfs probe. The earlier blocked execution reported `initdb` in `D` both through Compose and outside Compose; this correction does not treat that prior observation as disproved by the later probe.

After PostgreSQL became healthy in Compose with the tmpfs mount, the next real integration startup exposed a separate Windows line-ending failure in the bind-mounted SeaweedFS launcher: `/run/spryxel/start.sh: set: line 2: illegal option -`. The exact selected SeaweedFS version/digest and S3 authentication are unchanged; the test entrypoint now normalizes only the mounted shell copy before running it.

## Execution results

- Harness regressions: 3/3 PASS. `npm run lint`, `npm run typecheck`, `npm run build`, `npm run architecture:check`, `npm run test:worker`, `npm run test:integration`, `npm run test:browser`, aggregate `npm test`, `npm audit --audit-level=high` and `git diff --check`: PASS. Unit suite initially had one transient liveness timeout in a 16-worker run (63/64); the unmodified standard retry passed 64/64.
- Integration used the real disposable PostgreSQL service on Linux tmpfs, real migrations/RLS, Redis/BullMQ and authenticated SeaweedFS S3. The integration harness asserted tmpfs from container configuration and `/proc/mounts`; teardown confirmed no containers, volumes or networks remained in its unique Compose project.
- Full baseline HIGH_ASSURANCE acceptance completed before product mutation. On this Windows checkout with `core.autocrlf=true`, plain `format:check` reports existing CRLF files; `npm run format:check -- --line-ending=crlf` passed without normalizing tracked files. The required Linux CI formatter remains unmodified and will be evaluated on the exact pushed head.
- GEF 1.1.1 doctor exited successfully but reports the documented worktree observation limits `GIT_DIRECTORY_NOT_A_DIRECTORY` and `WORKING_TREE_NOT_OBSERVED`; status is `UNKNOWN` for dirtiness and `UNEXPECTED` for drift. Two status reads were byte-identical (SHA-256 `22CB2AF52C9E8F83A104D320938802224EFCAA6EEE28CCB9FDABBEF9E1F50020`). Under D-0007 this is reconciled against the authorized exact Git delta; GEF-managed `.gef` state was not modified, and no clean/observed claim is made.
- The correction's only shell compatibility edits normalize line endings at the disposable test boundaries. PostgreSQL remains real and pinned; no acceptance step, RLS check, migration, service handshake or product behavior was removed or weakened.
- Correction acceptance is satisfied. The original WO-007 implementation may proceed under its existing Context Lock; the correction itself does not alter that lock or protected governance state.
