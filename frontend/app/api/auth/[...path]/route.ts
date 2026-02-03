// frontend/app/api/auth/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

/**
 * Extracts the business slug from the Host header.
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
    const token = request.cookies.get('auth_token')?.value // ✅ Consistent cookie name
    const businessSlug = extractBusinessContext(request)

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
    
    // ✅ If this is a login response, set the cookie
    if (data.ok && data.token && path === 'login') {
      const res = NextResponse.json(data, { status: response.status })
      res.cookies.set('auth_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        ...(process.env.NODE_ENV === 'production' && {
          domain: '.mypadifood.com'
        })
      })
      return res
    }

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