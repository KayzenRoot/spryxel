import { randomBytes } from 'node:crypto';
import { chmod, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const action = process.argv[2];
const envPath = resolve(root, '.env.local-infra');
const composePath = resolve(root, 'infra/compose.yml');

if (action !== 'up' && action !== 'down')
  throw new Error('Use `npm run infra:up` or `npm run infra:down`');

if (action === 'up') {
  try {
    await readFile(envPath, 'utf8');
  } catch {
    const values = {
      POSTGRES_DB: 'spryxel_local',
      POSTGRES_USER: 'spryxel',
      POSTGRES_PASSWORD: randomBytes(24).toString('hex'),
      REDIS_PASSWORD: randomBytes(24).toString('hex'),
      S3_ACCESS_KEY_ID: randomBytes(16).toString('hex'),
      S3_SECRET_ACCESS_KEY: randomBytes(32).toString('hex'),
    };
    await writeFile(
      envPath,
      `${Object.entries(values)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n')}\n`,
      { mode: 0o600, flag: 'wx' },
    );
    await chmod(envPath, 0o600);
  }
}

await new Promise<void>((resolveRun, reject) => {
  const child = spawn(
    'docker',
    [
      'compose',
      '--env-file',
      envPath,
      '--project-name',
      'spryxel-local',
      '--file',
      composePath,
      '--profile',
      'infra',
      action === 'up' ? 'up' : 'down',
      ...(action === 'up' ? ['--build', '--detach', '--wait', '--wait-timeout', '90'] : []),
    ],
    { cwd: root, windowsHide: true, stdio: 'inherit' },
  );
  child.once('error', reject);
  child.once('close', (code) => {
    if (code === 0) resolveRun();
    else reject(new Error(`Docker Compose ${action} failed with exit code ${code}`));
  });
});

process.stdout.write(
  action === 'up'
    ? 'Local infrastructure is running on loopback. Credentials are stored in the ignored .env.local-infra file.\n'
    : 'Local infrastructure stopped. Named data volumes and the ignored local credential file were preserved.\n',
);
