import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { CreateProjectForm } from '../components/create-project-form';
import { GlobalShell } from '../components/global-shell';
import { requireWebSession } from '../../src/auth/session';
import { fetchProjects, ProjectApiError } from '../../src/projects/api';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireWebSession();
  const params = await searchParams;
  const tenantId = typeof params.tenantId === 'string' ? params.tenantId : undefined;
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 80) : '';

  let projectList: Awaited<ReturnType<typeof fetchProjects>> | undefined;
  let unavailable = false;
  try {
    projectList = await fetchProjects(session, tenantId);
  } catch (error) {
    if (!(error instanceof ProjectApiError)) throw error;
    unavailable = true;
  }
  const normalizedQuery = query.toLocaleLowerCase('en');
  const visibleProjects = (projectList?.projects ?? []).filter((project) =>
    project.name.toLocaleLowerCase('en').includes(normalizedQuery),
  );

  return (
    <GlobalShell displayName={session.displayName}>
      <section aria-labelledby="projects-title" className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-primary">
          Workspace
        </p>
        <h1 id="projects-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Projects
        </h1>
        <p className="max-w-3xl text-base leading-7 text-text-secondary">
          Browse and open projects in your authorized workspace.
        </p>
      </section>

      {unavailable || !projectList ? (
        <section className="rounded-workspace border border-border bg-surface p-5" role="alert">
          <h2 className="text-xl font-semibold">Projects are temporarily unavailable</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            The workspace could not be loaded. Retry when the service is available.
          </p>
          <Link
            className="mt-4 inline-block text-brand-primary underline underline-offset-4"
            href="/projects"
          >
            Try again
          </Link>
        </section>
      ) : (
        <>
          {projectList.role === 'OWNER' || projectList.role === 'ADMIN' ? (
            <CreateProjectForm tenantId={projectList.tenantId} idempotencyKey={randomUUID()} />
          ) : (
            <p className="rounded-panel border border-subtle-border bg-background p-4 text-sm text-text-secondary">
              Project creation is available to workspace Owners and Admins.
            </p>
          )}

          <section aria-labelledby="project-list-title" className="grid gap-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 id="project-list-title" className="text-xl font-semibold">
                  All projects
                </h2>
                <p className="mt-1 text-sm text-text-secondary">
                  {projectList.projects.length} authorized project
                  {projectList.projects.length === 1 ? '' : 's'}.
                </p>
              </div>
              <form
                action="/projects"
                method="get"
                className="flex w-full max-w-lg flex-wrap items-end gap-2"
              >
                <input type="hidden" name="tenantId" value={projectList.tenantId} />
                <label
                  className="grid min-w-0 flex-1 gap-2 text-sm font-medium"
                  htmlFor="project-search"
                >
                  Search loaded projects
                  <input
                    id="project-search"
                    type="search"
                    name="q"
                    maxLength={80}
                    defaultValue={query}
                    className="min-h-11 rounded-control border border-border bg-background px-3 text-base text-text-primary"
                  />
                </label>
                <button
                  className="min-h-11 rounded-control border border-border px-4 text-sm font-semibold hover:bg-hover"
                  type="submit"
                >
                  Search
                </button>
              </form>
            </div>

            {visibleProjects.length === 0 ? (
              <p className="rounded-panel border border-subtle-border bg-background p-5 text-sm leading-6 text-text-secondary">
                {query
                  ? 'No authorized projects match this search.'
                  : 'No projects yet. Create one to start a project workspace.'}
              </p>
            ) : (
              <ul className="grid gap-3 sm:grid-cols-2">
                {visibleProjects.map((project) => (
                  <li
                    key={project.id}
                    className="rounded-panel border border-border bg-surface p-5"
                  >
                    <h3 className="text-lg font-semibold">{project.name}</h3>
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
    </GlobalShell>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}
