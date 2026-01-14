// frontend/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization
  images: {
    domains: ['res.cloudinary.com', 'cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },

  // Environment variables available to the browser
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_WHATSAPP_NUMBER: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/login',
        permanent: false,
        has: [
          {
            type: 'cookie',
            key: 'token',
            value: undefined,
          },
        ],
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval';
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              font-src 'self';
              connect-src 'self' ${process.env.NEXT_PUBLIC_BACKEND_URL};
            `.replace(/\s+/g, ' '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
