// frontend/app/api/products-public/route.ts
// NEW: Public route for fetching products (no auth required)
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

// Get all products for public viewing (no auth required)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()
    const backendUrl = `${BACKEND_URL}/api/products${queryParams ? `?${queryParams}` : ''}`
    
    const response = await fetch(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
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

    // Ensure we return the data with images
    return NextResponse.json(Array.isArray(data) ? data : (data.products || []))
  } catch (error: any) {
    console.error('Products fetch error:', error)
    return NextResponse.json([], { status: 200 })
  }
}