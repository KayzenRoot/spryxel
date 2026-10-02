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
