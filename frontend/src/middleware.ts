// Protecting routes with next-auth
// https://next-auth.js.org/configuration/nextjs#middleware
// https://nextjs.org/docs/app/building-your-application/routing/middleware

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });

  // If no token, redirect to the homepage
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/'; // Redirect to homepage
    return NextResponse.redirect(url);
  }

  // Allow the request if the user is authenticated
  return NextResponse.next();
}

export const config = { matcher: ['/dashboard/:path*'] };
