import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './apps/web',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3100',
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
      command: 'npm run --workspace=@spryxel/web dev -- --hostname 127.0.0.1 --port 3100',
      url: 'http://127.0.0.1:3100',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        WORKOS_API_KEY: 'test_api_key_placeholder',
        WORKOS_CLIENT_ID: 'client_test_fixture',
        WORKOS_COOKIE_PASSWORD: 'test-cookie-password-for-local-playwright-only-000000000000000000',
        WORKOS_ISSUER: 'https://auth.example.test',
        NEXT_PUBLIC_WORKOS_REDIRECT_URI: 'http://127.0.0.1:3100/auth/callback',
        SPRYXEL_API_BASE_URL: 'http://127.0.0.1:3201',
        SPRYXEL_E2E_AUTH_SECRET: 'spryxel-local-browser-e2e-only',
      },
    },
  ],
  outputDir: 'test-results/browser',
});
