// frontend/app/api/orders/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/')
  console.log(`=== Orders Dynamic Route Called: ${request.method} /api/orders/${path} ===`)
  
  try {
    const token = request.cookies.get('auth_token')?.value
    
    // Public endpoints that don't require auth
    const publicEndpoints = ['checkout', 'track']
    const isPublic = publicEndpoints.some(ep => path.startsWith(ep))
    
    console.log('Path:', path)
    console.log('Is public:', isPublic)
    console.log('Has token:', !!token)
    
    if (!isPublic && !token) {
      console.log('Auth required but no token found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const backendUrl = `${BACKEND_URL}/api/orders/${path}`
    console.log('Backend URL:', backendUrl)
    
    const options: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...(!isPublic && token && { 'Authorization': `Bearer ${token}` }),
      },
      cache: 'no-store',
    }
    
    // Handle request body for POST/PUT/PATCH
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      try {
        const body = await request.json()
        options.body = JSON.stringify(body)
        console.log('Request body:', JSON.stringify(body).substring(0, 100))
      } catch (e) {
        console.log('No JSON body or error parsing')
      }
    }
    
    console.log('Fetching from backend...')
    const response = await fetch(backendUrl, options)
    console.log('Backend response status:', response.status)
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type')
    console.log('Response content-type:', contentType)
    
    if (!contentType?.includes('application/json')) {
      const text = await response.text()
      console.error('Non-JSON response:', text.substring(0, 200))
      return NextResponse.json(
        { error: 'Invalid response from server', details: text.substring(0, 100) },
        { status: 500 }
      )
    }
    
    const data = await response.json()
    console.log('Response data received:', !!data)
    
    if (!response.ok) {
      console.error('Backend returned error:', data.error)
      return NextResponse.json(
        { error: data.error || 'Request failed' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Orders API error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process orders request',
        details: error.toString(),
        path: path
      },
      { status: 500 }
    )
  }
}

export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
export const PUT = handler