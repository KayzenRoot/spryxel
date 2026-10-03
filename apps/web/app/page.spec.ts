import { expect, test } from '@playwright/test';

test('authenticated shell preserves the shared theme and keyboard boundaries', async ({ page }) => {
  await authenticateWorkspacePage(page, 'shell-theme');
  await page.addInitScript(() => window.localStorage.setItem('spryxel.theme', 'dark'));
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Welcome back, Browser test user',
  );
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('navigation', { name: 'Global navigation' })).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Spryxel home' })).toBeFocused();
  const themeButton = page.getByRole('button', { name: 'Switch to light theme' });
  await themeButton.focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.localStorage.getItem('spryxel.theme')))
    .toBe('light');
  await page.keyboard.press('Control+k');
  await expect(page.getByRole('dialog', { name: 'Go to a workspace' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Go to a workspace' })).not.toBeVisible();
});

test('persisted light theme is applied before hydration and survives reload', async ({ page }) => {
  await authenticateWorkspacePage(page, 'persisted-light');
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
  await authenticateWorkspacePage(page, 'system-light');
  const hydrationWarnings = captureHydrationWarnings(page);
  await page.emulateMedia({ colorScheme: 'light' });
  await captureThemeBeforePaint(page);

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expectThemeAppliedBeforeFirstPaint(page);
  expect(hydrationWarnings).toEqual([]);
});

test('theme toggle stays synchronized when local storage access throws', async ({ page }) => {
  await authenticateWorkspacePage(page, 'storage-blocked');
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

test('unauthenticated Projects redirects through the existing AuthKit edge', async ({ page }) => {
  const response = await page.request.get('/projects', { maxRedirects: 0 });
  expect([302, 307]).toContain(response.status());
  const location = response.headers().location;
  expect(location).toBeTruthy();
  expect(new URL(location ?? 'http://invalid.test').pathname).toContain('authorize');
});

test('Home to Projects to Create to Open keeps a canonical project context', async ({ page }) => {
  await authenticateWorkspacePage(page, 'create-project-flow');
  await page.goto('/');
  await expect(
    page.getByText('No projects yet. Create one to establish your first project workspace.'),
  ).toBeVisible();

  await page.getByRole('link', { name: 'Projects', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Project name' }).fill('Northstar');
  await page.getByRole('button', { name: 'Create project' }).click();
  await expect(page.getByRole('status')).toContainText('Project created.');
  await page.getByRole('link', { name: 'Open project' }).click();

  await expect(page.getByRole('heading', { name: 'Northstar', exact: true })).toBeVisible();
  await expect(page.getByText('Not configured', { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      'Durable jobs are not available in this increment; no job status is being inferred.',
    ),
  ).toBeVisible();
  const stored = await page.evaluate(() => ({
    local: Object.keys(window.localStorage),
    session: Object.keys(window.sessionStorage),
  }));
  expect(stored.local.some((key) => /token|auth|session/i.test(key))).toBe(false);
  expect(stored.session.some((key) => /token|auth|session/i.test(key))).toBe(false);
});

test('project browsing and creation stay usable at a companion viewport', async ({ page }) => {
  await authenticateWorkspacePage(page, 'mobile-projects');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects');

  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create project' })).toBeVisible();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
});

test('signed-out account route starts hosted AuthKit with PKCE and CSRF state', async ({
  page,
}) => {
  const response = await page.request.get('/account', { maxRedirects: 0 });
  expect([302, 307]).toContain(response.status());
  const location = response.headers().location;
  expect(location).toBeTruthy();
  const authorization = new URL(location ?? 'http://invalid.test');
  expect(authorization.pathname).toContain('authorize');
  expect(authorization.searchParams.get('client_id')).toBe('client_test_fixture');
  expect(authorization.searchParams.get('state')).toBeTruthy();
  expect(authorization.searchParams.get('code_challenge')).toBeTruthy();
  expect(authorization.searchParams.get('code_challenge_method')).toBe('S256');
});

test('sign-in route creates a one-time PKCE flow and callback rejects absent CSRF state', async ({
  page,
}) => {
  const signIn = await page.request.get('/sign-in', { maxRedirects: 0 });
  expect([302, 307]).toContain(signIn.status());
  expect(signIn.headers().location).toContain('authorize');
  const cookieHeader = signIn.headers()['set-cookie'] ?? '';
  expect(/wos-auth-verifier-/i.test(cookieHeader)).toBe(true);
  expect(/httponly/i.test(cookieHeader)).toBe(true);
  expect(/samesite=lax/i.test(cookieHeader)).toBe(true);

  const callback = await page.request.get('/auth/callback', { maxRedirects: 0 });
  expect(callback.status()).toBe(400);
  expect(callback.headers()['content-type']).toContain('application/problem+json');
  const body = await callback.text();
  expect(body).toContain('Authentication callback rejected');
  expect(body).not.toContain('client_test_fixture');
  expect(body).not.toContain('test-secret');
});

test('sign-out returns the browser to the public shell and browser storage has no tokens', async ({
  page,
}) => {
  await authenticateWorkspacePage(page, 'storage-no-token');
  await page.goto('/');
  const stored = await page.evaluate(() => ({
    local: Object.keys(window.localStorage),
    session: Object.keys(window.sessionStorage),
  }));
  expect(stored.local.some((key) => /token|auth|session/i.test(key))).toBe(false);
  expect(stored.session.some((key) => /token|auth|session/i.test(key))).toBe(false);

  const signOut = await page.request.get('/sign-out', { maxRedirects: 0 });
  expect([302, 303, 307]).toContain(signOut.status());
  const location = signOut.headers().location;
  expect(location).toBeTruthy();
  expect(new URL(location ?? '/', 'http://127.0.0.1').pathname).toBe('/');
});

async function authenticateWorkspacePage(
  page: import('@playwright/test').Page,
  scope: string,
): Promise<void> {
  await page.setExtraHTTPHeaders({
    'x-spryxel-e2e-auth': `spryxel-local-browser-e2e-only:${scope}`,
  });
}

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
