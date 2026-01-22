// app/(public)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import { BusinessSettings } from '@/types'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)

  useEffect(() => {
    // Load business settings
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(() => {})
  }, [])

  // Apply theme colors from settings
  useEffect(() => {
    if (settings) {
      document.documentElement.style.setProperty('--color-primary', settings.primaryColor)
      document.documentElement.style.setProperty('--color-secondary', settings.secondaryColor)
    }
  }, [settings])

  return (
    <div className="min-h-screen flex flex-col">
      <Header businessName={settings?.businessName} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
      <CartDrawer />
    </div>
  )
}