import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const referer = req.headers.get('referer') || '';
  const comingFromDeletedPage = referer.includes('/deleted');
  
  if (comingFromDeletedPage) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  
  const token = await getToken({ req });


  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { 
  matcher: [
    '/dashboard/:path*',
    '/dashboard/habits/:path*',
  ] 
};