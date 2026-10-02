# Security

Status: SOURCE_PACK_CANDIDATE — pending objective audit and checkpoint promotion.
Planning boundary: SPR-PLAN-005 is approved/completed in master v0.6.0; implementation and validation are NOT_STARTED.

## Protected assets and existing repository controls

Protected assets include Git history/branches, canonical sources and checkpoint, credentials, CI/supply-chain inputs, GEF receipts, user/project/asset data, payment references, credit ledger, generation jobs, API/MCP credentials, and security evidence.

The existing GEF/GitHub baseline remains in force: no committed secrets; Gitleaks and Trivy; immutable third-party Action pins; least-privilege workflow permissions; no force-push/history rewrite; no default ruleset bypass; provider mutations require before/after and read-back evidence. Never hand-edit .gef-managed init/adopt state or receipts to suppress drift.

## TrustShield principles

1. No single signal is authoritative; same IP or device token never proves the same person.
2. Account existence and promotional eligibility are separate.
3. Trust grows gradually and event risk is dynamic.
4. Risk decisions are versioned and internally explainable with reason codes.
5. Hard spend caps exist independently of score accuracy.
6. Security collection is minimized and purpose-bound.
7. False positives have a review/recovery route.
8. An automated score alone cannot permanently delete an account.
9. V1 starts with explicit rules, graph relationships, velocity, and provider signals; ML is deferred until labeled outcomes exist.
10. TrustShield never mutates wallet balances directly.

## Threat model

The approved threat set includes: multi-account trial farming; bot signup farming; VPN/proxy rotation; disposable-email farming; referral rings; stolen-card/card testing; friendly-fraud/refund abuse; chargeback after credit use; account takeover/credential stuffing; session/token theft; API-key theft; MCP credential leakage; runaway agent spend; concurrency/cost abuse; promo abuse; payment-instrument reuse; privileged/admin compromise; webhook replay/spoofing; rate-limit bypass; storage/download abuse; and cross-tenant unauthorized access.

## Trust graph and signals

Node types: ACCOUNT, SESSION, DEVICE_TOKEN, NETWORK_TOKEN, EMAIL_IDENTITY, EMAIL_DOMAIN, PAYMENT_CUSTOMER, PAYMENT_INSTRUMENT_TOKEN, PURCHASE, API_KEY, MCP_CLIENT, REFERRAL_CODE, PROMOTION, PROJECT, GENERATION_JOB, DISPUTE, REFUND, SECURITY_EVENT.

Edges include account-to-device/network/email-domain/payment-instrument/referral/API-key/MCP-client/promotion/dispute/refund relationships and purchase-to-payment-instrument relationships. Every edge records first/last seen, confidence, source, retention class, and reason code.

Signal strength is contextual: shared IP/ASN/common domain are weak; first-party pseudonymous device token and repeated behavior are medium; a repeated provider payment token, justified verified phone, strong referral ring, or compromised credential reuse are strong signals. Even strong signals are not individually an automatic ban.

V1 device signal is a random first-party SPRYXEL token, keyed/pseudonymous on the server where practical, used for trial/security correlation and not as proof of personhood. Invasive persistent browser fingerprinting (canvas/audio/fonts/hardware probing) is not a V1 dependency.

Raw network data is short-lived where possible; longer correlation uses pseudonymous derived tokens. Account for CGNAT, schools, companies, coworking, households, and mobile networks. Payment data uses processor/customer/instrument references; never store raw PAN, CVV, or full card details.

## Bot verification, signup, risk, and benefits

Cloudflare Turnstile is the preferred V1 planning candidate, not an implemented dependency. Server-side Siteverify is required; reject expired/replayed tokens and validate expected hostname/action where applicable. Tokens and only necessary outcome metadata are logged. Enterprise Ephemeral IDs are optional future, not V1.

Signup flow: edge rate limit → Turnstile → email normalization/risk → network/device signals → account creation → email verification → TrustShield evaluation → independent trial eligibility.

Trust levels: N0_NEW, N1_VERIFIED, N2_ESTABLISHED, N3_STUDIO_TRUSTED. Event risk planning bands: R0_LOW 0–24, R1_ELEVATED 25–49, R2_HIGH 50–69, R3_VERY_HIGH 70–84, R4_CRITICAL 85–100. Bands are initial planning values and require calibration from real data.

Policy actions range from normal operation, step-up, lower promotion throughput, extra audit, trial denial/delay, purchase verification, reduced concurrency, promotion/API/MCP restrictions, review, and blocking a new cost-incurring request. Credential/session revocation is for evidenced compromise. Risk score alone does not permanently delete accounts.

Trial states: ELIGIBLE, INELIGIBLE, REVIEW, USED, EXPIRED. Eligibility may require verified account, successful bot check, no prior redeemed trial in a strongly linked cluster, acceptable risk, and available campaign/free budget. An account may exist while remaining trial-ineligible. Strong-linked accounts may share one promotional eligibility; shared IP alone is not such a link.

No new account receives unlimited financial exposure. N0 is trial-only or smallest approved pack with low concurrency and strict promotion checks; N1 unlocks normal packs/concurrency after verification; N2 may unlock higher limits after stable age/usage/payment signals; N3 studio/organization capabilities are future. Monetary caps remain configurable and unfrozen until live fraud data.

False-positive escalation: restrict benefit → step-up verification → reduce exposure/concurrency → review → temporary cost block → permanent enforcement only with strong evidence. Review/appeal, reason codes, audit, and false-positive metrics are required.

## Identity, session, MFA, and administrative security

Account-takeover signals include new device, abrupt location change, password reset followed by purchase, new API key followed by costly generation, MFA removal, email change, and session anomaly. Responses can require step-up MFA, revoke sessions, temporarily block high-risk purchases/key creation, notify the user, and require reauthentication.

Consumer MFA is optional but encouraged. Sensitive actions may require stronger assurance: email change, MFA removal, privileged key creation, owner/admin changes, high-risk purchase, or sensitive export. Production owner/admin MFA is required.

Sessions require short-lived access tokens, refresh-token rotation, session correlation/revocation, step-up for sensitive actions, user-visible session management, and no bearer-token logging.

Owner/admin controls include MFA, RBAC, stronger sessions, step-up for critical actions, immutable audit, and no silent impersonation. Critical actions include credit grants, refund/risk overrides, unblock, credential/provider rotation, payment/model routing configuration, and kill switches.

## API, MCP, agent, and tenant protections

API keys use one-time plaintext disclosure, secure hash/HMAC storage, searchable prefix, workspace/project scope, explicit least-privilege scopes, revocation/expiry, last-used tracking, daily/monthly budgets, and optional network allowlist. No broad master key by default. Budgets cover credits/job/day/month, concurrency, allowed SKUs, and quality profiles.

Interactive remote MCP is OAuth-first with discovery, bearer-token verification, least-privilege scopes, resource-bound access, and step-up for stronger scopes where supported. Headless/server/CI automation may use scoped API keys.

MCP risk classes are READ_ONLY, LOW_COST_MUTATION, COST_INCURRING, HIGH_IMPACT. Higher-risk calls can require stronger scope, budget, trust, step-up, or explicit confirmation.

Cost-incurring agent requests carry max_credits, max_jobs, max_candidates, max_repairs, max_retries, and max_wall_time. Composite workflows pass one workflow_budget down to children; child calls consume it and recursion cannot reset it. Mutations use idempotency keys so retries cannot reserve twice or duplicate generation.

Every project, asset, generation, wallet, API key, export, map, UI pack, and billing request requires tenant authorization. Defense in depth includes PostgreSQL RLS, application checks, storage policy, signed URLs, and cross-tenant IDOR tests. A cross-tenant access defect is CRITICAL.

Storage/download controls include non-guessable IDs, short-lived signed URLs, project authorization, bandwidth/download limits, export audit, and no enumerable public asset URLs.

## Payment, promotion, audit, and incident controls

Webhooks require signature verification, replay/timestamp control where supported, provider event ID persistence, idempotency, no trust in client-only success, and provider API reconciliation on ambiguity. Events pass through canonical billing/ledger logic.

Referrals stay gated until TrustShield exists. Controls: no self-referral, qualifying event before reward, delayed reward, graph analysis, campaign hard budget, and compensating ledger entries where needed. Promotions record audience, redemption cap, trust requirement, cluster policy, time window, SKU scope, and budget. Purchased credits are not seized merely to recover promotion abuse.

Security evidence records event/account/session references, pseudonymous device/network references, payment reference, risk score/reasons, policy decision, trust level, related jobs/purchase, timestamp, and policy version. Avoid duplicating raw sensitive signals.

Chargeback evidence can include transaction reference, accepted Terms version, account verification, 3DS/auth result, credit issuance and consumption, ledger, jobs, delivered assets, downloads/exports, API/MCP use, support/refund history, and legally appropriate security context. Evidence remains factual.

Security events include auth/signup/login/reset/email/MFA/session events; trial/promo/referral/payment/generation/API/MCP risk events; payment success/failure/refund/dispute; key create/rotate/revoke; and admin overrides/grants/restrictions.

Independent audited, reasoned, reversible kill switches cover signups, trials, referrals, API-key creation, MCP mutations, global step-up, purchases/high-value purchases, free cloud, individual SKUs, global GPU, and provider budgets. Incident modes are NORMAL, ELEVATED, and LOCKDOWN; actions may tighten limits, freeze trials/promotions, stop cost-incurring work, revoke compromised credentials, disable purchases, or force reauthentication.

## Privacy and LGPD

Inventory operational data (account/session/device token), network/security data (IP/network, ASN, security-provider result), payment-derived references, and contact data. Each field documents purpose, lawful-basis candidate, access, retention class, processor/subprocessor, and deletion behavior.

Before adding a signal, document purpose, necessity, less intrusive alternatives, retention, access, security, and false-positive risk. Security does not authorize general surveillance. Where applicable, perform proportionality/legitimate-interest balancing and document safeguards.

Retention classes: RET_AUTH_SHORT, RET_NETWORK_SHORT, RET_RISK_DERIVED, RET_PAYMENT_LEGAL, RET_DISPUTE_HOLD, RET_AUDIT_HIGH_ASSURANCE, RET_PROMO_ANALYTICS. Exact retention periods need legal/operational review; legal hold may suspend deletion for disputes, incidents, or legal duties.

Do not reveal anti-fraud implementation details to users. Approved safe messaging: “This promotional offer isn't available for this account. You can continue with eligible paid options or contact support if you believe this is an error.” Do not expose device hashes, linked account IDs, or thresholds.

## SPR-PLAN-005 acceptance and status

Before public promotional GPU generation, the master requires server-verified Turnstile; signup rate limiting; first-party device token; trial eligibility separated from account state; promotional hard budget; device/network/payment graph links; no IP-only auto-ban; reason codes and policy version; scoped/hashed API keys; API/MCP cost budgets; admin MFA; idempotent payment webhooks; cross-tenant tests; security audit trail; false-positive review; retention classes; and tested kill switches.

SPR-PLAN-005 verdict in master v0.6.0: threat model, multi-account, trial abuse, payment risk, account takeover, and API/MCP security APPROVED; privacy/LGPD APPROVED FOR PLANNING / LEGAL REVIEW REQUIRED BEFORE LAUNCH; Turnstile preferred V1 candidate; TrustShield ML DEFERRED; implementation NOT STARTED.

No public free generation, referral rewards, or high-value first purchases until TrustShield v1 requirements and privacy/security controls are represented in the Source Pack and tested.
