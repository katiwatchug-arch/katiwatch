import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  serverExternalPackages: ['ffmpeg-static', 'fluent-ffmpeg'],
  transpilePackages: ['swiper', 'artplayer', 'lucide-react', 'clsx', 'tailwind-merge'],
  async rewrites() {
    const panelUrl = process.env.PANEL_URL;
    if (!panelUrl) return [];
    return [
      { source: '/panel', destination: `${panelUrl}` },
      { source: '/panel/:path*', destination: `${panelUrl}/:path*` },
    ];
  },
};

export default nextConfig;
