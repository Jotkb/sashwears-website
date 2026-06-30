import { NextRequest, NextResponse } from 'next/server'

// ── Allowed origins for CSRF same-origin check ───────────────────────────────
// API routes only accept requests from our own origin (or server-to-server)
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_SITE_URL ?? '',
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean)

// ── In-memory rate limiter (edge-safe, per-IP per-window) ────────────────────
// For production at scale, replace with Upstash Redis or similar edge KV store.
interface RateEntry { count: number; resetAt: number }
const rateLimitStore = new Map<string, RateEntry>()

function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }
  if (entry.count >= limit) return false // blocked
  entry.count++
  return true
}

// Prune stale entries periodically (prevents unbounded memory growth)
let lastPrune = Date.now()
function pruneRateLimitStore() {
  const now = Date.now()
  if (now - lastPrune < 60_000) return
  lastPrune = now
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) rateLimitStore.delete(key)
  }
}

// ── Route-specific rate limit configs ────────────────────────────────────────
const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/orders/create':    { limit: 5,  windowMs: 60_000 },   // 5 orders/min
  '/api/orders/pending':   { limit: 10, windowMs: 60_000 },   // 10 WA orders/min
  '/api/contact':          { limit: 5,  windowMs: 300_000 },  // 5 messages/5 min
  '/api/subscribe':        { limit: 5,  windowMs: 300_000 },  // 5 subs/5 min
  '/api/paystack/webhook': { limit: 60, windowMs: 60_000 },   // 60 webhook events/min
}

// ── Strict Content-Security-Policy ───────────────────────────────────────────
// Next.js injects inline <script> tags for hydration/RSC streaming on every
// request. A nonce-based CSP was tried but Next 15.5's App Router does not
// reliably stamp nonces onto its own chunk <script> tags, which silently
// broke hydration (and therefore all Framer Motion scroll animations) site
// wide. 'unsafe-inline' is the pragmatic, widely-shipped tradeoff — this app
// renders no user-controlled HTML unescaped, so inline-script XSS exposure
// is low.
// 'unsafe-eval' is dev-only: Next.js Fast Refresh/HMR wraps modules with
// eval() in development. Production bundles don't need it, so it's left out
// of the production CSP to keep the stricter policy where it matters.
const isDev = process.env.NODE_ENV !== 'production'
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://js.paystack.co`,
  // Paystack inline SDK writes inline styles; allow-same-origin keeps it sandboxed
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://cdn.sanity.io https://images.unsplash.com",
  "connect-src 'self' https://api.paystack.co https://*.sanity.io",
  "frame-src https://js.paystack.co https://checkout.paystack.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ')

// ── Security headers applied to every response ───────────────────────────────
function applySecurityHeaders(res: NextResponse): NextResponse {
  const h = res.headers

  h.set('Content-Security-Policy', CSP)
  h.set('X-Content-Type-Options', 'nosniff')
  h.set('X-Frame-Options', 'DENY')
  h.set('X-XSS-Protection', '1; mode=block')
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)')
  h.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  // Prevent browser from caching API responses
  if (h.get('cache-control') === null) {
    h.set('Cache-Control', 'no-store')
  }

  return res
}

export function middleware(req: NextRequest) {
  pruneRateLimitStore()

  const { pathname } = req.nextUrl
  const isApiRoute = pathname.startsWith('/api/')

  // ── CSRF / origin check for state-changing API routes ─────────────────────
  // The Paystack webhook is excluded — it authenticates via HMAC signature instead.
  if (isApiRoute && req.method !== 'GET' && pathname !== '/api/paystack/webhook') {
    const origin = req.headers.get('origin') ?? ''
    const host   = req.headers.get('host') ?? ''

    // Allow if origin matches our domain OR if request is same-host (server-to-server)
    const originHost = origin ? new URL(origin).host : null
    const sameOrigin = originHost === host || ALLOWED_ORIGINS.some(o => o && origin.startsWith(o))

    // Server-to-server calls (Paystack callbacks, internal cron) have no origin header
    const serverToServer = !origin

    if (!sameOrigin && !serverToServer) {
      return applySecurityHeaders(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      )
    }
  }

  // ── Rate limiting for API routes ──────────────────────────────────────────
  if (isApiRoute && req.method === 'POST') {
    const config = RATE_LIMITS[pathname]
    if (config) {
      const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
        req.headers.get('x-real-ip') ??
        '127.0.0.1'

      const allowed = rateLimit(`${ip}:${pathname}`, config.limit, config.windowMs)
      if (!allowed) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            {
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil(config.windowMs / 1000)),
              },
            }
          )
        )
      }
    }
  }

  // ── Apply security headers to all responses ───────────────────────────────
  const res = NextResponse.next()
  return applySecurityHeaders(res)
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
