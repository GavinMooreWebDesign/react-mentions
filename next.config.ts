import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/lander',
        destination: '/',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.(.*)',
          },
        ],
        destination: 'https://:1/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
