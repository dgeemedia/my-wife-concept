// frontend/app/api/auth/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

/**
 * Extracts the business slug from the Host header.
 *   "houseofqg.localhost:3000"   → "houseofqg"
 *   "localhost:3000"             → null
 *   "chrenisfarm.mypadifood.com" → "chrenisfarm"
 */
function extractBusinessContext(request: NextRequest): string | null {
  const host = (request.headers.get('host') || '').split(':')[0]
  const parts = host.split('.')

  if (parts[parts.length - 1] === 'localhost') {
    return parts.length >= 2 ? parts[0] : null
  }

  if (parts.length <= 2 || parts[0] === 'www') return null
  return parts[0]
}

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const token = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)

    // ✅ FIX: proxy to /api/auth/ — was incorrectly hitting /api/settings/
    const url = `${BACKEND_URL}/api/auth/${path}`

    const options: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(businessSlug && { 'X-Business-Slug': businessSlug }),
      },
    }

    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      const body = await request.json()
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)
    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      { error: 'Failed to process auth request' },
      { status: 500 }
    )
  }
}

export const GET    = handler
export const POST   = handler
export const PUT    = handler
export const PATCH  = handler
export const DELETE = handler