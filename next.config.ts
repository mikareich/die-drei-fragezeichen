import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    useCache: true,
  },
  outputFileTracingIncludes: {
    '/*': ['./node_modules/@libsql/**/*'],
  },
  images: {
    remotePatterns: [
      {
        hostname: 'dreimetadaten.de',
        pathname: '/data/Serie/**',
        protocol: 'https',
      },
    ],
  },
}

export default nextConfig
