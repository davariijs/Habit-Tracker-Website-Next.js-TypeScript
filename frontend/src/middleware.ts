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




// import { NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';
// import type { NextRequest } from 'next/server';
// import createMiddleware from 'next-intl/middleware';

// // Configure next-intl middleware
// const intlMiddleware = createMiddleware({
//   locales: ['en','fa'], // Add Persian ('fa')
//   defaultLocale: 'en',
//   localeDetection: true, // Auto-detect user locale
// });

// export async function middleware(req: NextRequest) {
//   // Apply next-intl middleware first
//   const intlResponse = intlMiddleware(req);
  
//   // Check for authentication
//   const token = await getToken({ req });

//   // If user is not authenticated and trying to access protected routes, redirect to homepage
//   if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
//     const url = req.nextUrl.clone();
//     url.pathname = '/'; // Redirect to homepage
//     return NextResponse.redirect(url);
//   }

//   // If authenticated, allow access
//   return intlResponse; // Return the modified response from next-intl
// }

// // Apply middleware to all pages but exclude API routes and static files
// export const config = {
//   matcher: ['/((?!api|_next|.*\\..*).*)'],
// };
