import 'server-only';
import { jobListResponseSchema, jobResponseSchema, type SafeJob } from '@spryxel/contracts';
import type { WebSession } from '../auth/session';

export class JobApiError extends Error {
  constructor(readonly status: number) {
    super('Job API request failed');
    this.name = 'JobApiError';
  }
}

export function assertJobApiError(error: unknown): asserts error is JobApiError {
  if (!(error instanceof JobApiError)) throw error;
}

export async function fetchJobs(
  session: WebSession,
  input: { tenantId: string; limit?: number; projectId?: string },
): Promise<{ jobs: SafeJob[]; nextCursor?: string }> {
  const query = new URLSearchParams({ limit: String(input.limit ?? 20) });
  if (input.projectId) query.set('projectId', input.projectId);
  const response = await request(`/api/v1/jobs?${query}`, session, input.tenantId);
  if (!response.ok) throw new JobApiError(response.status);
  const parsed = jobListResponseSchema.safeParse(await readJson(response));
  if (!parsed.success) throw new JobApiError(502);
  return {
    jobs: parsed.data.jobs,
    ...(parsed.data.nextCursor ? { nextCursor: parsed.data.nextCursor } : {}),
  };
}

export async function fetchProjectJobs(
  session: WebSession,
  input: { tenantId: string; projectId: string; limit?: number },
): Promise<{ jobs: SafeJob[]; nextCursor?: string }> {
  const query = new URLSearchParams({ limit: String(input.limit ?? 10) });
  const response = await request(
    `/api/v1/projects/${encodeURIComponent(input.projectId)}/jobs?${query}`,
    session,
    input.tenantId,
  );
  if (!response.ok) throw new JobApiError(response.status);
  const parsed = jobListResponseSchema.safeParse(await readJson(response));
  if (!parsed.success) throw new JobApiError(502);
  return {
    jobs: parsed.data.jobs,
    ...(parsed.data.nextCursor ? { nextCursor: parsed.data.nextCursor } : {}),
  };
}

export async function fetchJob(
  session: WebSession,
  input: { tenantId: string; projectId: string; jobId: string },
): Promise<SafeJob> {
  const response = await request(
    `/api/v1/projects/${encodeURIComponent(input.projectId)}/jobs/${encodeURIComponent(input.jobId)}`,
    session,
    input.tenantId,
  );
  if (!response.ok) throw new JobApiError(response.status);
  const parsed = jobResponseSchema.safeParse(await readJson(response));
  if (!parsed.success) throw new JobApiError(502);
  return parsed.data.job;
}

export async function cancelJob(
  session: WebSession,
  input: { tenantId: string; projectId: string; jobId: string },
): Promise<SafeJob> {
  const response = await request(
    `/api/v1/projects/${encodeURIComponent(input.projectId)}/jobs/${encodeURIComponent(input.jobId)}/cancel`,
    session,
    input.tenantId,
    { method: 'POST' },
  );
  if (!response.ok) throw new JobApiError(response.status);
  const parsed = jobResponseSchema.safeParse(await readJson(response));
  if (!parsed.success) throw new JobApiError(502);
  return parsed.data.job;
}

async function request(path: string, session: WebSession, tenantId: string, init?: RequestInit) {
  const base = process.env.SPRYXEL_API_BASE_URL?.trim() || 'http://127.0.0.1:3001';
  let url: URL;
  try {
    url = new URL(path, base);
  } catch {
    throw new JobApiError(503);
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new JobApiError(503);
  }
  try {
    return await fetch(url, {
      ...init,
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
      headers: {
        ...init?.headers,
        authorization: `Bearer ${session.accessToken}`,
        'x-tenant-id': tenantId,
      },
    });
  } catch {
    throw new JobApiError(503);
  }
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new JobApiError(502);
  }
}
