import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    // Vercel's Image Optimization has a monthly source-image quota; once
    // exceeded, any uncached size/quality variant 402s
    // (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED). All images here are
    // already pre-sized/compressed, so skip the optimizer entirely.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'i.postimg.cc',
        port: '',
        pathname: '/**',
      },
      {
        // YouTube thumbnails for the /lp course preview (click-to-load player).
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'signora.co.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yjxvrsmubrasvoipkwvn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      // Next.js injects inline bootstrap scripts; nonce-based CSP would need
      // per-request nonces, so allow inline as the pragmatic baseline.
      // Dev-only 'unsafe-eval': Fast Refresh's runtime uses eval() to patch
      // modules in place. Without it, every recompile throws a CSP EvalError
      // that aborts hydration, leaving the whole app inert (no click
      // handlers fire) any time this repo is run locally. Production never
      // needs eval, so the built bundle stays eval-free either way.
      `script-src 'self' 'unsafe-inline' https://analytics.tiktok.com https://connect.facebook.net${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://picsum.photos https://i.postimg.cc https://signora.co.id https://yjxvrsmubrasvoipkwvn.supabase.co https://www.facebook.com https://analytics.tiktok.com https://i.ytimg.com",
      "font-src 'self' data:",
      "connect-src 'self' https://yjxvrsmubrasvoipkwvn.supabase.co wss://yjxvrsmubrasvoipkwvn.supabase.co https://analytics.tiktok.com https://www.facebook.com https://connect.facebook.net",
      // www.facebook.com in frame-src and form-action: once the pixel carries
      // advanced-matching hashes (lib/pixelMatch.ts) its URL gets too long for
      // an image GET, so fbevents.js POSTs a form through a hidden iframe
      // instead. Without these two, every Lead and Contact is blocked here.
      "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com https://www.facebook.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self' https://www.facebook.com",
      "object-src 'none'",
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/about', destination: '/tentang', permanent: true },
      { source: '/courses', destination: '/kursus', permanent: true },
      { source: '/shop', destination: '/toko', permanent: true },
      { source: '/privacy', destination: '/kebijakan-privasi', permanent: true },
      { source: '/terms', destination: '/syarat-ketentuan', permanent: true },
      { source: '/syarat-dan-ketentuan', destination: '/syarat-ketentuan', permanent: true },
      // Non-permanent: "kelas" is used throughout the site's own copy
      // ("Daftar Kelas", "Lihat Semua Kelas") and could become a real route
      // later; a cached 308 here would be hard to undo.
      { source: '/kelas', destination: '/kursus', permanent: false },
      // Non-permanent: no real EN routes exist yet, but they're plausible
      // later -- same reasoning as /kelas above.
      { source: '/en', destination: '/', permanent: false },
    ];
  },
  output: 'standalone',
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;
