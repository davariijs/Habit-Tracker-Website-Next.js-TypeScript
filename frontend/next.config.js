const path = require('path');
const withPWA = require('next-pwa')({
  dest: 'public', // The service worker and PWA assets will be stored in `public`
  register: true, // Automatically registers the service worker
  skipWaiting: true, // Activates new service worker immediately after installation
  disable: process.env.NODE_ENV === 'development', // Disables PWA in development mode
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: '',
      },
    ],
  },
  transpilePackages: ['geist'],
  webpack: (config) => {
    // Add aliases for "@/src" and "~/public"
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'public'),
    };
    return config;
  },
});

module.exports = nextConfig;