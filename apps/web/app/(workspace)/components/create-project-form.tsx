'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@spryxel/ui';
import { createProjectAction } from '../projects/actions';

const initialCreateProjectState = { error: null, project: null };

export function CreateProjectForm({
  tenantId,
  idempotencyKey,
}: {
  tenantId: string;
  idempotencyKey: string;
}) {
  const [state, formAction, pending] = useActionState(
    createProjectAction,
    initialCreateProjectState,
  );

  return (
    <section
      aria-labelledby="create-project-heading"
      className="rounded-workspace border border-border bg-surface p-5 shadow-[var(--elevation-raised)] sm:p-6"
    >
      <h2 id="create-project-heading" className="text-xl font-semibold">
        Create a project
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
        Start with a name. You can choose a project and return to it from this workspace.
      </p>
      <form
        action={formAction}
        className="mt-5 grid gap-3 sm:max-w-xl sm:grid-cols-[minmax(0,1fr)_auto]"
      >
        <input type="hidden" name="tenantId" value={tenantId} />
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
        <fieldset disabled={pending || state.project !== null} className="contents">
          <label className="grid gap-2 text-sm font-medium" htmlFor="project-name">
            Project name
            <input
              id="project-name"
              name="name"
              type="text"
              minLength={1}
              maxLength={120}
              autoComplete="off"
              required
              aria-invalid={Boolean(state.error)}
              aria-describedby={state.error ? 'project-name-error' : 'project-name-help'}
              className="min-h-11 rounded-control border border-border bg-background px-3 text-base text-text-primary placeholder:text-text-muted"
              placeholder="e.g. Starfall"
            />
          </label>
          <div className="flex items-end">
            <Button type="submit" disabled={pending}>
              {pending ? 'Creating…' : 'Create project'}
            </Button>
          </div>
        </fieldset>
        <p id="project-name-help" className="text-sm text-text-secondary sm:col-span-2">
          Names can contain up to 120 characters.
        </p>
      </form>
      {state.error ? (
        <p id="project-name-error" className="mt-3 text-sm text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.project ? (
        <p
          className="mt-4 flex flex-wrap items-center gap-2 text-sm text-text-primary"
          role="status"
        >
          <span>Project created.</span>
          <Link
            className="rounded-control px-1 py-1 font-semibold text-brand-primary underline underline-offset-4"
            href={`/projects/${encodeURIComponent(state.project.id)}?tenantId=${encodeURIComponent(tenantId)}`}
          >
            Open project
          </Link>
        </p>
      ) : null}
    </section>
  );
}
