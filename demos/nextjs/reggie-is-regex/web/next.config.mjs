/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  assetPrefix: isProd ? 'https://reggie-is-regex-opensouls.vercel.app/' : undefined,
};

export default nextConfig;
