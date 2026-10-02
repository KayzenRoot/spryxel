import { parseRuntimeConfig } from '@spryxel/config';
import { runMigrations } from '@spryxel/db';

const config = parseRuntimeConfig(process.env, 'api');
if (!config.databaseUrl)
  throw new Error('DATABASE_URL is required for the explicit migration command');

const status = await runMigrations(config.databaseUrl);
process.stdout.write(
  `${JSON.stringify({ applied: status.map(({ id }) => id), count: status.length })}\n`,
);
