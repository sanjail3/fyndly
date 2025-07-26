import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboardRoute = pathname.startsWith('/explore') || pathname.startsWith('/swipe') || pathname.startsWith('/profile') || pathname.startsWith('/dashboard')|| pathname.startsWith("/ai-chat") || pathname.startsWith('/api/chat/history');

  // Check for the correct Supabase auth cookie
  const token = request.cookies.get('sb-kjvmpopapfnepqzpzfef-auth-token')?.value;
  if (isDashboardRoute && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/explore',
    '/swipe',
    '/profile',
    '/dashboard',
    '/ai-chat',
    '/api/chat/history/:path*',
  ],
}; 