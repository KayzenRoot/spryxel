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
    maxAttempts: z.literal(3),
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
