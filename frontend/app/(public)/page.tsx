// frontend/app/(public)/page.tsx
'use client'

import { useEffect, useState } from 'react'
import ProductGrid from '@/components/product/ProductGrid'
import Hero from '@/components/public/Hero'
import { ShoppingBag, Truck, Shield, Star } from 'lucide-react'
import { Product } from '@/types'
import { ProductGridSkeleton } from '@/components/ui/LoadingSkeleton'

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const response = await fetch('/api/products')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Check if data is an array
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
        // Load dummy data for testing
        setFeaturedProducts([
          {
            id: 1,
            name: "Jollof Rice",
            price: 1500,
            stock: 10,
            description: "Delicious Nigerian jollof rice with chicken",
            imageUrl: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: "Fried Rice",
            price: 1800,
            stock: 5,
            description: "Special fried rice with assorted meat",
            imageUrl: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 3,
            name: "Egusi Soup",
            price: 2000,
            stock: 8,
            description: "Traditional Nigerian egusi soup with pounded yam",
            imageUrl: "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ])
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [])

  return (
    <div className="animate-fade-in">
      <Hero />
      
      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Easy Ordering</h3>
              <p className="text-gray-600">Browse, select, and order in minutes</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Get your food delivered hot and fresh</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Safe Payment</h3>
              <p className="text-gray-600">Secure checkout via WhatsApp</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quality Food</h3>
              <p className="text-gray-600">Fresh ingredients, delicious meals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-gray-600">Check out our most popular items</p>
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
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Browse our menu and place your order. We'll handle the rest!
          </p>
          <a
            href="#products"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            View Full Menu
          </a>
        </div>
      </section>
    </div>
  )
}