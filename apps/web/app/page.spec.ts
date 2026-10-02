import { expect, test } from '@playwright/test';

test('shell preserves the shared theme and keyboard boundaries', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('spryxel.theme', 'dark'));
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'A clear foundation for the work ahead.',
  );
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Tab');
  const themeButton = page.getByRole('button', { name: 'Switch to light theme' });
  await expect(themeButton).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('spryxel.theme')))
    .toBe('light');
  await expect(page.locator('body')).toContainText('This shell establishes shared themes');
});

test('persisted light theme is applied before hydration and survives reload', async ({ page }) => {
  const hydrationWarnings = captureHydrationWarnings(page);
  await page.addInitScript(() => window.localStorage.setItem('spryxel.theme', 'light'));
  await captureThemeBeforePaint(page);

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expectThemeAppliedBeforeFirstPaint(page);

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expectThemeAppliedBeforeFirstPaint(page);
  expect(hydrationWarnings).toEqual([]);
});

test('system light preference is applied before hydration when no theme is saved', async ({
  page,
}) => {
  const hydrationWarnings = captureHydrationWarnings(page);
  await page.emulateMedia({ colorScheme: 'light' });
  await captureThemeBeforePaint(page);

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expectThemeAppliedBeforeFirstPaint(page);
  expect(hydrationWarnings).toEqual([]);
});

test('theme toggle stays synchronized when local storage access throws', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Storage is blocked', 'SecurityError');
      },
    });
  });

  await page.goto('/');
  const button = page.getByRole('button', { name: 'Switch to light theme' });
  await button.click();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

async function captureThemeBeforePaint(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript(() => {
    const timing = {
      changes: [] as Array<{ theme: string; at: number }>,
      firstFrameTheme: null as string | null,
      firstFrameAt: null as number | null,
    };
    (window as Window & { __themeTiming?: typeof timing }).__themeTiming = timing;
    const observeRoot = (root: HTMLElement) => {
      rootObserver.disconnect();
      new MutationObserver(() => {
        timing.changes.push({ theme: root.dataset.theme ?? '', at: performance.now() });
      }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
      requestAnimationFrame(() => {
        timing.firstFrameTheme = root.dataset.theme ?? '';
        timing.firstFrameAt = performance.now();
      });
    };
    const rootObserver = new MutationObserver(() => {
      if (document.documentElement) observeRoot(document.documentElement);
    });
    if (document.documentElement) observeRoot(document.documentElement);
    else rootObserver.observe(document, { childList: true });
  });
}

function captureHydrationWarnings(page: import('@playwright/test').Page): string[] {
  const warnings: string[] = [];
  page.on('console', (message) => {
    if (/hydration|server rendered|did not match/i.test(message.text())) {
      warnings.push(message.text());
    }
  });
  return warnings;
}

async function expectThemeAppliedBeforeFirstPaint(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  const timing = await page.evaluate(
    () =>
      (
        window as Window & {
          __themeTiming?: {
            changes: Array<{ theme: string; at: number }>;
            firstFrameTheme: string | null;
            firstFrameAt: number | null;
          };
        }
      ).__themeTiming,
  );
  expect(timing?.firstFrameTheme).toBe('light');
  const firstFrameAt = timing?.firstFrameAt;
  expect(firstFrameAt).not.toBeNull();
  expect(
    timing?.changes.some(
      (change) =>
        change.theme === 'light' && change.at <= (firstFrameAt ?? Number.NEGATIVE_INFINITY),
    ),
  ).toBe(true);
}
