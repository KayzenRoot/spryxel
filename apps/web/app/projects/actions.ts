'use server';

import {
  idempotencyKeyPattern,
  projectCreateRequestSchema,
  projectIdPattern,
  type Project,
} from '@spryxel/contracts';
import { requireWebSession } from '../../src/auth/session';
import { ProjectApiError, submitProject } from '../../src/projects/api';

export type CreateProjectState = {
  error: string | null;
  project: Project | null;
};

export async function createProjectAction(
  _previousState: CreateProjectState,
  formData: FormData,
): Promise<CreateProjectState> {
  const session = await requireWebSession();
  const parsedName = projectCreateRequestSchema.safeParse({ name: formData.get('name') });
  if (!parsedName.success) {
    return { error: 'Enter a project name between 1 and 120 characters.', project: null };
  }
  const tenantId = formData.get('tenantId');
  const idempotencyKey = formData.get('idempotencyKey');
  if (
    typeof tenantId !== 'string' ||
    !projectIdPattern.test(tenantId) ||
    typeof idempotencyKey !== 'string' ||
    !idempotencyKeyPattern.test(idempotencyKey)
  ) {
    return { error: 'Reload this page and try again.', project: null };
  }

  try {
    const project = await submitProject(session, {
      tenantId,
      idempotencyKey,
      name: parsedName.data.name,
    });
    return { error: null, project };
  } catch (error) {
    if (error instanceof ProjectApiError) {
      if (error.status === 403) {
        return { error: 'Only workspace Owners and Admins can create projects.', project: null };
      }
      if (error.status === 404) {
        return { error: 'This workspace is no longer available. Reload the page.', project: null };
      }
      if (error.status === 409) {
        return {
          error: 'This request was already used for different details. Reload the page.',
          project: null,
        };
      }
    }
    return { error: 'Projects are temporarily unavailable. Try again shortly.', project: null };
  }
}
