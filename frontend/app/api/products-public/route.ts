// frontend/app/api/products-public/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export const dynamic = 'force-dynamic'
/**
 * Extracts the business slug from the incoming request's Host header.
 *
 * LOCAL DEV
 *   "houseofqg.localhost:3000"   → "houseofqg"
 *   "chrenisfarm.localhost:3000" → "chrenisfarm"
 *   "localhost:3000"             → null
 *
 * PRODUCTION
 *   "chrenisfarm.mypadifood.com" → "chrenisfarm"
 *   "mypadifood.com"             → null
 *   "www.mypadifood.com"         → null
 */
function extractBusinessContext(request: NextRequest): string | null {
  const rawHost = request.headers.get('host') || ''

  // Strip port
  const host = rawHost.split(':')[0]
  const parts = host.split('.')

  // ── LOCAL DEV: *.localhost ────────────────────────────────
  if (parts[parts.length - 1] === 'localhost') {
    return parts.length >= 2 ? parts[0] : null
  }

  // ── PRODUCTION: *.domain.tld ──────────────────────────────
  if (parts.length <= 2) return null
  if (parts[0] === 'www') return null

  return parts[0]
}

// ── GET public products (no auth required) ───────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const businessSlug = extractBusinessContext(request)

    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()
    const backendUrl = `${BACKEND_URL}/api/products${queryParams ? `?${queryParams}` : ''}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Forward the tenant slug so the backend subdomain middleware can resolve it
    if (businessSlug) {
      headers['X-Business-Slug'] = businessSlug
    }

    const response = await fetch(backendUrl, {
      headers,
      cache: 'no-store',
    })

    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response from products backend:', text.substring(0, 200))
      return NextResponse.json([], { status: 200 })
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('Backend error:', data.error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(Array.isArray(data) ? data : (data.products || []))
  } catch (error: any) {
    console.error('Products fetch error:', error)
    return NextResponse.json([], { status: 200 })
  }
}