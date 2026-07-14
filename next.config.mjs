/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint runs on build. Type-safety is the hard gate (tsc); stylistic lint rules
    // are demoted to warnings in .eslintrc.json so they surface without blocking.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Enforce types on every build — `tsc --noEmit` is clean. Do not re-enable.
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Redirect non-www to www (permanent redirect for SEO)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'profyleai.com',
          },
        ],
        destination: 'https://www.profyleai.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
