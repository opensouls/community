/** @type {import('next').NextConfig} */

const isProxyEnabled = process.env.ENABLE_PROXY === 'true';

const nextConfig = {
  assetPrefix: isProxyEnabled ? '/s/opensouls/reggie/' : undefined,
};

export default nextConfig;
