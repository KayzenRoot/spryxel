import type { CanonicalDatabaseProbe } from '@spryxel/domain';
import type { Database } from '@spryxel/db';

export class DrizzlePostgresReadinessProbe implements CanonicalDatabaseProbe {
  constructor(private readonly database: Pick<Database, 'ping'>) {}

  ping(): Promise<void> {
    return this.database.ping();
  }
}
