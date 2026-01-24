// components/public/Hero.tsx
'use client'

import { ArrowRight, ShoppingBag, Star, Clock, Shield } from 'lucide-react'
import { useCart } from '../cart/CartProvider'

export default function Hero() {
  const { openCart } = useCart()

  const scrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault()
    const productsSection = document.getElementById('products')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div>
              <span className="inline-block px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-full font-semibold text-sm mb-4">
                🚀 Fresh & Delicious
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Order <span className="text-primary-600">Delicious</span> Meals
                <br />
                <span className="text-secondary-600">Delivered</span> to Your Doorstep
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mt-6">
                Browse our menu, add items to cart, and checkout via WhatsApp.
                No registration required - just good food, fast delivery!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={openCart}
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all transform hover:scale-105"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Start Ordering
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button
                onClick={scrollToProducts}
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:border-primary-600 hover:text-primary-600 dark:hover:border-primary-500 dark:hover:text-primary-500 transition-colors"
              >
                Shop Now
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">50+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Menu Items</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">30min</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">4.8</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Rating</div>
              </div>
            </div>
          </div>

          {/* Right Column - Features */}
          <div className="relative">
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl p-8 shadow-2xl">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white">Fast Delivery</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">30-45 minutes average</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white">Secure Checkout</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Via WhatsApp verification</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold dark:text-white">Quality Food</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fresh ingredients daily</p>
                  </div>
                </div>

                <div className="pt-6 border-t dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    "Best food delivery experience ever! Simple and fast." ⭐⭐⭐⭐⭐
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary-100 dark:bg-secondary-900 rounded-full flex items-center justify-center animate-bounce-slow">
              <ShoppingBag className="w-12 h-12 text-secondary-600 dark:text-secondary-400" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center animate-pulse">
              <Star className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-white dark:text-gray-900"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  )
}