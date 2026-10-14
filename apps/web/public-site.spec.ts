import { expect, test } from '@playwright/test';

const locales = ['en', 'pt-BR', 'es'] as const;
const pages = [
  '',
  '/features',
  '/how-it-works',
  '/faq',
  '/contact',
  '/terms',
  '/privacy',
  '/cookies',
] as const;

test('localized public pages render with language-specific metadata and landmarks', async ({
  page,
}) => {
  for (const locale of locales) {
    for (const slug of pages) {
      const path = `/${locale}${slug}`;
      const response = await page.request.get(path);

      expect(response.status(), `${path} should render`).toBe(200);
      const html = await response.text();
      expect(html).toContain(`class="public-site" lang="${locale}"`);
      expect(html).toContain('<main');
      expect(html).toContain('<title>');
      expect(html).toContain('Spryxel');
    }
  }

  await page.goto('/pt-BR');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test('public navigation keeps the current page when switching locales', async ({ page }) => {
  await page.goto('/es/features');

  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.locator('.public-locale-switcher a[href="/en/features"]')).toBeVisible();
  await expect(page.locator('.public-locale-switcher a[href="/pt-BR/features"]')).toBeVisible();
  await expect(page.locator('.public-locale-switcher a[href="/es/features"]')).toHaveAttribute(
    'aria-current',
    'page',
  );
});

test('public theme toggle changes the theme and preserves the selected preference', async ({
  page,
}) => {
  await page.goto('/en');

  const toggle = page.getByRole('button', { name: /theme|tema/i });
  await expect(toggle).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const initialTheme = await page.locator('html').getAttribute('data-theme');
  const nextTheme = initialTheme === 'light' ? 'dark' : 'light';
  await toggle.click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', nextTheme);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', nextTheme);
});

test('public homepage fits a mobile viewport without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt-BR');

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));

  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test('public routes stay open while workspace routes keep their AuthKit boundary', async ({
  page,
}) => {
  const publicResponse = await page.request.get('/en', { maxRedirects: 0 });
  expect(publicResponse.status()).toBe(200);

  const rootWorkspaceResponse = await page.request.get('/', { maxRedirects: 0 });
  expect([302, 307]).toContain(rootWorkspaceResponse.status());
  expect(rootWorkspaceResponse.headers().location).toContain('authorize');

  const workspaceResponse = await page.request.get('/projects', { maxRedirects: 0 });
  expect([302, 307]).toContain(workspaceResponse.status());
  expect(workspaceResponse.headers().location).toContain('authorize');
});
