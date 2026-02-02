// frontend/app/api/language/route.ts
import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

// Get supported languages
export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/language/supported`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Language fetch error:', error)
    
    // Return default supported languages if backend fails
    return NextResponse.json({
      success: true,
      languages: [
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'International' },
        { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'West & North Africa' },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'North Africa & Middle East' },
        { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬', region: 'Nigeria, Benin' },
        { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬', region: 'Nigeria' },
        { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬', region: 'Nigeria, Niger' },
        { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿', region: 'East Africa' },
        { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'India' },
      ],
      total: 8
    })
  }
}