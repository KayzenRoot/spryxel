import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const compose = await readFile(new URL('../infra/compose.yml', import.meta.url), 'utf8');
const postgresDockerfile = await readFile(
  new URL('../infra/postgres/Dockerfile', import.meta.url),
  'utf8',
);
const integrationHarness = await readFile(new URL('./run-integration.ts', import.meta.url), 'utf8');

describe('disposable PostgreSQL integration harness', () => {
  it('keeps local infrastructure persistent and gives test PGDATA Linux tmpfs', () => {
    const localPostgres = / {2}postgres:\r?\n([\s\S]*?)\r?\n {2}postgres-test:/.exec(compose)?.[1];
    const testPostgres = / {2}postgres-test:\r?\n([\s\S]*?)\r?\n {2}redis:/.exec(compose)?.[1];

    expect(localPostgres).toContain('profiles: [infra]');
    expect(localPostgres).toContain('postgres-data:/var/lib/postgresql');
    expect(localPostgres).not.toContain('tmpfs:');
    expect(testPostgres).toContain('profiles: [test]');
    expect(testPostgres).toContain(
      '/var/lib/postgresql:rw,noexec,nosuid,size=384m,uid=70,gid=70,mode=0700',
    );
    expect(testPostgres).not.toContain('volumes:');
  });

  it('normalizes Windows checkout line endings in the PostgreSQL init hook', () => {
    expect(postgresDockerfile).toContain(
      "RUN sed -i 's/\\r$//' /docker-entrypoint-initdb.d/10-create-app-role.sh",
    );
    expect(compose).toContain("sed 's/\\r$//' /run/spryxel/start.sh > /tmp/spryxel-start.sh");
  });

  it('bounds startup, captures PostgreSQL diagnostics and verifies scoped teardown', () => {
    expect(integrationHarness).toContain('composeWaitTimeoutSeconds = 90');
    expect(integrationHarness).toContain('assertPostgresUsesEphemeralTmpfs');
    expect(integrationHarness).toContain("' /var/lib/postgresql tmpfs '");
    expect(integrationHarness).toContain("'logs', '--no-color', '--tail=80', 'postgres-test'");
    expect(integrationHarness).toContain("'logs', '--no-color', '--tail=80', 'seaweedfs'");
    expect(integrationHarness).toContain(
      'tmpfs={{json .HostConfig.Tmpfs}} mounts={{json .Mounts}}',
    );
    expect(integrationHarness).toContain("['top', containerId, '-eo', 'pid,ppid,stat,comm,args']");
    expect(integrationHarness).toContain('assertNoResidualTestResources');
    expect(integrationHarness).toContain("['down', '--volumes', '--remove-orphans']");
  });

  it('escalates timed-out diagnostic children after the grace period', () => {
    const captureOutput = integrationHarness.slice(
      integrationHarness.indexOf('function captureOutput('),
      integrationHarness.indexOf('function describeCapture('),
    );

    expect(captureOutput).toContain("child.kill('SIGKILL')");
  });
});
