// frontend/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export const dynamic = 'force-dynamic' // Disable caching for this route
export const revalidate = 0 // Always revalidate

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    
    // Add cache-busting headers
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }
    
    const data = await response.json()
    
    // Return with cache-control headers
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (error) {
    console.error('Settings API error:', error)
    
    // Return default settings if backend is not available
    const defaultSettings = {
      id: 1,
      businessName: 'MyPadiFood',
      businessType: 'food',
      phone: '+234 811 025 2143',
      whatsappNumber: '2348110252143',
      currency: 'NGN',
      language: 'en',
      primaryColor: '#10B981',
      secondaryColor: '#F59E0B',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    return NextResponse.json(defaultSettings, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
  }
}

export async function PATCH(request: NextRequest) {
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
    if (!body.businessName || !body.phone || !body.whatsappNumber) {
      return NextResponse.json(
        { error: 'Business name, phone, and WhatsApp number are required' },
        { status: 400 }
      )
    }
    
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Backend responded with ${response.status}`)
    }
    
    const data = await response.json()
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
  } catch (error: any) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}