// app/public-store/layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import WhatsAppWidget from '@/components/public/WhatsAppWidget'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { BusinessProvider } from '@/contexts/BusinessContext'
import i18n, { detectAndSetLanguage } from '@/lib/i18n'
import { applyThemeColors } from '@/lib/colorUtils'

// Client-only i18n wrapper
function I18nWrapper({ children }: { children: React.ReactNode }) {
  const [i18nReady, setI18nReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        if (!i18n.isInitialized) {
          await i18n.init()
        }
        await detectAndSetLanguage()
        setI18nReady(true)
      } catch (error) {
        console.error('Failed to initialize i18n:', error)
        setI18nReady(true) // Continue anyway
      }
    }
    init()
  }, [])

  if (!i18nReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}

export default function PublicStoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <BusinessProvider>
      <I18nextProvider i18n={i18n}>
        <I18nWrapper>
          <SettingsProvider>
            <CurrencyProvider>
              <div className="min-h-screen flex flex-col">
                <PublicStoreContent>{children}</PublicStoreContent>
                <CartDrawer />
                <WhatsAppWidget />
              </div>
            </CurrencyProvider>
          </SettingsProvider>
        </I18nWrapper>
      </I18nextProvider>
    </BusinessProvider>
  )
}

// Separate component to use business context
function PublicStoreContent({ children }: { children: React.ReactNode }) {
  const { business, loading: businessLoading, error: businessError } = BusinessProvider.useBusiness()
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessLoading && business) {
      fetchSettings()
    } else if (!businessLoading && !business) {
      setLoading(false)
    }
  }, [business, businessLoading])

  const fetchSettings = async () => {
    try {
      const response = await fetch(`/api/settings?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          ...(business?.slug && { 'X-Business-Slug': business.slug })
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch settings')
      
      const data = await response.json()
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
      applyThemeColors(mergedSettings.primaryColor, mergedSettings.secondaryColor)
    } catch (error) {
      console.error('Error fetching settings:', error)
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
      }
    } finally {
      setLoading(false)
    }
  }

  if (businessError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600 mb-6">{businessError}</p>
        </div>
      </div>
    )
  }

  if (loading || businessLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading your store...</p>
      </div>
    )
  }

  return (
    <>
      <Header 
        businessName={settings?.businessName}
        logo={settings?.logo}
        primaryColor={settings?.primaryColor}
      />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  )
}