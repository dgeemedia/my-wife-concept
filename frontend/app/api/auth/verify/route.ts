// frontend/app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  
  if (!token) {
    return NextResponse.json({ authenticated: false })
  }
  
  return NextResponse.json({ authenticated: true })
}