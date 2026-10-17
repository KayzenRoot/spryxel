import { createServer, type Socket } from 'node:net';
import { describe, expect, it, vi } from 'vitest';
import { assertQueueNamespaceEmpty, runTechnicalQueueProbe } from './queue-probe.js';

describe('BullMQ technical queue probe', () => {
  it('uses namespace-scoped incremental SCAN, stops on the first residue, and never calls KEYS', async () => {
    const queueName = 'platform-probe-test';
    const scan = vi
      .fn()
      .mockResolvedValueOnce(['14', []])
      .mockResolvedValueOnce(['23', [`bull:${queueName}:meta`]])
      .mockResolvedValueOnce(['0', []]);
    const keys = vi.fn();
    const redis = { scan, keys } as unknown as Parameters<typeof assertQueueNamespaceEmpty>[0];

    await expect(assertQueueNamespaceEmpty(redis, queueName)).rejects.toThrow(
      'Technical queue probe left disposable Redis keys',
    );

    expect(scan).toHaveBeenNthCalledWith(1, '0', 'MATCH', `bull:${queueName}:*`, 'COUNT', 100);
    expect(scan).toHaveBeenNthCalledWith(2, '14', 'MATCH', `bull:${queueName}:*`, 'COUNT', 100);
    expect(scan).toHaveBeenCalledTimes(2);
    expect(keys).not.toHaveBeenCalled();
  });

  it('terminates an unresponsive Redis target within its overall deadline', async () => {
    const sockets = new Set<Socket>();
    let acceptedConnections = 0;
    const server = createServer((socket) => {
      acceptedConnections += 1;
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
      socket.on('data', () => {});
    });
    const port = await listen(server);
    const startedAt = Date.now();

    try {
      await expect(runTechnicalQueueProbe(`redis://127.0.0.1:${port}`, 300)).rejects.toThrow(
        'Technical queue probe timed out',
      );
      expect(Date.now() - startedAt).toBeLessThan(1_200);
      expect(acceptedConnections).toBeGreaterThan(0);
      const closeDeadline = Date.now() + 300;
      while (sockets.size > 0 && Date.now() < closeDeadline) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      expect(sockets.size).toBe(0);
    } finally {
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});

function listen(server: ReturnType<typeof createServer>): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Unable to bind unresponsive Redis test server'));
        return;
      }
      resolve(address.port);
    });
  });
}
