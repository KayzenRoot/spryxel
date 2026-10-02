import { createServer, type Socket } from 'node:net';
import { describe, expect, it } from 'vitest';
import { probeRedis } from './redis-probe.js';

describe('Redis readiness RESP parser', () => {
  it('waits for complete lines across fragmented authenticated replies', async () => {
    let receivedCommands = '';
    let sentReplies = false;
    const sockets = new Set<Socket>();
    const server = createServer((socket) => {
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
      socket.on('data', (chunk) => {
        receivedCommands += chunk.toString('utf8');
        if (sentReplies || !receivedCommands.includes('$4\r\nPING\r\n')) return;
        sentReplies = true;
        socket.write('+OK\r');
        setTimeout(() => socket.write('\n+PO'), 5);
        setTimeout(() => socket.write('NG\r\n'), 10);
      });
    });

    const port = await listen(server);
    try {
      await expect(
        probeRedis(`redis://probe-user:probe-secret@127.0.0.1:${port}`, 1_000),
      ).resolves.toBeUndefined();
      expect(receivedCommands).toContain('$4\r\nAUTH\r\n');
      expect(receivedCommands).toContain('$4\r\nPING\r\n');
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
        reject(new Error('Unable to bind test Redis server'));
        return;
      }
      resolve(address.port);
    });
  });
}
