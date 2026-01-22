// frontend/app/dashboard/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { getToken, removeToken } from '@/lib/auth'
import api from '@/lib/api'

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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
    <div className="min-h-screen bg-gray-100">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />
      
      <div className="lg:pl-64 flex flex-col flex-1">
        <DashboardHeader 
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}