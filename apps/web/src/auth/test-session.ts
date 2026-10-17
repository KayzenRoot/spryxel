export const browserTestAccessToken = 'spryxel-browser-test-token';

export type BrowserTestSession = {
  displayName: string;
  accessToken: string;
};

export function resolveBrowserTestSession(input: {
  nodeEnvironment: string | undefined;
  configuredSecret: string | undefined;
  suppliedSecret: string | null | undefined;
}): BrowserTestSession | undefined {
  const scopeSeparator = `${input.configuredSecret ?? ''}:`;
  const scope = input.suppliedSecret?.startsWith(scopeSeparator)
    ? input.suppliedSecret.slice(scopeSeparator.length)
    : '';
  if (
    input.nodeEnvironment === 'production' ||
    !input.configuredSecret ||
    !scope ||
    !/^[A-Za-z0-9_-]{1,48}$/.test(scope)
  ) {
    return undefined;
  }

  let mismatch = 0;
  for (let index = 0; index < input.configuredSecret.length; index += 1) {
    mismatch |=
      input.configuredSecret.charCodeAt(index) ^ (input.suppliedSecret?.charCodeAt(index) ?? 0);
  }
  if (mismatch !== 0) return undefined;

  return { displayName: 'Browser test user', accessToken: `${browserTestAccessToken}.${scope}` };
}
