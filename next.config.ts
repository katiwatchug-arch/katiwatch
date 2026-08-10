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
    const panelUrl = process.env.PANEL_URL || 'http://localhost:3001';
    return [
      { source: '/panel', destination: `${panelUrl}/panel` },
      { source: '/panel/:path*', destination: `${panelUrl}/panel/:path*` },
    ];
  },
};

export default nextConfig;
