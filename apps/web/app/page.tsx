import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { CreateProjectForm } from './components/create-project-form';
import { GlobalShell } from './components/global-shell';
import { requireWebSession } from '../src/auth/session';
import { fetchProjects, ProjectApiError } from '../src/projects/api';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireWebSession();
  const params = await searchParams;
  const tenantId = typeof params.tenantId === 'string' ? params.tenantId : undefined;

  let projectList: Awaited<ReturnType<typeof fetchProjects>> | undefined;
  let unavailable = false;
  try {
    projectList = await fetchProjects(session, tenantId);
  } catch (error) {
    if (!(error instanceof ProjectApiError)) throw error;
    unavailable = true;
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

      {unavailable || !projectList ? (
        <section className="rounded-workspace border border-border bg-surface p-5" role="alert">
          <h2 className="text-xl font-semibold">Projects are temporarily unavailable</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Your project list could not be loaded. Your workspace data was not changed.
          </p>
          <Link
            className="mt-4 inline-block text-brand-primary underline underline-offset-4"
            href="/"
          >
            Try again
          </Link>
        </section>
      ) : (
        <>
          {projectList.role === 'OWNER' || projectList.role === 'ADMIN' ? (
            <CreateProjectForm tenantId={projectList.tenantId} idempotencyKey={randomUUID()} />
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
            {projectList.projects.length === 0 ? (
              <p className="rounded-panel border border-subtle-border bg-background p-5 text-sm leading-6 text-text-secondary">
                No projects yet. Create one to establish your first project workspace.
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {projectList.projects.slice(0, 4).map((project) => (
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
                      href={`/projects/${encodeURIComponent(project.id)}?tenantId=${encodeURIComponent(projectList.tenantId)}`}
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
