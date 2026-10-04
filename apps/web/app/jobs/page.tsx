import { GlobalShell } from '../components/global-shell';
import { requireWebSession } from '../../src/auth/session';
import { fetchProjects } from '../../src/projects/api';
import { assertJobApiError, fetchJobs, JobApiError } from '../../src/jobs/api';
import { JobList, JobLoadProblem } from './job-list';

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireWebSession();
  const query = await searchParams;
  const tenantId = typeof query.tenantId === 'string' ? query.tenantId : undefined;
  const projectId = typeof query.projectId === 'string' ? query.projectId : undefined;
  let projectList: Awaited<ReturnType<typeof fetchProjects>> | undefined;
  let projectFailure: number | undefined;
  try {
    projectList = await fetchProjects(session, tenantId);
  } catch (error) {
    try {
      assertJobApiError(error);
    } catch {
      projectFailure = 503;
    }
    if (error instanceof JobApiError) projectFailure = error.status;
  }
  const activeTenant = tenantId ?? projectList?.tenantId ?? '';
  let jobs: Awaited<ReturnType<typeof fetchJobs>> | undefined;
  let jobFailure: number | undefined;
  if (activeTenant) {
    try {
      jobs = await fetchJobs(session, {
        tenantId: activeTenant,
        limit: 50,
        ...(projectId ? { projectId } : {}),
      });
    } catch (error) {
      assertJobApiError(error);
      jobFailure = error.status;
    }
  }
  return (
    <GlobalShell displayName={session.displayName}>
      <section className="grid gap-3" aria-labelledby="jobs-title">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-primary">
          Operations
        </p>
        <h1 id="jobs-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Jobs
        </h1>
        <p className="max-w-3xl text-base leading-7 text-text-secondary">
          Durable operation status from the selected workspace. Queue state is not shown as product
          truth.
        </p>
      </section>
      {projectList ? (
        <form
          action="/jobs"
          method="get"
          className="grid max-w-xl gap-3 rounded-panel border border-border bg-surface p-4 sm:grid-cols-[1fr_auto] sm:items-end"
        >
          <input type="hidden" name="tenantId" value={projectList.tenantId} />
          <label className="grid gap-2 text-sm font-medium" htmlFor="jobs-project-filter">
            Filter by project
            <select
              id="jobs-project-filter"
              name="projectId"
              defaultValue={projectId ?? ''}
              className="min-h-11 rounded-control border border-border bg-background px-3 text-base"
            >
              <option value="">All projects</option>
              {projectList.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="min-h-11 rounded-control border border-border px-4 text-sm font-semibold hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            type="submit"
          >
            Apply filter
          </button>
        </form>
      ) : projectFailure ? (
        <JobLoadProblem status={projectFailure} />
      ) : null}
      <section aria-label="Durable jobs" className="grid gap-3">
        {jobFailure ? (
          <JobLoadProblem status={jobFailure} />
        ) : jobs ? (
          <JobList jobs={jobs.jobs} tenantId={activeTenant} />
        ) : !activeTenant ? (
          <JobLoadProblem status={503} />
        ) : null}
        {jobs?.nextCursor ? (
          <p className="text-sm text-text-secondary">
            Showing the latest 50 matching jobs. Refine by project to narrow the list.
          </p>
        ) : null}
      </section>
    </GlobalShell>
  );
}
