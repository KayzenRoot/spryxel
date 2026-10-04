import { expect, test, type Locator, type Page } from '@playwright/test';

async function openJobDetails(page: Page, jobLink: Locator): Promise<void> {
  const href = await jobLink.getAttribute('href');
  expect(href).toBeTruthy();
  await Promise.all([
    page.waitForURL(new URL(href ?? '/jobs', page.url()).toString()),
    jobLink.click(),
  ]);
}
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
  await page.getByRole('status').getByRole('link', { name: 'Open project' }).click();

  await expect(page.getByRole('heading', { name: 'Northstar', exact: true })).toBeVisible();
  await expect(page.getByText('Not configured', { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      'No durable jobs yet. Job status will appear here after an admitted operation creates one.',
    ),
  ).toBeVisible();
  const stored = await page.evaluate(() => ({
    local: Object.keys(window.localStorage),
    session: Object.keys(window.sessionStorage),
  }));
  expect(stored.local.some((key) => /token|auth|session/i.test(key))).toBe(false);
  expect(stored.session.some((key) => /token|auth|session/i.test(key))).toBe(false);
});

test('Jobs Center lists durable state and reload preserves details and cancellation', async ({
  page,
}) => {
  await authenticateWorkspacePage(page, 'jobs-populated');
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Recent jobs' })).toBeVisible();
  await expect(page.getByText('queued', { exact: true }).first()).toBeVisible();
  await page.getByRole('link', { name: 'Jobs', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Jobs', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /SKU-001 · contract v1/ })).toBeVisible();
  const projectId = await page.locator('#jobs-project-filter option').nth(1).getAttribute('value');
  const tenantId = await page.locator('input[name="tenantId"]').first().inputValue();
  const jobLink = page.getByRole('link', { name: /SKU-001 · contract v1/ });
  await openJobDetails(page, jobLink);

  await expect(
    page.getByRole('heading', { level: 1, name: /SKU-001 · contract v1/ }),
  ).toBeVisible();
  await expect(page.getByText('Specification SHA-256')).toBeVisible();
  await expect(page.getByText(/raw contract|specification JSON/i)).toHaveCount(0);
  await page.getByRole('button', { name: 'Cancel job' }).click();
  await expect(page.getByText('Status: cancelled.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Status: cancelled.')).toBeVisible();
  expect(projectId).toBeTruthy();
  expect(tenantId).toMatch(/^[0-9a-f-]{36}$/i);
});

test('a terminal cancellation race redirects to the refreshed durable Job', async ({ page }) => {
  await authenticateWorkspacePage(page, 'jobs-cancel-raced');
  await page.goto('/jobs');
  const jobLink = page.getByRole('link', { name: /SKU-001 · contract v1/ });
  await openJobDetails(page, jobLink);

  await expect(page.getByRole('button', { name: 'Cancel job' })).toBeVisible();

  await page.getByRole('button', { name: 'Cancel job' }).click();

  await expect(page.getByText('cancelled', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel job' })).toHaveCount(0);
  await expect(page.getByText(/Internal Server Error|Application error/i)).toHaveCount(0);
});

test('a transient cancellation API failure returns to the current durable Job state', async ({
  page,
}) => {
  await authenticateWorkspacePage(page, 'jobs-cancel-unavailable');
  await page.goto('/jobs');
  const jobLink = page.getByRole('link', { name: /SKU-001 · contract v1/ });
  await openJobDetails(page, jobLink);

  await expect(page.getByRole('button', { name: 'Cancel job' })).toBeVisible();

  await page.getByRole('button', { name: 'Cancel job' }).click();

  await expect(page.getByText('queued', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel job' })).toBeVisible();
  await expect(page.getByText(/Internal Server Error|Application error/i)).toHaveCount(0);
});

test('Jobs list does not create a demo project for a non-Jobs fixture scope', async ({ page }) => {
  await authenticateWorkspacePage(page, 'mobile-projects');
  await page.goto('/projects');
  await expect(page.getByRole('textbox', { name: 'Project name' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open project' })).toHaveCount(0);
  await expect(page.getByText('0 authorized projects.')).toBeVisible();

  await page.goto('/jobs');
  await expect(page.getByRole('heading', { name: 'Jobs', exact: true })).toBeVisible();
  await expect(page.getByText(/No durable jobs yet/)).toBeVisible();

  await page.goto('/projects');
  await expect(page.getByRole('link', { name: 'Open project' })).toHaveCount(0);
  await expect(page.getByText('0 authorized projects.')).toBeVisible();
});

test('Jobs page preserves project authorization and dependency failures', async ({ page }) => {
  for (const scenario of [
    { status: 401, heading: 'Session expired', action: 'Sign in again' },
    { status: 403, heading: 'Access unavailable', action: 'Browse Projects' },
    { status: 404, heading: 'Workspace unavailable', action: 'Browse Projects' },
    { status: 502, heading: 'Projects are temporarily unavailable', action: 'Try again' },
    { status: 503, heading: 'Projects are temporarily unavailable', action: 'Try again' },
  ]) {
    await authenticateWorkspacePage(page, `workspace-${scenario.status}`);
    const query = scenario.status === 404 ? '?tenantId=not-a-uuid' : '';
    await page.goto(`/jobs${query}`);
    await expect(page.getByRole('heading', { name: scenario.heading, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: scenario.action, exact: true })).toBeVisible();
    await expect(page.getByText('Fixture private project')).toHaveCount(0);
    await expect(
      page.getByText(/workspace_not_found|project_store_unavailable|not-a-uuid/i),
    ).toHaveCount(0);
    if (scenario.status === 401) {
      await expect(page.getByRole('link', { name: 'Sign in again' })).toHaveAttribute(
        'href',
        '/sign-in',
      );
    }
  }
});

test('Project Overview shows recent jobs and all admitted states remain readable', async ({
  page,
}) => {
  await authenticateWorkspacePage(page, 'jobs-populated');
  await page.goto('/jobs');
  const projectId = await page.locator('#jobs-project-filter option').nth(1).getAttribute('value');
  const tenantId = await page.locator('input[name="tenantId"]').first().inputValue();
  expect(projectId).toBeTruthy();
  await page.goto(`/projects/${projectId}?tenantId=${tenantId}`);
  await expect(page.getByRole('heading', { name: 'Recent jobs' })).toBeVisible();
  await expect(page.getByRole('link', { name: /SKU-001 · contract v1/ })).toBeVisible();

  for (const status of [
    'queued',
    'running',
    'cancel_requested',
    'succeeded',
    'failed',
    'cancelled',
  ]) {
    await authenticateWorkspacePage(page, `jobs-${status}`);
    await page.goto('/jobs');
    await expect(
      page.getByText(status.replaceAll('_', ' '), { exact: true }).first(),
    ).toBeVisible();
  }
});

test('Jobs Center supports a mobile viewport without horizontal overflow and keeps cancel keyboard reachable', async ({
  page,
}) => {
  await authenticateWorkspacePage(page, 'jobs-mobile');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/jobs');
  await page.getByRole('link', { name: /SKU-001 · contract v1/ }).click();
  const cancelButton = page.getByRole('button', { name: 'Cancel job' });
  await cancelButton.focus();
  await expect(cancelButton).toBeFocused();
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
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

test('Home and Projects distinguish access and dependency failures without leaking workspace details', async ({
  page,
}) => {
  const cases = [
    { status: 401, heading: 'Session expired', action: 'Sign in again' },
    { status: 403, heading: 'Access unavailable', action: 'Browse Projects' },
    { status: 404, heading: 'Workspace unavailable', action: 'Browse Projects' },
    { status: 502, heading: 'Projects are temporarily unavailable', action: 'Try again' },
    { status: 503, heading: 'Projects are temporarily unavailable', action: 'Try again' },
  ];

  for (const scenario of cases) {
    await authenticateWorkspacePage(page, `workspace-${scenario.status}`);
    const tenantQuery = scenario.status === 404 ? '?tenantId=not-a-uuid' : '';

    for (const path of [`/${tenantQuery}`, `/projects${tenantQuery}`]) {
      await page.goto(path);
      await expect(
        page.getByRole('heading', { name: scenario.heading, exact: true }),
      ).toBeVisible();
      await expect(page.getByRole('link', { name: scenario.action, exact: true })).toBeVisible();
      await expect(page.getByText('Fixture private project')).toHaveCount(0);
      await expect(
        page.getByText(/workspace_not_found|project_store_unavailable|invalid-project-id/i),
      ).toHaveCount(0);
      if (scenario.status !== 502 && scenario.status !== 503) {
        await expect(page.getByText(/temporarily unavailable/i)).toHaveCount(0);
      }
      await expect(page.getByText('not-a-uuid', { exact: true })).toHaveCount(0);
    }

    if (scenario.status === 401) {
      await expect(page.getByRole('link', { name: 'Sign in again' })).toHaveAttribute(
        'href',
        '/sign-in',
      );
    }
  }
});

test('Project Overview distinguishes access, missing, and dependency states safely', async ({
  page,
}) => {
  const projectId = '00000000-0000-7000-8000-000000000042';
  const cases = [
    { status: 401, heading: 'Session expired', action: 'Sign in again' },
    { status: 403, heading: 'Access unavailable', action: 'Browse Projects' },
    { status: 502, heading: 'Project temporarily unavailable', action: 'Try again' },
    { status: 503, heading: 'Project temporarily unavailable', action: 'Try again' },
  ];

  for (const scenario of cases) {
    await authenticateWorkspacePage(page, `project-${scenario.status}`);
    await page.goto(`/projects/${projectId}`);
    await expect(page.getByRole('heading', { name: scenario.heading, exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: scenario.action, exact: true })).toBeVisible();
    await expect(page.getByText('Fixture private project')).toHaveCount(0);
    await expect(
      page.getByText(/workspace_not_found|project_store_unavailable|invalid-project-id/i),
    ).toHaveCount(0);
  }

  await authenticateWorkspacePage(page, 'project-404');
  const missingProject = await page.goto(`/projects/${projectId}`);
  expect(missingProject?.status()).toBe(404);
  await expect(
    page.getByRole('heading', { name: 'Project unavailable', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('The requested project could not be found or accessed.'),
  ).toBeVisible();
  await expect(page.getByText('Fixture private project')).toHaveCount(0);
  await expect(page.getByText(projectId, { exact: true })).toHaveCount(0);
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
