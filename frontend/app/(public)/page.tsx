// frontend/app/(public)/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ProductGrid from '@/components/product/ProductGrid'
import Hero from '@/components/public/Hero'
import { ShoppingBag, Truck, Shield, Star } from 'lucide-react'
import { Product } from '@/types'
import { ProductGridSkeleton } from '@/components/ui/LoadingSkeleton'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { t } = useTranslation()

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

  return (
    <div className="animate-fade-in">
      <Hero />
      
      {/* Features Section */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('features.easyOrdering.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('features.easyOrdering.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-secondary-600 dark:text-secondary-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('features.fastDelivery.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('features.fastDelivery.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('features.safePayment.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('features.safePayment.description')}</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('features.qualityFood.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('features.qualityFood.description')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12" id="products">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('product.featured')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('product.checkoutProducts')}
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <a
            href="#products"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            {t('cta.button')}
          </a>
        </div>
      </section>
    </div>
  )
}