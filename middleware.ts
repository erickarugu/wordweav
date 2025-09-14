import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isIPBlocked, recordFailedAttempt } from "@/lib/security";
import { getClientId } from "@/lib/rate-limit";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  try {
    const clientIP = getClientId(request);
    const pathname = request.nextUrl.pathname;

    // 1. IP Blocking Check
    if (isIPBlocked(clientIP)) {
      console.warn(`Blocked IP access attempt: ${clientIP} to ${pathname}`);
      return new NextResponse("Access Denied", { status: 403 });
    }

    // 2. Security Headers
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // 3. Content Security Policy
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

    // 4. Strict Transport Security (HTTPS only in production)
    if (process.env.NODE_ENV === "production") {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    // 5. Permissions Policy
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), interest-cohort=()"
    );

    // 6. Basic Bot Protection
    const userAgent = request.headers.get("user-agent") || "";
    const suspiciousBots = [
      /sqlmap/i,
      /nmap/i,
      /nikto/i,
      /masscan/i,
      /zap/i,
      /burp/i,
      /w3af/i,
    ];

    if (suspiciousBots.some((pattern) => pattern.test(userAgent))) {
      console.warn(`Suspicious bot detected: ${userAgent} from ${clientIP}`);
      recordFailedAttempt(clientIP);
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 7. API Route Security
    if (pathname.startsWith("/api/")) {
      // Ensure JSON content type for POST/PUT/PATCH
      if (["POST", "PUT", "PATCH"].includes(request.method)) {
        const contentType = request.headers.get("content-type") || "";
        if (
          !contentType.includes("application/json") &&
          !contentType.includes("multipart/form-data") &&
          !contentType.includes("application/x-www-form-urlencoded")
        ) {
          return NextResponse.json(
            { error: "Invalid content type" },
            { status: 400 }
          );
        }
      }

      // Add API security headers
      response.headers.set("X-API-Version", "1.0");
      response.headers.set("X-Content-Type-Options", "nosniff");
    }

    // 8. Authentication Route Protection
    if (pathname.startsWith("/auth/")) {
      // Additional security for auth routes
      response.headers.set(
        "Cache-Control",
        "no-store, no-cache, must-revalidate"
      );
      response.headers.set("Pragma", "no-cache");
    }

    // 9. Admin Route Protection (if you have admin routes)
    if (pathname.startsWith("/admin/")) {
      // Log admin access attempts
      console.info(`Admin route access: ${pathname} from ${clientIP}`);
    }

    // 10. CORS for API routes
    if (pathname.startsWith("/api/")) {
      const origin = request.headers.get("origin");
      const allowedOrigins = [
        process.env.NEXTAUTH_URL,
        "http://localhost:3000",
        "https://wordweave.app", // Add your production domain
      ].filter(Boolean);

      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-CSRF-Token"
        );
      }
    }

    // Handle preflight requests
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|images|icons).*)",
  ],
};
