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
  i18n: {
       locales: ['en', 'fr', 'yo', 'ig', 'ha', 'de', 'ar', 'sw'],
       defaultLocale: 'en',
     },
}

module.exports = nextConfig