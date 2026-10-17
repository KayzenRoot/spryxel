import { withAuth } from '@workos-inc/authkit-nextjs';
import { headers } from 'next/headers';
import { resolveBrowserTestSession } from './test-session';

export type WebSession = {
  displayName: string;
  accessToken: string;
};

export async function requireWebSession(): Promise<WebSession> {
  const requestHeaders = await headers();
  const suppliedTestSecret = requestHeaders.get('x-spryxel-e2e-auth');
  const testSession = resolveBrowserTestSession({
    nodeEnvironment: process.env.NODE_ENV,
    configuredSecret: process.env.SPRYXEL_E2E_AUTH_SECRET,
    suppliedSecret: suppliedTestSecret,
  });
  if (testSession) return testSession;

  const auth = await withAuth({ ensureSignedIn: true });
  return {
    displayName:
      [auth.user.firstName, auth.user.lastName].filter(Boolean).join(' ').trim() || 'Creator',
    accessToken: auth.accessToken,
  };
}
