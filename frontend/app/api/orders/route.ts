// frontend/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

function extractBusinessContext(request: NextRequest): string | null {
  const host = (request.headers.get('host') || '').split(':')[0]
  const parts = host.split('.')

  if (parts[parts.length - 1] === 'localhost') {
    return parts.length >= 2 ? parts[0] : null
  }

  if (parts.length <= 2 || parts[0] === 'www') return null
  return parts[0]
}

// GET  /api/orders          – list orders (supports ?limit=N, ?status=X, etc.)
// POST /api/orders          – create order
export async function GET(request: NextRequest) {
  try {
    const token        = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const url          = new URL(request.url)
    const queryParams  = url.searchParams.toString()
    const backendUrl   = `${BACKEND_URL}/api/orders${queryParams ? `?${queryParams}` : ''}`

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(businessSlug && { 'X-Business-Slug': businessSlug }),
      },
      cache: 'no-store',
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json({ orders: [], error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token        = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()

    const response = await fetch(`${BACKEND_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(businessSlug && { 'X-Business-Slug': businessSlug }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Orders POST error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}