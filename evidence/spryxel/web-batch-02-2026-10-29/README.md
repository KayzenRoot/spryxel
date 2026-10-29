# Spryxel public-site Batch 02 visual and test evidence

Isolated local QA evidence for Issue #81. No production data, real credentials, public tracking, external provider calls, or paid services were used.

## Source and visual capture

- Stacked source parent: 9e34e76ce8e451a47999cdd354921b5fed0c08c9.
- Screenshots were captured at the source patch hash in visualCaptureSourcePatchSha256 in visual-evidence.json, before the final test-coverage expansion.
- The later source diff only expanded apps/web/public-site.spec.ts; runtime UI files remained byte-identical to the screenshot capture.
- Before/after screenshot pairs cover 320px mobile and 1440px desktop, dark/light themes, and en/pt-BR/es.
- The full screenshot measurement JSON contains 42 standard-copy states before and 42 after: 3 locales × 2 themes × 7 widths (320, 375, 390, 768, 1024, 1440, 1920). It recorded zero document viewport overflow and zero visible-content bounds violations.
- The final Playwright suite checks all 24 localized public URLs for SSR language, metadata, navigation, legal noindex, and route boundary behavior. A separate reflow test checks every route at 320, 768, and 1440px in both themes, then checks 40% longer text at those widths.
- The initial expanded-matrix attempt hit Playwright's default 30-second timeout. No layout assertion failed. The test-specific timeout was raised to 180 seconds; the final run passed.

## Exact local commands and results

| Command | Result |
| --- | --- |
| npm run format:check | PASS, exit 0, 109 files |
| npm run lint | PASS, exit 0, 109 files |
| npm run typecheck --workspace=@spryxel/web | PASS, exit 0 |
| npm run test:unit | PASS, exit 0, 19 files / 74 tests |
| npm run build -- --force --concurrency=1 | PASS, exit 0, 11/11 packages; 32 static pages |
| npm exec -- playwright test apps/web/public-site.spec.ts --config=test-results/batch02-local.config.ts --workers=1 | PASS, exit 0, 13 tests; the all-route matrix took 1.2 minutes |
| npm audit --omit=dev --json | FAIL, exit 1; 4 production advisories |

Raw console output and audit JSON are byte-preserved in raw-logs.zip; raw-logs.sha256 records each original file hash. manifest.sha256 covers the bundle files.

## Environment limits and open findings

The repository declares Node 22.23.3/npm 10.9.9; this Windows machine provided Node 26.4.0/npm 11.17.0. The default Turbopack development startup crashed in this Windows environment before the browser suite. The local temporary test configuration used Next.js Webpack mode with disposable API/auth fixtures; its configuration is not included because it contains local fixture literals. The exact executed command and raw output are preserved. This run does not prove real WorkOS authentication, PostgreSQL FORCE RLS, tenant isolation, or production deployment readiness.

Production-only npm audit reported 4 vulnerable dependency paths: Next (critical), Zod (high), fast-uri (moderate), and Fastify (low). Dependency remediation is separate from this presentation change.

No merge or deployment was performed.