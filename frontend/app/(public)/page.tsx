// frontend/app/(public)/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProductGrid from '@/components/product/ProductGrid'
import Hero from '@/components/public/Hero'
import { Product } from '@/types'
import { ProductGridSkeleton } from '@/components/ui/LoadingSkeleton'
import { useBusiness } from '@/contexts/BusinessContext'
import SuperAdminLanding from '@/components/super-admin/SuperAdminLanding'
import { useSettings } from '@/contexts/SettingsContext'

export default function Home() {
  const { business, loading: businessLoading } = useBusiness()
  const { t } = useTranslation()

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!businessLoading && business) {
      loadProducts()
    } else if (!businessLoading && !business) {
      setLoading(false)
    }
  }, [business, businessLoading])

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

  // ✅ IMPORTANT: EXIT BEFORE useSettings()
  if (!businessLoading && !business) {
    return <SuperAdminLanding />
  }

  // ✅ Safe now — SettingsProvider exists for tenant routes
  const { settings } = useSettings()

  const isBookingBusiness =
    settings?.businessType === 'hotel' ||
    settings?.businessType === 'shortlet'

  const productLabel = isBookingBusiness
    ? t('product.availableListings')
    : t('product.browseWhatWeHave')

  return (
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
  )
}
