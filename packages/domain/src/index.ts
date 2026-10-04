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
import { createHash } from 'node:crypto';

export const integrityCheckOperation = 'asset_contract.integrity_check.v1' as const;
export const assetContractSchemaVersion = 'asset-contract.v1' as const;
export const maxContractBytes = 65_536;
export const maxContractDepth = 16;
export const maxContractNodes = 2_048;
export const maxJobAttempts = 3;
export const maxJobWallTimeMs = 5_000;

export const admittedSkuIds = [
  ...Array.from({ length: 15 }, (_, index) => `SKU-${String(index + 1).padStart(3, '0')}`),
  ...Array.from({ length: 9 }, (_, index) => `SKU-MAP-${String(index + 1).padStart(3, '0')}`),
  ...Array.from({ length: 10 }, (_, index) => `SKU-UI-${String(index + 1).padStart(3, '0')}`),
] as const;

export type AdmittedSkuId = (typeof admittedSkuIds)[number];
export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue };
export type AssetContractDraft = { skuId: string; specification: unknown };
export type CompiledAssetContract = {
  schemaVersion: typeof assetContractSchemaVersion;
  skuId: AdmittedSkuId;
  specification: Record<string, JsonValue>;
  canonicalSpecification: string;
  specificationSha256: string;
  requestSha256: string;
};

export class AssetContractValidationError extends Error {
  constructor(readonly code: 'unknown_sku' | 'invalid_specification' | 'specification_too_large') {
    super('Asset Contract is outside the admitted envelope');
    this.name = 'AssetContractValidationError';
  }
}

export function compileAssetContract(draft: AssetContractDraft): CompiledAssetContract {
  if (!admittedSkuIds.includes(draft.skuId as AdmittedSkuId)) {
    throw new AssetContractValidationError('unknown_sku');
  }
  let nodes = 0;
  const ancestors = new Set<object>();
  const normalize = (value: unknown, depth: number): JsonValue => {
    nodes += 1;
    if (nodes > maxContractNodes || depth > maxContractDepth) {
      throw new AssetContractValidationError('invalid_specification');
    }
    if (value === null || typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.normalize('NFC');
      if (Buffer.byteLength(normalized, 'utf8') > 4_096) {
        throw new AssetContractValidationError('invalid_specification');
      }
      return normalized;
    }
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value !== 'object' || value === undefined) {
      throw new AssetContractValidationError('invalid_specification');
    }
    if (ancestors.has(value)) throw new AssetContractValidationError('invalid_specification');
    ancestors.add(value);
    try {
      if (Array.isArray(value)) {
        if (value.length > 128) throw new AssetContractValidationError('invalid_specification');
        return value.map((item) => normalize(item, depth + 1));
      }
      const prototype = Object.getPrototypeOf(value);
      if (prototype !== Object.prototype && prototype !== null) {
        throw new AssetContractValidationError('invalid_specification');
      }
      const output: Record<string, JsonValue> = {};
      for (const key of Object.keys(value).sort()) {
        const normalizedKey = key.normalize('NFC');
        if (
          !normalizedKey ||
          Buffer.byteLength(normalizedKey, 'utf8') > 256 ||
          normalizedKey in output
        ) {
          throw new AssetContractValidationError('invalid_specification');
        }
        output[normalizedKey] = normalize((value as Record<string, unknown>)[key], depth + 1);
      }
      return output;
    } finally {
      ancestors.delete(value);
    }
  };

  const normalized = normalize(draft.specification, 0);
  if (normalized === null || Array.isArray(normalized) || typeof normalized !== 'object') {
    throw new AssetContractValidationError('invalid_specification');
  }
  const canonicalSpecification = canonicalJson(normalized);
  if (Buffer.byteLength(canonicalSpecification, 'utf8') > maxContractBytes) {
    throw new AssetContractValidationError('specification_too_large');
  }
  const specificationSha256 = sha256(canonicalSpecification);
  const requestSha256 = sha256(
    canonicalJson({
      operation: integrityCheckOperation,
      schemaVersion: assetContractSchemaVersion,
      skuId: draft.skuId,
      specificationSha256,
    }),
  );
  return {
    schemaVersion: assetContractSchemaVersion,
    skuId: draft.skuId as AdmittedSkuId,
    specification: normalized,
    canonicalSpecification,
    specificationSha256,
    requestSha256,
  };
}

function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key] as JsonValue)}`)
    .join(',')}}`;
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export type DurableJobStatus =
  | 'queued'
  | 'running'
  | 'cancel_requested'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export type DurableJobTransitionEvent =
  | 'claim'
  | 'retry'
  | 'request_cancel'
  | 'cancel_before_claim'
  | 'finish_success'
  | 'finish_failure'
  | 'finish_cancel';

const jobTransitions: Record<
  DurableJobStatus,
  Partial<Record<DurableJobTransitionEvent, DurableJobStatus>>
> = {
  queued: { claim: 'running', cancel_before_claim: 'cancelled' },
  running: {
    retry: 'queued',
    request_cancel: 'cancel_requested',
    finish_success: 'succeeded',
    finish_failure: 'failed',
    finish_cancel: 'cancelled',
  },
  cancel_requested: { finish_cancel: 'cancelled' },
  succeeded: {},
  failed: {},
  cancelled: {},
};

export function nextDurableJobState(
  current: DurableJobStatus,
  event: DurableJobTransitionEvent,
): DurableJobStatus {
  const next = jobTransitions[current][event];
  if (!next) throw new Error('Illegal durable Job state transition');
  return next;
}

export type SafeJobAttempt = {
  id: string;
  attemptNumber: number;
  status: 'running' | 'succeeded' | 'failed' | 'cancelled' | 'expired';
  startedAt: string;
  completedAt: string | null;
  failureCode: string | null;
};

export type SafeJob = {
  id: string;
  projectId: string;
  operationType: typeof integrityCheckOperation;
  status: DurableJobStatus;
  retryable: boolean;
  cancelEligible: boolean;
  attemptCount: number;
  maxAttempts: number;
  resultCode: 'integrity_passed' | null;
  failureCode: string | null;
  createdAt: string;
  updatedAt: string;
  contract: {
    id: string;
    version: number;
    schemaVersion: typeof assetContractSchemaVersion;
    skuId: string;
    specificationSha256: string;
  };
  attempts: SafeJobAttempt[];
};

export type CreateIntegrityJobCommand = {
  subjectId: string;
  tenantId: string;
  projectId: string;
  idempotencyKeySha256: string;
  compiledContract: CompiledAssetContract;
};

export type DurableJobRepositoryPort = {
  list(input: {
    subjectId: string;
    tenantId: string;
    projectId?: string;
    limit: number;
    cursor?: string;
  }): Promise<{ jobs: SafeJob[]; nextCursor?: string }>;
  get(input: {
    subjectId: string;
    tenantId: string;
    projectId: string;
    jobId: string;
  }): Promise<SafeJob | null>;
  cancel(input: {
    subjectId: string;
    tenantId: string;
    projectId: string;
    jobId: string;
  }): Promise<SafeJob | null>;
};

export type CreatedDurableJob = { job: SafeJob; replayed: boolean };
