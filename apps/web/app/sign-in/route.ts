import { getSignInUrl } from '@workos-inc/authkit-nextjs';

export async function GET() {
  const authorizationUrl = await getSignInUrl({ returnTo: '/account' });
  return Response.redirect(authorizationUrl, 302);
}
