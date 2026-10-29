import { expect, type Page, test } from '@playwright/test';

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

async function expectPublicContentWithinViewport(page: Page, label: string) {
  const layout = await page.evaluate(() => {
    const site = document.querySelector<HTMLElement>('.public-site');
    if (!site) throw new Error('Public site root is missing');

    const visibleContent = Array.from(
      site.querySelectorAll<HTMLElement>('a, button, summary, img, h1, h2, p, main, section'),
    ).filter((element) => element.getClientRects().length > 0);
    const outOfBounds = visibleContent
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.left < -1 || rect.right > window.innerWidth + 1);

    return {
      viewport: window.innerWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      outOfBoundsCount: outOfBounds.length,
    };
  });

  expect(layout.documentScrollWidth, `${label}: document scroll width`).toBeLessThanOrEqual(
    layout.viewport + 1,
  );
  expect(layout.outOfBoundsCount, `${label}: visible content outside viewport`).toBe(0);
}

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

test('mobile navigation is keyboard-operable and exposes its expanded state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pt-BR');

  const collapsedToggle = page.getByRole('button', { name: 'Abrir menu' });
  const disclosure = page.locator('.public-header__mobile-menu');
  await expect(collapsedToggle).toHaveAttribute('aria-expanded', 'false');
  await collapsedToggle.focus();
  await page.keyboard.press('Space');

  const expandedToggle = page.getByRole('button', { name: 'Fechar menu' });
  await expect(expandedToggle).toHaveAttribute('aria-expanded', 'true');
  await expect(expandedToggle).toHaveAttribute('aria-controls', 'public-mobile-navigation');
  await expect(disclosure.locator('#public-mobile-navigation')).toBeVisible();

  const homeLink = page.locator('.public-header__mobile-nav a[href="/pt-BR"]');
  const featuresLink = page.locator('.public-header__mobile-nav a[href="/pt-BR/features"]');
  await page.keyboard.press('Tab');
  await expect(homeLink).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(featuresLink).toBeFocused();
  await page.keyboard.press('Escape');
  const closedToggle = page.getByRole('button', { name: 'Abrir menu' });
  await expect(closedToggle).toBeFocused();
  await expect(closedToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(featuresLink).toBeHidden();

  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/pt-BR\/features$/);
});

test('public theme toggle changes the theme and preserves the selected preference', async ({
  page,
}) => {
  await page.goto('/en');

  const toggle = page.getByRole('button', { name: /theme|tema/i });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const initialTheme = await page.locator('html').getAttribute('data-theme');
  const nextTheme = initialTheme === 'light' ? 'dark' : 'light';
  await toggle.click();

  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).toHaveAttribute('data-theme', nextTheme);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', nextTheme);
});

test('public product status separates available workspace from planned private media', async ({
  page,
}) => {
  const statusByLocale = {
    en: 'Private asset storage, generation, and export are still planned.',
    'pt-BR':
      'O espaço de trabalho de projetos está disponível. O armazenamento privado de recursos, a geração e a exportação ainda estão planejados.',
    es: 'El almacenamiento privado de recursos, la generación y la exportación siguen planificados.',
  } as const;

  for (const locale of locales) {
    await page.goto(`/${locale}`);
    await expect(page.locator('.public-footer__status')).toContainText(statusByLocale[locale]);
  }
});

test('public pages reflow across target widths, locales, and themes', async ({ page }) => {
  const widths = [320, 375, 390, 768, 1024, 1440, 1920] as const;
  const themes = ['dark', 'light'] as const;

  for (const locale of locales) {
    await page.goto(`/${locale}`);

    for (const theme of themes) {
      await page.evaluate((selectedTheme) => {
        window.localStorage.setItem('spryxel.theme', selectedTheme);
        document.documentElement.dataset.theme = selectedTheme;
      }, theme);

      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        await expectPublicContentWithinViewport(page, `${locale}/${theme} at ${width}px`);
      }
    }

    await page.evaluate(() => {
      const copy = document.querySelector('.public-site');
      if (!copy) throw new Error('Public site root is missing');

      for (const element of copy.querySelectorAll<HTMLElement>(
        'h1, h2, h3, p, a, button, summary',
      )) {
        if (element.childElementCount > 0) continue;
        const original = element.textContent?.trim();
        if (!original) continue;
        const extra = original.slice(0, Math.ceil(original.length * 0.4));
        element.textContent = `${original} ${extra}`;
      }
    });

    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await expectPublicContentWithinViewport(page, `${locale} with 40% longer copy at ${width}px`);
    }
  }
});

test('public sticky header follows page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 800);
  });

  await expect
    .poll(() =>
      page
        .locator('.public-header')
        .evaluate((header) => Math.round(header.getBoundingClientRect().top)),
    )
    .toBe(0);
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
