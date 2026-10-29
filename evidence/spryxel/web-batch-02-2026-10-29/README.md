# Spryxel public-site Batch 02 visual evidence

This is isolated local QA evidence for Issue #81. It contains browser screenshots and logs only; no production data, credentials, tracking, or paid provider calls.

- Source parent: `9e34e76ce8e451a47999cdd354921b5fed0c08c9`
- The screenshot patch hash is recorded in `visual-evidence.json`; it covers the four permitted source/test paths.
- Before/after screenshots are paired for 320px mobile and 1440px desktop, both themes, and all three locales.
- `before-metrics.json` and `after-metrics.json` retain the full 42-state matrix: 3 locales × 2 themes × 7 widths (320, 375, 390, 768, 1024, 1440, 1920).
- The full public Playwright run additionally tests 40% longer runtime-injected copy, keyboard menu flow, theme state, language links, legal noindex, raw localized HTML language, and protected-route boundary behavior.
- Metrics show zero document viewport overflow and zero visible content outside viewport in all 42 standard-copy states. The decorative orbit still has intrinsic overflow inside the clipped public-site box on narrow widths; it does not expand document width or move content outside the viewport.

## Local results

| Command | Result |
| --- | --- |
| `npm run format:check` | PASS, exit 0, 109 files |
| `npm run lint` | PASS, exit 0, 109 files |
| `npm run typecheck --workspace=@spryxel/web` | PASS, exit 0 |
| `npm run test:unit` | PASS, exit 0, 19 files / 74 tests |
| `npm run build -- --force --concurrency=1` | PASS, exit 0, 11/11 packages; 32 static pages |
| `npm exec -- playwright test apps/web/public-site.spec.ts --config=test-results/batch02-local.config.ts --workers=1` | PASS, exit 0, 12 tests |

The repository declares Node 22.23.3/npm 10.9.9; this Windows environment provided Node 26.4.0/npm 11.17.0. Default Turbopack development startup crashed in the Windows environment before the browser suite; the local disposable test configuration uses Next.js Webpack mode and the real Playwright/Chromium suite. No production AuthKit, PostgreSQL/RLS, tenant-isolation, deployment, or provider integration was exercised.

The forced full build passed after the unconstrained initial build hit Windows memory pressure. The production-only `npm audit --omit=dev` returned exit 1 with 4 advisories: Next (critical), Zod (high), fast-uri (moderate), and Fastify (low). Dependency remediation is deliberately separate from this static UI change.

No merge or deployment was performed. Raw test and audit output is preserved byte-for-byte in `raw-logs.zip`; `raw-logs.sha256` records the original file hashes. Check `manifest.sha256` for bundle integrity.
