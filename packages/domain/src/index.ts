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

export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER';

export type Project = {
  id: string;
  tenantId: string;
  createdBySubjectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectCreateCommand = {
  idempotencyKeyHash: string;
  requestHash: string;
  subjectId: string;
  tenantId: string;
  requestId: string;
  name: string;
};

export type ProjectRepositoryPort = {
  create(input: ProjectCreateCommand): Promise<Project>;
  list(input: { subjectId: string; tenantId: string }): Promise<Project[]>;
  get(input: { subjectId: string; tenantId: string; projectId: string }): Promise<Project | null>;
};

export function canCreateProject(role: ProjectRole): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}

export function normalizeProjectName(value: string): string {
  return value.normalize('NFC').trim().replace(/\s+/gu, ' ');
}
