import Link from 'next/link';

export default function ProjectNotFound() {
  return (
    <section
      aria-labelledby="project-not-found-title"
      className="mx-auto grid max-w-2xl gap-3 rounded-workspace border border-border bg-surface p-6"
      role="alert"
    >
      <h1 id="project-not-found-title" className="text-2xl font-semibold">
        Project unavailable
      </h1>
      <p className="text-sm leading-6 text-text-secondary">
        The requested project could not be found or accessed.
      </p>
      <Link className="text-brand-primary underline underline-offset-4" href="/projects">
        Browse Projects
      </Link>
    </section>
  );
}
