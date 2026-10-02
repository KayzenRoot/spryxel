# Scope

Status: CANONICAL — approved by objective audit of SPRYXEL-WO-002.
Scope and classifications below preserve Product Master v0.6.0; decision IDs are owned by DECISIONS-LEDGER.md.

## Product release boundary

The vision includes Pixel, 2D, 2.5D/isometric, and 3D. V1 focuses on Pixel + 2D and establishes the platform core and production controls before broadening inference complexity.

### V1 — NECESSARY

Platform: authentication, Projects, Asset Library, Asset Graph v1, Spryxel DNA v1, Generate Studio, Jobs/Queue, provenance, local Docker stack, local GPU worker, serverless inference adapter, and Model Router v1.

Asset production: pixel characters and general pixel assets; general 2D assets; items/props; basic environment assets; basic tilesets; simple spritesheets; basic image-to-variation.

Developer surfaces: API v1, MCP v1, basic CLI, Godot export v1, Unity export v1.

Quality: Pixel QA v1, Consistency Engine v1, and basic Seam Engine.

Commercial/trust: Credit Ledger, CostGuard, bounded trial/free-credit budget, TrustShield v1, RevenueShield v1, owner administration, and economics dashboard.

Localization: English, Brazilian Portuguese, and Spanish.

### V1.1 / V1.x — IMPORTANT

- Advanced directional characters and stronger character identity.
- Advanced tilesets, animation generation, and Animation QA.
- UI/HUD Studio, VFX Studio, workflow recipes, and richer CLI/SDK.
- Map and UI/HUD product surfaces are first-class and differentiated, with the map/UI catalog, contracts, QA, and bounded agent workflows preserved below; exact release sequencing remains subject to the approved backlog and planning gates.

### Later major releases — FUTURE

- Advanced 2.5D/isometric and full 3D generation pipeline.
- Rigging and LOD.
- Team collaboration, studio/team plans, and enterprise.
- Unreal export is not a V1 capability; it is planned for a later release.

### Explicit OUT OF SCOPE for V1

- Video generation.
- Music generation.
- Voice generation.
- General-purpose graphic design.
- Full game engine.
- Game hosting.
- Game publishing marketplace.

These may enter a later scope only through explicit planning decisions.

## Capability matrix

| Capability | V1 | V1.x | Later |
| --- | --- | --- | --- |
| Pixel characters | Full initial focus | Advanced | Continuous |
| Pixel items/props | Yes | Advanced | Continuous |
| Pixel tilesets | Basic | Advanced | Continuous |
| General 2D | Yes | Advanced | Continuous |
| 2D animation | Basic/limited | Full focus | Continuous |
| UI/HUD | Basic support | Studio | Continuous |
| VFX | Limited | Studio | Continuous |
| 2.5D | Architecture-ready | Experimental | Full |
| Isometric | Limited research | Beta | Full |
| 3D mesh generation | No production promise | R&D | Full |
| 3D texturing | No production promise | R&D | Full |
| Rigging | No | R&D | Full |
| Godot export | Yes | Advanced | Continuous |
| Unity export | Yes | Advanced | Continuous |
| Unreal export | No | Planned | Yes |
| API | Yes | Expanded | Continuous |
| MCP | Yes | Expanded | Continuous |
| CLI | Basic | Full | Continuous |

## Module inventory and master classifications

| ID | Module | Classification |
| --- | --- | --- |
| M-01 | Home / Command Center | NECESSARY |
| M-02 | Projects | NECESSARY |
| M-03 | Spryxel DNA Studio | NECESSARY |
| M-04 | Generate Studio | NECESSARY |
| M-05 | Character Studio | NECESSARY |
| M-06 | World Studio | NECESSARY |
| M-07 | Tileset Studio | NECESSARY |
| M-08 | Items & Props Studio | NECESSARY |
| M-09 | UI / HUD Studio | IMPORTANT |
| M-10 | Animation Studio | IMPORTANT |
| M-11 | VFX Studio | IMPORTANT |
| M-12 | 2.5D / Isometric Studio | IMPORTANT |
| M-13 | 3D Studio | IMPORTANT / LATER DELIVERY |
| M-14 | Asset Library | NECESSARY |
| M-15 | Asset Graph | NECESSARY |
| M-16 | Workflow / Recipe Studio | IMPORTANT |
| M-17 | QA Center | NECESSARY |
| M-18 | Export Center / EngineBridge | NECESSARY |
| M-19 | Developer Platform / AgentBridge | NECESSARY |
| M-20 | Jobs / Queue Center | NECESSARY |
| M-21 | Credits / Billing | NECESSARY |
| M-22 | CostGuard | NECESSARY |
| M-23 | TrustShield | NECESSARY |
| M-24 | RevenueShield | NECESSARY |
| M-25 | Admin / Owner Console | NECESSARY |
| M-26 | Observability & Economics | NECESSARY |
| M-27 | Team / Collaboration | FUTURE |
| M-28 | World Map Studio | IMPORTANT |
| M-29 | Region / Zone Map Studio | IMPORTANT |
| M-30 | Local Area / Battle Map Studio | IMPORTANT |
| M-31 | Dungeon / Interior Map Studio | IMPORTANT |
| M-32 | Minimap / Navigation Map Studio | IMPORTANT |
| M-33 | Map Export & Layer Studio | IMPORTANT |
| M-34 | UI / HUD Builder | IMPORTANT |
| M-35 | Inventory / Backpack UI Studio | IMPORTANT |
| M-36 | Menu & Screen Builder | IMPORTANT |
| M-37 | UI Export & Theme Studio | IMPORTANT |

The master’s broader scope-classification summary also places Animation Studio, advanced tilesets, UI/HUD Studio, VFX, Workflow/Recipe Studio, advanced 2.5D, advanced engine plugins, and SDKs in IMPORTANT; team collaboration, enterprise, advanced private models, full 3D production where unvalidated, marketplace, community asset sharing, and a public Style Capsule marketplace in FUTURE. This broad summary is preserved alongside the more specific V1/V1.x capability matrix above.

## Maps, worldbuilding, and UI/HUD

SPR-SPECIAL-001 is APPROVED / ADDED IN MASTER v0.4.1 and classified IMPORTANT WITH STRONG DIFFERENTIATION POTENTIAL. Maps, regions, local areas, dungeons/interiors, minimaps, and UI/HUD are product domains, not generic image-generation prompts. They share project DNA and may be composed into workflow-level packs.

SPR-SPECIAL-002 is APPROVED / COMPLETED IN MASTER v0.4.2 and classified IMPORTANT / PRE-FINANCIAL CATALOG COMPLETION. The catalog includes explicit versioned map and UI SKUs, structured map/UI contracts, QA failure categories and benchmark suites, engine export direction, MCP/API operations, bounded composite budgets, and provenance/evolution requirements. Credit prices remain undefined.

Structured dungeon generation is structure-first; map layers are dimension-aligned and machine-addressable. World evolution should preserve stable region and POI identities when feasible. UI packages remain coherent and localization-safe for English, pt-BR, and Spanish.

## Versioned SKU inventory carried from the master

The identifiers below are planning catalog IDs, not frozen credit prices:

Pixel/2D: SKU-001 PX_CHARACTER_BASE_V1; SKU-002 PX_CHARACTER_4DIR_V1; SKU-003 PX_CHARACTER_VARIANT_V1; SKU-004 PX_ITEM_SINGLE_V1; SKU-005 PX_ITEM_PACK_8_V1; SKU-006 PX_PROP_SINGLE_V1; SKU-007 PX_TILE_SINGLE_V1; SKU-008 PX_TILESET_BASIC_V1; SKU-009 PX_ENV_OBJECT_V1; SKU-010 IMG_VARIATION_V1; SKU-011 TWO_D_CHARACTER_BASE_V1; SKU-012 TWO_D_ITEM_V1; SKU-013 TWO_D_ENV_ASSET_V1; SKU-014 SPRITESHEET_ASSEMBLE_V1; SKU-015 ASSET_REPAIR_V1.

Maps: SKU-MAP-001 WORLD_MAP_CONCEPT_V1; SKU-MAP-002 WORLD_MAP_STRUCTURED_V1; SKU-MAP-003 REGION_MAP_V1; SKU-MAP-004 LOCAL_AREA_MAP_V1; SKU-MAP-005 DUNGEON_GRAPH_V1; SKU-MAP-006 DUNGEON_RENDER_V1; SKU-MAP-007 MINIMAP_PACK_V1; SKU-MAP-008 MAP_MARKER_PACK_V1; SKU-MAP-009 RPG_WORLD_NAV_PACK_V1.

UI/HUD: SKU-UI-001 HUD_CORE_PACK_V1; SKU-UI-002 BACKPACK_UI_PACK_V1; SKU-UI-003 MENU_SCREEN_PACK_V1; SKU-UI-004 MAP_SCREEN_UI_V1; SKU-UI-005 DIALOG_UI_PACK_V1; SKU-UI-006 SHOP_UI_PACK_V1; SKU-UI-007 CRAFTING_UI_PACK_V1; SKU-UI-008 QUEST_JOURNAL_UI_V1; SKU-UI-009 UI_ICON_FAMILY_32_V1; SKU-UI-010 FULL_RPG_INTERFACE_STARTER_V1.

## Cross-cutting dependencies

Identity/Auth → Projects → Spryxel DNA → Asset Metadata/Library → Asset Graph → Job System → Inference Gateway/Model Router → CostGuard/Credit Reservation → generation pipeline → QA → approval/versioning → export → API/MCP/CLI automation.

TrustShield, RevenueShield, observability, audit, security, and localization affect multiple layers and are not deferred add-ons.

## OUT OF SCOPE for SPRYXEL-WO-002

- Product implementation or product code.
- SPR-PLAN-006 execution, visual-component implementation, or invented screen/token decisions.
- Commercial price or credit-quantity freeze.
- AI/model benchmark execution or production-model selection.
- GEF 1.1.1, .gef, ruleset, provider, or checkpoint mutation/promotion.
- Any scope not supported by the immutable v0.6.0 seed or admitted Work Order.
