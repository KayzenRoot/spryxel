import Link from 'next/link';
import type { Project } from '@spryxel/contracts';
import { ThemeToggle } from '../theme-toggle';
import { CommandPalette } from './command-palette';

export function GlobalShell({
  children,
  displayName,
  currentProject,
}: {
  children: React.ReactNode;
  displayName: string;
  currentProject?: Project;
}) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="min-h-screen bg-canvas text-text-primary lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="border-b border-border bg-background lg:min-h-screen lg:border-b-0 lg:border-r">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 lg:sticky lg:top-0 lg:flex-col lg:items-stretch lg:p-5">
            <Link
              className="text-lg font-semibold tracking-tight"
              href="/"
              aria-label="Spryxel home"
            >
              Spryxel
            </Link>
            <nav aria-label="Global navigation" className="flex flex-wrap gap-2 lg:grid">
              <Link className="rounded-control px-3 py-2 text-sm hover:bg-hover" href="/">
                Home
              </Link>
              <Link className="rounded-control px-3 py-2 text-sm hover:bg-hover" href="/projects">
                Projects
              </Link>
              <span
                aria-disabled="true"
                className="rounded-control px-3 py-2 text-sm text-text-disabled"
                title="Notifications are not available yet"
              >
                Notifications · unavailable
              </span>
            </nav>
            <div className="hidden border-t border-border pt-4 text-sm lg:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Project context
              </p>
              {currentProject ? (
                <div className="mt-2 grid gap-1">
                  <span className="truncate font-medium" title={currentProject.name}>
                    {currentProject.name}
                  </span>
                  <Link
                    className="text-brand-primary underline underline-offset-4"
                    href={`/projects?tenantId=${encodeURIComponent(currentProject.tenantId)}`}
                  >
                    Change project
                  </Link>
                </div>
              ) : (
                <Link
                  className="mt-2 inline-block text-brand-primary underline underline-offset-4"
                  href="/projects"
                >
                  Choose a project
                </Link>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 lg:mt-auto lg:grid lg:pt-6">
              <Link className="rounded-control px-3 py-2 text-sm hover:bg-hover" href="/account">
                Account · {displayName}
              </Link>
              <Link className="rounded-control px-3 py-2 text-sm hover:bg-hover" href="/sign-out">
                Sign out
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </aside>
        <div className="min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3 sm:px-8">
            <p className="text-sm text-text-secondary">Project workspace</p>
            <CommandPalette />
          </header>
          <main
            id="main-content"
            className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-8 sm:py-10"
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
