// components/public/Hero.tsx
'use client'

import { ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'
import { useCart } from '../cart/CartProvider'
import { useSettings } from '@/contexts/SettingsContext'
import { useTranslation } from 'react-i18next'

export default function Hero() {
  const { t } = useTranslation()
  const { openCart } = useCart()
  const { settings } = useSettings()

  const scrollToProducts = (e: React.MouseEvent) => {
    e.preventDefault()
    const productsSection = document.getElementById('products')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Determine if it's a booking/reservation type business
  const isBookingBusiness = settings?.businessType === 'hotel' || settings?.businessType === 'shortlet'
  const browseLabel = isBookingBusiness ? t('hero.browseListings') : t('hero.browseProducts')
  
  return (
    <section className="relative overflow-hidden">
      {/* Dynamic Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950"></div>
      
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Decorative Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Animated Delivery Vehicles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Bicycle - Top Lane */}
        <div className="absolute top-[20%] left-0 w-full h-16 animate-slide-right">
          <div className="absolute left-0 w-16 h-16">
            <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-lg">
              <circle cx="28" cy="18" r="4" fill="#6366f1" />
              <path d="M28 22 L28 32 L24 38" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M28 26 L34 24" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M28 32 L32 38" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M34 24 L42 36" stroke="#4f46e5" strokeWidth="2.5" fill="none" />
              <path d="M34 24 L20 36" stroke="#4f46e5" strokeWidth="2.5" fill="none" />
              <path d="M20 36 L42 36" stroke="#4f46e5" strokeWidth="2.5" fill="none" />
              <circle cx="42" cy="44" r="8" fill="none" stroke="#1f2937" strokeWidth="2" />
              <circle cx="42" cy="44" r="1.5" fill="#1f2937" />
              <line x1="42" y1="36" x2="42" y2="44" stroke="#1f2937" strokeWidth="1" />
              <circle cx="20" cy="44" r="8" fill="none" stroke="#1f2937" strokeWidth="2" />
              <circle cx="20" cy="44" r="1.5" fill="#1f2937" />
              <line x1="20" y1="36" x2="20" y2="44" stroke="#1f2937" strokeWidth="1" />
              <circle cx="31" cy="36" r="3" fill="#a855f7" className="animate-spin-slow" style={{ transformOrigin: '31px 36px' }} />
            </svg>
          </div>
        </div>

        {/* Delivery Van - Bottom Lane */}
        <div className="absolute bottom-[25%] left-0 w-full h-20 animate-slide-right-slow">
          <div className="absolute left-0 w-24 h-20">
            <svg viewBox="0 0 96 64" className="w-full h-full drop-shadow-lg">
              <rect x="10" y="20" width="70" height="28" rx="4" fill="#8b5cf6" />
              <rect x="50" y="12" width="30" height="36" rx="4" fill="#7c3aed" />
              <rect x="54" y="16" width="10" height="10" rx="2" fill="#e0e7ff" opacity="0.8" />
              <rect x="68" y="16" width="8" height="10" rx="2" fill="#e0e7ff" opacity="0.8" />
              <rect x="15" y="24" width="30" height="20" rx="2" fill="#6d28d9" />
              <line x1="30" y1="24" x2="30" y2="44" stroke="#5b21b6" strokeWidth="1.5" />
              <circle cx="30" cy="34" r="6" fill="#fff" opacity="0.9" />
              <path d="M28 34 L30 36 L34 32" stroke="#7c3aed" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="25" cy="48" r="7" fill="#1f2937" />
              <circle cx="25" cy="48" r="4" fill="#4b5563" />
              <circle cx="65" cy="48" r="7" fill="#1f2937" />
              <circle cx="65" cy="48" r="4" fill="#4b5563" />
              <circle cx="82" cy="28" r="2" fill="#fbbf24" />
              <circle cx="82" cy="36" r="2" fill="#fbbf24" />
              <line x1="5" y1="25" x2="8" y2="25" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <line x1="3" y1="32" x2="7" y2="32" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
              <line x1="5" y1="39" x2="8" y2="39" stroke="#9333ea" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* Second Bicycle - Middle Lane */}
        <div className="absolute top-[50%] right-0 w-full h-16 animate-slide-left hidden md:block">
          <div className="absolute right-0 w-16 h-16 transform scale-x-[-1]">
            <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-lg">
              <circle cx="28" cy="18" r="4" fill="#ec4899" />
              <path d="M28 22 L28 32 L24 38" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M28 26 L34 24" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M28 32 L32 38" stroke="#ec4899" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M34 24 L42 36" stroke="#db2777" strokeWidth="2.5" fill="none" />
              <path d="M34 24 L20 36" stroke="#db2777" strokeWidth="2.5" fill="none" />
              <path d="M20 36 L42 36" stroke="#db2777" strokeWidth="2.5" fill="none" />
              <circle cx="42" cy="44" r="8" fill="none" stroke="#1f2937" strokeWidth="2" />
              <circle cx="42" cy="44" r="1.5" fill="#1f2937" />
              <circle cx="20" cy="44" r="8" fill="none" stroke="#1f2937" strokeWidth="2" />
              <circle cx="20" cy="44" r="1.5" fill="#1f2937" />
              <circle cx="31" cy="36" r="3" fill="#f472b6" className="animate-spin-slow" style={{ transformOrigin: '31px 36px' }} />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge with Updated Text */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-purple-200 dark:border-purple-800 mb-8 shadow-lg">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
              {t('hero.welcome')}
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-6 mb-10">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
              {t('hero.title')}{' '}
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
              </span>
              <br />
              {t('hero.titleContinued')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={scrollToProducts}
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <ShoppingBag className="w-5 h-5 mr-2 relative z-10" />
              <span className="relative z-10">{browseLabel}</span>
              <ArrowRight className="w-5 h-5 ml-2 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={openCart}
              className="inline-flex items-center justify-center px-8 py-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white rounded-xl font-semibold border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-lg"
            >
              {t('hero.viewCart')}
            </button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-purple-200/50 dark:border-purple-800/50 shadow-sm">
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{t('hero.fastService')}</span>
            </div>
            <div className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-indigo-200/50 dark:border-indigo-800/50 shadow-sm">
              <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t('hero.safeCheckout')}</span>
            </div>
            <div className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-pink-200/50 dark:border-pink-800/50 shadow-sm">
              <span className="text-sm font-semibold text-pink-600 dark:text-pink-400">{t('hero.qualityGuaranteed')}</span>
            </div>
            <div className="px-6 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-blue-200/50 dark:border-blue-800/50 shadow-sm">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{t('hero.easyOrdering')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-white dark:text-gray-900"
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