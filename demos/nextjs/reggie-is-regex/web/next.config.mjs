/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  assetPrefix: isProd ? '/test/opensouls/reggie/' : undefined,
};

export default nextConfig;
