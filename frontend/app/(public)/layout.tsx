// frontend/app/(public)/layout.tsx
'use client'

import { useEffect } from 'react'
import { useBusiness } from '@/contexts/BusinessContext'
import { useRouter } from 'next/navigation'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { business, loading } = useBusiness()
  const router = useRouter()

  useEffect(() => {
    // If no business context, redirect to root
    // This layout should only be used for actual business subdomains
    if (!loading && !business) {
      router.push('/')
    }
  }, [business, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!business) {
    return null // Will redirect
  }

  return <>{children}</>
}