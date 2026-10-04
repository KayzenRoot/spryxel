import { notFound } from 'next/navigation';
import type { SafeJob } from '@spryxel/contracts';
import { GlobalShell } from '../../components/global-shell';
import { requireWebSession } from '../../../src/auth/session';
import { assertJobApiError, fetchJob } from '../../../src/jobs/api';
import { cancelJobAction } from '../actions';
import { formatDate, JobLoadProblem } from '../job-list';

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ jobId }, query, session] = await Promise.all([
    params,
    searchParams,
    requireWebSession(),
  ]);
  const projectId = typeof query.projectId === 'string' ? query.projectId : '';
  const tenantId = typeof query.tenantId === 'string' ? query.tenantId : '';
  if (!projectId || !tenantId) notFound();
  let job: SafeJob;
  try {
    job = await fetchJob(session, { jobId, projectId, tenantId });
  } catch (error) {
    assertJobApiError(error);
    if (error.status === 404) notFound();
    return (
      <GlobalShell displayName={session.displayName}>
        <JobLoadProblem status={error.status} />
      </GlobalShell>
    );
  }
  return (
    <GlobalShell displayName={session.displayName}>
      <section className="grid gap-3" aria-labelledby="job-detail-title">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-primary">
          Job detail
        </p>
        <h1
          id="job-detail-title"
          className="break-all text-3xl font-semibold tracking-tight sm:text-4xl"
        >
          {job.contract.skuId} · contract v{job.contract.version}
        </h1>
        <p className="break-all text-sm text-text-secondary">Job {job.id}</p>
        <p className="text-sm text-text-secondary">
          Status: <strong className="capitalize">{job.status.replaceAll('_', ' ')}</strong>. Updated{' '}
          <time dateTime={job.updatedAt}>{formatDate(job.updatedAt)}</time>.
        </p>
      </section>
      <dl className="grid gap-3 rounded-workspace border border-border bg-surface p-5 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-text-muted">Operation</dt>
          <dd>Asset Contract integrity check</dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Attempts</dt>
          <dd>
            {job.attemptCount} of {job.maxAttempts}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Contract version</dt>
          <dd>
            {job.contract.schemaVersion} · v{job.contract.version}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Specification SHA-256</dt>
          <dd className="break-all font-mono text-xs">{job.contract.specificationSha256}</dd>
        </div>
        <div>
          <dt className="text-sm text-text-muted">Result</dt>
          <dd>{job.resultCode ?? job.failureCode ?? 'No terminal result'}</dd>
        </div>
      </dl>
      <section aria-labelledby="attempt-history-title" className="grid gap-3">
        <h2 id="attempt-history-title" className="text-xl font-semibold">
          Attempt history
        </h2>
        {job.attempts.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No worker attempt has claimed this durable Job.
          </p>
        ) : (
          <ol className="grid gap-2">
            {job.attempts.map((attempt) => (
              <li key={attempt.id} className="rounded-panel border border-border bg-background p-4">
                <p className="font-medium">
                  Attempt {attempt.attemptNumber}:{' '}
                  <span className="capitalize">{attempt.status}</span>
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  <time dateTime={attempt.startedAt}>{formatDate(attempt.startedAt)}</time>
                  {attempt.completedAt ? ` · finished ${formatDate(attempt.completedAt)}` : ''}
                </p>
                {attempt.failureCode ? (
                  <p className="mt-1 text-sm text-text-secondary">Outcome: {attempt.failureCode}</p>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </section>
      {job.cancelEligible ? (
        <form action={cancelJobAction} className="rounded-panel border border-border p-4">
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="jobId" value={job.id} />
          <button
            type="submit"
            className="min-h-11 rounded-control border border-border px-4 text-sm font-semibold hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            Cancel job
          </button>
          <p className="mt-2 text-sm text-text-secondary">
            Cancellation is durable; a running worker confirms it at its next safe point.
          </p>
        </form>
      ) : null}
    </GlobalShell>
  );
}
