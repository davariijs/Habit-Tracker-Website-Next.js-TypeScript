const path = require('path');
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development' && !process.env.TEST_PWA,
  sw: '/sw-custom.js',
  publicExcludes: ['!sw-custom.js', '!workbox-*.js'],
  buildExcludes: [/chunks\/.*$/]
});

/** @type {import('next').NextConfig} */
const nextConfig = withPWA({
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: 'api.slingacademy.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' } 
    ]
  },
  transpilePackages: ['geist'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'public')
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }]
      },
      {
        source: "/workbox-:slug(.*\\.js)",
        headers: [{ key: "Cache-Control", value: "public, max-age=0, must-revalidate" }]
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }]
      }
    ];
  }
});

module.exports = nextConfig;