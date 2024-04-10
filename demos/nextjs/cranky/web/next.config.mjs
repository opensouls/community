const assetPath = process.env.NEXT_PUBLIC_ASSET_BASE_URL;
const hostname = assetPath ? new URL(assetPath).hostname : undefined;

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.ASSET_PREFIX_FOR_PROXY || undefined,
  images: hostname ? {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: hostname,
      },
    ],
  } : undefined,
};

export default nextConfig;
