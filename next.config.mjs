/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
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
