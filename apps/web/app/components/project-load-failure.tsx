import Link from 'next/link';
import type { ProjectApiError } from '../../src/projects/api';

export function ProjectLoadFailure({
  error,
  resource,
  retryHref,
  headingLevel = 2,
}: {
  error: ProjectApiError;
  resource: 'workspace' | 'project';
  retryHref: string;
  headingLevel?: 1 | 2;
}) {
  const messages = getMessages(error.status, resource);
  const Heading = headingLevel === 1 ? 'h1' : 'h2';

  return (
    <section
      aria-labelledby="project-load-failure-title"
      className="rounded-workspace border border-border bg-surface p-5"
      role="alert"
    >
      <Heading id="project-load-failure-title" className="text-xl font-semibold">
        {messages.title}
      </Heading>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{messages.description}</p>
      <Link
        className="mt-4 inline-block text-brand-primary underline underline-offset-4"
        href={messages.href ?? retryHref}
      >
        {messages.action}
      </Link>
    </section>
  );
}

function getMessages(status: number, resource: 'workspace' | 'project') {
  if (status === 401) {
    return {
      title: 'Session expired',
      description: 'Sign in again to continue in your workspace.',
      action: 'Sign in again',
      href: '/sign-in',
    };
  }

  if (status === 403) {
    return {
      title: 'Access unavailable',
      description:
        resource === 'workspace'
          ? 'You do not have access to this workspace.'
          : 'Access to this project is unavailable.',
      action: 'Browse Projects',
    };
  }

  if (status === 404) {
    return {
      title: resource === 'workspace' ? 'Workspace unavailable' : 'Project unavailable',
      description: `The requested ${resource} could not be found or accessed.`,
      action: 'Browse Projects',
    };
  }

  if (status === 502 || status === 503) {
    return {
      title:
        resource === 'workspace'
          ? 'Projects are temporarily unavailable'
          : 'Project temporarily unavailable',
      description: 'The request could not be completed. Your workspace data was not changed.',
      action: 'Try again',
    };
  }

  return {
    title: `${resource === 'workspace' ? 'Workspace' : 'Project'} request could not be completed`,
    description: 'Try again or return to Projects.',
    action: 'Browse Projects',
  };
}
