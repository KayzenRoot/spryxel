# Billing and Economics

Status: SOURCE_PACK_CANDIDATE — pending objective audit and checkpoint promotion.
Planning source: SPR-PLAN-004 APPROVED / COMPLETED IN MASTER v0.5.0 and SPR-PLAN-005 risk controls. Implementation, benchmark COGS, provider procurement, public pricing, and launch are NOT_STARTED.

## Economic doctrine and approved thresholds

- Every generation has bounded economic cost before execution.
- Every credit grant creates a traceable liability.
- Customer price and internal delivery cost are separate.
- Cost per accepted production asset includes attempts, retries, QA, repair, storage, and delivery.
- No pack relies on unused credits, breakage, churn, or under-consumption for profit.
- No normal paid SKU may knowingly lose money per valid use and depend on low use or hidden cross-subsidy.
- Public prices remain SIMULATION_ONLY / NOT FROZEN until measured COGS and required financial/legal/payment inputs exist.

Contribution = product revenue before processing less processor fees, refund loss, chargeback loss, fraud loss, variable delivery COGS, promotion subsidy, and FX loss. Contribution margin = contribution / product revenue before processing.

Approved internal target: base contribution margin at least 70%; conservative scenario at least 60%; approved severe stress scenario at least 30%. Catastrophic scenarios may fall below 30% only when loss is bounded and automatic circuit breakers activate. At non-positive predicted margin, CostGuard rejects new affected jobs before GPU execution.

## Credits, wallets, lots, and reservations

Spryxel Credits (SC) are abstract, non-cash usage units with no permanently fixed currency value. Use integer credit amounts; authoritative money does not use floating point.

Every grant creates an immutable Credit Lot with: credit_lot_id, wallet_id, origin, issued_credits, remaining_credits, issued_at, nullable expiry, nullable purchase/subscription-cycle/promotion references, jurisdiction, and status. Origins: TRIAL, PROMOTIONAL, REFERRAL, COMPENSATION, SUBSCRIPTION, PAID_PACK.

Planning consumption order: expiring trial, expiring promotional, expiring referral, subscription-cycle, then oldest paid-pack credits. Final legal implications require launch review. Paid credits are not seized merely to recover promotion abuse.

Default free experience uses bounded Trial Entitlements for low-cost approved SKUs, quality profile, candidates, and repairs, gated by TrustShield. Entitlements do not convert into paid SC. Initial public free cloud budget is 0 USD until explicitly funded. Campaign activation requires remaining promotion budget above estimated worst-case cost, with daily/monthly/campaign/account/device-risk/SKU limits; the free-cloud gate stops at zero.

Generation reservation sequence: calculate current SKU credit cost and maximum internal cost → verify wallet and financial gates → reserve SC → generate and QA/repair → commit disclosed final debit → release unused reservation. No negative wallet balance by default. Composite map/UI jobs reserve the whole bounded workflow. Agent/API inputs may bound max_credits, max_internal_cost, max_retries, and partial-delivery policy.

Ledger entries are immutable after posting; correct through compensating entries. Payment state is distinct from wallet state. Webhooks are signature-verified, idempotent, and grant a lot exactly once. Pricing rules are versioned; historical jobs retain their original rule and historical credit costs are never rewritten.

## Launch shape and billing abstraction

Approved initial commercial direction: prepaid credit packs first. Subscriptions are deferred until usage/retention data exists, but architecture keeps cycle lots and explicit rollover/expiry policy available for later jurisdictional review.

Business logic depends on a BillingProvider abstraction. Paddle/Merchant of Record is the preferred early global candidate for further validation; Stripe is a first-class direct-payment alternative. Neither is contractually selected. Architecture supports migration or dual routing.

The master records a $10 initial simulation floor to study fixed fee dilution; this is not a public price. $10, $20, and $50 baskets are simulation points, while $5 remains a useful fixed-fee anti-pattern. Credit quantities per pack and all public prices remain NOT FROZEN.

## Full cost, revenue, and reserve formulas

True SKU COGS includes inference attempts, model API cost, QA, repair, retry, storage write/retention, variable bandwidth, and third-party variable fees.

Cost per accepted asset = sum of all attempt + QA + repair costs / accepted production assets. Never record only the winning attempt.

Revenue waterfall: customer charge → indirect tax withheld/collected → product revenue before processing → processing, refund loss, chargeback loss, fraud loss, variable delivery COGS, promotional subsidy, FX loss → contribution. Exact tax location depends on provider and jurisdiction.

Refunded consumed COGS is separately modeled as refund probability × average consumed COGS before refund. A refund reverses revenue; it is not itself COGS. Chargeback expected loss includes probability × principal at risk + unrecoverable COGS + nonrefundable dispute fees. Model fraud separately from chargebacks.

Working-capital reserve = expected p95 daily cloud COGS × payout-lag days + provider prepaid requirement + refund cash buffer + operating safety buffer. Public paid cloud generation cannot launch until available generation cash covers this reserve independently of booked revenue.

Simplified price-floor model uses C = delivered COGS, L = expected loss reserve, V = variable processor percentage, F = fixed fee allocation, and M = target margin: PRICE_MIN = (C + L + F) / (1 - V - M). It is valid only with positive denominator, separate tax model, and explicit allocation of material costs. Production uses the full simulator, not this shortcut alone.

Credit safety compares SKU credit price × conservative revenue per credit against approved stress COGS + reserves. Otherwise reprice, improve pipeline, change qualified model, change pack economics, or disable SKU.

## Stress scenarios and verdicts

Every pack and SKU simulates full 100% redemption, worst-valid-SKU mix, contribution margin, and cash requirement. Scenarios include base, conservative (p75/p90 COGS, retry/repair increases, GPU +15%, localized FX cost +10%, refund stress), GPU shock +35%, USD-cost FX shock +20%, quality regression (lower first-pass acceptance and doubled retries/repairs), refund spike (including 5%, 8%, 10% planning values), chargeback/fraud spike, free farming, heavy user, worst valid mix, and provider outage with a 30–60% more expensive fallback. Fallback cannot exceed approved margin/cost bounds.

Verdicts: APPROVED, REPRICE, RESTRICT_SKU, BLOCKED. No manual optimism override without an explicit recorded Decision/ADR.

Paid pack simulation forces redemption_rate = 100%. Trial exposure is maximum entitlement executions × worst bounded COGS per entitlement and may be granted only when TrustShield eligible and campaign budget covers that exposure.

Referral rewards are promotional liabilities and must fit a hard campaign budget; anti-self-referral graph controls apply. Support compensation requires reason code, amount, issuer/admin, optional incident/job, budget allocation, and audit; larger grants need stronger admin permission.

## Circuit breakers and monitoring

Global controls: GLOBAL_DAILY_GPU_USD, GLOBAL_MONTHLY_GPU_USD, FREE_DAILY_GPU_USD, FREE_MONTHLY_GPU_USD. Provider: PROVIDER_DAILY_USD and PROVIDER_MONTHLY_USD. SKU: SKU_MAX_COGS, SKU_MAX_RETRY_COST, SKU_MIN_MARGIN. Account: ACCOUNT_DAILY_COGS, ACCOUNT_CONCURRENCY, ACCOUNT_PROMO_EXPOSURE.

At a hard limit, no new cost-incurring job is authorized; owner/admin is alerted and running jobs follow safe cancellation/completion policy. Rolling COGS +10% warns; +20% reviews routing; projected Orange margin restricts promotion; Red blocks new affected jobs.

Financial guardrail bands: GREEN >=70%; YELLOW 50–<70% investigate with no free-use expansion; ORANGE 35–<50% may stop promotions/discounts or select an already-qualified cheaper route; RED 0–<35% blocks new promotion; BLACK <=0% hard-stops new affected jobs.

Owner dashboard covers gross/net-of-tax revenue, fees/refunds/disputes, paid/promotional credit liabilities, GPU/model/QA/repair/storage COGS, margin by SKU/pack/cohort/country/provider, cooling-off/refund/fraud exposure, prepaid balance, reserve, payout, and generation runway. Runway = available cloud generation cash / p95 daily cloud COGS; planning alerts at <14, <7, and <3 days.

## Approved invariants and open financial decisions

Financial data invariants: immutable ledger postings, compensating corrections, integer/fixed-precision money, webhook/generation idempotency, reservation before cost, no double debit or duplicate grant, distinct payment/wallet states, traceable transaction references, audited admin grants, and versioned pricing rules.

The economics dashboard is operational management accounting and does not replace statutory books, Brazilian tax accounting, corporate tax calculation, or professional legal/accounting advice.

Open: public pack prices; credits per pack; exact refund/chargeback/fraud rates and reserves; exact working-capital amount; payment-provider contract; launch tax treatment; measured SKU and map/UI workflow COGS; processor and GPU fees at launch. Paddle, Stripe, GPU prices, and FX values in the master are dated planning snapshots and must be revalidated. No current external-price assertion is made here.

SPR-PLAN-004 verdict: credit/free-tier/credit-pack-first/margin model APPROVED; reserves approved as formulas with rates NOT FROZEN; Paddle preferred planning candidate, not contractually selected; prices and pack credit quantities NOT FROZEN; working-capital formula approved, amount NOT FROZEN; implementation NOT STARTED.
