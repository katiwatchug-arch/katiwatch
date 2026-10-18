import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  serverExternalPackages: ['ffmpeg-static', 'fluent-ffmpeg'],
  transpilePackages: ['swiper', 'artplayer', 'lucide-react', 'clsx', 'tailwind-merge'],
  
  // SEO optimizations
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },
  
  async rewrites() {
    const panelUrl = process.env.PANEL_URL;
    if (!panelUrl) return [];
    return [
      { source: '/panel', destination: `${panelUrl}/panel` },
      { source: '/panel/:path*', destination: `${panelUrl}/panel/:path*` },
    ];
  },
  
  
  // Strict mode for better React practices
  reactStrictMode: true,
  
  // Remove X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;
