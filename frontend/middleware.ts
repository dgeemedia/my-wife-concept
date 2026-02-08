// frontend/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl.clone()
  
  // Remove port for local development
  const host = hostname.split(':')[0]
  const parts = host.split('.')
  
  // Check for subdomain
  const isLocalhost = parts[parts.length - 1] === 'localhost'
  const hasSubdomain = isLocalhost ? parts.length >= 2 : parts.length > 2
  const subdomain = hasSubdomain ? parts[0] : null
  
  // Ignore special subdomains
  const ignoredSubdomains = ['www', 'platform', 'api', 'admin']
  
  // Root domain or ignored subdomain - show landing page
  if (!subdomain || ignoredSubdomains.includes(subdomain)) {
    // Allow the request to proceed normally
    return NextResponse.next()
  }
  
  // Business subdomain - pass subdomain info to the app
  const response = NextResponse.next()
  response.headers.set('x-business-slug', subdomain)
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}