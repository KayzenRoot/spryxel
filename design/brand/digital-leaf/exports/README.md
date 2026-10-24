# Planned exports — NOT GENERATED YET

**The SVG masters in ../sources/ exist. PNG, WebP and ICO files are NOT included yet.** This checklist is a future export and QA contract, not evidence that raster variants were created.

## Required export matrix
| Target | Files / pixels | Requirements |
|---|---|---|
| Source | master SVG, mono-black/dark, mono-white/light | Vector paths, no remote resources or external fonts |
| Transparent social avatars | 1024×1024 PNG and 512×512 PNG/WebP | True alpha, symbol centered, safe area >= 12% |
| X/Twitter header | 1500×500 PNG | Crop-safe area around key text; responsive crop preview |
| Open Graph image | 1200×630 PNG | Clear contrast and readable typography |
| Icon | 16, 32, 48, 180, 192, 512 PNG | Pixel-snapped, visually inspected down to 16 px |
| Favicon | favicon.ico (16,32,48) + favicon.svg | Validate in modern browsers |
| Social dark/light | dark, light and mono PNG/WebP | Distinct backgrounds where explicitly requested; transparent versions remain truly transparent |
| General marketing | square 1080×1080, landscape 1920×1080 | Only after typography/logo/layout approvals |

## QA requirements
1. Preserve a **single versioned SVG source of truth** and automate deterministic raster exports with a pinned toolchain.
2. Check dimensions, format, ICC/color space, alpha, visual output, SVG safety and file sizes.
3. Confirm correct optical alignment on white, black, light and dark backgrounds; user approves exact reference fidelity.
4. Keep actual backgrounds separate from transparent exports; no checkerboard baked into pixels.
5. Browser, social-preview and accessibility verification before shipping; do not infer generated from documented.

**Need review:** a true outlined typography master and horizontal/vertical lockups. Current mark is a geometric *interpretation* of the chosen Digital Leaf; final artwork is not yet approved.
