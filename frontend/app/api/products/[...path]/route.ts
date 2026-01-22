// frontend/app/api/products/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = params.path.join('/')
    const token = request.cookies.get('auth_token')?.value
    
    const url = `${BACKEND_URL}/api/products/${path}`
    
    const options: RequestInit = {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    }
    
    if (request.method === 'POST' || request.method === 'PUT') {
      const body = await request.json()
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(url, options)
    const data = await response.json()
    
    // Return the data directly (not wrapped in an object)
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Products API error:', error)
    // Return empty array instead of error object
    return NextResponse.json([], { status: 200 })
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler