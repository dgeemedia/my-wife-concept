/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Remove this line:
  // output: 'standalone',
  // Or comment it out:
  // output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
}

module.exports = nextConfig