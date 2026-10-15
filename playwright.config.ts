import { defineConfig } from '@playwright/test';

const e2ePort = Number.parseInt(process.env.SPRYXEL_E2E_PORT ?? '3100', 10);
if (!Number.isInteger(e2ePort) || e2ePort < 1 || e2ePort > 65_535) {
  throw new Error('SPRYXEL_E2E_PORT must be a valid TCP port');
}
const e2eBaseUrl = `http://127.0.0.1:${e2ePort}`;

export default defineConfig({
  testDir: './apps/web',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: e2eBaseUrl,
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm exec -- tsx scripts/run-browser-api.ts',
      url: 'http://127.0.0.1:3201/healthz',
      reuseExistingServer: false,
      timeout: 30_000,
      env: { NODE_ENV: 'test' },
    },
    {
      command: `npm run --workspace=@spryxel/web dev -- --hostname 127.0.0.1 --port ${e2ePort}`,
      url: e2eBaseUrl,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        WORKOS_API_KEY: 'test_api_key_placeholder',
        WORKOS_CLIENT_ID: 'client_test_fixture',
        WORKOS_COOKIE_PASSWORD: 'test-cookie-password-for-local-playwright-only-000000000000000000',
        WORKOS_ISSUER: 'https://auth.example.test',
        NEXT_PUBLIC_WORKOS_REDIRECT_URI: `${e2eBaseUrl}/auth/callback`,
        SPRYXEL_API_BASE_URL: 'http://127.0.0.1:3201',
        SPRYXEL_E2E_AUTH_SECRET: 'spryxel-local-browser-e2e-only',
      },
    },
  ],
  outputDir: 'test-results/browser',
});
