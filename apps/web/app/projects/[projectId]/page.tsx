import { notFound } from 'next/navigation';
import { GlobalShell } from '../../components/global-shell';
import { requireWebSession } from '../../../src/auth/session';
import { fetchProject, ProjectApiError } from '../../../src/projects/api';

export default async function ProjectOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireWebSession();
  const [{ projectId }, query] = await Promise.all([params, searchParams]);
  const tenantId = typeof query.tenantId === 'string' ? query.tenantId : '';
  let result: Awaited<ReturnType<typeof fetchProject>>;
  try {
    result = await fetchProject(session, projectId, tenantId);
  } catch (error) {
    if (error instanceof ProjectApiError && error.status === 404) notFound();
    return (
      <GlobalShell displayName={session.displayName}>
        <section className="rounded-workspace border border-border bg-surface p-6" role="alert">
          <h1 className="text-2xl font-semibold">Project temporarily unavailable</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            The project overview could not be loaded. No project data was changed.
          </p>
        </section>
      </GlobalShell>
    );
  }

  return (
    <GlobalShell displayName={session.displayName} currentProject={result.project}>
      <section aria-labelledby="project-overview-title" className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-primary">
          Project overview
        </p>
        <h1
          id="project-overview-title"
          className="break-words text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {result.project.name}
        </h1>
        <p className="max-w-3xl text-base leading-7 text-text-secondary">
          This project is open in your authorized workspace. Project context stays visible while you
          browse.
        </p>
        <p className="text-sm text-text-secondary">
          Created{' '}
          <time dateTime={result.project.createdAt}>{formatDate(result.project.createdAt)}</time>
        </p>
      </section>

      <nav
        aria-label="Project capabilities"
        className="flex flex-wrap gap-2 border-y border-border py-3"
      >
        <span
          aria-current="page"
          className="rounded-control bg-selection px-3 py-2 text-sm font-semibold"
        >
          Overview
        </span>
        {['DNA', 'Generate', 'Library', 'Graph', 'QA', 'Export'].map((capability) => (
          <span
            key={capability}
            aria-disabled="true"
            className="rounded-control border border-subtle-border px-3 py-2 text-sm text-text-disabled"
            title={`${capability} is not available in this increment`}
          >
            {capability} · unavailable
          </span>
        ))}
      </nav>

      <div className="grid gap-4 md:grid-cols-2">
        <section
          aria-labelledby="dna-state-title"
          className="rounded-workspace border border-border bg-surface p-5"
        >
          <h2 id="dna-state-title" className="text-lg font-semibold">
            Project DNA
          </h2>
          <p className="mt-2 text-sm font-medium">Not configured</p>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            DNA persistence and setup are not implemented in this increment.
          </p>
        </section>
        <section
          aria-labelledby="assets-state-title"
          className="rounded-workspace border border-border bg-surface p-5"
        >
          <h2 id="assets-state-title" className="text-lg font-semibold">
            Recent assets
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Asset storage is not available in this increment; no assets are being shown.
          </p>
        </section>
        <section
          aria-labelledby="jobs-state-title"
          className="rounded-workspace border border-border bg-surface p-5 md:col-span-2"
        >
          <h2 id="jobs-state-title" className="text-lg font-semibold">
            Recent jobs
          </h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            Durable jobs are not available in this increment; no job status is being inferred.
          </p>
        </section>
      </div>
    </GlobalShell>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));
}
