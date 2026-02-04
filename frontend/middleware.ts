import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const accessToken = req.cookies.get('accessToken');

  // Protected user routes - just check if logged in
  const protectedRoutes = ['/profile', '/home'];
  if (
    protectedRoutes.some(route => pathname.startsWith(route)) &&
    !accessToken
  ) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Admin routes - only check if they have a token, NOT the role
  // Let the ProtectedRoute component handle role verification
  if (pathname.startsWith('/admin')) {
    if (!accessToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // ⭐ Just pass through - let ProtectedRoute component verify the role
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/home/:path*', '/admin/:path*'],
};
