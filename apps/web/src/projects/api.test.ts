import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { assertProjectApiError, fetchProjects, ProjectApiError } from './api.js';

describe('project API response boundary', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps a non-JSON success response to a safe dependency error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not-json', { status: 200 })));

    await expect(
      fetchProjects({ accessToken: 'test-access-token', displayName: 'Test' }),
    ).rejects.toMatchObject({ name: 'ProjectApiError', status: 502 });
  });

  it('preserves unexpected control-flow errors for Next.js to handle', () => {
    const error = new Error('NEXT_REDIRECT');

    expect(() => assertProjectApiError(error)).toThrow(error);
    expect(() => assertProjectApiError(new ProjectApiError(503))).not.toThrow();
  });
});
