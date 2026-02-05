// frontend/components/super-admin/SuperAdminLanding.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import LandingHeader from './components/LandingHeader'
import HeroSection from './components/HeroSection'
import BusinessesDirectory from './components/BusinessesDirectory'
import OnboardingForm from './components/OnboardingForm'
import LandingFooter from './components/LandingFooter'
import PlatformWhatsAppWidget from './components/PlatformWhatsAppWidget'
import SuperAdminDashboard from './components/SuperAdminDashboard'
import { getBusinessUrl } from '@/lib/domain-helper'
import { BUSINESS_TYPES } from './constants/businessTypes'
import { PLATFORM_WHATSAPP } from './constants/platform'
import type { Business, User } from './types'

export default function SuperAdminLanding() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [activeView, setActiveView] = useState<'landing' | 'businesses' | 'onboarding'>('landing')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth_token='))
        ?.split('=')[1]

      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)

        if (data.user.role === 'super-admin') {
          setActiveView('businesses')
        } else if (data.user.businessId) {
          const businessResponse = await fetch(`/api/business/${data.user.businessId}`)
          if (businessResponse.ok) {
            const business = await businessResponse.json()
            // Use domain helper for redirect
            const businessUrl = getBusinessUrl(business.slug)
            window.location.href = `${businessUrl}/dashboard`
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <PublicLandingPage activeView={activeView} setActiveView={setActiveView} />
  }

  if (user?.role === 'super-admin') {
    return <SuperAdminDashboard user={user} onLogout={handleLogout} />
  }

  return <PublicLandingPage activeView={activeView} setActiveView={setActiveView} />
}

function PublicLandingPage({ activeView, setActiveView }: any) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <LandingHeader activeView={activeView} setActiveView={setActiveView} />
      
      {activeView === 'landing' && <HeroSection setActiveView={setActiveView} />}
      {activeView === 'businesses' && <BusinessesDirectory />}
      {activeView === 'onboarding' && <OnboardingForm />}
      
      <LandingFooter />
      <PlatformWhatsAppWidget />
    </div>
  )
}