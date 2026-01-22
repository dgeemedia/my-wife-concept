// frontend/app/dashboard/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { getToken, removeToken } from '@/lib/auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
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

    // For other dashboard pages, check authentication
    const token = getToken()
    if (!token) {
      router.push('/dashboard/login')
    } else {
      setLoading(false)
    }
  }, [router, isLoginPage])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}