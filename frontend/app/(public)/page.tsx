// frontend/app/(public)/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// This page is part of the (public) route group
// It should redirect to root if accessed directly
export default function PublicGroupPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}