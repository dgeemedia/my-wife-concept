// app/public-store/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProductGrid from '@/components/product/ProductGrid'
import Hero from '@/components/public/Hero'
import { Product } from '@/types'
import { ProductGridSkeleton } from '@/components/ui/LoadingSkeleton'
import { useBusiness } from '@/contexts/BusinessContext'
import { useSettings } from '@/contexts/SettingsContext'

export default function PublicStorePage() {
  const { business } = useBusiness()
  const { t } = useTranslation()
  const { settings } = useSettings()

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (business) {
      loadProducts()
    }
  }, [business])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/products-public')
      
      if (!response.ok) {
        throw new Error(`Failed to load products: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (Array.isArray(data)) {
        const inStock = data.filter((p: Product) => p.stock > 0)
        setFeaturedProducts(inStock.slice(0, 8))
      } else if (data.products && Array.isArray(data.products)) {
        const inStock = data.products.filter((p: Product) => p.stock > 0)
        setFeaturedProducts(inStock.slice(0, 8))
      } else {
        setFeaturedProducts([])
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

  return (
    <div className="animate-fade-in">
      <Hero />
      
      <section className="py-16" id="products">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {isBookingBusiness ? 'Available Listings' : 'Browse Our Products'}
            </h2>
            <p className="text-xl text-gray-600">
              {t('product.findWhatYouNeed')}
            </p>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mt-4 max-w-md mx-auto">
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
    </div>
  )
}