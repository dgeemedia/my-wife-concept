// frontend/app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

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

  // Strip port  →  "houseofqg.localhost:3000" → "houseofqg.localhost"
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

// ── GET all products ──────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()
    const backendUrl = `${BACKEND_URL}/api/products${queryParams ? `?${queryParams}` : ''}`

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    // Always forward the resolved slug so the backend middleware picks it up
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

    return NextResponse.json(data.products || data || [])
  } catch (error: any) {
    console.error('Products fetch error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// ── POST create product ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }

    if (businessSlug) {
      headers['X-Business-Slug'] = businessSlug
    }

    const response = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}