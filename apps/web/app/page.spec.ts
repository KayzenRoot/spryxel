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
