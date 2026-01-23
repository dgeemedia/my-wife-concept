// frontend/app/(public)/layout.tsx
'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import { SettingsProvider } from '@/contexts/SettingsContext'

// Create Currency Context
const CurrencyContext = createContext({ currency: 'NGN', symbol: '₦' })
export const useCurrency = () => useContext(CurrencyContext)

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    // Load business settings with cache busting
    fetch('/api/settings?' + new Date().getTime())
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

  // Get currency symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      'NGN': '₦',
      'USD': '$',
      'GBP': '£',
      'EUR': '€'
    }
    return symbols[currency] || '₦'
  }

  const currencyValue = {
    currency: settings?.currency || 'NGN',
    symbol: getCurrencySymbol(settings?.currency || 'NGN')
  }

  return (
    <SettingsProvider>
      <CurrencyContext.Provider value={currencyValue}>
        <div className="min-h-screen flex flex-col">
          <Header 
            businessName={settings?.businessName}
            logo={settings?.logo}
          />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <CartDrawer />
        </div>
      </CurrencyContext.Provider>
    </SettingsProvider>
  )
}