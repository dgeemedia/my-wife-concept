// frontend/components/super-admin/components/LandingHeader.tsx
'use client'

import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PLATFORM_WHATSAPP } from '../constants/platform'
import LandingLanguageSwitcher from './LandingLanguageSwitcher'
import Image from 'next/image'
import { useState } from 'react'

interface LandingHeaderProps {
  activeView: 'landing' | 'businesses' | 'onboarding'
  setActiveView: (view: 'landing' | 'businesses' | 'onboarding') => void
}

export default function LandingHeader({ activeView, setActiveView }: LandingHeaderProps) {
  const router = useRouter()
  const { t } = useTranslation('landing')
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false)
  
  const handleWhatsApp = (messageKey: string) => {
    const message = encodeURIComponent(t(messageKey))
    window.open(`https://wa.me/${PLATFORM_WHATSAPP}?text=${message}`, '_blank')
    setShowWhatsAppMenu(false)
  }

  const quickMessages = [
    { key: 'whatsappWidget.messages.generalHelp', label: t('whatsappWidget.messages.generalHelp').substring(0, 40) + '...' },
    { key: 'whatsappWidget.messages.setupStore', label: t('whatsappWidget.messages.setupStore').substring(0, 40) + '...' },
    { key: 'whatsappWidget.messages.pricing', label: t('whatsappWidget.messages.pricing').substring(0, 40) + '...' },
    { key: 'whatsappWidget.messages.technicalIssue', label: t('whatsappWidget.messages.technicalIssue').substring(0, 40) + '...' }
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setActiveView('landing')}
          >
            <Image 
              src="/logo.svg" 
              alt="MyPadiFood Logo" 
              width={32} 
              height={32}
              className="w-8 h-8"
            />
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
            
            {/* WhatsApp with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
                className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="hidden sm:inline">{t('header.contactUs')}</span>
              </button>

              {showWhatsAppMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowWhatsAppMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-20 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 text-white">
                      <p className="font-semibold text-sm">{t('whatsappWidget.selectTopic')}</p>
                    </div>
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {quickMessages.map((msg, index) => (
                        <button
                          key={index}
                          onClick={() => handleWhatsApp(msg.key)}
                          className="w-full text-left px-3 py-2 hover:bg-green-50 rounded-lg transition-colors text-sm text-gray-700"
                        >
                          {msg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

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