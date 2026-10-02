# UX Design System Contract

Status: CANONICAL — SPRYXEL-WO-003 / SPR-PLAN-006 approved by objective audit.

This contract defines reusable visual and interaction rules for the product UI. It does not specify final logo/brand artwork, production CSS, component code or frozen numeric color values. Token aliases are the implementation boundary; feature screens must not invent raw feature-specific colors.

## Principles

1. Keep the active creative work area primary; use compact-comfortable density and progressive disclosure.
2. Preserve a calm hierarchy while making project, DNA, job, quality, cost and permission context easy to inspect.
3. Share one shell and studio grammar; expose domain variation only when the operation semantics require it.
4. Use semantic tokens and redundant status signals. Never encode status, risk, selection or validation by hue alone.
5. Protect legibility and user control over decorative effects. Dense data is opaque, readable, navigable and stable.
6. Design for desktop production and a deliberately bounded mobile companion, not for a full studio canvas scaled down.
7. User interfaces may request or display domain operations; server authorization, canonical records, policy, budgets and the ledger remain authoritative.

## Theme contract

Dark is the default presentation for creative workspaces. Light is a first-class, equal theme and must maintain the same information hierarchy, affordances, status distinctions, focus treatment and accessibility target. Theme choice applies consistently across global navigation, project contexts, studios, dialogs, tables, billing/security and owner/admin surfaces.

Every semantic token has DARK and LIGHT variants. Theme changes cannot alter data, permissions, job semantics, contrast meaning or selected values. User/system preference can select a theme; persist it only as a presentation preference.

## Semantic token taxonomy

| Token family | Semantic roles | Use |
| --- | --- | --- |
| Canvas and surface | canvas, background, surface, elevated, overlay | Work area, opaque containers and elevated transient content |
| Borders and separators | border, subtle-border, divider | Pane edges, grouping and control boundaries |
| Text | text-primary, text-secondary, text-muted, text-on-accent, text-disabled | Hierarchy and disabled-state explanation |
| Brand accents | brand-primary (spectral-violet direction), brand-secondary (electric-teal direction) | Brand emphasis and secondary action; not status encoding |
| Interaction | selection, focus, hover, pressed, disabled | Selection and control state with non-color cues |
| Semantic status | success, info, warning, danger | Validation, notice and error meaning with icon/label/text |
| Job state | job-queued, job-running, job-review, job-complete, job-failed, job-cancelled | Durable job lifecycle with readable text and shape/icon |
| Quality state | quality-pass, quality-attention, quality-blocked | Integrity and production-quality outcomes, never conflated |
| Cost/risk state | cost-estimate, budget-blocked, risk-restricted | User-relevant estimate/block/restriction without leaking internal risk detail |

Token values are centrally assigned per theme and contrast-tested. Feature modules consume roles, not their own palette. Charts and layered diagrams supplement each category with labels, line patterns, shapes or legends. Disabled, selected and focus states remain distinct from success/failure colors.

## Typography

- Product interface: Inter Variable or a metrics-compatible open fallback.
- Code, API identifiers, hashes, short machine IDs and aligned cost/credit quantities: JetBrains Mono or a metrics-compatible open fallback when fixed-width scanning helps.
- Define named, tokenized roles for display, page title, section title, body, supporting/body-small, label, caption and monospace data. Keep hierarchy consistent across shells and studios.
- Use sentence case for controls, explicit verbs for actions and readable line lengths for long text. Do not communicate essential information only with typographic weight or casing.
- Localized copy may wrap and expand; controls and tables must not rely on fixed English string widths.

## Space, density, radius and elevation

- Use a 4 px base spacing grid. Define shared spacing tokens in grid multiples for inline gaps, control padding, field groups, cards/panels, section breaks and shell gutters.
- Default workspace density is compact-comfortable. Offer an explicit compact mode for data-heavy/operator screens; avoid shrinking interactive targets below accessibility needs.
- Define shared radius roles for controls, cards/panels and larger workspace surfaces. Define elevation layers for base, raised, popover and modal content. Exact values belong to the implementation token package, not to per-screen inventions.
- Pane resizing, docking and collapse should retain clear boundaries, keyboard control and sensible minimum content widths. A persisted layout preference cannot obscure safety-critical content.

## Glass and translucency

Glass/translucency is permitted for navigation chrome, overlays, floating toolbars, command palette, modal frames and transient surfaces. Dense forms, tables, logs, billing/security detail and long text use opaque, high-contrast surfaces. Underlying content must not reduce text contrast or make focus/status hard to distinguish. If readability competes with effect, remove the effect.

## Motion

Use purposeful motion for orientation, relationship and feedback. Canonical duration tiers are approximately 120 ms (small acknowledgement), 180 ms (control/pane transition) and 240 ms (larger surface transition). These are target tiers, not minimum animation obligations.

Avoid decorative blocking animation, long motion chains and motion that delays input. Reduced-motion preference removes or minimizes nonessential movement while retaining direct state communication. State changes must be perceivable without animation and cannot be hidden until motion completes.

## Focus and accessibility

Target WCAG 2.2 AA across product UI. Every interactive control has a visible, theme-safe focus indicator with adequate contrast and separation. Keyboard users can reach, operate and leave every control, dialog, menu, pane and canvas-adjacent action in a logical order; visible shortcut alternatives remain available.

Provide semantic headings, names, instructions, validation and live status announcements. Associate errors with their fields and preserve entered values when safe. Status meaning includes text and/or icon/pattern and never color alone. Dialogs manage focus and restore it when closed. Targets and spacing support accurate pointer/touch use.

Canvas-only actions also have an accessible structured or keyboard-operable route where the action is in scope. Do not make drag, hover, gesture, color discrimination, sound or animation the sole input or signal. Respect zoom and text resizing without clipped actions. Future implementation validation includes contrast, keyboard-only, screen-reader semantics, reduced motion and localization expansion.

## Component state rules

Shared controls use the same focus, hover, pressed, selected, disabled, loading and validation language. Busy state identifies the ongoing operation, prevents accidental duplicate submission where appropriate, and preserves cancellation when the durable operation allows it. Errors appear beside the affected control and in their durable owning job/notification surface when operationally critical.

Transient toast messages supplement durable state. Cost, permission, policy and validation blocks explain the safe user-facing reason and next allowed action; they do not reveal server-only rules. Dangerous actions show a scope preview and explicit confirmation before execution. Confirmation copy identifies irreversible or high-cost consequences without inventing a price.

## Localization and responsive fit

English is canonical/default; pt-BR and Spanish are first-class. Layouts allow about 35–40% text expansion, localized plural forms, date/time/number/credit formatting and wrapping. Avoid truncating essential warning, cost, status or action text. Future implementation validation includes pseudo-localization.

At 1024 px and above, production studios retain the shared multi-pane grammar. At widths below 1024 px, complex canvas studios transition to companion capabilities; they do not imply full complex editing. Mobile/tablet supports monitoring, review/approval, notifications, account/billing, project browsing and safe simple actions.
