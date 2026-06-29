import type { NextConfig } from 'next'

const nextConfig: NextConfig = {

  // ── Image optimisation ──────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    deviceSizes:   [640, 750, 828, 1080, 1200, 1920],
    imageSizes:    [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ── HTTP Security Headers ───────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',   value: 'nosniff' },
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-XSS-Protection',          value: '1; mode=block' },
          { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ]
  },

  // ── HTTPS enforcement ───────────────────────────────────────────────────
  async redirects() {
    return [
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source:      '/:path*',
              has:         [{ type: 'header' as const, key: 'x-forwarded-proto', value: 'http' }],
              destination: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sashwears.com'}/:path*`,
              permanent:   true,
            },
          ]
        : []),
    ]
  },

  outputFileTracingRoot: process.cwd(),

  webpack(config) {
    // Sanity 6 ESM chunks do named imports from 'react' (e.g. useEffectEvent).
    // React ships CJS via module.exports — webpack can't statically verify
    // named exports from CJS when the importer is treated as strict ESM.
    // Marking all sanity ESM chunks as 'javascript/auto' bypasses the check.
    config.module.rules.push({
      test: /node_modules[/\\](sanity|@sanity)[/\\].*\._chunks-es[/\\].*\.js$/,
      type: 'javascript/auto',
    })
    config.module.rules.push({
      test: /node_modules[/\\]sanity[/\\]lib[/\\]_chunks-es[/\\].*\.js$/,
      type: 'javascript/auto',
    })
    config.module.rules.push({
      test: /node_modules[/\\]@sanity[/\\].*[/\\]lib[/\\]_chunks-es[/\\].*\.js$/,
      type: 'javascript/auto',
    })
    return config
  },
}

export default nextConfig
