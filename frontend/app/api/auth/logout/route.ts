// frontend/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true, message: 'Logged out successfully' })
  
  // ✅ Clear cookie with same settings as login
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
    ...(process.env.NODE_ENV === 'production' && {
      domain: '.mypadifood.com'
    })
  })
  
  return response
}