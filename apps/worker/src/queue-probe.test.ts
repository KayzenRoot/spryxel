import { createServer, type Socket } from 'node:net';
import { describe, expect, it } from 'vitest';
import { runTechnicalQueueProbe } from './queue-probe.js';

describe('BullMQ technical queue probe', () => {
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
