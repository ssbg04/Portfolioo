import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || "fallback_secret_key_for_development";

export default async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith('/admin') && !path.startsWith('/admin/login');

  if (isAuthRoute) {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const secret = new TextEncoder().encode(SECRET_KEY);
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Check if trying to access login while already logged in
  if (path === '/admin/login') {
    const token = request.cookies.get('admin_token')?.value;

    if (token) {
      try {
        const secret = new TextEncoder().encode(SECRET_KEY);
        await jwtVerify(token, secret);
        return NextResponse.redirect(new URL('/admin', request.url));
      } catch (error) {
        // Invalid token, allow access to login
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
