import { createHash, randomBytes } from 'node:crypto';

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

const uuidV7Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sha256Pattern = /^[0-9a-f]{64}$/;
const versionPayloadMaxBytes = 65_536;
const versionPayloadMaxDepth = 16;
const versionPayloadMaxNodes = 4_096;

export type VersionStatus = 'draft' | 'published' | 'archived';
export type VersionProvenanceSource = 'manual' | 'import' | 'generation' | 'restore' | 'system';
export type VersionProvenance = Readonly<{
  source: VersionProvenanceSource;
  actorSubjectId: string | null;
  recordedAt: string;
  sourceVersionId: string | null;
}>;

export type ProjectDnaPayload = {
  schemaVersion: 'project-dna.v1';
  status: VersionStatus;
  styleIdentity: string;
  palette: Array<{ name: string; colors: string[] }>;
  visualReferenceIds: string[];
  constraints: Record<string, unknown>;
  rules: string[];
};

export type AssetMetadataPayload = {
  schemaVersion: 'asset-metadata.v1';
  assetType: string;
  assetSubtype: string | null;
  name: string;
  description: string | null;
  tags: string[];
  status: VersionStatus;
  lineage: Array<{
    relation: 'derived_from' | 'variant_of' | 'component_of' | 'frame_of' | 'source';
    assetId: string;
    assetVersionId: string | null;
  }>;
  assetContract: { id: string; version: number } | null;
  projectDna: { id: string; version: number } | null;
  dimensions: { width: number; height: number; frameCount: number; fps: number | null } | null;
  paletteId: string | null;
  attributes: Record<string, unknown>;
};

export type VersionedPayloadSchema = { parse(value: unknown): unknown };
type VersionCommand<T> = {
  tenantId: string;
  projectId: string;
  versionId: string;
  version: number;
  idempotencyKeySha256: string;
  payload: T;
  provenance: VersionProvenance;
};

export type PreparedProjectDnaVersion = Readonly<{
  id: string;
  tenantId: string;
  projectId: string;
  versionId: string;
  version: number;
  idempotencyKeySha256: string;
  payload: Readonly<ProjectDnaPayload>;
  canonicalPayload: string;
  payloadSha256: string;
  provenance: VersionProvenance;
}>;

export type PreparedAssetVersion = Readonly<{
  assetId: string;
  tenantId: string;
  projectId: string;
  versionId: string;
  version: number;
  idempotencyKeySha256: string;
  payload: Readonly<AssetMetadataPayload>;
  canonicalPayload: string;
  payloadSha256: string;
  provenance: VersionProvenance;
}>;

export class VersionedEntityConflictError extends Error {
  readonly code = 'idempotency_payload_conflict' as const;

  constructor() {
    super('Idempotency key was already used for different version content');
    this.name = 'VersionedEntityConflictError';
  }
}

export class VersionedPayloadValidationError extends Error {
  constructor(readonly code: 'invalid_payload' | 'payload_too_large') {
    super('Versioned payload is outside the admitted envelope');
    this.name = 'VersionedPayloadValidationError';
  }
}

export function createUuidV7(now: Date = new Date()): string {
  const timestamp = now.getTime();
  if (!Number.isSafeInteger(timestamp) || timestamp < 0 || timestamp > 0xffffffffffff) {
    throw new RangeError('UUIDv7 timestamp is outside its 48-bit range');
  }
  const bytes = randomBytes(16);
  let remainingTimestamp = timestamp;
  for (let index = 5; index >= 0; index -= 1) {
    bytes[index] = remainingTimestamp & 0xff;
    remainingTimestamp = Math.floor(remainingTimestamp / 256);
  }
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x70;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function prepareProjectDnaVersion(
  input: VersionCommand<ProjectDnaPayload> & {
    id: string;
    payloadSchema: VersionedPayloadSchema;
  },
): PreparedProjectDnaVersion {
  validateVersionCommand(input);
  validateUuidV7(input.id);
  const parsed = parseVersionPayload(input.payloadSchema, input.payload, input.provenance);
  const compiled = compileBoundedPayload(parsed.payload);
  return deepFreeze({
    id: input.id.toLowerCase(),
    tenantId: input.tenantId.toLowerCase(),
    projectId: input.projectId.toLowerCase(),
    versionId: input.versionId.toLowerCase(),
    version: input.version,
    idempotencyKeySha256: input.idempotencyKeySha256,
    payload: compiled.value as ProjectDnaPayload,
    canonicalPayload: compiled.canonicalPayload,
    payloadSha256: compiled.payloadSha256,
    provenance: parsed.provenance,
  });
}

export function prepareAssetVersion(
  input: VersionCommand<AssetMetadataPayload> & {
    assetId: string;
    payloadSchema: VersionedPayloadSchema;
  },
): PreparedAssetVersion {
  validateVersionCommand(input);
  validateUuidV7(input.assetId);
  const parsed = parseVersionPayload(input.payloadSchema, input.payload, input.provenance);
  const compiled = compileBoundedPayload(parsed.payload);
  return deepFreeze({
    assetId: input.assetId.toLowerCase(),
    tenantId: input.tenantId.toLowerCase(),
    projectId: input.projectId.toLowerCase(),
    versionId: input.versionId.toLowerCase(),
    version: input.version,
    idempotencyKeySha256: input.idempotencyKeySha256,
    payload: compiled.value as AssetMetadataPayload,
    canonicalPayload: compiled.canonicalPayload,
    payloadSha256: compiled.payloadSha256,
    provenance: parsed.provenance,
  });
}

export function assertIdempotentPayloadReplay<T>(
  existing: { payloadSha256: string; value: T },
  candidatePayloadSha256: string,
): T {
  validateSha256(existing.payloadSha256);
  validateSha256(candidatePayloadSha256);
  if (existing.payloadSha256 !== candidatePayloadSha256) throw new VersionedEntityConflictError();
  return existing.value;
}

export function assertVersionStatusTransition(
  current: VersionStatus,
  next: VersionStatus,
): VersionStatus {
  const allowed: Record<VersionStatus, ReadonlySet<VersionStatus>> = {
    draft: new Set(['draft', 'published']),
    published: new Set(['published', 'archived']),
    archived: new Set(['archived']),
  };
  if (!allowed[current]?.has(next)) throw new Error('Illegal immutable version status transition');
  return next;
}

export function restoreProjectDnaVersionAsNew(input: {
  source: PreparedProjectDnaVersion;
  versionId: string;
  version: number;
  idempotencyKeySha256: string;
  actorSubjectId: string | null;
  recordedAt: string;
  payloadSchema: VersionedPayloadSchema;
}): PreparedProjectDnaVersion {
  validateRestore(input.source, input.versionId, input.version, input.idempotencyKeySha256);
  return prepareProjectDnaVersion({
    id: input.source.id,
    tenantId: input.source.tenantId,
    projectId: input.source.projectId,
    versionId: input.versionId,
    version: input.version,
    idempotencyKeySha256: input.idempotencyKeySha256,
    payloadSchema: input.payloadSchema,
    payload: { ...input.source.payload, status: 'draft' },
    provenance: {
      source: 'restore',
      actorSubjectId: input.actorSubjectId,
      recordedAt: input.recordedAt,
      sourceVersionId: input.source.versionId,
    },
  });
}

export function restoreAssetVersionAsNew(input: {
  source: PreparedAssetVersion;
  versionId: string;
  version: number;
  idempotencyKeySha256: string;
  actorSubjectId: string | null;
  recordedAt: string;
  payloadSchema: VersionedPayloadSchema;
}): PreparedAssetVersion {
  validateRestore(input.source, input.versionId, input.version, input.idempotencyKeySha256);
  return prepareAssetVersion({
    assetId: input.source.assetId,
    tenantId: input.source.tenantId,
    projectId: input.source.projectId,
    versionId: input.versionId,
    version: input.version,
    idempotencyKeySha256: input.idempotencyKeySha256,
    payloadSchema: input.payloadSchema,
    payload: { ...input.source.payload, status: 'draft' },
    provenance: {
      source: 'restore',
      actorSubjectId: input.actorSubjectId,
      recordedAt: input.recordedAt,
      sourceVersionId: input.source.versionId,
    },
  });
}

function validateVersionCommand(input: VersionCommand<unknown>): void {
  validateUuidV7(input.tenantId);
  validateUuidV7(input.projectId);
  validateUuidV7(input.versionId);
  validateSha256(input.idempotencyKeySha256);
  if (!Number.isSafeInteger(input.version) || input.version < 1) {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
}

function validateRestore(
  source: { versionId: string; version: number },
  versionId: string,
  version: number,
  idempotencyKeySha256: string,
): void {
  validateUuidV7(versionId);
  validateSha256(idempotencyKeySha256);
  if (
    versionId === source.versionId ||
    !Number.isSafeInteger(version) ||
    version <= source.version
  ) {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
}

function validateVersionProvenance(value: VersionProvenance): VersionProvenance {
  if (
    !['manual', 'import', 'generation', 'restore', 'system'].includes(value.source) ||
    !isIsoUtcDateTime(value.recordedAt) ||
    (value.actorSubjectId !== null && !uuidV7Pattern.test(value.actorSubjectId)) ||
    (value.sourceVersionId !== null && !uuidV7Pattern.test(value.sourceVersionId)) ||
    (value.source === 'restore' && value.sourceVersionId === null)
  ) {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
  return deepFreeze({
    ...value,
    actorSubjectId: value.actorSubjectId?.toLowerCase() ?? null,
    sourceVersionId: value.sourceVersionId?.toLowerCase() ?? null,
  });
}

function parseVersionPayload<T>(
  payloadSchema: VersionedPayloadSchema,
  payload: T,
  provenance: VersionProvenance,
): { payload: T; provenance: VersionProvenance } {
  let parsed: unknown;
  try {
    parsed = payloadSchema.parse({ ...payload, provenance });
  } catch {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
  const descriptors = Object.getOwnPropertyDescriptors(parsed);
  const provenanceDescriptor = descriptors.provenance;
  if (!provenanceDescriptor || !Object.hasOwn(provenanceDescriptor, 'value')) {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
  const content = Object.create(null) as Record<string, unknown>;
  for (const key of Object.keys(descriptors)) {
    if (key === 'provenance') continue;
    const descriptor = descriptors[key];
    if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
      throw new VersionedPayloadValidationError('invalid_payload');
    }
    content[key] = descriptor.value;
  }
  return {
    payload: content as T,
    provenance: validateVersionProvenance(provenanceDescriptor.value as VersionProvenance),
  };
}

function isIsoUtcDateTime(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) return false;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return false;
  const canonicalInput = value.includes('.') ? value : value.replace(/Z$/, '.000Z');
  return parsed.toISOString() === canonicalInput;
}

function validateUuidV7(value: string): void {
  if (!uuidV7Pattern.test(value)) throw new VersionedPayloadValidationError('invalid_payload');
}

function validateSha256(value: string): void {
  if (!sha256Pattern.test(value)) throw new VersionedPayloadValidationError('invalid_payload');
}

function compileBoundedPayload(value: unknown): {
  value: Record<string, unknown>;
  canonicalPayload: string;
  payloadSha256: string;
} {
  const normalized = normalizeJsonValue(value, 0, { count: 0 }, new Set());
  if (normalized === null || Array.isArray(normalized) || typeof normalized !== 'object') {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
  const canonicalPayload = canonicalJsonValue(normalized);
  if (Buffer.byteLength(canonicalPayload, 'utf8') > versionPayloadMaxBytes) {
    throw new VersionedPayloadValidationError('payload_too_large');
  }
  return {
    value: normalized as Record<string, unknown>,
    canonicalPayload,
    payloadSha256: createHash('sha256').update(canonicalPayload).digest('hex'),
  };
}

type NormalizedJsonValue =
  | null
  | boolean
  | number
  | string
  | NormalizedJsonValue[]
  | { [key: string]: NormalizedJsonValue };

function normalizeJsonValue(
  value: unknown,
  depth: number,
  nodes: { count: number },
  ancestors: Set<object>,
): NormalizedJsonValue {
  nodes.count += 1;
  if (nodes.count > versionPayloadMaxNodes || depth > versionPayloadMaxDepth) {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'string') return normalizeJsonString(value);
  if (typeof value === 'number' && Number.isFinite(value)) return Object.is(value, -0) ? 0 : value;
  if (typeof value !== 'object' || value === undefined || ancestors.has(value)) {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
  if (Array.isArray(value)) return normalizeJsonArray(value, depth, nodes, ancestors);
  return normalizeJsonObject(value, depth, nodes, ancestors);
}

function normalizeJsonString(value: string): string {
  const normalized = value.normalize('NFC');
  if (!isJsonbSafeString(normalized) || Buffer.byteLength(normalized, 'utf8') > 4_096) {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
  return normalized;
}

function normalizeJsonArray(
  value: unknown[],
  depth: number,
  nodes: { count: number },
  ancestors: Set<object>,
): NormalizedJsonValue[] {
  if (Object.getPrototypeOf(value) !== Array.prototype || value.length > 512) {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
  ancestors.add(value);
  try {
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const output: NormalizedJsonValue[] = [];
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = descriptors[String(index)];
      if (!descriptor || !Object.hasOwn(descriptor, 'value')) {
        throw new VersionedPayloadValidationError('invalid_payload');
      }
      output.push(normalizeJsonValue(descriptor.value, depth + 1, nodes, ancestors));
    }
    if (
      Object.keys(descriptors).some((key) => key !== 'length' && !/^(0|[1-9][0-9]*)$/.test(key))
    ) {
      throw new VersionedPayloadValidationError('invalid_payload');
    }
    return output;
  } finally {
    ancestors.delete(value);
  }
}

function normalizeJsonObject(
  value: object,
  depth: number,
  nodes: { count: number },
  ancestors: Set<object>,
): Record<string, NormalizedJsonValue> {
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new VersionedPayloadValidationError('invalid_payload');
  }
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const output = Object.create(null) as Record<string, NormalizedJsonValue>;
  ancestors.add(value);
  try {
    for (const key of Object.keys(descriptors).sort(compareCanonicalKeys)) {
      const descriptor = descriptors[key];
      const normalizedKey = key.normalize('NFC');
      if (
        !descriptor ||
        !Object.hasOwn(descriptor, 'value') ||
        !isJsonbSafeString(normalizedKey) ||
        Buffer.byteLength(normalizedKey, 'utf8') > 256 ||
        Object.hasOwn(output, normalizedKey)
      ) {
        throw new VersionedPayloadValidationError('invalid_payload');
      }
      output[normalizedKey] = normalizeJsonValue(descriptor.value, depth + 1, nodes, ancestors);
    }
    return output;
  } finally {
    ancestors.delete(value);
  }
}

function canonicalJsonValue(value: NormalizedJsonValue): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJsonValue).join(',')}]`;
  return `{${Object.keys(value)
    .sort(compareCanonicalKeys)
    .map((key) => `${JSON.stringify(key)}:${canonicalJsonValue(value[key] as NormalizedJsonValue)}`)
    .join(',')}}`;
}

function deepFreeze<T>(value: T): Readonly<T> {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

export const integrityCheckOperation = 'asset_contract.integrity_check.v1' as const;
export const assetContractSchemaVersion = 'asset-contract.v1' as const;
export const maxContractBytes = 65_536;
export const maxContractDepth = 16;
export const maxContractNodes = 2_048;
export type AssetContractExecutionBounds = Readonly<{
  maxCandidates: number;
  maxRetries: number;
  maxRepairs: number;
  maxWallTimeMs: number;
}>;
export const integrityCheckExecutionBounds: AssetContractExecutionBounds = Object.freeze({
  maxCandidates: 1,
  maxRetries: 2,
  maxRepairs: 0,
  maxWallTimeMs: 5_000,
});
export const maxJobAttempts = integrityCheckExecutionBounds.maxRetries + 1;
export const maxJobWallTimeMs = integrityCheckExecutionBounds.maxWallTimeMs;
export const integrityExecutorKind = 'spryxel.asset_contract.integrity_worker' as const;
export const integrityExecutorVersion = 'v1' as const;

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
export type CompiledAssetContract = Readonly<{
  schemaVersion: typeof assetContractSchemaVersion;
  skuId: AdmittedSkuId;
  specification: Record<string, JsonValue>;
  canonicalSpecification: string;
  specificationSha256: string;
  executionBounds: AssetContractExecutionBounds;
  requestSha256: string;
}>;

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
      if (!isJsonbSafeString(normalized) || Buffer.byteLength(normalized, 'utf8') > 4_096) {
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
      const output = Object.create(null) as Record<string, JsonValue>;
      for (const key of Object.keys(value).sort(compareCanonicalKeys)) {
        const normalizedKey = key.normalize('NFC');
        if (
          !normalizedKey ||
          !isJsonbSafeString(normalizedKey) ||
          Buffer.byteLength(normalizedKey, 'utf8') > 256 ||
          Object.hasOwn(output, normalizedKey)
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
  const requestSha256 = deriveAssetContractRequestSha256(
    draft.skuId,
    specificationSha256,
    integrityCheckExecutionBounds,
  );
  return Object.freeze({
    schemaVersion: assetContractSchemaVersion,
    skuId: draft.skuId as AdmittedSkuId,
    specification: normalized,
    canonicalSpecification,
    specificationSha256,
    executionBounds: integrityCheckExecutionBounds,
    requestSha256,
  });
}

export function deriveAssetContractRequestSha256(
  skuId: string,
  specificationSha256: string,
  executionBounds: AssetContractExecutionBounds,
): string {
  return sha256(
    canonicalJson({
      operation: integrityCheckOperation,
      schemaVersion: assetContractSchemaVersion,
      skuId,
      specificationSha256,
      executionBounds: {
        maxCandidates: executionBounds.maxCandidates,
        maxRetries: executionBounds.maxRetries,
        maxRepairs: executionBounds.maxRepairs,
        maxWallTimeMs: executionBounds.maxWallTimeMs,
      },
    }),
  );
}

function canonicalJson(value: JsonValue): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  return `{${Object.keys(value)
    .sort(compareCanonicalKeys)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key] as JsonValue)}`)
    .join(',')}}`;
}

function isJsonbSafeString(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit === 0) return false;
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const nextCodeUnit = value.charCodeAt(index + 1);
      if (!(nextCodeUnit >= 0xdc00 && nextCodeUnit <= 0xdfff)) return false;
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      return false;
    }
  }
  return true;
}

function compareCanonicalKeys(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
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
  executorKind: typeof integrityExecutorKind;
  executorVersion: typeof integrityExecutorVersion;
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
    executionBounds: AssetContractExecutionBounds;
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

export * from './credit-ledger.js';

export * from './private-asset-storage.js';
