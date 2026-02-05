// frontend/components/super-admin/components/LandingHeader.tsx
'use client'

import { useRouter } from 'next/navigation'
import { Shield, MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PLATFORM_WHATSAPP } from '../constants/platform'
import LandingLanguageSwitcher from './LandingLanguageSwitcher'

interface LandingHeaderProps {
  activeView: 'landing' | 'businesses' | 'onboarding'
  setActiveView: (view: 'landing' | 'businesses' | 'onboarding') => void
}

export default function LandingHeader({ activeView, setActiveView }: LandingHeaderProps) {
  const router = useRouter()
  const { t } = useTranslation('landing')
  
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hi, I need help with MyPadiFood platform')
    window.open(`https://wa.me/${PLATFORM_WHATSAPP}?text=${message}`, '_blank')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveView('landing')}
          >
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">MyPadiFood</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setActiveView('landing')}
              className={`${activeView === 'landing' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {t('header.home')}
            </button>
            <button
              onClick={() => setActiveView('businesses')}
              className={`${activeView === 'businesses' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {t('header.businesses')}
            </button>
            <button
              onClick={() => setActiveView('onboarding')}
              className={`${activeView === 'onboarding' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {t('header.startBusiness')}
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            {/* Landing-Specific Language Switcher */}
            <LandingLanguageSwitcher />
            
            <button
              onClick={handleWhatsApp}
              className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="hidden sm:inline">{t('header.contactUs')}</span>
            </button>
            <button
              onClick={() => router.push('/platform/login')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {t('header.login')}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}