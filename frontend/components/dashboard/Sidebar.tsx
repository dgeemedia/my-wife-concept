// frontend/components/dashboard/Sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Home,
  Package,
  ShoppingCart,
  Settings,
  Users,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  onLogout: () => void
}

export default function Sidebar({ isOpen, onClose, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation('dashboard')

  const navItems = [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
    { name: t('navigation.products'), href: '/dashboard/products', icon: Package },
    { name: t('navigation.orders'), href: '/dashboard/orders', icon: ShoppingCart },
    { name: t('navigation.staff'), href: '/dashboard/staff', icon: Users },
    { name: t('navigation.settings'), href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
            <span className="font-bold text-lg">MyPadiFood</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <button
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{t('navigation.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}