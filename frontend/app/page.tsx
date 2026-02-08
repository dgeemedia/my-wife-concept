// frontend/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { I18nextProvider } from 'react-i18next'
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext'
import { CurrencyProvider } from '@/contexts/CurrencyContext'
import { useBusiness } from '@/contexts/BusinessContext'
import SuperAdminLanding from '@/components/super-admin/SuperAdminLanding'
import i18n, { detectAndSetLanguage } from '@/lib/i18n'
import ProductGrid from '@/components/product/ProductGrid'
import Hero from '@/components/public/Hero'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import WhatsAppWidget from '@/components/public/WhatsAppWidget'
import { Product } from '@/types'
import { ProductGridSkeleton } from '@/components/ui/LoadingSkeleton'
import { applyThemeColors } from '@/lib/colorUtils'

// Business storefront content component
function BusinessStorefront() {
  const { t } = useTranslation()
  const { settings } = useSettings()
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (settings?.primaryColor && settings?.secondaryColor) {
      applyThemeColors(settings.primaryColor, settings.secondaryColor)
    }
  }, [settings])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products-public')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (Array.isArray(data)) {
        const inStock = data.filter((p: Product) => p.stock > 0)
        setFeaturedProducts(inStock.slice(0, 8))
      } else {
        setError(t('product.productsDataFormatIncorrect'))
      }
    } catch (error) {
      console.error('Failed to load products:', error)
      setError(t('product.failedToLoadProducts'))
    } finally {
      setLoading(false)
    }
  }

  const isBookingBusiness =
    settings?.businessType === 'hotel' ||
    settings?.businessType === 'shortlet'

  const productLabel = isBookingBusiness
    ? t('product.availableListings')
    : t('product.browseWhatWeHave')

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        businessName={settings?.businessName}
        logo={settings?.logo}
        primaryColor={settings?.primaryColor}
      />
      
      <main className="flex-1">
        <div className="animate-fade-in">
          <Hero />

          <section className="py-16" id="products">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {productLabel}
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400">
                  {t('product.findWhatYouNeed')}
                </p>

                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4">
                    {error}
                  </div>
                )}
              </div>

              {loading ? (
                <ProductGridSkeleton count={8} />
              ) : (
                <ProductGrid products={featuredProducts} />
              )}
            </div>
          </section>

          <section className="py-16 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t('cta.readyToStart')}
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                {t('cta.browseCollection')}
              </p>

              <a
                href="#products"
                className="inline-block bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {t('cta.startShopping')}
              </a>
            </div>
          </section>
        </div>
      </main>
      
      <Footer settings={settings} />
      <CartDrawer />
      <WhatsAppWidget />
    </div>
  )
}

// Main root page component
export default function RootPage() {
  const { business, loading: businessLoading, error: businessError } = useBusiness()
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Business error (subdomain not found)
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

  // No business (root domain) - show platform landing page
  if (!business) {
    return (
      <I18nextProvider i18n={i18n}>
        <SuperAdminLanding />
      </I18nextProvider>
    )
  }

  // Business exists (subdomain) - show business storefront
  return (
    <I18nextProvider i18n={i18n}>
      <SettingsProvider>
        <CurrencyProvider>
          <BusinessStorefront />
        </CurrencyProvider>
      </SettingsProvider>
    </I18nextProvider>
  )
}