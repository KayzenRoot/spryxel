import { parseRuntimeConfig } from '@spryxel/config';
import { getMigrationStatus } from '@spryxel/db';

const config = parseRuntimeConfig(process.env, 'api');
if (!config.databaseUrl) throw new Error('DATABASE_URL is required for migration status');

const status = await getMigrationStatus(config.databaseUrl);
process.stdout.write(`${JSON.stringify({ migrations: status })}\n`);
