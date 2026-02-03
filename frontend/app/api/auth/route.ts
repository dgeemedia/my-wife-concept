// frontend/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

// Proxy for /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    if (data.ok && data.token) {
      // Set token in response cookie with proper domain settings
      const res = NextResponse.json(data)
      
      // ✅ CRITICAL: Set cookie domain to work across all subdomains
      res.cookies.set('auth_token', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed from 'strict' to 'lax' for subdomain support
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        // For localhost development - don't set domain
        // For production - set to .yourdomain.com to work across subdomains
        ...(process.env.NODE_ENV === 'production' && {
          domain: '.mypadifood.com' // ✅ This allows cookies across all subdomains
        })
      })
      
      return res
    }
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { ok: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}