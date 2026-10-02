import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const workspaces = [
  ['apps/api', '@spryxel/api'],
  ['apps/web', '@spryxel/web'],
  ['apps/worker', '@spryxel/worker'],
  ['packages/config', '@spryxel/config'],
  ['packages/contracts', '@spryxel/contracts'],
  ['packages/db', '@spryxel/db'],
  ['packages/domain', '@spryxel/domain'],
  ['packages/observability', '@spryxel/observability'],
  ['packages/testkit', '@spryxel/testkit'],
  ['packages/ui', '@spryxel/ui'],
] as const;

describe('architecture boundary checker', () => {
  it('rejects forbidden imports under Next app/ while ignoring generated and vendor output', async () => {
    const fixtureRoot = await mkdtemp(join(tmpdir(), 'spryxel-architecture-'));
    try {
      await writeFile(
        join(fixtureRoot, 'package.json'),
        JSON.stringify({
          packageManager: 'npm@10.9.9',
          workspaces: ['apps/*', 'packages/*'],
        }),
      );
      await writeFile(join(fixtureRoot, 'package-lock.json'), '{}');

      for (const [directory, name] of workspaces) {
        const workspaceRoot = join(fixtureRoot, directory);
        await mkdir(workspaceRoot, { recursive: true });
        await writeFile(
          join(workspaceRoot, 'package.json'),
          JSON.stringify({ name, version: '0.0.0' }),
        );
      }

      const webRoot = join(fixtureRoot, 'apps/web');
      const appRoot = join(webRoot, 'app');
      await mkdir(appRoot, { recursive: true });
      await writeFile(
        join(appRoot, 'page.tsx'),
        "import { createDatabase } from '@spryxel/db';\nexport default createDatabase;\n",
      );

      const generatedDirectories = [
        '.next',
        'node_modules',
        'dist',
        'build',
        'coverage',
        'test-results',
        'playwright-report',
        'vendor',
      ];
      for (const directory of generatedDirectories) {
        const generatedRoot = join(webRoot, directory);
        await mkdir(generatedRoot, { recursive: true });
        await writeFile(
          join(generatedRoot, 'generated.ts'),
          "import { createDatabase } from '@spryxel/db/src/private';\n",
        );
      }

      const result = spawnSync(
        process.execPath,
        [
          join(repositoryRoot, 'node_modules/tsx/dist/cli.mjs'),
          join(repositoryRoot, 'scripts/check-architecture.ts'),
        ],
        { cwd: fixtureRoot, encoding: 'utf8', timeout: 10_000 },
      );

      expect(result.error).toBeUndefined();
      expect(result.status).toBe(1);
      expect(result.stderr).toContain('apps/web/app/page.tsx crosses a forbidden import boundary');
      expect(result.stderr).not.toContain('.next/generated.ts');
      expect(result.stderr).not.toContain('node_modules/generated.ts');
      expect(result.stderr).not.toContain('dist/generated.ts');
      expect(result.stderr).not.toContain('playwright-report/generated.ts');
    } finally {
      await rm(fixtureRoot, { recursive: true, force: true });
    }
  });
});
