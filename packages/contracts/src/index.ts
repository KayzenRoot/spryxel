import { z } from 'zod';

export { z };

export const serviceNameSchema = z.enum(['web', 'api', 'worker']);
export const dependencyStateSchema = z.enum(['ready', 'disabled', 'unavailable']);

export const healthResponseSchema = z.object({
  service: serviceNameSchema,
  status: z.literal('ok'),
  requestId: z.string().min(1),
});

export const readinessDependencySchema = z.object({
  name: z.enum(['postgres', 'redis', 'object-storage']),
  status: dependencyStateSchema,
});

export const readinessResponseSchema = z.object({
  service: z.literal('api'),
  status: z.enum(['ready', 'unavailable']),
  dependencies: z.array(readinessDependencySchema),
  requestId: z.string().min(1),
});

export type ServiceName = z.infer<typeof serviceNameSchema>;
export type HealthResponse = z.infer<typeof healthResponseSchema>;
export type ReadinessDependency = z.infer<typeof readinessDependencySchema>;
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;

export const requestIdPattern = /^[A-Za-z0-9._:-]{1,80}$/;
export const projectIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const uuidV7Schema = z
  .string()
  .regex(projectIdPattern)
  .transform((value) => value.toLowerCase());
export const sha256HexSchema = z.string().regex(/^[0-9a-f]{64}$/);

export const dnaPayloadSchemaVersion = 'project-dna.v1' as const;
export const assetMetadataSchemaVersion = 'asset-metadata.v1' as const;
export const versionedPayloadMaxBytes = 65_536;
export const versionedPayloadMaxDepth = 16;
export const versionedPayloadMaxNodes = 4_096;

export const versionStatusSchema = z.enum(['draft', 'published', 'archived']);

export const provenanceV1Schema = z
  .object({
    source: z.enum(['manual', 'import', 'generation', 'restore', 'system']),
    actorSubjectId: uuidV7Schema.nullable(),
    recordedAt: z.iso.datetime(),
    sourceVersionId: uuidV7Schema.nullable(),
  })
  .strict()
  .superRefine((provenance, context) => {
    if (provenance.source === 'restore' && provenance.sourceVersionId === null) {
      context.addIssue({ code: 'custom', message: 'Restore provenance requires a source version' });
    }
  });

export type ProvenanceV1 = z.infer<typeof provenanceV1Schema>;
export type VersionStatus = z.infer<typeof versionStatusSchema>;
export type BoundedJsonValue =
  | null
  | boolean
  | number
  | string
  | BoundedJsonValue[]
  | { [key: string]: BoundedJsonValue };
export type BoundedJsonObject = { [key: string]: BoundedJsonValue };

const boundedJsonObjectSchema = z.custom<BoundedJsonObject>(isBoundedJsonObject);
const boundedTextSchema = (max: number) =>
  z.string().max(max).refine(isSafeJsonString, 'Text must be valid, PostgreSQL-safe Unicode');

const uniqueUuidV7ListSchema = (max: number) =>
  z
    .array(uuidV7Schema)
    .max(max)
    .superRefine((values, context) => {
      if (new Set(values.map((value) => value.toLowerCase())).size !== values.length) {
        context.addIssue({ code: 'custom', message: 'UUID identifiers must be unique' });
      }
    });

export const projectDnaV1Schema = z
  .object({
    schemaVersion: z.literal(dnaPayloadSchemaVersion),
    status: versionStatusSchema,
    styleIdentity: boundedTextSchema(256).min(1),
    palette: z
      .array(
        z
          .object({
            name: boundedTextSchema(80).min(1),
            colors: z
              .array(z.string().regex(/^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}){0,2}$/))
              .min(1)
              .max(32),
          })
          .strict(),
      )
      .max(32),
    visualReferenceIds: uniqueUuidV7ListSchema(64),
    constraints: boundedJsonObjectSchema,
    rules: z.array(boundedTextSchema(1_024).min(1)).max(100),
    provenance: provenanceV1Schema,
  })
  .strict()
  .superRefine(checkVersionedPayloadSize);

export const assetMetadataV1Schema = z
  .object({
    schemaVersion: z.literal(assetMetadataSchemaVersion),
    assetType: z.string().regex(/^[a-z][a-z0-9-]{0,63}$/),
    assetSubtype: z
      .string()
      .regex(/^[a-z][a-z0-9-]{0,63}$/)
      .nullable(),
    name: boundedTextSchema(160).min(1),
    description: boundedTextSchema(2_000).nullable(),
    tags: z
      .array(boundedTextSchema(64).min(1))
      .max(64)
      .superRefine((values, context) => {
        if (
          new Set(values.map((value) => value.normalize('NFC').toLocaleLowerCase('en-US'))).size !==
          values.length
        ) {
          context.addIssue({ code: 'custom', message: 'Asset tags must be unique' });
        }
      }),
    status: versionStatusSchema,
    lineage: z
      .array(
        z
          .object({
            relation: z.enum(['derived_from', 'variant_of', 'component_of', 'frame_of', 'source']),
            assetId: uuidV7Schema,
            assetVersionId: uuidV7Schema.nullable(),
          })
          .strict(),
      )
      .max(64)
      .superRefine((entries, context) => {
        const keys = entries.map(
          (entry) => `${entry.relation}:${entry.assetId}:${entry.assetVersionId ?? ''}`,
        );
        if (new Set(keys).size !== keys.length) {
          context.addIssue({ code: 'custom', message: 'Asset lineage references must be unique' });
        }
      }),
    assetContract: z
      .object({ id: uuidV7Schema, version: z.number().int().min(1).max(2_147_483_647) })
      .strict()
      .nullable(),
    projectDna: z
      .object({ id: uuidV7Schema, version: z.number().int().min(1).max(2_147_483_647) })
      .strict()
      .nullable(),
    dimensions: z
      .object({
        width: z.number().int().min(1).max(16_384),
        height: z.number().int().min(1).max(16_384),
        frameCount: z.number().int().min(1).max(10_000),
        fps: z.number().finite().min(0.1).max(240).nullable(),
      })
      .strict()
      .nullable(),
    paletteId: uuidV7Schema.nullable(),
    attributes: boundedJsonObjectSchema,
    provenance: provenanceV1Schema,
  })
  .strict()
  .superRefine(checkVersionedPayloadSize);

export type ProjectDnaV1 = z.infer<typeof projectDnaV1Schema>;
export type AssetMetadataV1 = z.infer<typeof assetMetadataV1Schema>;

function checkVersionedPayloadSize(value: unknown, context: z.RefinementCtx): void {
  try {
    if (new TextEncoder().encode(JSON.stringify(value)).byteLength > versionedPayloadMaxBytes) {
      context.addIssue({ code: 'custom', message: 'Versioned payload exceeds the byte limit' });
    }
  } catch {
    context.addIssue({ code: 'custom', message: 'Versioned payload must be JSON serializable' });
  }
}

function isBoundedJsonObject(value: unknown): value is BoundedJsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const ancestors = new Set<object>();
  let nodes = 0;
  const visit = (item: unknown, depth: number): item is BoundedJsonValue => {
    nodes += 1;
    if (nodes > versionedPayloadMaxNodes || depth > versionedPayloadMaxDepth) return false;
    if (item === null || typeof item === 'boolean') return true;
    if (typeof item === 'string') {
      return isSafeJsonString(item) && new TextEncoder().encode(item).byteLength <= 4_096;
    }
    if (typeof item === 'number') return Number.isFinite(item);
    if (typeof item !== 'object' || item === undefined || ancestors.has(item)) return false;
    const prototype = Object.getPrototypeOf(item);
    if (Array.isArray(item)) {
      if (prototype !== Array.prototype || item.length > 512) return false;
      const descriptors = Object.getOwnPropertyDescriptors(item);
      ancestors.add(item);
      try {
        for (let index = 0; index < item.length; index += 1) {
          const descriptor = descriptors[String(index)];
          if (
            !descriptor ||
            !Object.hasOwn(descriptor, 'value') ||
            !visit(descriptor.value, depth + 1)
          ) {
            return false;
          }
        }
        return Object.keys(descriptors).every(
          (key) => key === 'length' || /^(0|[1-9][0-9]*)$/.test(key),
        );
      } finally {
        ancestors.delete(item);
      }
    }
    if (prototype !== Object.prototype && prototype !== null) return false;
    if (Object.keys(item).length === 0) return true;
    ancestors.add(item);
    try {
      const descriptors = Object.getOwnPropertyDescriptors(item);
      const normalizedKeys = new Set<string>();
      for (const key of Object.keys(descriptors)) {
        const descriptor = descriptors[key];
        const normalizedKey = key.normalize('NFC');
        if (
          !descriptor ||
          !Object.hasOwn(descriptor, 'value') ||
          !isSafeJsonString(normalizedKey) ||
          new TextEncoder().encode(normalizedKey).byteLength > 256 ||
          normalizedKeys.has(normalizedKey) ||
          !visit(descriptor.value, depth + 1)
        ) {
          return false;
        }
        normalizedKeys.add(normalizedKey);
      }
      return true;
    } finally {
      ancestors.delete(item);
    }
  };
  try {
    return visit(value, 0);
  } catch {
    return false;
  }
}

function isSafeJsonString(value: string): boolean {
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

const postgresInt8Maximum = 9_223_372_036_854_775_807n;
const nonNegativeInt8DecimalSchema = z
  .string()
  .regex(/^(?:0|[1-9][0-9]{0,18})$/)
  .refine((value) => BigInt(value) <= postgresInt8Maximum);

export const creditSummaryResponseSchema = z
  .object({
    tenantId: z.string().regex(projectIdPattern),
    asOf: z.iso.datetime(),
    requestId: z.string().regex(requestIdPattern),
    balances: z
      .object({
        availableCredits: nonNegativeInt8DecimalSchema,
        reservedCredits: nonNegativeInt8DecimalSchema,
        committedCredits: nonNegativeInt8DecimalSchema,
      })
      .strict(),
    counters: z
      .object({
        openReservations: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
        ledgerEntries: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
      })
      .strict(),
  })
  .strict();

export type CreditSummaryResponse = z.infer<typeof creditSummaryResponseSchema>;

const normalizedProjectNameSchema = z
  .string()
  .transform((value) => value.normalize('NFC').trim().replace(/\s+/gu, ' '))
  .pipe(z.string().min(1).max(120));

export const projectCreateRequestSchema = z.object({ name: normalizedProjectNameSchema }).strict();

export const projectSchema = z
  .object({
    id: z.string().regex(projectIdPattern),
    tenantId: z.string().regex(projectIdPattern),
    createdBySubjectId: z.string().regex(projectIdPattern),
    name: z.string().min(1).max(120),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export const projectRoleSchema = z.enum(['OWNER', 'ADMIN', 'MEMBER']);

export const projectListResponseSchema = z
  .object({
    tenantId: z.string().regex(projectIdPattern),
    role: projectRoleSchema,
    projects: z.array(projectSchema),
  })
  .strict();

export const projectResponseSchema = z
  .object({
    tenantId: z.string().regex(projectIdPattern),
    role: projectRoleSchema,
    project: projectSchema,
  })
  .strict();

export const idempotencyKeyPattern = /^[A-Za-z0-9._:-]{1,128}$/;

export const durableJobStatusSchema = z.enum([
  'queued',
  'running',
  'cancel_requested',
  'succeeded',
  'failed',
  'cancelled',
]);
export const jobAttemptSchema = z
  .object({
    id: z.string().regex(projectIdPattern),
    executorKind: z.literal('spryxel.asset_contract.integrity_worker'),
    executorVersion: z.literal('v1'),
    attemptNumber: z.number().int().min(1).max(3),
    status: z.enum(['running', 'succeeded', 'failed', 'cancelled', 'expired']),
    startedAt: z.iso.datetime(),
    completedAt: z.iso.datetime().nullable(),
    failureCode: z
      .enum([
        'contract_integrity_mismatch',
        'attempts_exhausted',
        'execution_timeout',
        'lease_expired',
      ])
      .nullable(),
  })
  .strict();
export const safeJobSchema = z
  .object({
    id: z.string().regex(projectIdPattern),
    projectId: z.string().regex(projectIdPattern),
    operationType: z.literal('asset_contract.integrity_check.v1'),
    status: durableJobStatusSchema,
    retryable: z.boolean(),
    cancelEligible: z.boolean(),
    attemptCount: z.number().int().min(0).max(3),
    maxAttempts: z.number().int().min(1).max(3),
    resultCode: z.literal('integrity_passed').nullable(),
    failureCode: z
      .enum(['contract_integrity_mismatch', 'attempts_exhausted', 'execution_timeout'])
      .nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    contract: z
      .object({
        id: z.string().regex(projectIdPattern),
        version: z.number().int().min(1),
        schemaVersion: z.literal('asset-contract.v1'),
        skuId: z.string().regex(/^SKU-(?:MAP-|UI-)?[0-9]{3}$/),
        specificationSha256: z.string().regex(/^[0-9a-f]{64}$/),
        executionBounds: z
          .object({
            maxCandidates: z.literal(1),
            maxRetries: z.literal(2),
            maxRepairs: z.literal(0),
            maxWallTimeMs: z.literal(5_000),
          })
          .strict(),
      })
      .strict(),
    attempts: z.array(jobAttemptSchema).max(3),
  })
  .strict();
export const jobListResponseSchema = z
  .object({
    jobs: z.array(safeJobSchema).max(50),
    nextCursor: z.string().max(256).optional(),
  })
  .strict();
export const jobResponseSchema = z.object({ job: safeJobSchema }).strict();
export const jobCancelResponseSchema = z.object({ job: safeJobSchema }).strict();
export const jobListQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: z
      .string()
      .regex(/^[A-Za-z0-9_-]{1,256}$/)
      .optional(),
    projectId: z.string().regex(projectIdPattern).optional(),
  })
  .strict();
export const projectJobListQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(50).default(20),
    cursor: z
      .string()
      .regex(/^[A-Za-z0-9_-]{1,256}$/)
      .optional(),
  })
  .strict();

export type Project = z.infer<typeof projectSchema>;
export type ProjectRole = z.infer<typeof projectRoleSchema>;
export type SafeJob = z.infer<typeof safeJobSchema>;
