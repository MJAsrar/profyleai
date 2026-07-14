import { NextRequest } from "next/server"

/**
 * Lightweight fixed-window rate limiter.
 *
 * Scope: in-memory, so on serverless it limits per warm instance rather than
 * globally. That is a meaningful brake on abuse (and on accidental client loops)
 * but it is NOT a hard global guarantee — move to Redis/Upstash for that.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Keep the map from growing without bound on long-lived instances.
const MAX_TRACKED_KEYS = 10_000

function prune(now: number) {
  if (buckets.size < MAX_TRACKED_KEYS) return
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  ok: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * Consume one unit against `key`. Returns ok=false once `limit` is exceeded
 * within `windowMs`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  prune(now)

  const existing = buckets.get(key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  existing.count += 1

  if (existing.count > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  return { ok: true, remaining: limit - existing.count, retryAfterSeconds: 0 }
}

/**
 * Build a rate-limit key. Prefer the authenticated user id; fall back to client IP
 * so unauthenticated abuse is still bounded.
 */
export function rateLimitKey(req: NextRequest, scope: string, userId?: string): string {
  if (userId) return `${scope}:user:${userId}`

  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
  return `${scope}:ip:${ip}`
}

/** Standard 429 body + Retry-After header. */
export function rateLimitResponse(result: RateLimitResult) {
  return Response.json(
    {
      error: "Too many requests",
      message: `Rate limit exceeded. Try again in ${result.retryAfterSeconds}s.`,
      code: "RATE_LIMITED",
    },
    {
      status: 429,
      headers: { "Retry-After": result.retryAfterSeconds.toString() },
    }
  )
}
