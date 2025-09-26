import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  const userAgent = request.headers.get("user-agent");

  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "https://wordweav.com",
    "https://www.wordweav.com",
    "https://wordweav.vercel.app",
  ].filter(Boolean);

  const diagnostics = {
    timestamp: new Date().toISOString(),
    request: {
      origin,
      referer,
      host,
      userAgent: userAgent?.substring(0, 100) + "...", // Truncate for security
      url: request.url,
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    },
    validation: {
      allowedOrigins,
      originAllowed: origin
        ? allowedOrigins.some(
            (allowed) => allowed && origin.startsWith(allowed)
          )
        : true,
      isVercelPreview: origin
        ? origin.includes("wordweav") && origin.includes("vercel.app")
        : false,
    },
  };

  return NextResponse.json(diagnostics, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
