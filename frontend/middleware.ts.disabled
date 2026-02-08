// frontend/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  try {
    const hostname = request.headers.get('host')
    
    if (!hostname) {
      return NextResponse.next()
    }
    
    // Remove port for local development
    const host = hostname.split(':')[0]
    const parts = host.split('.')
    
    // Determine if we have a subdomain
    let subdomain: string | null = null
    
    // Local development: *.localhost
    if (parts[parts.length - 1] === 'localhost') {
      if (parts.length >= 2 && parts[0] !== 'localhost') {
        subdomain = parts[0]
      }
    } 
    // Production: *.mypadifood.com or *.vercel.app
    else if (parts.length > 2) {
      const firstPart = parts[0]
      // Ignore www and special subdomains
      if (firstPart !== 'www' && firstPart !== 'platform' && firstPart !== 'api' && firstPart !== 'admin') {
        subdomain = firstPart
      }
    }
    
    // Add subdomain to headers if exists
    const response = NextResponse.next()
    if (subdomain) {
      response.headers.set('x-business-slug', subdomain)
    }
    
    return response
  } catch (error) {
    // If middleware fails, just let the request through
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}