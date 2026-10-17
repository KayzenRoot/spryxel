import type { Dirent } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import ts from 'typescript';
import { findOutOfScopeProductTables } from './architecture-guard.js';

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
  '@spryxel/worker': [
    '@spryxel/config',
    '@spryxel/db',
    '@spryxel/domain',
    '@spryxel/observability',
  ],
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
  '@spryxel/worker': [
    /from\s+['"](?:next|fastify|drizzle-orm|pg)(?:\/|['"])/,
    /from\s+['"]@aws-sdk\//,
    /from\s+['"]@spryxel\/(?:api|contracts|identity|ui|web)(?:\/|['"])/,
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
  const outOfScopeTables = findOutOfScopeProductTables(sql);
  if (outOfScopeTables.length > 0) {
    violations.push(
      `${file.slice(root.length + 1)} contains out-of-scope product tables: ${outOfScopeTables.join(', ')}`,
    );
  }
}

const approvedProviderEdges = new Set([
  'apps/api/src/adapters/workos-auth.ts',
  'apps/web/proxy.ts',
  'apps/web/app/auth/callback/route.ts',
  'apps/web/app/sign-in/route.ts',
  'apps/web/app/sign-out/route.ts',
  'apps/web/app/account/page.tsx',
  'apps/web/src/auth/session.ts',
]);
for (const files of sourceFilesByWorkspace.values()) {
  for (const file of files) {
    const relative = file.slice(root.length + 1).replaceAll('\\', '/');
    if (approvedProviderEdges.has(relative)) continue;
    const source = await readFile(file, 'utf8');
    if (containsWorkOSImport(source, file)) {
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

function containsWorkOSImport(source: string, file: string): boolean {
  const extension = extname(file).toLowerCase();
  const scriptKind = extension.endsWith('x')
    ? extension.endsWith('tsx')
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.JSX
    : /\.[cm]?js$/.test(extension)
      ? ts.ScriptKind.JS
      : ts.ScriptKind.TS;
  const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKind);
  const createRequireNames = new Set(['createRequire']);
  const requireNames = new Set(['require']);
  let found = false;

  function collectRequireAliases(node: ts.Node): void {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteralLike(node.moduleSpecifier) &&
      (node.moduleSpecifier.text === 'node:module' || node.moduleSpecifier.text === 'module') &&
      node.importClause?.namedBindings &&
      ts.isNamedImports(node.importClause.namedBindings)
    ) {
      for (const element of node.importClause.namedBindings.elements) {
        if ((element.propertyName?.text ?? element.name.text) === 'createRequire') {
          createRequireNames.add(element.name.text);
        }
      }
    }
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      createRequireNames.has(node.initializer.expression.text)
    ) {
      requireNames.add(node.name.text);
    }
    ts.forEachChild(node, collectRequireAliases);
  }

  function isRequireCall(expression: ts.Expression): boolean {
    if (ts.isIdentifier(expression)) return requireNames.has(expression.text);
    if (!ts.isPropertyAccessExpression(expression)) return false;
    if (expression.name.text === 'require' && ts.isIdentifier(expression.expression)) {
      return expression.expression.text === 'module';
    }
    return (
      expression.name.text === 'resolve' &&
      ts.isIdentifier(expression.expression) &&
      requireNames.has(expression.expression.text)
    );
  }

  function visit(node: ts.Node): void {
    if (found) return;
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier) &&
      isWorkOSModule(node.moduleSpecifier.text)
    ) {
      found = true;
      return;
    }
    if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression) &&
      isWorkOSModule(node.moduleReference.expression.text)
    ) {
      found = true;
      return;
    }
    if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      node.arguments[0] !== undefined &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      isWorkOSModule(node.arguments[0].text) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword || isRequireCall(node.expression))
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  }

  collectRequireAliases(sourceFile);
  visit(sourceFile);
  return found;
}

function isWorkOSModule(moduleName: string): boolean {
  return moduleName.startsWith('@workos-inc/');
}
