import { NextRequest, NextResponse } from "next/server";
import { applyRateLimit, rateLimiters, RateLimiter } from "./rate-limit";
import { validateCSRFToken } from "./csrf";
import { validateSecurityHeaders } from "./validation";

// Security middleware options
interface SecurityMiddlewareOptions {
  rateLimit?: {
    enabled: boolean;
    limiter?:
      | "api"
      | "auth"
      | "passwordReset"
      | "textProcessing"
      | "newsletter"
      | "payment"
      | "profile";
    customLimiter?: RateLimiter;
  };
  csrf?: {
    enabled: boolean;
    sessionId?: string;
    skipMethods?: string[];
  };
  headers?: {
    validateOrigin: boolean;
    requireUserAgent: boolean;
    requireSecureHeaders: boolean;
  };
  authentication?: {
    required: boolean;
    roles?: string[];
  };
}

// Default security options
const defaultOptions: SecurityMiddlewareOptions = {
  rateLimit: {
    enabled: true,
    limiter: "api",
  },
  csrf: {
    enabled: true,
    skipMethods: ["GET", "HEAD", "OPTIONS"],
  },
  headers: {
    validateOrigin: true,
    requireUserAgent: true,
    requireSecureHeaders: true,
  },
  authentication: {
    required: false,
  },
};

// Security middleware factory
export function withSecurity(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: Partial<SecurityMiddlewareOptions> = {}
) {
  const config = { ...defaultOptions, ...options };

  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Rate Limiting
      if (config.rateLimit?.enabled) {
        const limiter =
          config.rateLimit.customLimiter ||
          rateLimiters[config.rateLimit.limiter as keyof typeof rateLimiters];

        const { allowed, headers } = await applyRateLimit(request, limiter);

        if (!allowed) {
          return NextResponse.json(
            {
              error: "Rate limit exceeded",
              code: "RATE_LIMIT_EXCEEDED",
              message: "Too many requests. Please try again later.",
            },
            {
              status: 429,
              headers: {
                ...headers,
                "Content-Type": "application/json",
              },
            }
          );
        }
      }

      // 2. Security Headers Validation
      if (config.headers?.validateOrigin || config.headers?.requireUserAgent) {
        const headerValidation = validateSecurityHeaders(request.headers);

        if (config.headers.validateOrigin && !headerValidation.hasValidOrigin) {
          return NextResponse.json(
            {
              error: "Invalid origin",
              code: "INVALID_ORIGIN",
            },
            { status: 403 }
          );
        }

        if (
          config.headers.requireUserAgent &&
          !headerValidation.hasSecureHeaders
        ) {
          return NextResponse.json(
            {
              error: "Missing required headers",
              code: "MISSING_HEADERS",
            },
            { status: 403 }
          );
        }
      }

      // 3. CSRF Protection
      // CSRF protection (edge-compatible)
      if (config.csrf?.enabled) {
        const skipMethods = config.csrf.skipMethods || [
          "GET",
          "HEAD",
          "OPTIONS",
        ];

        if (!skipMethods.includes(request.method)) {
          const isValidCSRF = validateCSRFToken(request);

          if (!isValidCSRF) {
            return NextResponse.json(
              {
                error: "CSRF token validation failed",
                code: "CSRF_INVALID",
              },
              { status: 403 }
            );
          }
        }
      }

      // 4. Content Security
      await validateRequestSecurity(request);

      // Call the original handler
      const response = await handler(request);

      // Add security headers to response
      addSecurityHeaders(response);

      return response;
    } catch (error) {
      console.error("Security middleware error:", error);

      return NextResponse.json(
        {
          error: "Security validation failed",
          code: "SECURITY_ERROR",
        },
        { status: 500 }
      );
    }
  };
}

// Validate request content for security issues
async function validateRequestSecurity(request: NextRequest): Promise<void> {
  // Check for suspicious patterns in request
  const userAgent = request.headers.get("user-agent") || "";
  const contentType = request.headers.get("content-type") || "";

  // Block known malicious user agents
  const maliciousUAPatterns = [
    /sqlmap/i,
    /nmap/i,
    /nikto/i,
    /masscan/i,
    /zap/i,
  ];

  if (maliciousUAPatterns.some((pattern) => pattern.test(userAgent))) {
    throw new Error("Suspicious user agent detected");
  }

  // Validate content type for POST/PUT requests
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    if (
      !contentType.includes("application/json") &&
      !contentType.includes("multipart/form-data") &&
      !contentType.includes("application/x-www-form-urlencoded")
    ) {
      throw new Error("Invalid content type");
    }
  }

  // Check request size (basic DoS protection)
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > 10 * 1024 * 1024) {
    // 10MB limit
    throw new Error("Request too large");
  }
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse): void {
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https://api.openai.com https://accounts.google.com; " +
      "frame-src https://accounts.google.com;"
  );

  // Strict Transport Security (for HTTPS)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
}

// Pre-configured middleware for common use cases
export const securityMiddleware = {
  // Public endpoints (minimal security)
  public: (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withSecurity(handler, {
      csrf: { enabled: false },
      authentication: { required: false },
      rateLimit: { enabled: true, limiter: "api" },
    }),

  // Authentication endpoints
  auth: (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withSecurity(handler, {
      csrf: { enabled: true },
      authentication: { required: false },
      rateLimit: { enabled: true, limiter: "auth" },
    }),

  // Protected API endpoints
  api: (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withSecurity(handler, {
      csrf: { enabled: true },
      authentication: { required: true },
      rateLimit: { enabled: true, limiter: "api" },
    }),

  // Text processing endpoints
  textProcessing: (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withSecurity(handler, {
      csrf: { enabled: true },
      authentication: { required: true },
      rateLimit: { enabled: true, limiter: "textProcessing" },
    }),

  // Payment endpoints
  payment: (handler: (request: NextRequest) => Promise<NextResponse>) =>
    withSecurity(handler, {
      csrf: { enabled: true },
      authentication: { required: true },
      rateLimit: { enabled: true, limiter: "payment" },
    }),
};

// Utility function to check if request is from allowed origins
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Same-origin requests

  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    "http://localhost:3000",
    "http://localhost:3001", // Alternative dev port
    "https://wordweav.com",
    "https://www.wordweav.com", // www subdomain
    "https://wordweav.vercel.app", // Vercel preview URLs
    "https://wordweav-*.vercel.app", // Vercel branch URLs
    // Add your production domains
  ].filter(Boolean) as string[];

  // Log for debugging in production
  if (process.env.NODE_ENV === "production") {
    console.log("Origin check:", { origin, allowedOrigins });
  }

  return allowedOrigins.some((allowed) => {
    // Handle wildcard patterns for Vercel
    if (allowed.includes("*")) {
      const pattern = allowed.replace("*", ".*");
      return new RegExp(`^${pattern}$`).test(origin);
    }
    return origin.startsWith(allowed);
  });
}

// IP-based blocking (for repeated abuse)
const blockedIPs = new Set<string>();
const ipAttempts = new Map<string, { count: number; resetTime: number }>();

export function blockIP(ip: string, durationMs = 24 * 60 * 60 * 1000): void {
  blockedIPs.add(ip);

  // Auto-unblock after duration
  setTimeout(() => {
    blockedIPs.delete(ip);
  }, durationMs);
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}

export function recordFailedAttempt(ip: string, maxAttempts = 10): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour

  const attempts = ipAttempts.get(ip) || {
    count: 0,
    resetTime: now + windowMs,
  };

  if (attempts.resetTime <= now) {
    // Reset window
    attempts.count = 1;
    attempts.resetTime = now + windowMs;
  } else {
    attempts.count++;
  }

  ipAttempts.set(ip, attempts);

  if (attempts.count >= maxAttempts) {
    blockIP(ip);
    return true; // IP was blocked
  }

  return false;
}
