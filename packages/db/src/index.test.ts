import { describe, expect, it, vi } from 'vitest';

const importSideEffectSpies = vi.hoisted(() => ({
  createPool: vi.fn(),
  readDirectory: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock('pg', () => ({ Pool: importSideEffectSpies.createPool }));
vi.mock('node:fs/promises', () => ({
  readdir: importSideEffectSpies.readDirectory,
  readFile: importSideEffectSpies.readFile,
}));

describe('PostgreSQL foundation', () => {
  it('does not start a database connection or migrate on module import', async () => {
    const databaseModule = await import('@spryxel/db');
    expect(databaseModule.createDatabase).toBeTypeOf('function');
    expect(databaseModule.runMigrations).toBeTypeOf('function');
    expect(databaseModule.getMigrationStatus).toBeTypeOf('function');
    expect(importSideEffectSpies.createPool).not.toHaveBeenCalled();
    expect(importSideEffectSpies.readDirectory).not.toHaveBeenCalled();
    expect(importSideEffectSpies.readFile).not.toHaveBeenCalled();
  });
});
