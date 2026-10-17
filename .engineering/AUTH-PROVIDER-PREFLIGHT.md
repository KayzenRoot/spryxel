# Auth Provider Preflight — Identity/Tenancy Baseline

Status: ARCHITECT DECISION CANDIDATE  
Date: 2026-10-02  
Target next increment: Identity/Tenancy security baseline  
Current main at preflight: `64d6cb0c229fb9d2ea36473f9714a139e1ca220c`

## Decision summary

Select **WorkOS AuthKit** as the V1 external authentication/session provider, behind the existing provider-neutral application identity/session adapter.

Spryxel keeps tenant authorization, memberships, product roles, RLS policy and internal identity IDs in canonical PostgreSQL. WorkOS authenticates a human identity and manages external session lifecycle; it does not become the canonical authorization database for Spryxel.

## Current evidence snapshot

Observed on 2026-10-02 from official/current sources:

- AuthKit base pricing: first 1,000,000 active users free; production environment requires billing information; enterprise SSO/directory connections may incur separate charges.
- AuthKit supports email/password, social login, MFA, passkeys, session listing/revocation and organization-aware auth.
- WorkOS access tokens are signed JWTs with JWKS verification. Resource servers must validate signature, expiration, issuer and audience.
- Current Node SDK observed: `@workos-inc/node@11.0.0`, MIT, Node >=22.11.
- Current Next.js SDK observed: `@workos-inc/authkit-nextjs@4.3.2`, MIT, App Router compatible.
- The Next.js SDK documents mandatory PKCE and two-channel OAuth state/CSRF verification.
- AuthKit supports session lifetime/access-token duration controls and explicit session revocation.
- Passkeys are available; hosted AuthKit treats verified passkey authentication as MFA-equivalent.
- Hosted MFA supports TOTP; production owner/admin MFA remains mandatory under Spryxel decisions.

Primary references:
- https://workos.com/pricing
- https://workos.com/docs/authkit/environments
- https://workos.com/docs/authkit/sessions
- https://workos.com/docs/reference/authkit/session
- https://workos.com/docs/authkit/mfa
- https://workos.com/docs/authkit/passkeys
- https://workos.com/docs/authkit/roles-and-permissions
- https://workos.com/docs/sdks/authkit-nextjs
- https://workos.com/docs/sdks/node
- https://www.npmjs.com/package/@workos-inc/node
- https://www.npmjs.com/package/@workos-inc/authkit-nextjs

## Alternative review

### Better Auth

Strong architectural fit: TypeScript-native, Drizzle/PostgreSQL adapter, organization plugin, 2FA, passkeys and fully self-hosted session control.

Not selected for this HIGH_ASSURANCE identity slice at this time because the project has a dense recent security-advisory stream, including CRITICAL/HIGH advisories published through 2026-09-30, and its published security policy supports only the latest version. This does not permanently ban Better Auth; it may be reconsidered only through a later explicit provider migration/preflight.

Evidence:
- https://github.com/better-auth/better-auth/security
- https://github.com/better-auth/better-auth/security/policy
- https://better-auth.com/docs/adapters/drizzle
- https://better-auth.com/docs/concepts/session-management

### Clerk / Auth0

Both remain viable alternatives. They provide mature managed authentication and organization/MFA features, but current pricing/feature boundaries create more immediate commercial constraints for this V1 than AuthKit's present base offer. They remain fallback candidates, not selected providers.

## Security and lock-in controls

1. Internal user/identity IDs are UUIDv7-compatible Spryxel IDs. External WorkOS user/session IDs are provider references, never tenant authorization keys.
2. Canonical product tenancy lives in PostgreSQL: tenant, membership, role/permission projection, ownership and RLS.
3. WorkOS organization/role claims, if used later, are external assertions that must map to local tenant/membership records. They never bypass local authorization.
4. Fastify API independently validates WorkOS JWT signature, `iss`, `aud`, `exp`, subject and expected token type/context. UI state is never authorization.
5. No bearer/access/refresh token is stored in browser localStorage/sessionStorage.
6. Web auth may use the official AuthKit Next.js edge SDK for PKCE/callback/session-cookie handling, but Next.js does not become a second business backend.
7. Sensitive/high-impact actions require recent authentication/step-up. Production Owner/Admin requires MFA.
8. Sessions must be listable/revocable; sign-out must invalidate the provider session and local security/session projection as applicable.
9. Product audit records reference auth/session IDs without logging credentials or raw tokens.
10. Provider outage/auth uncertainty fails closed for protected mutations.
11. Provider SDKs stay at app/adapter edges. `domain` and `contracts` remain provider-free.
12. A future provider replacement must be possible through external-subject remapping without changing tenant/business primary keys.

## Implementation-preflight gate

The Identity/Tenancy Work Order must still re-check immediately before installation:
- exact current package versions and release status;
- Node 22 compatibility and peers;
- MIT/license notices;
- current npm/GitHub advisories;
- WorkOS pricing/production-environment terms;
- AuthKit security/session documentation;
- exact issuer/JWKS/audience behavior;
- no newly published HIGH/CRITICAL issue that invalidates the selected integration path.

If materially unsafe or incompatible evidence appears, stop BLOCKED and do not silently switch providers.

## Test boundary

Provider credentials must not be required to prove tenant authorization/RLS locally.

The slice must include:
- deterministic local JWT/JWKS fixtures matching the provider contract;
- invalid signature/issuer/audience/expiry tests;
- session/principal adapter tests;
- real PostgreSQL tenant/RLS cross-tenant tests;
- optional WorkOS staging smoke only when credentials are available, recorded separately from mandatory deterministic CI.

No fake local identity adapter may be enabled in production configuration.
