import Link from 'next/link';
import type { SafeJob } from '@spryxel/contracts';

export function JobList({ jobs, tenantId }: { jobs: SafeJob[]; tenantId: string }) {
  if (jobs.length === 0) {
    return (
      <p className="rounded-panel border border-subtle-border bg-background p-5 text-sm leading-6 text-text-secondary">
        No durable jobs yet. Job status will appear here after an admitted operation creates one.
      </p>
    );
  }
  return (
    <ul className="grid gap-3">
      {jobs.map((job) => (
        <li key={job.id} className="rounded-panel border border-border bg-surface p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-semibold">
                <Link
                  className="underline decoration-subtle-border underline-offset-4 hover:text-brand-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                  href={`/jobs/${encodeURIComponent(job.id)}?projectId=${encodeURIComponent(job.projectId)}&tenantId=${encodeURIComponent(tenantId)}`}
                >
                  {job.contract.skuId} · contract v{job.contract.version}
                </Link>
              </h2>
              <p className="mt-1 break-all text-xs text-text-muted">Job {job.id}</p>
            </div>
            <span className="rounded-control border border-border px-2.5 py-1 text-sm font-semibold">
              {job.status.replaceAll('_', ' ')}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-text-muted">Attempts</dt>
              <dd>
                {job.attemptCount} of {job.maxAttempts}
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Updated</dt>
              <dd>
                <time dateTime={job.updatedAt}>{formatDate(job.updatedAt)}</time>
              </dd>
            </div>
            <div>
              <dt className="text-text-muted">Operation</dt>
              <dd>Contract integrity check</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}

export function JobLoadProblem({ status }: { status: number }) {
  const message =
    status === 403
      ? 'Your workspace role does not allow this Job action.'
      : status === 404
        ? 'The requested Job could not be found in this project.'
        : 'Durable Job data is temporarily unavailable. Refresh to try again.';
  return (
    <p
      role="alert"
      className="rounded-panel border border-border bg-background p-5 text-sm leading-6 text-text-secondary"
    >
      {message}
    </p>
  );
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  );
}
