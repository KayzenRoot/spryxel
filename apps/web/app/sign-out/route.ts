import { signOut } from '@workos-inc/authkit-nextjs';

export async function GET() {
  await signOut({ returnTo: '/' });
  return new Response(null, { status: 204 });
}
