// frontend/app/(public)/layout.tsx - UPDATED
'use client'

import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import WhatsAppWidget from '@/components/public/WhatsAppWidget'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { useBusiness } from '@/contexts/BusinessContext'
import i18n, { detectAndSetLanguage } from '@/lib/i18n'
import { applyThemeColors } from '@/lib/colorUtils'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { business, loading: businessLoading, error: businessError } = useBusiness()
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
    // Wait for business to load before fetching settings
    if (!businessLoading && business) {
      fetchSettings()
    } else if (!businessLoading && !business) {
      // No business context (main landing page)
      fetchSettings()
    }

    const handleSettingsUpdate = (event: CustomEvent) => {
      setSettings(event.detail)
    }

    window.addEventListener('settings-updated' as any, handleSettingsUpdate as EventListener)
    
    return () => {
      window.removeEventListener('settings-updated' as any, handleSettingsUpdate as EventListener)
    }
  }, [business, businessLoading])

  const fetchSettings = async () => {
    try {
      // Settings will automatically use business context from subdomain middleware
      const response = await fetch('/api/settings?' + new Date().getTime(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          // Pass business slug for local development
          ...(business?.slug && { 'X-Business-Slug': business.slug })
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      
      const data = await response.json()
      
      // Merge business data with settings if available
      const mergedSettings = {
        ...data,
        ...(business && {
          businessName: business.businessName,
          logo: business.logo,
          primaryColor: business.primaryColor,
          secondaryColor: business.secondaryColor,
          currency: business.currency,
          phone: business.phone,
          whatsappNumber: business.whatsappNumber,
          businessType: business.businessType,
        })
      }
      
      setSettings(mergedSettings)
    } catch (error) {
      console.error('Error fetching settings:', error)
      
      // Use business data as fallback if available
      if (business) {
        setSettings({
          businessName: business.businessName,
          businessType: business.businessType || 'food',
          phone: business.phone,
          whatsappNumber: business.whatsappNumber,
          currency: business.currency || 'NGN',
          language: business.language || 'en',
          primaryColor: business.primaryColor || '#10B981',
          secondaryColor: business.secondaryColor || '#F59E0B',
          logo: business.logo || null
        })
      } else {
        // Ultimate fallback
        setSettings({
          businessName: 'My Business',
          primaryColor: '#10B981',
          secondaryColor: '#F59E0B',
          currency: 'NGN',
          language: 'en',
          logo: null
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (settings?.primaryColor && settings?.secondaryColor) {
      applyThemeColors(settings.primaryColor, settings.secondaryColor)
    }
  }, [settings])

  // Show business error if subdomain not found
  if (businessError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600 mb-6">{businessError}</p>
          <p className="text-sm text-gray-500">
            Please check the URL or contact support if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }

  if (loading || !i18nReady || businessLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {businessLoading ? 'Loading business...' : 'Loading your store...'}
          </p>
          {business && (
            <p className="text-sm text-gray-500 mt-2">{business.businessName}</p>
          )}
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
            <WhatsAppWidget />
          </div>
        </CurrencyProvider>
      </SettingsProvider>
    </I18nextProvider>
  )
}