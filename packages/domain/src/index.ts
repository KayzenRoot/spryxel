export type ReadinessState = 'ready' | 'disabled' | 'unavailable';

export type ReadinessProbe = {
  name: 'postgres' | 'redis' | 'object-storage';
  state: ReadinessState;
};

export function summarizeReadiness(probes: ReadinessProbe[]): 'ready' | 'unavailable' {
  return probes.some((probe) => probe.state === 'unavailable') ? 'unavailable' : 'ready';
}

export interface Clock {
  now(): Date;
}

export interface PrivateObjectStorageProbe {
  probe(): Promise<void>;
}

export interface TransientQueueProbe {
  ping(): Promise<void>;
}

export interface CanonicalDatabaseProbe {
  ping(): Promise<void>;
}

export const systemClock: Clock = {
  now: () => new Date(),
};
