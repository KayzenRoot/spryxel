import { describe, expect, it } from 'vitest';
import { browserTestAccessToken, resolveBrowserTestSession } from './test-session.js';

describe('browser test identity guard', () => {
  it('creates a deterministic session only with the configured non-production test secret', () => {
    expect(
      resolveBrowserTestSession({
        nodeEnvironment: 'development',
        configuredSecret: 'local-e2e-secret',
        suppliedSecret: 'local-e2e-secret:flow-1',
      }),
    ).toEqual({
      displayName: 'Browser test user',
      accessToken: `${browserTestAccessToken}.flow-1`,
    });
    expect(
      resolveBrowserTestSession({
        nodeEnvironment: 'development',
        configuredSecret: 'local-e2e-secret',
        suppliedSecret: 'wrong-secret:flow-1',
      }),
    ).toBeUndefined();
  });

  it('cannot create a test session in production even when both secrets match', () => {
    expect(
      resolveBrowserTestSession({
        nodeEnvironment: 'production',
        configuredSecret: 'production-misconfiguration',
        suppliedSecret: 'production-misconfiguration',
      }),
    ).toBeUndefined();
  });
});
