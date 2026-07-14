import { NextRequest, NextResponse } from 'next/server'

/**
 * Global edge middleware.
 *
 * The app previously had none, which meant no security headers on any response and
 * no baseline throttle in front of the API. Route handlers still apply their own,
 * tighter limits; this is the floor, not the ceiling.
 */

// Baseline API throttle (per IP, per window). Deliberately generous — it exists to
// blunt scripted abuse, not to shape normal usage.
const API_LIMIT = 120
const API_WINDOW_MS = 60_000

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

function throttle(key: string): { ok: boolean; retryAfter: number } {
  const now = Date.now()

  // Bound memory on long-lived instances.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k)
  }

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + API_WINDOW_MS })
    return { ok: true, retryAfter: 0 }
  }

  bucket.count += 1
  if (bucket.count > API_LIMIT) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) }
  }
  return { ok: true, retryAfter: 0 }
}

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  // Defense-in-depth headers. Kept conservative so they can't break the app:
  // no CSP here, because the app relies on inline styles/scripts that would need
  // auditing first — that's a follow-up, not a drive-by change.
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-DNS-Prefetch-Control', 'off')
  res.headers.set(
    'Permissions-Policy',
    // The app legitimately needs camera+mic for video interviews; deny the rest.
    'camera=(self), microphone=(self), geolocation=(), payment=()'
  )
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  return res
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Stripe must never be throttled or it will see 429s as delivery failures and
  // retry storms; its authenticity is proven by signature, not rate.
  const isStripeWebhook = pathname.startsWith('/api/credits/webhooks/')

  if (pathname.startsWith('/api/') && !isStripeWebhook) {
    const result = throttle(`api:${clientIp(req)}`)
    if (!result.ok) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: 'Too many requests', code: 'RATE_LIMITED' },
          { status: 429, headers: { 'Retry-After': result.retryAfter.toString() } }
        )
      )
    }
  }

  return withSecurityHeaders(NextResponse.next())
}

export const config = {
  // Run on everything except static assets and image optimization.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/|images/).*)'],
}
