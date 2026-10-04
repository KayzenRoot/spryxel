import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import { fetchProjects } from './api.js';

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
});
