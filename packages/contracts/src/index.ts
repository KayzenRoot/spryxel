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
export type Project = z.infer<typeof projectSchema>;
export type ProjectRole = z.infer<typeof projectRoleSchema>;
