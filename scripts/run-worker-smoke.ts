import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const entry = resolve('apps/worker/dist/main.js');
const child = spawn(process.execPath, [entry, '--self-test'], {
  cwd: process.cwd(),
  windowsHide: true,
  env: {
    NODE_ENV: 'test',
    LOG_LEVEL: 'info',
    HOST: '127.0.0.1',
    PORT: '3002',
    PATH: process.env.PATH ?? '',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
let errorOutput = '';
child.stdout.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
child.stderr.setEncoding('utf8').on('data', (chunk: string) => (errorOutput += chunk));
const exitCode: number | null = await new Promise((resolveExit, reject) => {
  child.once('error', reject);
  child.once('close', resolveExit);
});

if (exitCode !== 0)
  throw new Error(`Worker self-test process failed (${exitCode}): ${errorOutput.slice(-500)}`);
const events = output
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => JSON.parse(line) as Record<string, unknown>);
if (!events.some((event) => event.event === 'worker.ready' && event.productConsumers === 1)) {
  throw new Error('Worker self-test did not report the admitted bounded consumer');
}
process.stdout.write(
  'Worker self-test: PASS (separate Node process; one bounded integrity consumer)\n',
);
