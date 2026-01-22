// frontend/app/api/settings/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Settings API error:', error)
    // Return default settings if backend is not available
    return NextResponse.json({
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
    })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    const body = await request.json()
    
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}