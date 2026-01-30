// frontend/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[Users API] GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const body = await request.json()
    
    console.log('[Users API] Creating user:', body.email)
    
    const response = await fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    console.log('[Users API] Response:', response.status, data)
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[Users API] POST Error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}