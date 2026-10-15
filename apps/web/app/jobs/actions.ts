'use server';

import { redirect } from 'next/navigation';
import { requireWebSession } from '../../src/auth/session';
import { assertJobApiError, cancelJob } from '../../src/jobs/api';

export async function cancelJobAction(formData: FormData): Promise<void> {
  const tenantId = formData.get('tenantId');
  const projectId = formData.get('projectId');
  const jobId = formData.get('jobId');
  if (typeof tenantId !== 'string' || typeof projectId !== 'string' || typeof jobId !== 'string') {
    redirect('/jobs');
  }
  const session = await requireWebSession();
  try {
    await cancelJob(session, { tenantId, projectId, jobId });
  } catch (error) {
    assertJobApiError(error);
  }
  redirect(
    `/jobs/${encodeURIComponent(jobId)}?projectId=${encodeURIComponent(projectId)}&tenantId=${encodeURIComponent(tenantId)}`,
  );
}
