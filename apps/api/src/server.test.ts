import { describe, expect, it } from 'vitest';
import { parseRuntimeConfig } from '@spryxel/config';
import { buildApiServer } from './server.js';

describe('API foundation routes', () => {
  it('returns safe liveness and a bounded request ID', async () => {
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'));
    try {
      const response = await app.inject({
        method: 'GET',
        url: '/healthz',
        headers: { 'x-request-id': 'smoke-123' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers['x-request-id']).toBe('smoke-123');
      expect(response.json()).toEqual({ service: 'api', status: 'ok', requestId: 'smoke-123' });
    } finally {
      await app.close();
    }
  });

  it('reports disabled optional adapters without exposing configuration', async () => {
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'));
    try {
      const response = await app.inject({ method: 'GET', url: '/readyz' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        service: 'api',
        status: 'ready',
        dependencies: [
          { name: 'postgres', status: 'disabled' },
          { name: 'redis', status: 'disabled' },
          { name: 'object-storage', status: 'disabled' },
        ],
      });
      expect(response.body).not.toContain('secret');
    } finally {
      await app.close();
    }
  });

  it('replaces an invalid incoming request ID instead of reflecting it', async () => {
    const app = buildApiServer(parseRuntimeConfig({ LOG_LEVEL: 'silent' }, 'api'));
    try {
      const response = await app.inject({
        method: 'GET',
        url: '/healthz',
        headers: { 'x-request-id': 'bad\nvalue' },
      });
      expect(response.statusCode).toBe(200);
      expect(response.headers['x-request-id']).not.toBe('bad\nvalue');
      expect(response.json().requestId).toBe(response.headers['x-request-id']);
    } finally {
      await app.close();
    }
  });
});
