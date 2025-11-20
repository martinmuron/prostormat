import { NextResponse } from "next/server"

// Simple in-memory rate limiter for serverless environments
// For production at scale, consider using Upstash Redis

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory store (note: each serverless instance has its own store)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries periodically
const CLEANUP_INTERVAL = 60000 // 1 minute
let lastCleanup = Date.now()

function cleanupOldEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  lastCleanup = now
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}

export interface RateLimitConfig {
  limit: number      // Max requests
  windowMs: number   // Time window in milliseconds
}

// Preset configurations
export const rateLimitConfigs = {
  // Strict: For auth endpoints (login, register, password reset)
  auth: { limit: 5, windowMs: 60000 },        // 5 per minute

  // Standard: For form submissions
  form: { limit: 10, windowMs: 60000 },       // 10 per minute

  // Relaxed: For general API calls
  api: { limit: 30, windowMs: 60000 },        // 30 per minute

  // Very relaxed: For read operations
  read: { limit: 100, windowMs: 60000 },      // 100 per minute
}

export function getClientIP(request: Request): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  const realIP = request.headers.get("x-real-ip")
  if (realIP) {
    return realIP
  }

  // Vercel-specific header
  const vercelIP = request.headers.get("x-vercel-forwarded-for")
  if (vercelIP) {
    return vercelIP.split(",")[0].trim()
  }

  return "unknown"
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  cleanupOldEntries()

  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  if (!entry || entry.resetTime < now) {
    // Create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + config.windowMs,
    })

    return {
      success: true,
      limit: config.limit,
      remaining: config.limit - 1,
      reset: now + config.windowMs,
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      success: false,
      limit: config.limit,
      remaining: 0,
      reset: entry.resetTime,
    }
  }

  // Increment counter
  entry.count++

  return {
    success: true,
    limit: config.limit,
    remaining: config.limit - entry.count,
    reset: entry.resetTime,
  }
}

export function rateLimitResponse(result: RateLimitResult): NextResponse {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)

  return NextResponse.json(
    {
      error: "Příliš mnoho požadavků. Zkuste to prosím později.",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "X-RateLimit-Limit": result.limit.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": result.reset.toString(),
        "Retry-After": retryAfter.toString(),
      },
    }
  )
}

// Helper function for API routes
export function rateLimit(
  request: Request,
  endpoint: string,
  config: RateLimitConfig = rateLimitConfigs.form
): RateLimitResult {
  const ip = getClientIP(request)
  const identifier = `${endpoint}:${ip}`
  return checkRateLimit(identifier, config)
}
