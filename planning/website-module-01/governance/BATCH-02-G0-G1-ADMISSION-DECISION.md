# Batch 02 | G0/G1 approval packet, narrow static-front-end exception

**STATUS: PROPOSED FOR OWNER + INDEPENDENT AUDITOR DECISION; NOT APPROVED; NOT EXECUTABLE.**
Tracked in issue #81, sequencing #63, interface #64, parent #54. Prepared after Codex Cloud correctly returned `BLOCKED_PREFLIGHT_NO_CHANGES`.

## Confirmed current snapshot (2026-10-14)

| Source | Exact SHA / state |
| --- | --- |
| Canonical `main` | `08bd429bb924e26f7d5266ee9b556cc8da2c8b8c` |
| Active canonical next legal stage | `ASSET_CONTRACT_DURABLE_JOB_WORK_ORDER_REQUIRED` in `.engineering/CHECKPOINT.json` |
| Normative executor constraint | `AGENTS.md`: explicitly admitted WO + current Context Lock |
| WO-008 / PR #30 | OPEN, HIGH_ASSURANCE, `4a7d696b72ffab6f1569510d1059f42964864626` |
| Public frontend / PR #76 | DRAFT, `3dd79038d0cca379a5cd3db7ac09a153a3c5b0a7` |
| SSR-locale / PR #80 | DRAFT, stacked on PR #76, `9e34e76ce8e451a47999cdd354921b5fed0c08c9` |
| Proposed Batch 02 / issue #81 | NOT_ADMITTED / zero source mutations, no implementation PR |
| G0 #63 / G1 #64 | Both proposals; no signed official decision/freeze |
| G2 / logo | Full branding master/signoff not approved, **not necessary to create a static accessibility/copy/CSS code candidate**, but remains needed before official brand publication |

The prior Codex attempt **succeeded as a safety preflight**, not an implementation. No tests were run because no source was changed. Do not ask Codex to repeat it.

## G0 narrow decision candidate (scope-limited, NOT an override yet)

**Propose:** allow *isolated, review-only, off-`main`* implementation of **Batch 02 static public UI polish** on a fresh stacked branch from PR #80. The work consists of only 3 file-disjoint workers plus one serial test writer. This DOES NOT reorder or claim completion of WO-008, asset/job contract, or backend. **The branch/PR MUST NOT merge to `main`** until separate independent merge-sequencing audit and HIGH_ASSURANCE authorizations.

**Explicit controls:** Preserve D-153 history, Checkpoint and WorkOS boundaries. No modification of protected routing/layout, middleware/proxy, auth, DB/RLS, governance, GEF, infra, CI or lockfiles. No Blender, animation, video, rendering, credits, payments, billing or GPU runtime. No license/unapproved Digital Leaf logo substitution. No branding publication or legal/cookie live release.

**Owner G0 decision:** `PENDING`; options:
- `APPROVE_G0_OFF_MAIN_STATIC_BATCH02_ONLY`: request formal isolated execution exception and allow independent audit/admission workflow to continue.
- `HOLD_G0_UNTIL_WO008_CLOSEOUT`: do not run Batch02.
Owner decision is necessary but **not sufficient**: independent technical/governance review and normative updated decision/approval must still be recorded.

## G1 minimal freeze candidate for this Batch ONLY

Use current exact PR #80 implementation as the interface baseline:
- Public routes: `/{locale}` and `/{locale}/{slug}`, where locales are `en`, `pt-BR`, `es` and 7 slugs are `features`, `how-it-works`, `faq`, `contact`, `terms`, `privacy`, `cookies`. 3 × 8 = **24 existing public URLs**. The historic proposal `/{locale}/legal/{slug}` is **NOT** the current implementation; Batch02 must not silently change it.
- Public app root: `apps/web/app/[locale]/layout.tsx` emits proper **SSR initial HTML lang** as in PR #80. Protected `/`, `/projects`, `/account` and WorkOS root remain unchanged. No root edits for Batch 02.
- Three-language text API: `PublicDictionary` in `apps/web/src/public-site/content.ts` is the canonical live code contract **for this isolated batch**. No schema-breaking rename/route/type migration.
- Theme and visual tokens: reuse `@spryxel/ui/tokens.css` semantics, scoped existing `.public-site` styles; keep dark/light with static imagery (seven current WebP). No breaking HTML semantics or JS motion.
- Exclusive ownership pinned by SHA in `SPRYXEL-WEB-BATCH-02-CONTEXT-CANDIDATE.plan.json`:
  - C1 `apps/web/src/public-site/shell.tsx`
  - C2 `apps/web/src/public-site/content.ts`
  - C3 `apps/web/app/globals.css`
  - Serial integrator `apps/web/public-site.spec.ts`
- Source head `9e34e76ce8e451a47999cdd354921b5fed0c08c9` must remain exact. No work from unapproved head changes. No two agents writing one path.

**G1 scoped technical owner/auditor freeze:** `PENDING`. This code contract is a candidate, not a source hierarchy decision. G2 approved visual art is explicitly a separate publication gate for this bounded polish batch, *subject to the owner's and independent reviewer's acceptance of this split*.

## Formal gate checklist: every answer must be grounded, not inferred

- [ ] **Owner scope decision** explicitly authorizes `APPROVE_G0_OFF_MAIN_STATIC_BATCH02_ONLY` and no main merge; or opts HOLD.
- [ ] **Independent governance/security audit** verifies coexistence with the immutable WO-008 PR #30 Context Lock/main and permits off-main test branch work.
- [ ] **Canonical normative Decision Delta** using a unique new D-ID, approved with current Source Hierarchy, documents this narrow G0 exception **without rewriting D-153**.
- [ ] **G1 technical freeze** confirms exact route/interface/owned-file SHA contract above and G2 deferral only for static visual polish, not live launch.
- [ ] **Admitted execution WO/Context Lock**, schema compatible with existing Spryxel governance, includes exact source SHA, owned paths, authorized branch, approved budget, stop condition; explicitly marked `ADMITTED_FOR_EXECUTION` only after prerequisite approvals.
- [ ] **Independent admission receipt + review permission** recorded in issues #63/#64/#81 and authorized source as needed.
- [ ] THEN and ONLY THEN the owner invokes Codex in existing `Spryxel - Código` thread with the existing GitHub markdown prompt. Do not send/dispatch a new prompt until this point.
- [ ] Later: standard + exact SHA checks, integration tests, WorkOS security requirements and merge approval. No self-merge.

## Fix applied to candidate (traceable)
Earlier `SPRYXEL-WEB-BATCH-02-CONTEXT-CANDIDATE.plan.json` accidentally contained `authority.requiredIndependentApproval=false`. This was an incorrect policy flag; the record has been corrected to `true` and all admission/owner/freeze flags remain **false**. It is STILL ONLY A CANDIDATE.

**NEXT STOP:** `SPRYXEL_WEB_BATCH02_OWNER_G0_DECISION_AND_INDEPENDENT_ADMISSION_PENDING`.
