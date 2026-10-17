import type { TransientQueueProbe } from '@spryxel/domain';
import { probeRedis } from '../redis-probe.js';

export class RedisTransientReadinessProbe implements TransientQueueProbe {
  constructor(private readonly redisUrl: string) {}

  ping(): Promise<void> {
    return probeRedis(this.redisUrl);
  }
}
