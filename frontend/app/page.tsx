// frontend/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { useBusiness } from '@/contexts/BusinessContext'
import SuperAdminLanding from '@/components/super-admin/SuperAdminLanding'
import i18n, { detectAndSetLanguage } from '@/lib/i18n'

// Import the actual page content
import PublicPageContent from './(public)/page'

export default function RootPage() {
  const { business, loading: businessLoading } = useBusiness()
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

  // Loading state
  if (businessLoading || !i18nReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // No business - show landing page
  if (!business) {
    return (
      <I18nextProvider i18n={i18n}>
        <SuperAdminLanding />
      </I18nextProvider>
    )
  }

  // Business exists - wrap with providers and render business page
  return (
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <CurrencyProvider>
          <PublicPageContent />
        </CurrencyProvider>
      </SettingsProvider>
    </I18nextProvider>
  )
}