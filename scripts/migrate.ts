import { parseMigrationDatabaseUrl } from '@spryxel/config';
import { runMigrations } from '@spryxel/db';

const migrationDatabaseUrl = parseMigrationDatabaseUrl(process.env);
const status = await runMigrations(migrationDatabaseUrl);
process.stdout.write(
  `${JSON.stringify({ applied: status.map(({ id }) => id), count: status.length })}\n`,
);
