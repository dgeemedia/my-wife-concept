// frontend/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export async function POST(request: NextRequest) {
  try {
    // Try to get token from multiple sources
    let token = request.cookies.get('auth_token')?.value
    
    // If not in cookies, check Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    if (!token) {
      console.error('No token found in cookies or headers')
      return NextResponse.json(
        { ok: false, error: 'Authentication required. Please log in again.' },
        { status: 401 }
      )
    }
    
    console.log('Token found, forwarding upload to backend')

    // Get the form data from the request
    const formData = await request.formData()
    
    // Forward the request to backend
    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    // Check if response is ok
    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      
      // Try to parse error message
      let errorMessage = 'Upload failed'
      if (contentType?.includes('application/json')) {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } else {
        const text = await response.text()
        console.error('Non-JSON response from backend:', text)
      }
      
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: response.status }
      )
    }

    // Parse successful response
    const data = await response.json()
    
    return NextResponse.json(data, { status: 200 })
    
  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to upload file' },
      { status: 500 }
    )
  }
}