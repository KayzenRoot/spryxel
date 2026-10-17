import 'server-only';
import { projectListResponseSchema, projectResponseSchema, type Project } from '@spryxel/contracts';
import type { WebSession } from '../auth/session';

export type ProjectList = {
  tenantId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  projects: Project[];
};

export class ProjectApiError extends Error {
  constructor(readonly status: number) {
    super('Project API request failed');
    this.name = 'ProjectApiError';
  }
}

export function assertProjectApiError(error: unknown): asserts error is ProjectApiError {
  if (!(error instanceof ProjectApiError)) throw error;
}

export async function fetchProjects(session: WebSession, tenantId?: string): Promise<ProjectList> {
  const response = await requestApi('/api/v1/projects', session, tenantId);
  if (!response.ok) throw new ProjectApiError(response.status);
  const parsed = projectListResponseSchema.safeParse(await readProjectJson(response));
  if (!parsed.success) throw new ProjectApiError(502);
  return parsed.data;
}

export async function fetchProject(
  session: WebSession,
  projectId: string,
  tenantId: string,
): Promise<{ tenantId: string; role: 'OWNER' | 'ADMIN' | 'MEMBER'; project: Project }> {
  const response = await requestApi(
    `/api/v1/projects/${encodeURIComponent(projectId)}`,
    session,
    tenantId,
  );
  if (!response.ok) throw new ProjectApiError(response.status);
  const parsed = projectResponseSchema.safeParse(await readProjectJson(response));
  if (!parsed.success) throw new ProjectApiError(502);
  return parsed.data;
}

export async function submitProject(
  session: WebSession,
  input: { tenantId: string; idempotencyKey: string; name: string },
): Promise<Project> {
  const response = await requestApi('/api/v1/projects', session, input.tenantId, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'idempotency-key': input.idempotencyKey },
    body: JSON.stringify({ name: input.name }),
  });
  if (!response.ok) throw new ProjectApiError(response.status);
  const parsed = projectResponseSchema.safeParse(await readProjectJson(response));
  if (!parsed.success) throw new ProjectApiError(502);
  return parsed.data.project;
}

async function requestApi(
  path: string,
  session: WebSession,
  tenantId?: string,
  init: RequestInit = {},
): Promise<Response> {
  const origin = process.env.SPRYXEL_API_BASE_URL?.trim() || 'http://127.0.0.1:3001';
  let url: URL;
  try {
    url = new URL(path, origin);
  } catch {
    throw new ProjectApiError(503);
  }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new ProjectApiError(503);
  }
  try {
    return await fetch(url, {
      ...init,
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
      headers: {
        ...init.headers,
        authorization: `Bearer ${session.accessToken}`,
        ...(tenantId ? { 'x-tenant-id': tenantId } : {}),
      },
    });
  } catch {
    throw new ProjectApiError(503);
  }
}

async function readProjectJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ProjectApiError(502);
  }
}
