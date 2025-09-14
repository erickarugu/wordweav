import { NextRequest } from "next/server";

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  error?: string;
}

// In-memory store for rate limiting (for development)
// In production, you should use Redis or a distributed cache
const store = new Map<string, { count: number; resetTime: number }>();

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private keyPrefix: string;

  constructor(windowMs: number, maxRequests: number, keyPrefix = "rl") {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.keyPrefix = keyPrefix;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = `${this.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean up old entries
    this.cleanup(windowStart);

    const record = store.get(key);

    if (!record || record.resetTime <= now) {
      // First request in window or window expired
      store.set(key, {
        count: 1,
        resetTime: now + this.windowMs,
      });

      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
      };
    }

    if (record.count >= this.maxRequests) {
      return {
        success: false,
        limit: this.maxRequests,
        remaining: 0,
        reset: record.resetTime,
        error: "Rate limit exceeded",
      };
    }

    // Increment counter
    record.count++;
    store.set(key, record);

    return {
      success: true,
      limit: this.maxRequests,
      remaining: this.maxRequests - record.count,
      reset: record.resetTime,
    };
  }

  private cleanup(windowStart: number) {
    for (const [key, record] of store.entries()) {
      if (record.resetTime <= windowStart) {
        store.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // General API rate limiting
  api: new RateLimiter(60 * 1000, 100), // 100 requests per minute

  // Authentication endpoints (more restrictive)
  auth: new RateLimiter(15 * 60 * 1000, 5), // 5 requests per 15 minutes

  // Password reset (very restrictive)
  passwordReset: new RateLimiter(60 * 60 * 1000, 3), // 3 requests per hour

  // Text processing (resource-intensive)
  textProcessing: new RateLimiter(60 * 1000, 10), // 10 requests per minute

  // Newsletter subscription
  newsletter: new RateLimiter(60 * 60 * 1000, 5), // 5 requests per hour

  // Payment endpoints
  payment: new RateLimiter(60 * 1000, 10), // 10 requests per minute

  // Profile updates
  profile: new RateLimiter(60 * 1000, 5), // 5 requests per minute
};

// Helper function to get client identifier
export function getClientId(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  let ip =
    forwarded?.split(",")[0].trim() || realIp || cfConnectingIp || "unknown";

  // Remove IPv6 prefix if present
  ip = ip.replace(/^::ffff:/, "");

  return ip;
}

// Middleware helper to apply rate limiting
export async function applyRateLimit(
  request: NextRequest,
  rateLimiter: RateLimiter,
  identifier?: string
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const clientId = identifier || getClientId(request);
  const result = await rateLimiter.check(clientId);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.reset).toISOString(),
  };

  if (!result.success) {
    headers["Retry-After"] = Math.ceil(
      (result.reset - Date.now()) / 1000
    ).toString();
  }

  return {
    allowed: result.success,
    headers,
  };
}
