// frontend/app/api/business/current/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

// Add at the top
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Get current user's business
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const response = await fetch(`${BACKEND_URL}/api/business/current`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Current business fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch current business' },
      { status: 500 }
    )
  }
}