import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  outputFileTracingIncludes: { '/api/relics': ['./node_modules/warframe-items/data/json/Relics.json'] },
}

export default nextConfig
