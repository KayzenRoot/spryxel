import { parseMigrationDatabaseUrl } from '@spryxel/config';
import { getMigrationStatus } from '@spryxel/db';

const migrationDatabaseUrl = parseMigrationDatabaseUrl(process.env);
const status = await getMigrationStatus(migrationDatabaseUrl);
process.stdout.write(`${JSON.stringify({ migrations: status })}\n`);
