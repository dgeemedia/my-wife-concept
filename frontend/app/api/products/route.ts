// frontend/app/api/products/route.ts - UPDATED WITH BUSINESS CONTEXT
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

// Helper function to extract business context
function extractBusinessContext(request: NextRequest): string | null {
  const hostname = request.headers.get('host') || ''
  
  // For local development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    // Check for custom header
    return request.headers.get('X-Business-Slug') || null
  }
  
  // Extract subdomain from hostname
  // Example: chrenisfarm.mypadifood.com -> chrenisfarm
  const parts = hostname.split('.')
  
  // If www.mypadifood.com or mypadifood.com (no subdomain)
  if (parts.length <= 2 || parts[0] === 'www') {
    return null
  }
  
  return parts[0] // Return subdomain
}

// Get all products
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const businessSlug = extractBusinessContext(request)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()
    const backendUrl = `${BACKEND_URL}/api/products${queryParams ? `?${queryParams}` : ''}`
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
    
    // 🔥 ADD BUSINESS CONTEXT
    if (businessSlug) {
      headers['X-Business-Slug'] = businessSlug
    }
    
    const response = await fetch(backendUrl, {
      headers,
      cache: 'no-store',
    })

    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response from products backend:', text.substring(0, 200))
      return NextResponse.json([], { status: 200 })
    }

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Backend error:', data.error)
      return NextResponse.json([], { status: 200 })
    }

    return NextResponse.json(data.products || data || [])
  } catch (error: any) {
    console.error('Products fetch error:', error)
    return NextResponse.json([], { status: 200 })
  }
}

// Create new product
export async function POST(request: NextRequest) {
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
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
    
    // 🔥 ADD BUSINESS CONTEXT
    if (businessSlug) {
      headers['X-Business-Slug'] = businessSlug
    }
    
    const response = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}