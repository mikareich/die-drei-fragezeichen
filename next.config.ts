import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    useCache: true,
  },
  outputFileTracingIncludes: {
    '/*': ['./node_modules/@libsql/**/*'],
  },
  images: {
    remotePatterns: [
      {
        hostname: 'assets.ddf-archiv.de',
        pathname: '/covers/*.png',
        protocol: 'https',
      },
    ],
  },
}

export default nextConfig
