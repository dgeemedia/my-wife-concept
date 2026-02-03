// frontend/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

// ── GET settings ──────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const token    = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)

    console.log('Settings GET - resolved slug:', businessSlug)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (businessSlug) {
      headers['X-Business-Slug'] = businessSlug
    }

    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('Settings API error:', error)

    // Return generic defaults only when the backend is completely unreachable
    return NextResponse.json({
      id: 1,
      businessName: 'MyPadiFood',
      businessType: 'food',
      phone: '+234 811 025 2143',
      whatsappNumber: '2348110252143',
      currency: 'NGN',
      language: 'en',
      primaryColor: '#10B981',
      secondaryColor: '#F59E0B',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, {
      status: 200,
      headers: { 'Cache-Control': 'no-cache' }
    })
  }
}

// ── PATCH update settings ─────────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const token        = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.businessName || !body.phone || !body.whatsappNumber) {
      return NextResponse.json(
        { error: 'Business name, phone, and WhatsApp number are required' },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }

    if (businessSlug) {
      headers['X-Business-Slug'] = businessSlug
    }

    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Backend responded with ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': 'no-cache' }
    })
  } catch (error: any) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}