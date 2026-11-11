
# Round 08 | Verified source import staging receipt, NOT GitHub binary import

**State:** local source pack verified and prepared for authorized copy to Git worktree; binary GitHub import STILL PENDING. Design owner signoff STILL PENDING. Issue #70 and brand #53.

## Source verified in current conversation runtime
- Original Round05 pack: spryxel-master-design-round05-review-pack.zip, SHA256 **91782ba281fb852d9fc2bcf69c0eebe61509b41f146cc3b759931b80bf59ce41**, matches Round05 freeze manifest.
- Digital Leaf original IMG_9281.jpeg, SHA256 **ccea6a42e1787b8a2162019ba07a800ca28274bfa6f2f4d74faf4dec870652aa**, preserved unchanged.
- Original option07 3D FOCADO EM WORLDS board painel_de_marca_e_interfaces_spryxel.png, SHA256 **8e86b97c86b30dd9f155fe9165abefef28cbd8a32b52512b6c9c5decb29a1a70**, preserved unchanged.
- All four Round05 desktop/mobile dark/light PNGs and HTML/CSS exact recorded SHA256 matched the files extracted from the original ZIP. No new logo or fake/derivative replacement.

## Prepared output for download; NOT in GitHub
**spryxel-round08-design-import-ready.zip**: **14,047,342 bytes**, SHA256 **d7a85c0d592e14aa64b4f58af8b0b7f6ed8f75fa7eb6d0fc26d53907dbbe9d2d**.

Contains:
- 8 **unchanged** verified design reference files in repo-files/design/... paths (2 owner original directions, 4 full-page candidates, 2 HTML/CSS authoring sources).
- IMPORT-MANIFEST.json with their exact SHA256 and repo target paths.
- README.md and import-round08.py that default to **read-only** and require an explicit --apply.
- GitHub text-only copy at planning/website-module-01/tools/import-round08.py.

**Local smoke test of bundled importer (not GitHub CI):**
1. Created disposable Git repo branch design-import (not main).
2. Dry-run validated 8 signatures/digests and correct path handling: PASS.
3. Explicit --apply copied exactly 8 paths: PASS; checked sample imported SHA256 matched original.
4. Re-run correctly refused to overwrite the existing files: PASS.
5. No commit or push was made. No actual GitHub Git blob uploaded.

## Example future import (user's own authorized Git checkout)
From a dedicated, up-to-date **non-main** Git asset branch:
```sh
python planning/website-module-01/tools/import-round08.py --repo . --archive /path/to/spryxel-round08-design-import-ready.zip
python planning/website-module-01/tools/import-round08.py --repo . --archive /path/to/spryxel-round08-design-import-ready.zip --apply
git status --short
```
The local import alone is not approval; inspect only target design paths and create separate scoped PR. Verify exact SHA256 of each GitHub blob after import and ensure no image file accidentally enters the Next public/ runtime bundle. Final brand production masters #53 still need accurate licensed SVG/PNG/favicon exports and owner visual approval.

## Security and lifecycle
The original owner-approved **direction** JPEG/PNG must be preserved for comparisons. The HTML/CSS are a **reference website mock**, not ready to ship, and four long screenshots are owner-review candidates, NOT approved user-facing assets. Source rights of derivative hero/card images are not fully verified. No public image optimization claim, no legal/WorkOS/consent acceptance, no site implementation.

**Remaining blocker:** current GitHub write connector accepts blob contents as text/base64 but has no direct authorized way to stream the local 14 MB ZIP/8 binary files by container path; current container cannot resolve GitHub externally. Therefore actual binary repository import has NOT been performed. This report records what really was done instead of inventing a GitHub-hosted image URL.

**STOP:** SPRYXEL_WEB_ROUND08_ASSET_STAGING_VERIFIED_GITHUB_IMPORT_PENDING
