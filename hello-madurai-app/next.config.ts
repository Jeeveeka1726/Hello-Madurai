import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'supabase.co', 'hello-madurai-c5xr.vercel.app', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
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
        hostname: 'hello-madurai-c5xr.vercel.app',
        pathname: '/api/images/**',
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
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // Cache images for 24 hours
  },
  compress: true, // Enable gzip compression
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production for smaller bundle size
  poweredByHeader: false, // Remove X-Powered-By header for security
  reactStrictMode: true, // Enable strict mode for better error detection
  swcMinify: true, // Use SWC for faster minification
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '500mb', // Allow large PDF uploads to Hostinger
    },
    // Optimize package imports
    optimizePackageImports: ['@heroicons/react', 'lucide-react', 'framer-motion'],
  },
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  async redirects() {
    return [
      // Permanent redirect from old /radio route to new /fm route
      {
        source: '/radio',
        destination: '/fm',
        permanent: true, // 301 redirect (tells Google this is permanent)
      },
    ];
  },
  async headers() {
    return [
      // Feature images - aggressive caching
      {
        source: '/feature-images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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
