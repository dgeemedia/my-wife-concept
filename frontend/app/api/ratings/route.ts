// ============================================================================
// UPDATED FRONTEND RATINGS API
// frontend/app/api/ratings/route.ts
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

// GET - Fetch ratings or check if user can rate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const productId = searchParams.get('productId')
    const phone = searchParams.get('phone')
    
    console.log('🔍 Ratings API GET:', { action, productId, phone: phone ? '***' + phone.slice(-4) : null })
    
    // Check if user can rate
    if (action === 'check' && productId && phone) {
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/can-rate?phone=${encodeURIComponent(phone)}`,
        { 
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      const data = await response.json()
      console.log('✅ Can rate response:', { 
        canRate: data.canRate, 
        hasRated: data.hasRated 
      })
      
      return NextResponse.json(data)
    }
    
    // Get product ratings
    if (productId) {
      const page = searchParams.get('page') || '1'
      const limit = searchParams.get('limit') || '10'
      
      const response = await fetch(
        `${BACKEND_URL}/api/products/${productId}/ratings?page=${page}&limit=${limit}`,
        { cache: 'no-store' }
      )
      
      const data = await response.json()
      console.log('📊 Ratings fetched:', data.totalRatings || 0)
      
      return NextResponse.json(data)
    }
    
    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('❌ Ratings GET error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}

// POST - Submit rating
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, phone, rating, comment } = body
    
    console.log('⭐ Submitting rating:', { 
      productId, 
      phone: phone ? '***' + phone.slice(-4) : null, 
      rating 
    })
    
    if (!productId || !phone || !rating) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const response = await fetch(
      `${BACKEND_URL}/api/products/${productId}/ratings`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, rating, comment })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('❌ Rating submission failed:', data.error)
      return NextResponse.json(data, { status: response.status })
    }
    
    console.log('✅ Rating submitted successfully')
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('❌ Ratings POST error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit rating' },
      { status: 500 }
    )
  }
}