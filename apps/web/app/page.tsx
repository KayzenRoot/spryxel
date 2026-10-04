import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { CreateProjectForm } from './components/create-project-form';
import { GlobalShell } from './components/global-shell';
import { ProjectLoadFailure } from './components/project-load-failure';
import { requireWebSession } from '../src/auth/session';
import { assertProjectApiError, fetchProjects, type ProjectApiError } from '../src/projects/api';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireWebSession();
  const params = await searchParams;
  const tenantId = typeof params.tenantId === 'string' ? params.tenantId : undefined;

  let projectState:
    | { kind: 'loaded'; projectList: Awaited<ReturnType<typeof fetchProjects>> }
    | { kind: 'failed'; error: ProjectApiError };
  try {
    projectState = { kind: 'loaded', projectList: await fetchProjects(session, tenantId) };
  } catch (error) {
    assertProjectApiError(error);
    projectState = { kind: 'failed', error };
  }

  return (
    <GlobalShell displayName={session.displayName}>
      <section aria-labelledby="home-title" className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-primary">
          Home / Command Center
        </p>
        <h1 id="home-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome back, {session.displayName}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-text-secondary">
          Choose a project to continue or create a workspace for your next game.
        </p>
      </section>

      {projectState.kind === 'failed' ? (
        <ProjectLoadFailure error={projectState.error} resource="workspace" retryHref="/" />
      ) : (
        <>
          {projectState.projectList.role === 'OWNER' ||
          projectState.projectList.role === 'ADMIN' ? (
            <CreateProjectForm
              tenantId={projectState.projectList.tenantId}
              idempotencyKey={randomUUID()}
            />
          ) : (
            <section className="rounded-workspace border border-border bg-surface p-5">
              <h2 className="text-xl font-semibold">Choose a project</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Project creation is available to workspace Owners and Admins.
              </p>
            </section>
          )}

          <section aria-labelledby="recent-projects-title" className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="recent-projects-title" className="text-xl font-semibold">
                  Your projects
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  Projects in the selected workspace.
                </p>
              </div>
              <Link
                className="text-sm font-semibold text-brand-primary underline underline-offset-4"
                href="/projects"
              >
                Browse all projects
              </Link>
            </div>
            {projectState.projectList.projects.length === 0 ? (
              <p className="rounded-panel border border-subtle-border bg-background p-5 text-sm leading-6 text-text-secondary">
                No projects yet. Create one to establish your first project workspace.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {projectState.projectList.projects.slice(0, 4).map((project) => (
                  <li
                    key={project.id}
                    className="rounded-panel border border-border bg-surface p-4"
                  >
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      Updated{' '}
                      <time dateTime={project.updatedAt}>{formatDate(project.updatedAt)}</time>
                    </p>
                    <Link
                      className="mt-4 inline-block rounded-control px-1 py-1 text-sm font-semibold text-brand-primary underline underline-offset-4"
                      href={`/projects/${encodeURIComponent(project.id)}?tenantId=${encodeURIComponent(projectState.projectList.tenantId)}`}
                    >
                      Open project
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <section
        aria-labelledby="jobs-title"
        className="rounded-workspace border border-border bg-background p-5"
      >
        <h2 id="jobs-title" className="text-lg font-semibold">
          Recent jobs
        </h2>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Durable jobs are not available in this increment. No job status is being inferred or
          fabricated.
        </p>
      </section>
    </GlobalShell>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}
