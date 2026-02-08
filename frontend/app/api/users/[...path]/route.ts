// frontend/app/api/users/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'


const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const token = request.cookies.get('auth_token')?.value
    
    const url = `${BACKEND_URL}/api/users/${path}`
    
    const options: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }
    
    if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
      const body = await request.json()
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(url, options)
    
    // ✅ FIX: Check content type before parsing JSON
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      return NextResponse.json(data, { status: response.status })
    } else {
      // If not JSON, it's likely an HTML error page
      const text = await response.text()
      console.error('Non-JSON response from backend:', text.substring(0, 200))
      return NextResponse.json(
        { error: 'Invalid response from server' },
        { status: response.status || 500 }
      )
    }
  } catch (error) {
    console.error('Users API error:', error)
    return NextResponse.json(
      { error: 'Failed to process users request' },
      { status: 500 }
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler