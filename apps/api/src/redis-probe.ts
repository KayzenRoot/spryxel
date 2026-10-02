import { connect as connectTcp, type Socket } from 'node:net';
import { connect as connectTls } from 'node:tls';

export async function probeRedis(redisUrl: string, timeoutMs = 2_000): Promise<void> {
  let url: URL;
  try {
    url = new URL(redisUrl);
  } catch {
    throw new Error('Redis readiness probe failed');
  }

  const secure = url.protocol === 'rediss:';
  if (!secure && url.protocol !== 'redis:') throw new Error('Redis readiness probe failed');
  const port = Number(url.port || 6379);
  const commands: string[][] = [];
  const password = decodeURIComponent(url.password);
  const username = decodeURIComponent(url.username);
  if (password) commands.push(username ? ['AUTH', username, password] : ['AUTH', password]);
  commands.push(['PING']);

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let receiveBuffer = '';
    const completedReplies: string[] = [];
    const socket: Socket = secure
      ? connectTls({ host: url.hostname, port, servername: url.hostname })
      : connectTcp({ host: url.hostname, port });
    const timer = setTimeout(() => finish(new Error('Redis readiness probe timed out')), timeoutMs);

    function finish(error?: Error): void {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      socket.destroy();
      if (error) reject(error);
      else resolve();
    }

    socket.setTimeout(timeoutMs, () => finish(new Error('Redis readiness probe timed out')));
    socket.once(secure ? 'secureConnect' : 'connect', () => {
      socket.write(commands.map(encodeCommand).join(''));
    });
    socket.on('data', (chunk) => {
      receiveBuffer += chunk.toString('utf8');
      let lineEnd = receiveBuffer.indexOf('\r\n');
      while (lineEnd !== -1) {
        completedReplies.push(receiveBuffer.slice(0, lineEnd));
        receiveBuffer = receiveBuffer.slice(lineEnd + 2);
        lineEnd = receiveBuffer.indexOf('\r\n');
      }
      if (completedReplies.some((line) => line.startsWith('-'))) {
        finish(new Error('Redis readiness probe failed'));
        return;
      }
      if (completedReplies.length >= commands.length) {
        const pingReply = completedReplies[commands.length - 1];
        finish(pingReply === '+PONG' ? undefined : new Error('Redis readiness probe failed'));
      }
    });
    socket.once('error', () => finish(new Error('Redis readiness probe failed')));
  });
}

function encodeCommand(parts: string[]): string {
  const values = parts.map((part) => Buffer.from(part, 'utf8'));
  return `*${values.length}\r\n${values.map((value) => `$${value.length}\r\n${value.toString('utf8')}\r\n`).join('')}`;
}
