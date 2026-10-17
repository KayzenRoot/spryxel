import assert from 'node:assert/strict';
import { chromium, type FullConfig } from '@playwright/test';

const fixtureHeader = 'x-spryxel-e2e-auth';
const fixtureSecret = 'spryxel-local-browser-e2e-only';
const routePrewarmScope = 'jobs-populated-prewarm';
const publicLocales = ['en', 'pt-BR', 'es'] as const;
const publicPaths = [
  '',
  '/features',
  '/how-it-works',
  '/faq',
  '/contact',
  '/terms',
  '/privacy',
  '/cookies',
] as const;

export default async function prewarmBrowserRoutes(config: FullConfig): Promise<void> {
  const baseUrl = config.projects[0]?.use.baseURL;
  if (typeof baseUrl !== 'string') {
    throw new Error('Playwright browser setup requires a string baseURL');
  }

  // Compile and check every public route before Playwright starts its timed tests.
  await prewarmPublicRoutes(baseUrl);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await setFixtureScope(page, routePrewarmScope);
    const home = await fetchPage(baseUrl, '/');
    assert.match(home, /Welcome back,/);
    assert.match(home, /Browser test user/);

    const projects = await fetchPage(baseUrl, '/projects');
    assert.match(projects, /Projects/);
    const projectHref = extractHref(
      projects,
      /href="(\/projects\/[0-9a-f-]+\?tenantId=[0-9a-f-]+)"/i,
      'fixture project detail link',
    );

    const jobs = await fetchPage(baseUrl, '/jobs');
    assert.match(jobs, /Durable operation status/);
    const jobHref = extractHref(
      jobs,
      /href="(\/jobs\/[0-9a-f-]+\?projectId=[^"&]+(?:&amp;|&)tenantId=[^"&]+)"/i,
      'fixture Job detail link',
    ).replaceAll('&amp;', '&');

    await fetchPage(baseUrl, projectHref);
    await fetchPage(baseUrl, jobHref);

    await page.goto(new URL('/', baseUrl).toString());
    await page.getByRole('link', { name: 'Projects', exact: true }).first().click();
    await page
      .getByRole('heading', { name: 'Projects', exact: true })
      .waitFor({ state: 'visible' });
    await page.getByRole('link', { name: 'Jobs', exact: true }).click();
    await page.getByRole('heading', { name: 'Jobs', exact: true }).waitFor({ state: 'visible' });

    await setFixtureScope(page, 'create-project-prewarm');
    await page.goto(new URL('/projects', baseUrl).toString());
    await page.getByRole('textbox', { name: 'Project name' }).fill('Server action prewarm');
    await page.getByRole('button', { name: 'Create project' }).click();
    const projectStatus = page.getByRole('status');
    await projectStatus.waitFor({ state: 'visible' });
    assert.match(await projectStatus.innerText(), /Project created\./);
    await projectStatus.getByRole('link', { name: 'Open project' }).click();
    await page
      .getByRole('heading', { name: 'Server action prewarm', exact: true })
      .waitFor({ state: 'visible' });

    await setFixtureScope(page, 'jobs-populated-cancel-prewarm');
    await page.goto(new URL('/jobs', baseUrl).toString());
    const jobLink = page.getByRole('link', { name: /SKU-001 · contract v1/ });
    await Promise.all([
      page.waitForURL((url) => url.pathname.startsWith('/jobs/')),
      jobLink.click(),
    ]);
    await page.getByRole('button', { name: 'Cancel job' }).click();
    await page.reload();
    await page.getByText('cancelled', { exact: true }).waitFor({ state: 'visible' });
  } finally {
    await browser.close();
  }
}

async function prewarmPublicRoutes(baseUrl: string): Promise<void> {
  for (const locale of publicLocales) {
    for (const slug of publicPaths) {
      const path = `/${locale}${slug}`;
      const response = await fetch(new URL(path, baseUrl), { redirect: 'manual' });
      assert.equal(response.status, 200, `Public SSR prewarm failed for ${path}`);

      const html = await response.text();
      assert.match(
        html,
        new RegExp(String.raw`<html\b[^>]*\blang=["']${locale}["']`, 'i'),
        `Public SSR language mismatch for ${path}`,
      );
    }
  }
}

async function setFixtureScope(
  page: import('@playwright/test').Page,
  scope: string,
): Promise<void> {
  await page.setExtraHTTPHeaders({ [fixtureHeader]: `${fixtureSecret}:${scope}` });
}

async function fetchPage(baseUrl: string, path: string): Promise<string> {
  const response = await fetch(new URL(path, baseUrl), {
    headers: { [fixtureHeader]: `${fixtureSecret}:${routePrewarmScope}` },
    redirect: 'manual',
  });
  const html = await response.text();
  assert.equal(response.status, 200, `Browser route warmup failed for ${path}`);
  return html;
}

function extractHref(html: string, pattern: RegExp, label: string): string {
  const match = html.match(pattern);
  const href = match?.[1];
  assert.ok(href, `Browser route warmup could not find the ${label}`);
  return href;
}
