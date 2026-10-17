import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { match } from 'path-to-regexp';

const proxySource = readFileSync(resolve(import.meta.dirname, '../../proxy.ts'), 'utf8');
const matcherLiteral = proxySource.match(/matcher:\s*(\[[^\]]*\])/)?.[1];
const protectedProxyMatcher: string[] = matcherLiteral
  ? JSON.parse(matcherLiteral.replaceAll("'", '"'))
  : [];

const isCovered = (pathname: string) =>
  protectedProxyMatcher.some((pattern) => match(pattern)(pathname) !== false);

describe('AuthKit proxy matcher', () => {
  it('reads a static matcher literal from proxy.ts', () => {
    expect(protectedProxyMatcher.length).toBeGreaterThan(0);
  });

  it.each(['/projects', '/projects/project-1', '/account', '/account/settings'])(
    'keeps the existing protected route %s covered',
    (pathname) => {
      expect(isCovered(pathname)).toBe(true);
    },
  );

  it.each(['/jobs', '/jobs/job-1', '/jobs/job-1/details'])(
    'covers the protected jobs route %s',
    (pathname) => {
      expect(isCovered(pathname)).toBe(true);
    },
  );

  it.each(['/jobsite', '/jobs-archive', '/job', '/projectsx'])(
    'does not cover unrelated prefix collision %s',
    (pathname) => {
      expect(isCovered(pathname)).toBe(false);
    },
  );
});

const unauthenticatedPathsLiteral = proxySource.match(
  /browserTestSession\s*\?\s*(\[[^\]]*\])\s*:/,
)?.[1];
const fixtureUnauthenticatedPaths: string[] = unauthenticatedPathsLiteral
  ? JSON.parse(unauthenticatedPathsLiteral.replaceAll("'", '"'))
  : [];

describe('fixture unauthenticated paths', () => {
  it('exposes jobs routes to the browser fixture only when the session is valid', () => {
    expect(fixtureUnauthenticatedPaths).toContain('/jobs');
    expect(fixtureUnauthenticatedPaths).toContain('/jobs/:path*');
  });

  it('keeps the account route outside the fixture bypass list', () => {
    expect(fixtureUnauthenticatedPaths).not.toContain('/account');
    expect(fixtureUnauthenticatedPaths).not.toContain('/account/:path*');
  });

  it('keeps the non-fixture branch empty so production stays protected', () => {
    const emptyBranch = proxySource.match(/:\s*(\[\s*\])\s*,?\s*\}/)?.[1];
    expect(emptyBranch).toBe('[]');
  });
});
