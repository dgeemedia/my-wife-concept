// frontend/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  // Clear the auth cookie
  const response = NextResponse.json({ ok: true, message: 'Logged out successfully' })
  response.cookies.delete('auth_token')
  return response
}