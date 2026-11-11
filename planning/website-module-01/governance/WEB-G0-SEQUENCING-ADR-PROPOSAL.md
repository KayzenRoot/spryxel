# WEB-G0 | Proposed Decision Delta: public website first without invalidating existing workspace

> **STATUS: PROPOSED / NOT APPROVED / NO SOURCE-PACK CHANGE / NO WORK ORDER ADMISSION.**
> Owner intent: build complete professional public marketing site, legal/cookie/footer, then improve sign-in/registration experience; prioritize game asset creators, delay commercial checkout/crypto until a later high-assurance stage.
> Issue #63, parent #54, draft PR #75; this is a proposed ADR discussion under `planning/`, NOT a new authoritative Decision Ledger entry.

## Current verified GitHub preflight
- Current `.engineering/CHECKPOINT.json` declares `PROJECTS_CANONICAL_SHELL_HOME_COMPLETE`, next legal stage `ASSET_CONTRACT_DURABLE_JOB_WORK_ORDER_REQUIRED`, with `SPRYXEL-WO-008` HIGH_ASSURANCE review pending in issue #29/PR #30.
- Canonical `.engineering/DECISIONS-LEDGER.md` D-0002 chooses ChatGPT specifies/audits, Codex implements and tests, GitHub stores evidence. Owner requested ChatGPT-first fixes and less repeated Codex work; formal implementation-model changes need separately approved Decision Delta.
- Canonical `.engineering/UX-DESIGN-SYSTEM.md` requires product semantic roles, English primary, pt-BR/es first class, light/dark, Inter and a 4px grid. Marketing neon colors may be promotional art accents without silently replacing product/studio tokens.
- **Implementation conflict:** current `apps/web/app/page.tsx` implements an authenticated Home/Command Center at URL `/` and invokes `requireWebSession()`; `apps/web/proxy.ts` protects `/`, `/projects` and `/account` via WorkOS; `apps/web/app/components/global-shell.tsx` links Home to `/`. Unconditionally replacing `/` with a public landing before migration would invalidate existing user journeys and browser tests.
- `apps/web/app/sign-in/route.ts` already calls WorkOS AuthKit `getSignInUrl({returnTo:'/account'})`. Never invent a second auth provider or custom fake credential form.

## Decision proposed
**Reprioritize only the independent public-site planning and implementation work**, while keeping existing security/cost/jobs and current WO-008 scope immutable until independent approval. Build public marketing routes alongside existing workspace first, then perform deliberate protected root migration after verified integration.

### Stage P: planning now, safe without canonical modification
Round 01–05 master design, ownership specs and 12 candidate Work Orders; accurate capability copy and verified brand provenance. No code edits, process gate bypass or runtime dispatch.

### Stage A: additive public routes, after G0/G1/G2 formal approval
Introduce public `/en`, `/pt-BR`, `/es` and language-specific approved public legal/FAQ resources under an isolated app route group; group name does not affect URL. Keep existing protected `/`, `/projects`, `/account` and WorkOS sign-in exact semantics intact. Public routes must be explicitly safe from proxy matcher, avoid middleware accidental regression and exclude tenant/session information. Non-essential cookies remain disabled until compliant consent implementation and legal approval. Do not start public signup or payments.

### Stage B: ROOT MIGRATION at B1, separately high-assurance reviewed
If owner approves public `/` as canonical landing:
- Migrate authenticated command center from `/` to an agreed protected route **candidate** `/app` or `/workspace`; do not implement either without approved route contract and audit.
- Update all authenticated `/` links, project return paths, proxy matcher/unauthenticated exemptions, WorkOS returnTo callback and browser/integration tests **atomically** in an admitted, independently audited change. Preserve server authorization and forced tenant RLS.
- Set `/` public as locale negotiation or default `/en` redirect with explicit SEO canonical/hreflang behavior; no redirect loops, no hidden protected preview content.
- Distinguish public sign-in CTA `/sign-in` from protected app home; never display a credential-collection mock as real login.
- Where migration cannot be demonstrated safe, **NO-GO** root flip; shipping public localized `/en` while `/` remains protected is the reversible fallback.
- Migration touching proxy/auth route or login state must be treated as **HIGH_ASSURANCE review boundary**, including E2E unauthenticated/authenticated and cross-tenant checks. No P2 deferral of security.

### Stage C: public launch only after B2 evidence
G2 brand owner approval, all 4 master previews, legal-controller/contact verified and qualified-reviewed terms/privacy/cookies, actual EN/pt-BR/es routes, working consent preference/revocation, mobile/dark/light and accessibility checks, safe real CTA, accurate product claims, approved domain/social metadata. No GPU/credits/checkout promise before cost and release gates.

## Explicit non-decisions
- Not editing `.engineering/CHECKPOINT.json`, D-153 or historic WOs in this planning PR; a new formal decision needs its own ID/owner signoff and objective audit.
- Not terminating/reprioritizing work in PR #30 without an owner/auditor decision; WO-008 remains HIGH_ASSURANCE and isolated.
- Not replacing WorkOS AuthKit or introducing Clerk, Stripe or on-chain payments.
- Not rewriting product/studio design token roles. Public marketing lime/cyan remains subject to G1 semantic alias reconciliation.
- Not authorizing the seven build agents or automatic merge merely because the user requested speed.

## Decision records still needed
- [ ] Independent source check against exact current `main`, unmerged PRs and required checks; confirm WO-008 status.
- [ ] Owner approves execution sequencing, scope and **Stage A additive first vs Stage B root migration later**.
- [ ] Architect/security reviewer approves the route/proxy migration gate and auth trust boundary.
- [ ] New approved Decision Delta, unique canonical ID and explicit status recorded using existing governance flow; don't rewrite previously approved D-153.
- [ ] Updated admitted WO/Context Lock with exact file paths/sha, safety exclusions, admission and STOP condition.
- [ ] Production cutover rollback for `/` and post-merge/SEO tests authorized separately.

**Proposed verdict:** `G0_PLAN_READY_FOR_REVIEW` (not implementation authorization).
**STOP:** `SPRYXEL_WEB_G0_ROUTE_AND_SEQUENCE_DELTA_READY_FOR_OWNER_AND_AUDITOR_REVIEW`.
