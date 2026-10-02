import { describe, expect, it } from 'vitest';
import { Writable } from 'node:stream';
import { createLogger, withSpan } from './index.js';

describe('observability foundation', () => {
  it('redacts common credential fields from structured output', async () => {
    let output = '';
    const destination = new Writable({
      write(chunk, _encoding, callback) {
        output += String(chunk);
        callback();
      },
    });
    const logger = createLogger({ level: 'info' }, destination);
    logger.info(
      {
        secretAccessKey: 'private-s3-secret',
        headers: { authorization: 'Bearer private-token' },
      },
      'probe completed',
    );
    await new Promise<void>((resolve) => logger.flush(() => resolve()));
    expect(output).not.toContain('private-s3-secret');
    expect(output).not.toContain('private-token');
    expect(output.match(/\[REDACTED\]/g)).toHaveLength(2);
    destination.end();
  });

  it('runs an operation inside a span without requiring an exporter', async () => {
    await expect(withSpan('foundation.test', async () => 'ok')).resolves.toBe('ok');
  });
});
