import { z } from 'zod';

// Internal-only commands. The caller cannot supply tenant/actor/bucket credentials.
// Real authenticated principal and resolved project/asset membership must be fetched
// server-side under PostgreSQL FORCE RLS before executing any operation.
const uuidV7 = z.string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  .transform(value => value.toLowerCase());
const target = z.object({ projectId: uuidV7, assetVersionId: uuidV7 }).strict();
export const privateAssetBeginCommandSchema = target.extend({
  operation: z.literal('begin'),
  mediaType: z.enum(['image/png', 'image/webp']),
  sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024),
  declaredSha256: z.string().regex(/^[a-f0-9]{64}$/),
  idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{16,128}$/),
}).strict();
export const privateAssetFinalizeCommandSchema = target.extend({
  operation: z.literal('finalize'), uploadAttemptId: uuidV7,
}).strict();
export const privateAssetReadCommandSchema = target.extend({
  operation: z.literal('read'),
}).strict();
export const privateAssetAbortCommandSchema = target.extend({
  operation: z.literal('abort'), uploadAttemptId: uuidV7,
}).strict();
export const privateAssetRevokeCommandSchema = target.extend({
  operation: z.literal('revoke'),
}).strict();
export const privateAssetCommandSchema = z.discriminatedUnion('operation', [
  privateAssetBeginCommandSchema, privateAssetFinalizeCommandSchema,
  privateAssetReadCommandSchema, privateAssetAbortCommandSchema,
  privateAssetRevokeCommandSchema,
]);
export type PrivateAssetCommand = z.infer<typeof privateAssetCommandSchema>;
