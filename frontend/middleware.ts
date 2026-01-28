import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken');

  const protectedRoutes = ['/profile', '/home'];

  if (
    protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route)) &&
    !accessToken
  ) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}
