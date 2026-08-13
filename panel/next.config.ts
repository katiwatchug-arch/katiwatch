import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/panel',
  assetPrefix: 'https://katiwatch-panell.vercel.app/panel',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
