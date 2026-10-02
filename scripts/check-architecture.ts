import type { Dirent } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const root = process.cwd();
const packageDirectories = ['apps', 'packages'];
const generatedDirectoryNames = new Set([
  '.cache',
  '.git',
  '.next',
  '.output',
  '.turbo',
  '.vercel',
  'blob-report',
  'build',
  'coverage',
  'dist',
  'generated',
  'node_modules',
  'out',
  'playwright-report',
  'storybook-static',
  'test-results',
  'vendor',
]);
const workspaces = new Map<string, { path: string; manifest: Record<string, unknown> }>();
const violations: string[] = [];
const sourceFilesByWorkspace = new Map<string, string[]>();

for (const directory of packageDirectories) {
  for (const entry of await readdir(resolve(root, directory), { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const workspacePath = join(directory, entry.name);
    const manifest = JSON.parse(
      await readFile(resolve(root, workspacePath, 'package.json'), 'utf8'),
    ) as Record<string, unknown>;
    workspaces.set(String(manifest.name), { path: workspacePath, manifest });
  }
}

const allowedInternalDependencies: Record<string, string[]> = {
  '@spryxel/api': [
    '@spryxel/config',
    '@spryxel/contracts',
    '@spryxel/db',
    '@spryxel/domain',
    '@spryxel/identity',
    '@spryxel/observability',
  ],
  '@spryxel/config': ['@spryxel/contracts'],
  '@spryxel/contracts': [],
  '@spryxel/db': ['@spryxel/domain', '@spryxel/identity'],
  '@spryxel/domain': [],
  '@spryxel/identity': [],
  '@spryxel/observability': [],
  '@spryxel/testkit': [],
  '@spryxel/ui': [],
  '@spryxel/web': ['@spryxel/contracts', '@spryxel/ui'],
  '@spryxel/worker': ['@spryxel/config', '@spryxel/observability'],
};

const graph = new Map<string, string[]>();
for (const [name, workspace] of workspaces) {
  const edges: string[] = [];
  for (const sectionName of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const section = workspace.manifest[sectionName];
    if (!section || typeof section !== 'object') continue;
    for (const dependency of Object.keys(section)) {
      if (!workspaces.has(dependency)) continue;
      edges.push(dependency);
      if (!(allowedInternalDependencies[name] ?? []).includes(dependency)) {
        violations.push(`${name} has an unapproved internal dependency on ${dependency}`);
      }
    }
  }
  graph.set(name, [...new Set(edges)]);
}

for (const name of workspaces.keys()) {
  if (!(name in allowedInternalDependencies)) violations.push(`Unexpected workspace ${name}`);
}

const visiting = new Set<string>();
const visited = new Set<string>();
function visit(name: string, path: string[]): void {
  if (visiting.has(name)) {
    violations.push(`Workspace cycle: ${[...path, name].join(' -> ')}`);
    return;
  }
  if (visited.has(name)) return;
  visiting.add(name);
  for (const dependency of graph.get(name) ?? []) visit(dependency, [...path, name]);
  visiting.delete(name);
  visited.add(name);
}
for (const name of workspaces.keys()) visit(name, []);

const forbiddenByWorkspace: Record<string, RegExp[]> = {
  '@spryxel/domain': [
    /from\s+['"](?:next|fastify|drizzle-orm|pg|bullmq|ioredis)(?:\/|['"])/,
    /from\s+['"]@aws-sdk\//,
    /from\s+['"]@spryxel\/(?:api|config|db|observability|ui|web|worker)(?:\/|['"])/,
    /from\s+['"]node:process['"]|process\.env/,
  ],
  '@spryxel/identity': [
    /from\s+['"](?:next|fastify|drizzle-orm|pg|bullmq|ioredis)(?:\/|['"])/,
    /from\s+['"]@workos-inc\//,
    /from\s+['"]@spryxel\/(?:api|config|contracts|db|domain|observability|ui|web|worker)(?:\/|['"])/,
  ],
  '@spryxel/contracts': [
    /from\s+['"](?:drizzle-orm|pg|bullmq|ioredis|fastify)(?:\/|['"])/,
    /from\s+['"]@aws-sdk\//,
    /from\s+['"]@spryxel\/(?:api|db|domain|worker)(?:\/|['"])/,
  ],
  '@spryxel/ui': [
    /from\s+['"](?:fastify|drizzle-orm|pg|bullmq|ioredis)(?:\/|['"])/,
    /from\s+['"]@aws-sdk\//,
    /from\s+['"]@spryxel\/(?:api|config|db|domain|observability|worker)(?:\/|['"])/,
  ],
  '@spryxel/web': [
    /from\s+['"](?:drizzle-orm|pg|bullmq|ioredis)(?:\/|['"])/,
    /from\s+['"]@aws-sdk\//,
    /from\s+['"]@spryxel\/(?:api|db|domain|worker)(?:\/|['"])/,
  ],
};

for (const [name, workspace] of workspaces) {
  const patterns = forbiddenByWorkspace[name] ?? [];
  const files = await sourceFiles(resolve(root, workspace.path));
  sourceFilesByWorkspace.set(name, files);
  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const relative = file.slice(root.length + 1).replaceAll('\\', '/');
    if (/['"]@spryxel\/[^'"]+\/(?:src|dist)\//.test(source)) {
      violations.push(`${relative} imports through another workspace's private source/output path`);
    }
    for (const pattern of patterns) {
      if (pattern.test(source)) violations.push(`${relative} crosses a forbidden import boundary`);
    }
  }
}

const migrationFiles = await sourceFiles(resolve(root, 'packages/db/src/migrations'));
for (const file of migrationFiles.filter((path) => extname(path) === '.sql')) {
  const sql = await readFile(file, 'utf8');
  if (
    /create\s+table\s+[^;]*(users?|projects?|assets?|jobs?|wallet|credits?|ledger|trustshield)/i.test(
      sql,
    )
  ) {
    violations.push(`${file.slice(root.length + 1)} contains an out-of-scope product table`);
  }
}

const providerImport = /from\s+['"]@workos-inc\//;
const approvedProviderEdges = new Set([
  'apps/api/src/adapters/workos-auth.ts',
  'apps/web/proxy.ts',
  'apps/web/app/auth/callback/route.ts',
  'apps/web/app/sign-in/route.ts',
  'apps/web/app/sign-out/route.ts',
  'apps/web/app/account/page.tsx',
]);
for (const files of sourceFilesByWorkspace.values()) {
  for (const file of files) {
    const relative = file.slice(root.length + 1).replaceAll('\\', '/');
    if (providerImport.test(await readFile(file, 'utf8')) && !approvedProviderEdges.has(relative)) {
      violations.push(`${relative} imports WorkOS outside an authorized authentication edge`);
    }
  }
}

const rootManifest = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8')) as {
  packageManager?: string;
  workspaces?: string[];
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
  peerDependencies?: Record<string, unknown>;
};
if (rootManifest.packageManager !== 'npm@10.9.9')
  violations.push('Root package manager pin changed');
if (JSON.stringify(rootManifest.workspaces) !== JSON.stringify(['apps/*', 'packages/*'])) {
  violations.push('npm workspaces differ from the admitted topology');
}
const rootEntries = await readdir(root, { withFileTypes: true });
const lockfiles = rootEntries
  .filter((entry) =>
    /^(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?)$/.test(entry.name),
  )
  .map((entry) => entry.name)
  .sort();
if (lockfiles.length !== 1 || lockfiles[0] !== 'package-lock.json') {
  violations.push('Expected exactly one npm package-lock.json and no competing lockfiles');
}
const manifests = [
  { name: 'root', manifest: rootManifest },
  ...[...workspaces].map(([name, workspace]) => ({ name, manifest: workspace.manifest })),
];
for (const { name, manifest } of manifests) {
  for (const sectionName of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const section = manifest[sectionName];
    if (!section || typeof section !== 'object') continue;
    for (const [dependency, version] of Object.entries(section)) {
      if (
        typeof version !== 'string' ||
        !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)
      ) {
        violations.push(`${name} does not pin ${dependency} to an exact dependency version`);
      }
    }
  }
}
if (violations.length > 0) {
  process.stderr.write(`${violations.map((item) => `- ${item}`).join('\n')}\n`);
  process.exitCode = 1;
} else {
  const webAppSources = (sourceFilesByWorkspace.get('@spryxel/web') ?? []).filter((file) =>
    file
      .slice(root.length + 1)
      .replaceAll('\\', '/')
      .startsWith('apps/web/app/'),
  );
  process.stdout.write(`Scanned @spryxel/web app source files: ${webAppSources.length}.\n`);
  process.stdout.write(
    `Architecture boundaries: PASS (${workspaces.size} workspaces, ${[...graph.values()].flat().length} internal edges, no cycles, private deep imports, forbidden persistence/provider imports, or product migrations).\n`,
  );
}

async function sourceFiles(directory: string): Promise<string[]> {
  let entries: Dirent[];
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory() && generatedDirectoryNames.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await sourceFiles(path)));
    else if (/\.(?:[cm]?[jt]sx?|sql)$/.test(entry.name)) files.push(path);
  }
  return files;
}
