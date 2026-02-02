// frontend/app/api/business/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

// Get all businesses (super-admin only) or create new business
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const response = await fetch(`${BACKEND_URL}/api/business`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Business fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}

// Create new business (super-admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.slug || !body.businessName || !body.phone || !body.whatsappNumber) {
      return NextResponse.json(
        { error: 'slug, businessName, phone, and whatsappNumber are required' },
        { status: 400 }
      )
    }
    
    const response = await fetch(`${BACKEND_URL}/api/business`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Business creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create business' },
      { status: 500 }
    )
  }
}