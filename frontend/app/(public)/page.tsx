// frontend/app/(public)/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProductGrid from '@/components/product/ProductGrid'
import Hero from '@/components/public/Hero'
import { Product } from '@/types'
import { ProductGridSkeleton } from '@/components/ui/LoadingSkeleton'
import { useSettings } from '@/contexts/SettingsContext'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { t } = useTranslation()
  const { settings } = useSettings()

  useEffect(() => {
    loadProducts()
  }, [])

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
        console.warn('API returned non-array data:', data)
        setError('Products data format is incorrect')
      }
    } catch (error) {
      console.error('Failed to load products:', error)
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Determine if it's a booking/reservation type business
  const isBookingBusiness = settings?.businessType === 'hotel' || settings?.businessType === 'shortlet'
  const productLabel = isBookingBusiness ? 'Available Listings' : 'Browse What We Have'

  return (
    <div className="animate-fade-in">
      <Hero />

      {/* Products Section - Direct focus on what we sell */}
      <section className="py-16" id="products">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {productLabel}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Find what you need and order instantly
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

      {/* Simple CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Browse our collection and place your order today!
          </p>
          <a
            href="#products"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Start Shopping
          </a>
        </div>
      </section>
    </div>
  )
}