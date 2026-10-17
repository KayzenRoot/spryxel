import { withAuth } from '@workos-inc/authkit-nextjs';

export default async function AccountPage() {
  const { user } = await withAuth({ ensureSignedIn: true });
  if (!user) throw new Error('Authenticated account page requires a user session');

  return (
    <main className="mx-auto grid min-h-screen max-w-3xl content-center gap-6 px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-primary">
        Account
      </p>
      <h1 className="text-4xl font-semibold tracking-tight">Authenticated session</h1>
      <p className="text-text-secondary">The hosted identity session is active.</p>
      <a className="w-fit rounded-control border border-border px-3 py-2 text-sm" href="/sign-out">
        Sign out
      </a>
    </main>
  );
}
