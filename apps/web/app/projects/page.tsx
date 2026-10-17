import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { CreateProjectForm } from '../components/create-project-form';
import { GlobalShell } from '../components/global-shell';
import { ProjectLoadFailure } from '../components/project-load-failure';
import { requireWebSession } from '../../src/auth/session';
import { assertProjectApiError, fetchProjects, type ProjectApiError } from '../../src/projects/api';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireWebSession();
  const params = await searchParams;
  const tenantId = typeof params.tenantId === 'string' ? params.tenantId : undefined;
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 80) : '';

  let projectState:
    | { kind: 'loaded'; projectList: Awaited<ReturnType<typeof fetchProjects>> }
    | { kind: 'failed'; error: ProjectApiError };
  try {
    projectState = { kind: 'loaded', projectList: await fetchProjects(session, tenantId) };
  } catch (error) {
    assertProjectApiError(error);
    projectState = { kind: 'failed', error };
  }
  const normalizedQuery = query.toLocaleLowerCase('en');
  const visibleProjects =
    projectState.kind === 'loaded'
      ? projectState.projectList.projects.filter((project) =>
          project.name.toLocaleLowerCase('en').includes(normalizedQuery),
        )
      : [];

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

      {projectState.kind === 'failed' ? (
        <ProjectLoadFailure error={projectState.error} resource="workspace" retryHref="/projects" />
      ) : (
        <>
          {projectState.projectList.role === 'OWNER' ||
          projectState.projectList.role === 'ADMIN' ? (
            <CreateProjectForm
              tenantId={projectState.projectList.tenantId}
              idempotencyKey={randomUUID()}
            />
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
                  {projectState.projectList.projects.length} authorized project
                  {projectState.projectList.projects.length === 1 ? '' : 's'}.
                </p>
              </div>
              <form
                action="/projects"
                method="get"
                className="flex w-full max-w-lg flex-wrap items-end gap-2"
              >
                <input type="hidden" name="tenantId" value={projectState.projectList.tenantId} />
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
    </GlobalShell>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}
