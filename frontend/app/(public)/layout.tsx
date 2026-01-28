// frontend/app/(public)/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import i18n, { detectAndSetLanguage } from '@/lib/i18n'
import { applyThemeColors } from '@/lib/colorUtils'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    const initI18n = async () => {
      try {
        await detectAndSetLanguage()
        setI18nReady(true)
      } catch (error) {
        console.error('Failed to initialize i18n:', error)
        setI18nReady(true)
      }
    }
    
    initI18n()
  }, [])

  useEffect(() => {
    fetchSettings()

    const handleSettingsUpdate = (event: CustomEvent) => {
      setSettings(event.detail)
    }

    window.addEventListener('settings-updated' as any, handleSettingsUpdate as EventListener)
    
    return () => {
      window.removeEventListener('settings-updated' as any, handleSettingsUpdate as EventListener)
    }
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings?' + new Date().getTime(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setSettings({
        businessName: 'My Business',
        primaryColor: '#10B981',
        secondaryColor: '#F59E0B',
        currency: 'NGN',
        language: 'en',
        logo: null
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (settings?.primaryColor && settings?.secondaryColor) {
      applyThemeColors(settings.primaryColor, settings.secondaryColor)
    }
  }, [settings])

  if (loading || !i18nReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your store...</p>
        </div>
      </div>
    )
  }

  return (
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <CurrencyProvider>
          <div className="min-h-screen flex flex-col">
            <Header 
              businessName={settings?.businessName}
              logo={settings?.logo}
              primaryColor={settings?.primaryColor}
            />
            <main className="flex-1">{children}</main>
            <Footer settings={settings} />
            <CartDrawer />
          </div>
        </CurrencyProvider>
      </SettingsProvider>
    </I18nextProvider>
  )
}