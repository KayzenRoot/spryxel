import type { NextFetchEvent, NextRequest } from 'next/server';
import { authkitProxy } from '@workos-inc/authkit-nextjs';
import { resolveBrowserTestSession } from './src/auth/test-session';

export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const browserTestSession = resolveBrowserTestSession({
    nodeEnvironment: process.env.NODE_ENV,
    configuredSecret: process.env.SPRYXEL_E2E_AUTH_SECRET,
    suppliedSecret: request.headers.get('x-spryxel-e2e-auth'),
  });
  return authkitProxy({
    eagerAuth: false,
    middlewareAuth: {
      enabled: true,
      unauthenticatedPaths: browserTestSession ? ['/', '/projects', '/projects/:path*'] : [],
    },
  })(request, event);
}

export const config = {
  matcher: ['/', '/projects', '/projects/:path*', '/account/:path*'],
};
