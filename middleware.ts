import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected routes that require authentication
  if (pathname.startsWith('/dashboard')) {
    // TODO: Add Supabase authentication check here
    // For now, we'll let all requests through since auth is handled client-side
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};
