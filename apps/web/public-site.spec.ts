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

for (const locale of locales) {
  test(`localized public pages render with language-specific metadata and landmarks: ${locale}`, async ({
    page,
  }) => {
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
  });
}

test('Portuguese public navigation sets document language', async ({ page }) => {
  await page.goto('/pt-BR');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test('localized public responses set the root HTML language before client hydration', async ({
  page,
}) => {
  for (const locale of locales) {
    const response = await page.request.get(`/${locale}`);
    expect(response.status(), `/${locale} should render`).toBe(200);
    const html = await response.text();
    expect(html).toMatch(new RegExp(`<html\\b[^>]*\\blang=["']${locale}["']`, 'i'));
  }

  const portugueseFaq = await page.request.get('/pt-BR/faq');
  expect(portugueseFaq.status()).toBe(200);
  expect(await portugueseFaq.text()).toMatch(/<html\b[^>]*\blang=["']pt-BR["']/i);

  const spanishPrivacy = await page.request.get('/es/privacy');
  expect(spanishPrivacy.status()).toBe(200);
  const privacyHtml = await spanishPrivacy.text();
  expect(privacyHtml).toMatch(/<html\b[^>]*\blang=["']es["']/i);
  expect(privacyHtml).toMatch(/<meta[^>]*name="robots"[^>]*content="noindex, nofollow"/);
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

test('theme preference survives document navigation between public and workspace roots', async ({
  page,
}) => {
  await page.setExtraHTTPHeaders({
    'x-spryxel-e2e-auth': 'spryxel-local-browser-e2e-only:cross-root-theme',
  });
  await page.goto('/en');

  await page.getByRole('button', { name: /switch to light theme/i }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Welcome back, Browser test user',
  );
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.goto('/es');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
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

test('unverified legal/contact pages are not indexable and display complete draft warnings', async ({
  page,
}) => {
  for (const locale of locales) {
    for (const slug of ['/contact', '/terms', '/privacy', '/cookies']) {
      const response = await page.request.get(`/${locale}${slug}`);
      expect(response.status()).toBe(200);
      expect(await response.text()).toMatch(
        /<meta[^>]*name="robots"[^>]*content="noindex, nofollow"/,
      );
    }
  }

  await page.goto('/en/terms');
  await expect(page.getByText(/This outline is not final terms/)).toBeVisible();
  await page.goto('/pt-BR/privacy');
  await expect(page.getByText(/Esta estrutura de privacidade não é um aviso final/)).toBeVisible();
});
