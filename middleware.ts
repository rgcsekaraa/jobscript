import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to the settings page without checking for the API key
  if (pathname === '/' || pathname === '/settings') {
    return NextResponse.next();
  }

  // Allow access to static assets
  if (
    pathname.startsWith('/_next/') || // Next.js internal assets
    pathname.startsWith('/images/') || // Image assets (adjust based on your folder structure)
    pathname.startsWith('/public/') || // Public folder
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff|woff2|ttf)$/.test(pathname) // Common static file extensions
  ) {
    return NextResponse.next();
  }

  // Check for a cookie that indicates the API key is set
  // Since localStorage is client-side, you can set a cookie when the API key is saved
  const hasApiKey = request.cookies.has('has_openai_api_key');

  if (!hasApiKey) {
    // Redirect to settings page if no API key is found
    const url = request.nextUrl.clone();
    url.pathname = '/settings';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
