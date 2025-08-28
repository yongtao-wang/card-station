import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  experimental: {
    typedRoutes: true,
  },
}

export default nextConfig
