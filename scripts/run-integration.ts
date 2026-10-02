import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListBucketsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createDatabase, getMigrationStatus, probePostgres, runMigrations } from '@spryxel/db';
import { createRunId, waitFor } from '@spryxel/testkit';
import { BullMqTechnicalQueueProbe } from '@spryxel/worker/queue-probe';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const composePath = resolve(root, 'infra/compose.yml');
const tempDirectory = await mkdtemp(resolve(tmpdir(), 'spryxel-wo005-r2-'));
const envPath = resolve(tempDirectory, 'test.env');
const projectName = createRunId('spryxel-test');
const secrets = {
  postgres: randomBytes(24).toString('hex'),
  redis: randomBytes(24).toString('hex'),
  accessKey: randomBytes(16).toString('hex'),
  secretKey: randomBytes(32).toString('hex'),
};
const ports = {
  postgres: await availablePort(),
  redis: await availablePort(),
  s3: await availablePort(),
};
const databaseUrl = `postgresql://spryxel:${secrets.postgres}@127.0.0.1:${ports.postgres}/spryxel_test`;
const redisUrl = `redis://:${secrets.redis}@127.0.0.1:${ports.redis}/0`;
const s3Endpoint = `http://127.0.0.1:${ports.s3}`;
const bucket = `spryxel-${randomBytes(8).toString('hex')}`;
const envContent = [
  'POSTGRES_DB=spryxel_test',
  'POSTGRES_USER=spryxel',
  `POSTGRES_PASSWORD=${secrets.postgres}`,
  `REDIS_PASSWORD=${secrets.redis}`,
  `S3_ACCESS_KEY_ID=${secrets.accessKey}`,
  `S3_SECRET_ACCESS_KEY=${secrets.secretKey}`,
  `PG_PORT=${ports.postgres}`,
  `REDIS_PORT=${ports.redis}`,
  `S3_PORT=${ports.s3}`,
].join('\n');

const allSecrets = Object.values(secrets);
const s3 = new S3Client({
  endpoint: s3Endpoint,
  region: 'us-east-1',
  forcePathStyle: true,
  credentials: { accessKeyId: secrets.accessKey, secretAccessKey: secrets.secretKey },
});
let primaryError: unknown;

try {
  await writeFile(envPath, `${envContent}\n`, { mode: 0o600, flag: 'wx' });
  await chmodBestEffort(envPath);
  await runCompose(['config', '--quiet']);
  await runCompose(['up', '--detach', '--build', '--wait', '--wait-timeout', '90']);

  let lastS3ProbeFailure = 'no S3 error details captured';
  await Promise.all([
    waitFor(() => probePostgres(databaseUrl).then(() => true), Boolean, {
      label: 'PostgreSQL/Drizzle handshake',
      timeoutMs: 90_000,
      intervalMs: 1_000,
    }),
    waitFor(
      async () => {
        try {
          await s3.send(new ListBucketsCommand({}));
          return true;
        } catch (error) {
          const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
          lastS3ProbeFailure = redact(detail, allSecrets);
          throw error;
        }
      },
      Boolean,
      {
        label: 'SeaweedFS authenticated S3 ListBuckets',
        timeoutMs: 30_000,
        intervalMs: 500,
      },
    ).catch((error: unknown) => {
      throw new Error(`${String(error)}; last S3 failure: ${lastS3ProbeFailure}`);
    }),
  ]);

  const pristineMigrationStatus = await getMigrationStatus(databaseUrl);
  if (
    pristineMigrationStatus.length !== 1 ||
    pristineMigrationStatus.some((migration) => migration.applied)
  ) {
    throw new Error('Pristine PostgreSQL did not report all migrations as unapplied');
  }

  const migrationStatus = await runMigrations(databaseUrl);
  if (migrationStatus.length !== 1 || !migrationStatus[0]?.applied) {
    throw new Error('Disposable PostgreSQL migration did not apply the single technical migration');
  }
  const repeatStatus = await runMigrations(databaseUrl);
  if (!repeatStatus.every((migration) => migration.applied)) {
    throw new Error('Migration runner was not idempotent');
  }
  const readStatus = await getMigrationStatus(databaseUrl);
  if (readStatus.length !== 1 || !readStatus[0]?.applied) {
    throw new Error('Migration status did not report the applied technical migration');
  }

  const database = createDatabase(databaseUrl, { max: 1 });
  try {
    const identity = await database.pool.query<{ current_user: string }>('select current_user');
    if (identity.rows[0]?.current_user !== 'spryxel') {
      throw new Error('Disposable PostgreSQL connected with an unexpected role');
    }
    const tables = await database.pool.query<{ table_schema: string; table_name: string }>(
      `select table_schema, table_name
       from information_schema.tables
       where table_schema in ('public', 'platform') and table_type = 'BASE TABLE'
       order by table_schema, table_name`,
    );
    const observed = tables.rows.map((row) => `${row.table_schema}.${row.table_name}`);
    if (observed.length !== 1 || observed[0] !== 'public._spryxel_schema_migrations') {
      throw new Error('The migration created an unexpected non-technical table');
    }
  } finally {
    await database.close();
  }

  const signedBuckets = await s3.send(new ListBucketsCommand({}));
  if (!Array.isArray(signedBuckets.Buckets))
    throw new Error('Signed S3 ListBuckets handshake failed');
  await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  const key = 'technical-probe.txt';
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: 'authenticated-s3-probe' }));
  const object = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
  const objectBody = await object.Body?.transformToString();
  if (objectBody !== 'authenticated-s3-probe') throw new Error('Authenticated S3 read-back failed');
  const anonymous = await fetch(`${s3Endpoint}/`);
  if (anonymous.status !== 401 && anonymous.status !== 403) {
    throw new Error(`Unauthenticated S3 access was not denied (HTTP ${anonymous.status})`);
  }
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));

  const queueProbe = new BullMqTechnicalQueueProbe(redisUrl);
  await queueProbe.ping();
  await queueProbe.ping();

  const apiPort = await availablePort();
  const api = await startApi(apiPort);
  try {
    const healthResponse = await fetch(`http://127.0.0.1:${apiPort}/healthz`, {
      headers: { 'x-request-id': 'wo005-r2-integration' },
    });
    const health = (await healthResponse.json()) as { status?: string; requestId?: string };
    if (
      healthResponse.status !== 200 ||
      health.status !== 'ok' ||
      health.requestId !== 'wo005-r2-integration' ||
      healthResponse.headers.get('x-request-id') !== 'wo005-r2-integration'
    ) {
      throw new Error('API liveness endpoint contract failed');
    }

    const readinessResponse = await fetch(`http://127.0.0.1:${apiPort}/readyz`);
    const readinessText = await readinessResponse.text();
    if (readinessResponse.status !== 200) throw new Error('API readiness did not become healthy');
    for (const secret of allSecrets) {
      if (readinessText.includes(secret)) throw new Error('API readiness leaked a credential');
    }
    const readiness = JSON.parse(readinessText) as {
      status?: string;
      dependencies?: Array<{ name: string; status: string }>;
    };
    if (
      readiness.status !== 'ready' ||
      readiness.dependencies?.length !== 3 ||
      readiness.dependencies.some((dependency) => dependency.status !== 'ready')
    ) {
      throw new Error('API readiness did not report all configured adapters healthy');
    }
  } finally {
    await api.stop();
  }
  await s3.send(new DeleteBucketCommand({ Bucket: bucket }));
} catch (error) {
  primaryError = error;
} finally {
  s3.destroy();
  try {
    await runCompose(['down', '--volumes', '--remove-orphans']);
  } catch (error) {
    if (!primaryError) primaryError = error;
  }
  await removeTemporaryDirectory(tempDirectory);
}

if (primaryError) throw new Error(redact(String(primaryError), allSecrets));
process.stdout.write(
  'Real-service integration: PASS (Drizzle/PostgreSQL migration + idempotency, authenticated Redis/BullMQ round-trip, authenticated SeaweedFS S3 put/get/delete and anonymous denial, API health/readiness).\n',
);
process.stdout.write(
  'Migration/queue regressions: PASS (pristine PostgreSQL reports unapplied; two BullMQ probes leave no disposable queue keys).\n',
);
process.stdout.write('Disposable Compose teardown: PASS (containers and named volumes removed).\n');

function runCompose(args: string[]): Promise<void> {
  return run('docker', [
    'compose',
    '--env-file',
    envPath,
    '--project-name',
    projectName,
    '--file',
    composePath,
    '--profile',
    'test',
    ...args,
  ]);
}

function run(command: string, args: string[]): Promise<void> {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
    child.stderr.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
    child.once('error', (error) => reject(new Error(`${command} could not start: ${error.name}`)));
    child.once('close', (code) => {
      if (code === 0) resolveRun();
      else
        reject(
          new Error(
            `${command} ${args[0]} failed (${code}): ${redact(output.slice(-1_200), allSecrets)}`,
          ),
        );
    });
  });
}

async function availablePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Unable to allocate an ephemeral port');
  const port = address.port;
  await new Promise<void>((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
  return port;
}

async function startApi(port: number): Promise<{ stop(): Promise<void> }> {
  const child = spawn(process.execPath, [resolve(root, 'apps/api/dist/main.js')], {
    cwd: root,
    windowsHide: true,
    env: {
      NODE_ENV: 'test',
      HOST: '127.0.0.1',
      PORT: String(port),
      LOG_LEVEL: 'silent',
      DATABASE_URL: databaseUrl,
      REDIS_URL: redisUrl,
      S3_ENDPOINT: s3Endpoint,
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY_ID: secrets.accessKey,
      S3_SECRET_ACCESS_KEY: secrets.secretKey,
      S3_BUCKET: bucket,
      PATH: process.env.PATH ?? '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  let lastReadinessObservation = 'no API response captured';
  child.stdout.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
  child.stderr.setEncoding('utf8').on('data', (chunk: string) => (output += chunk));
  child.once('error', (error) => {
    output += `${error.name}: ${error.message}`;
  });

  try {
    await waitFor(
      async () => {
        if (child.exitCode !== null) {
          lastReadinessObservation = `API process exited with code ${child.exitCode}`;
          throw new Error('API process exited before readiness');
        }
        try {
          const response = await fetch(`http://127.0.0.1:${port}/readyz`);
          const text = await response.text();
          lastReadinessObservation = `HTTP ${response.status}: ${redact(text.slice(0, 500), allSecrets)}`;
          return { response };
        } catch (error) {
          const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
          lastReadinessObservation = redact(detail, allSecrets);
          throw error;
        }
      },
      (result) => result.response.status === 200,
      { label: 'API readiness with all real adapters', timeoutMs: 30_000, intervalMs: 300 },
    );
  } catch (error) {
    child.kill();
    throw new Error(
      `${String(error)}; last API readiness: ${lastReadinessObservation}; ${redact(output.slice(-1_000), allSecrets)}`,
    );
  }

  return {
    async stop() {
      if (child.exitCode !== null) return;
      const exited = new Promise<void>((resolveExit) => child.once('exit', () => resolveExit()));
      child.kill();
      await Promise.race([exited, new Promise((resolveDelay) => setTimeout(resolveDelay, 5_000))]);
      if (child.exitCode === null) child.kill('SIGKILL');
    },
  };
}

async function chmodBestEffort(path: string): Promise<void> {
  try {
    const { chmod } = await import('node:fs/promises');
    await chmod(path, 0o600);
  } catch {
    // The temp directory uses the current user's OS ACL; chmod is an additional POSIX restriction.
  }
}

async function removeTemporaryDirectory(path: string): Promise<void> {
  const relativePath = relative(tmpdir(), path);
  if (isAbsolute(relativePath) || relativePath === '..' || relativePath.startsWith(`..${sep}`)) {
    throw new Error('Refusing to remove integration temp files outside the OS temp directory');
  }
  await rm(path, { recursive: true, force: true });
}

function redact(value: string, values: string[]): string {
  return values.reduce((text, secret) => text.split(secret).join('[REDACTED]'), value);
}
