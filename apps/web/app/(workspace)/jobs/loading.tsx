export default function JobsLoading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-8 sm:px-8"
    >
      <h1 className="text-2xl font-semibold">Loading durable Jobs…</h1>
      <p className="text-sm text-text-secondary">Refreshing status from the workspace.</p>
    </main>
  );
}
