# Integration Contracts

Status: SOURCE_PACK_CANDIDATE — candidates and boundaries only. Procurement, provider configuration, and product implementation are NOT_STARTED.

## Game engines and export

Canonical assets remain engine-independent. EngineBridge adapts validated exports for Godot v1 and Unity v1. Unreal is not a V1 export promise; it is planned for later. Export is project-authorized, versioned, provenance-bearing, and uses safe private delivery.

## Model and workflow providers

Model/provider selection is hidden behind Model Router and versioned Generation SKU/Asset Contract. Inference Gateway adapters may target local workers and bounded serverless workers. ComfyUI is an inference/workflow adapter and R&D environment; it does not own billing, trust, authorization, or business invariants.

Model candidates and license status are maintained in MODEL-INFERENCE-STRATEGY.md. No candidate is a paid-production dependency until final commercial-license review, benchmark qualification, economics evidence, and approval.

## Identity, bot, and security integrations

Supabase-based planning includes Auth-native limits and MFA capabilities; the final provider/plan and plan-dependent controls require validation. Layer native Auth controls with SPRYXEL edge/risk-aware and cost-aware limits.

Cloudflare Turnstile is the preferred V1 planning candidate for signup, recovery, suspicious login, trial, referral, and suspicious generation bursts. Server-side Siteverify is mandatory; token replay/expiry/hostname/action checks and minimal outcome logging apply. Enterprise Ephemeral IDs are future optional, not a V1 dependency.

Network/device/payment-provider signals enter through minimized, purpose-bound adapters. Never persist raw card details. Use processor identifiers/tokens; same instrument is context, not automatic fraud.

## Billing integrations

Use BillingProvider abstraction. Paddle/Merchant of Record is preferred early global candidate for further validation; Stripe direct payments remain first-class alternative. No contract/provider choice is final. Provider events require signature validation, replay control where supported, idempotency, canonical event persistence, and reconciliation.

## Storage, queue, and deployment services

The master considers free-tier web/database/storage and serverless GPU to minimize early infrastructure cost, with PostgreSQL canonical state, a queue/job boundary, private object storage, and provider-neutral adapters. Exact queue, object storage, runtime, and GPU provider selections remain open where the master says so. Revalidate external price, limits, commercial eligibility, and terms before launch.

## Compatibility requirements

Adapters cannot change Asset Contract semantics, job idempotency, cost authorization, credit ledger, trust policy, QA, provenance, or tenant isolation. Provider outage fallback may queue, pause, or use a cheaper qualified route; never silently select an unbounded expensive route. Provider-specific settings and credentials stay server-side and are not part of this Work Order.
