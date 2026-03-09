import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/profile', '/home', '/session', '/admin', '/report'];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasAccessToken = req.cookies.has('accessToken');

  if (!hasAccessToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/report/:path*',
    '/home/:path*',
    '/admin/:path*',
    '/session/:path*',
  ],
};
