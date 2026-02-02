// frontend/app/api/settings/route.ts - UPDATED WITH BUSINESS CONTEXT
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Helper function to extract business context
function extractBusinessContext(request: NextRequest): string | null {
  const hostname = request.headers.get('host') || ''
  
  // For local development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return request.headers.get('X-Business-Slug') || null
  }
  
  // Extract subdomain
  const parts = hostname.split('.')
  if (parts.length <= 2 || parts[0] === 'www') {
    return null
  }
  
  return parts[0]
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)
    
    console.log('Settings GET - Business slug:', businessSlug)
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
    
    // Add auth if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    // 🔥 ADD BUSINESS CONTEXT
    if (businessSlug) {
      headers['X-Business-Slug'] = businessSlug
    }
    
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      headers,
      cache: 'no-store',
    })
    
    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }
    
    const data = await response.json()
    
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
    const businessSlug = extractBusinessContext(request)
    
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
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
    
    // 🔥 ADD BUSINESS CONTEXT
    if (businessSlug) {
      headers['X-Business-Slug'] = businessSlug
    }
    
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      method: 'PATCH',
      headers,
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