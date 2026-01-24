// frontend/app/dashboard/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { getToken, removeToken } from '@/lib/auth'
import api from '@/lib/api'
import { CurrencyProvider } from '@/components/dashboard/CurrencyProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Check if we're on the login page
  const isLoginPage = pathname === '/dashboard/login'

  useEffect(() => {
    // If on login page, skip auth check
    if (isLoginPage) {
      setLoading(false)
      return
    }

    // For other dashboard pages, verify authentication
    verifyAuth()
  }, [router, isLoginPage])

  const verifyAuth = async () => {
    const token = getToken()
    
    if (!token) {
      router.push('/dashboard/login')
      return
    }

    try {
      // Verify token by fetching current user
      const response = await api.get('/auth/me')
      
      if (response.user) {
        setUser(response.user)
        setLoading(false)
      } else {
        throw new Error('Invalid response')
      }
    } catch (error) {
      console.error('Auth verification failed:', error)
      removeToken()
      router.push('/dashboard/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  // If on login page, don't use the dashboard layout
  if (isLoginPage) {
    return <>{children}</>
  }

  const handleLogout = () => {
    removeToken()
    router.push('/dashboard/login')
  }

  return (
    <CurrencyProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* Sidebar */}
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
        />
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden lg:ml-64">
          {/* Header */}
          <DashboardHeader 
            onMenuClick={() => setSidebarOpen(true)}
            user={user}
            onLogout={handleLogout}
          />
          
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </CurrencyProvider>
  )
}