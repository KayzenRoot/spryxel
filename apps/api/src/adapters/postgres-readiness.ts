import type { CanonicalDatabaseProbe } from '@spryxel/domain';
import { probePostgres } from '@spryxel/db';

export class DrizzlePostgresReadinessProbe implements CanonicalDatabaseProbe {
  constructor(private readonly databaseUrl: string) {}

  ping(): Promise<void> {
    return probePostgres(this.databaseUrl);
  }
}
