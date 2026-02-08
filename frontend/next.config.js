// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Remove i18n from next.config - we're handling it client-side
  // The i18n config here can cause routing issues with dynamic subdomains
  
  // Ensure proper error handling
  typescript: {
    // Don't fail build on type errors in production
    ignoreBuildErrors: false,
  },
  eslint: {
    // Don't fail build on eslint errors in production
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig