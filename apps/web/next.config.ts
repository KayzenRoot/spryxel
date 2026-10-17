import type { NextConfig } from 'next';

if (process.env.NODE_ENV === 'production' && process.env.SPRYXEL_E2E_AUTH_SECRET) {
  throw new Error('Browser test authentication cannot be configured for production builds');
}

const nextConfig: NextConfig = {
  transpilePackages: ['@spryxel/ui'],
  poweredByHeader: false,
};

export default nextConfig;
