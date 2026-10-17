import { CallbackError, handleAuth } from '@workos-inc/authkit-nextjs';

export const GET = handleAuth({
  returnPathname: '/account',
  onError: async ({ error }) => {
    if (error instanceof CallbackError) {
      return Response.json(
        {
          type: 'about:blank',
          title: 'Authentication callback rejected',
          status: 400,
          detail: 'The authentication callback could not be validated.',
        },
        { status: 400, headers: { 'content-type': 'application/problem+json' } },
      );
    }
    return Response.json(
      {
        type: 'about:blank',
        title: 'Authentication provider unavailable',
        status: 503,
        detail: 'The authentication callback could not be completed.',
      },
      { status: 503, headers: { 'content-type': 'application/problem+json' } },
    );
  },
});
