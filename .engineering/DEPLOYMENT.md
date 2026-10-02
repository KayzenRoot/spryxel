# Deployment

Status: CANONICAL — approved by objective audit of SPRYXEL-WO-002.
No Spryxel product has been deployed or implemented.

## Development

Local-first Docker development targets the planning baseline of RTX 5050 8 GB VRAM and 24 GB RAM. Use Docker profiles so optional services do not overwhelm this workstation. Local inference supports development and benchmarking; model fit may require quantization/offload and is not guaranteed for every candidate.

Preserve local-to-cloud parity in job identity, Asset Contract, Model Router, cost authorization, queue semantics, QA, provenance, and ledger boundaries. Use free tiers only where commercially permitted. Public free cloud budget defaults to zero until an owner explicitly funds a campaign budget.

## Release environments and gates

- Development: local Docker/RTX 5050; bounded private test quotas; cloud generation not required.
- Closed alpha: capped testers, local-first where practical, no SLA, explicit alpha limitations, no public free-cloud spend by default.
- Public paid production: serverless GPU capacity, measured COGS and cost per accepted asset, working-capital reserve, validated payment/billing path, stress simulator and circuit breakers, security/privacy implementation and validation, tested TrustShield, and legal/accounting review.

Public paid cloud generation is prohibited until available generation cash reserve covers p95 daily cloud COGS over payout lag plus provider prepayment, refund cash buffer, and operating safety buffer. Positive unit economics alone does not prove working capital.

## Provider and external-service boundaries

Keep deployment adapters replaceable. Candidate providers, current planning prices, and payment assumptions are snapshot facts in BILLING-ECONOMICS.md and INTEGRATION-CONTRACTS.md; revalidate before launch. No provider is procured or configured by this Work Order.

## Governance/provider rollout and recovery

SPRYXEL-WO-001 established active main ruleset ID 24340349 and the existing four required checks. WO-002 performs read-only validation only; it does not mutate provider settings, ruleset, visibility, GEF, or .gef.

For future provider changes, preserve before/after snapshots and read-back evidence. Recover only under a separately authorized action. Do not rewrite Git history or weaken required security/governance checks as an ad hoc workaround.

## Product runtime planning — SPR-PLAN-007 canonical

The planned product processes use TypeScript on Node.js 22 LTS-compatible runtime: Next.js web presentation, Fastify control-plane API and a separate Node worker. Core local infrastructure is a bounded Docker Compose `infra` profile for PostgreSQL, Redis and MinIO-compatible storage. Web/API/worker may run on the host for fast HMR or in containers when parity is required. A separate `test` profile uses disposable real services; GPU/inference is an optional profile, off by default. The resource baseline remains 24 GB RAM / 8 GB VRAM.

This is a development plan, not a deployment manifest or provider procurement. No Compose/runtime file is created by SPRYXEL-WO-004. Production hosting, PostgreSQL/Redis service, S3 provider, telemetry exporter, auth/billing/GPU providers and exact image/package versions remain open for compatibility, security, terms and cost preflight. See [LOCAL-DEVELOPMENT.md](LOCAL-DEVELOPMENT.md).
