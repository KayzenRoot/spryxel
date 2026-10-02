import { jwtVerify, type JWTPayload, type JWTVerifyGetKey, type JWTVerifyOptions } from 'jose';
import type { AuthenticatedPrincipal } from '@spryxel/identity';

export class InvalidAccessTokenError extends Error {
  constructor() {
    super('Access token is invalid');
    this.name = 'InvalidAccessTokenError';
  }
}

export type JwtVerificationConfig = {
  issuer: string;
  audience: string;
  currentDate?: Date;
};

export async function verifyWorkOSAccessToken(
  token: string,
  jwks: JWTVerifyGetKey,
  config: JwtVerificationConfig,
): Promise<AuthenticatedPrincipal> {
  if (!config.issuer.trim() || !config.audience.trim() || token.length > 16_384) {
    throw new InvalidAccessTokenError();
  }

  try {
    const options: JWTVerifyOptions = {
      issuer: config.issuer,
      audience: config.audience,
      clockTolerance: 5,
      algorithms: ['RS256'],
      ...(config.currentDate ? { currentDate: config.currentDate } : {}),
    };
    const { payload } = await jwtVerify(token, jwks, options);
    return mapWorkOSClaims(payload, config.currentDate ?? new Date());
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
    if (code === 'ERR_JWKS_TIMEOUT') throw error;
    throw new InvalidAccessTokenError();
  }
}

function mapWorkOSClaims(payload: JWTPayload, now: Date): AuthenticatedPrincipal {
  const subject = nonEmptyString(payload.sub);
  const sessionId = nonEmptyString(payload.sid);
  const authTime = payload.auth_time;
  const subjectProfile = payload.sub_profile;
  const methods = payload.amr;

  if (
    !subject ||
    !sessionId ||
    typeof authTime !== 'number' ||
    !Number.isSafeInteger(authTime) ||
    authTime > Math.floor(now.getTime() / 1000) + 5 ||
    (subjectProfile !== undefined && subjectProfile !== 'user') ||
    payload.act !== undefined ||
    payload.impersonator !== undefined ||
    (methods !== undefined &&
      (!Array.isArray(methods) || methods.some((method) => typeof method !== 'string')))
  ) {
    throw new InvalidAccessTokenError();
  }

  return {
    externalSubject: { provider: 'workos', subject },
    externalSession: { provider: 'workos', session: sessionId },
    authTimeSeconds: authTime,
    verifiedAuthenticationMethods: (methods as string[] | undefined) ?? [],
    impersonated: false,
  };
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}
