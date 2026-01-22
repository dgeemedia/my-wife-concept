// frontend/app/api/test/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth/[...path]',
      products: '/api/products/[...path]',
      orders: '/api/orders/[...path]',
      settings: '/api/settings/[...path]',
      users: '/api/users/[...path]',
    }
  })
}