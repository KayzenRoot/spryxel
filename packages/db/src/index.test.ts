import { describe, expect, it } from 'vitest';

describe('PostgreSQL foundation', () => {
  it('does not start a database connection or migrate on module import', async () => {
    const databaseModule = await import('./index.js');
    expect(databaseModule.createDatabase).toBeTypeOf('function');
    expect(databaseModule.runMigrations).toBeTypeOf('function');
    expect(databaseModule.getMigrationStatus).toBeTypeOf('function');
  });
});
