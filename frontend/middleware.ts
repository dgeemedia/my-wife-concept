// middleware.ts - FIXED VERSION
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''
  const pathname = url.pathname
  
  // Skip for API, assets, etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }
  
  // Extract subdomain
  const subdomain = getSubdomain(hostname)
  
  console.log(`🌐 Middleware: host=${hostname}, subdomain=${subdomain}, path=${pathname}`)
  
  // Platform subdomain
  if (subdomain === 'platform') {
    if (!pathname.startsWith('/platform') && !pathname.startsWith('/api')) {
      url.pathname = `/platform${pathname === '/' ? '' : pathname}`
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }
  
  // Business subdomains (*.mypadifood.com)
  if (subdomain && subdomain !== 'www' && subdomain !== 'platform') {
    // Rewrite to public-store for business pages
    if (pathname === '/' || pathname.startsWith('/public-store')) {
      return NextResponse.next()
    }
    
    // Rewrite other business requests to public-store
    if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/api')) {
      url.pathname = `/public-store${pathname}`
      return NextResponse.rewrite(url)
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

function getSubdomain(hostname: string): string | null {
  const host = hostname.split(':')[0]
  const parts = host.split('.')
  
  // Local development
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    // For local testing, you can use query parameter
    // Example: http://localhost:3000?subdomain=chrenisfarm
    // OR use a cookie
    return null // Return null for root domain in local dev
  }
  
  // Production - extract from hostname
  if (parts.length <= 2) return null
  if (parts[0] === 'www') return null
  if (parts[0] === 'platform') return 'platform'
  
  return parts[0]
}