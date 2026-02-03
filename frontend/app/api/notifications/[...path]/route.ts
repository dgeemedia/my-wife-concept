// frontend/app/api/notifications/[...path]/route.ts
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

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path         = params.path.join('/')
    const token        = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const url = `${BACKEND_URL}/api/notifications/${path}`

    const options: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(businessSlug && { 'X-Business-Slug': businessSlug }),
      },
    }

    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      // Some sub-routes (like read-all) have no body; guard against empty reads
      const text = await request.text()
      if (text) {
        options.body = text
      }
    }

    const response = await fetch(url, options)
    const data     = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Notifications catch-all error:', error)
    return NextResponse.json({ error: 'Failed to process notification request' }, { status: 500 })
  }
}

export const GET    = handler
export const POST   = handler
export const PUT    = handler
export const PATCH  = handler
export const DELETE = handler