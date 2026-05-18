import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'supabase.co', 'hello-madurai-c5xr.vercel.app'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'www.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'hello-madurai-c5xr.vercel.app',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'archive.org',
      },
      {
        protocol: 'https',
        hostname: '*.archive.org',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '500mb', // Allow large PDF uploads to Hostinger
    },
  },
  async headers() {
    return [
      // Favicon cache control
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/favicon-:size.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/apple-touch-icon.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          // Content Security Policy - Prevents XSS attacks
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://drive.google.com https://www.youtube.com https://youtube.com https://www.youtube-nocookie.com https://www.instagram.com https://instagram.com https://googleads.g.doubleclick.net https://pagead2.googlesyndication.com https://www.google.com https://ep2.adtrafficquality.google https://tpc.googlesyndication.com https://www.tamilradios.com https://tamilradios.com https://*.tamilradios.com https://archive.org https://*.archive.org;",
          },
          // Strict Transport Security - Forces HTTPS (prevents SSL downgrade attacks)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // X-Frame-Options - Prevents clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // X-Content-Type-Options - Prevents MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Referrer-Policy - Controls referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy - Controls browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          // X-DNS-Prefetch-Control - Controls DNS prefetching
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
