import { ThemeToggle } from './theme-toggle.js';

export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="min-h-screen bg-canvas text-text-primary">
        <header className="border-b border-border">
          <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
            <span className="font-semibold tracking-tight">Spryxel</span>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-text-secondary sm:inline">
                Platform foundation
              </span>
              <a className="rounded-control border border-border px-3 py-2 text-sm" href="/sign-in">
                Sign in
              </a>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl content-center gap-8 px-5 py-16 sm:px-8"
        >
          <section aria-labelledby="page-title" className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-brand-primary">
              Platform foundation
            </p>
            <h1 id="page-title" className="text-4xl font-semibold tracking-tight sm:text-6xl">
              A clear foundation for the work ahead.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">
              This shell establishes shared themes, readable hierarchy, and keyboard-operable
              controls.
            </p>
          </section>
          <section
            id="foundation-details"
            tabIndex={-1}
            aria-labelledby="foundation-title"
            className="max-w-3xl rounded-workspace border border-border bg-surface p-6 shadow-[var(--elevation-raised)] sm:p-8"
          >
            <h2 id="foundation-title" className="text-xl font-semibold">
              Interface foundation
            </h2>
            <p className="mt-2 max-w-2xl leading-7 text-text-secondary">
              Dark and light themes share the same semantic roles, focus treatment, and content
              order.
            </p>
            <ul className="mt-5 grid gap-3 text-sm text-text-secondary sm:grid-cols-3">
              <li className="rounded-panel border border-subtle-border bg-background p-4">
                Semantic color roles
              </li>
              <li className="rounded-panel border border-subtle-border bg-background p-4">
                Visible keyboard focus
              </li>
              <li className="rounded-panel border border-subtle-border bg-background p-4">
                Reduced-motion support
              </li>
            </ul>
          </section>
        </main>
      </div>
    </>
  );
}
