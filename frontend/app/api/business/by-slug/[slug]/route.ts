// frontend/app/api/business/by-slug/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

interface RouteParams {
  params: { slug: string }
}

// Get business by slug (public route - no auth required)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = params
    
    const response = await fetch(`${BACKEND_URL}/api/business/by-slug/${slug}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Business by slug error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch business' },
      { status: 500 }
    )
  }
}