// ============================================================================
// frontend/app/api/orders/route.ts
// ============================================================================
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export async function GET(request: NextRequest) {
  console.log('=== Orders Route GET Called ===')
  
  try {
    const token = request.cookies.get('auth_token')?.value
    console.log('Auth token present:', !!token)
    
    if (!token) {
      console.log('No auth token found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const url = new URL(request.url)
    const queryParams = url.searchParams.toString()
    const backendUrl = `${BACKEND_URL}/api/orders${queryParams ? `?${queryParams}` : ''}`
    
    console.log('Fetching from backend:', backendUrl)
    
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    console.log('Backend response status:', response.status)
    console.log('Backend response content-type:', response.headers.get('content-type'))
    
    const contentType = response.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response from backend:', text.substring(0, 200))
      return NextResponse.json(
        { error: 'Invalid response from server', details: text.substring(0, 100) },
        { status: 500 }
      )
    }
    
    const data = await response.json()
    console.log('Backend data received:', data ? 'yes' : 'no')
    console.log('Orders count:', data.orders?.length || 0)
    
    if (!response.ok) {
      console.error('Backend error:', data.error)
      return NextResponse.json(
        { error: data.error || 'Request failed' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Orders fetch error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders', details: error.toString() },
      { status: 500 }
    )
  }
}

