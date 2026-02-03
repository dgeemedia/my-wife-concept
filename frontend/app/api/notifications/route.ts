// frontend/app/api/notifications/route.ts
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

// GET /api/notifications   – list active notifications
export async function GET(request: NextRequest) {
  try {
    const token        = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)

    if (!token) {
      return NextResponse.json(
        { notifications: [], unreadCount: 0 },
        { status: 200 }
      )
    }

    const url         = new URL(request.url)
    const queryParams = url.searchParams.toString()
    const backendUrl  = `${BACKEND_URL}/api/notifications${queryParams ? `?${queryParams}` : ''}`

    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(businessSlug && { 'X-Business-Slug': businessSlug }),
      },
      cache: 'no-store',
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { notifications: [], unreadCount: 0 },
      { status: 200 }
    )
  }
}

// POST /api/notifications/read-all  – mark all as read
//   (Next.js will match this file for POST /api/notifications
//    but /read-all is a sub-path so it goes to the catch-all below)
export async function POST(request: NextRequest) {
  try {
    const token        = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const response = await fetch(`${BACKEND_URL}/api/notifications/read-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(businessSlug && { 'X-Business-Slug': businessSlug }),
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Notifications read-all error:', error)
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 })
  }
}