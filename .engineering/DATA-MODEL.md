# Data Model

Status: CANONICAL — approved by objective audit of SPRYXEL-WO-002.
These are planning entities and invariants, not implemented database tables or a frozen physical schema.

## Canonical durable state

PostgreSQL is canonical for users, projects, assets, jobs, and ledger state. Queue/provider state is transient. RLS plus application authorization protects tenant boundaries. Object storage is private and addressable only through authorized project access and short-lived signed URLs.

## Product entities

- Account, session, membership/tenant, project, and project settings.
- Spryxel DNA versions: style identity, palette, visual references, constraints, and project rules.
- Asset Contract and versioned Generation SKU: asset type, dimensions/resolution profile, style/DNA version, pose/frame/layout, output requirements, quality profile, allowed provider/model abstraction, retry/repair/cost bounds, and export metadata.
- Asset, Asset Version, Asset Family/Pack, canonical metadata, source references, generated outputs, approval/rejection, and export record.
- Asset Graph nodes/edges for dependency, variation, component, animation/frame, tile/transition, map/layer/POI, UI component/theme, and provenance relationships as applicable.
- Generation Job, attempt, candidate, QA result, repair, delivery, and immutable replay/provenance record.
- Model/pipeline/provider adapter identity, benchmark qualification, license status/evidence, and versioned runtime configuration.

Master asset metadata includes canonical asset ID/type, project ID, family/pack, parent/base asset, version, style/DNA, palette, resolution/dimensions, animation/direction/frame data, tags, generation prompt/negative prompt, model/pipeline identity, seed/runtime settings, QA/approval, lineage, provenance, and storage/export references. Exact schemas remain owned by their specialized SKU contracts.

The v0.6.0 conceptual metadata field set is: asset_id, project_id, asset_type, asset_subtype, name, description, tags, status, version, parent_asset_id, source_asset_ids, dna_version, generation_id, workflow_id, model_id, pipeline_version, seed, width, height, frame_count, fps, directions, palette_id, license_state, provenance_id, qa_status, created_at, updated_at, approved_at, export_targets. 3D extensions may include vertex_count, triangle_count, UV state, rig state, material slots, LOD levels, and collision state.

Map contracts represent dimension-aligned, machine-addressable layers and structured map graph/region/POI identities. UI contracts represent coherent component packs, state coverage, localization-safe layout/text constraints, theme/DNA, and export references. Physical schemas and full per-SKU field sets remain conceptual/open rather than a frozen database schema.

## Job, QA, and provenance

Durable jobs have stable IDs and idempotency keys. Each attempt records model/pipeline/runtime identity, start/end, resource use, cost, output reference, and result. QA records contract version, deterministic hard-gate outcomes, domain checks, score/rubric, failure codes, repair lineage, and reviewer evidence. Store enough generation metadata for replay and audit without logging credentials.

Raw candidate outputs are distinct from accepted, versioned production assets. Approval is possible only after Integrity Gate passes and the applicable Production Score/contract requirements are satisfied. User rejection of a valid result is distinct from technical or quality failure.

## Financial entities

Wallet, Credit Lot, append-only Ledger Entry, Payment/Purchase, Provider Event, Subscription Cycle (future), Promotion/Campaign, Trial Entitlement, Reservation, Refund, Dispute, Compensation Grant, Pricing Rule version, and SKU economic result.

Credit Lot fields: id, wallet, origin, issued/remaining credits, issue/expiry times, purchase/cycle/promotion reference, jurisdiction, and status. Origins: TRIAL, PROMOTIONAL, REFERRAL, COMPENSATION, SUBSCRIPTION, PAID_PACK.

Financial invariants: immutable posted ledger plus compensating entries; no floating-point authoritative money; payment state separate from wallet state; provider webhook and generation idempotency; reserve before execution; no duplicate grant/debit; versioned pricing; complete source-to-ledger/job traceability; audited administrative grants.

## Trust and security graph

TrustGraph nodes: ACCOUNT, SESSION, DEVICE_TOKEN, NETWORK_TOKEN, EMAIL_IDENTITY, EMAIL_DOMAIN, PAYMENT_CUSTOMER, PAYMENT_INSTRUMENT_TOKEN, PURCHASE, API_KEY, MCP_CLIENT, REFERRAL_CODE, PROMOTION, PROJECT, GENERATION_JOB, DISPUTE, REFUND, SECURITY_EVENT.

Edges represent account device/network/email-domain/payment-instrument use, referrals, keys, MCP client use, promotion receipt, dispute/refund relationships, and purchase payment-instrument use. Each edge records first/last seen, confidence, source, retention class, and reason code.

Security events reference account/session and pseudonymous device/network identifiers, payment reference, risk score/reasons, policy decision/version, trust level, related job/purchase, and timestamp. Do not duplicate raw sensitive signals unnecessarily.

Data inventory categories: operational identity/session/device token; network/security signals; payment-provider identifiers and risk outcomes; contact data. For every field document purpose, necessity, lawful-basis candidate, access, processor/subprocessor, retention class, security, and deletion behavior.

Retention classes are RET_AUTH_SHORT, RET_NETWORK_SHORT, RET_RISK_DERIVED, RET_PAYMENT_LEGAL, RET_DISPUTE_HOLD, RET_AUDIT_HIGH_ASSURANCE, and RET_PROMO_ANALYTICS. Periods need legal/operational review. Legal hold may pause deletion for dispute, incident, or legal obligation.

## Tenant isolation and storage

Every project, asset, generation, wallet, API key, export, map/UI pack, and billing access checks tenant ownership. Use PostgreSQL RLS, application authorization, storage policies, non-guessable object IDs, expiring signed URLs, and cross-tenant IDOR tests. Raw PAN/CVV/full card data are prohibited. API secrets are one-time revealed and stored as secure hashes/HMACs.
