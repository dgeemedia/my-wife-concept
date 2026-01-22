// frontend/app/api/auth/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/auth/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    if (path === 'login' && data.ok) {
      const res = NextResponse.json(data)
      res.cookies.set('auth_token', data.token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
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

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const token = request.cookies.get('auth_token')?.value
    
    const response = await fetch(`${BACKEND_URL}/api/auth/${path}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
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