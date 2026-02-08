// frontend/app/api/notifications/archived/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()
    const backendUrl = `${BACKEND_URL}/api/notifications/archived${queryParams ? `?${queryParams}` : ''}`
    
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Archived notifications fetch error:', error)
    return NextResponse.json(
      { notifications: [], totalArchived: 0 },
      { status: 200 }
    )
  }
}