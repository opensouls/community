/** @type {import('next').NextConfig} */
const nextConfig = {
    assetPrefix: process.env.ASSET_PREFIX_FOR_PROXY || undefined,
    reactStrictMode: false,
};

export default nextConfig;
