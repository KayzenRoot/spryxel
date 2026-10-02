import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/test-results/**'],
    environment: 'node',
    testTimeout: 10_000,
    hookTimeout: 30_000,
    restoreMocks: true,
    clearMocks: true,
  },
});
