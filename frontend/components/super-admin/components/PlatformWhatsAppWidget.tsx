// frontend/components/super-admin/components/PlatformWhatsAppWidget.tsx
'use client'

import { useState } from 'react'
import { MessageCircle, X, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { PLATFORM_WHATSAPP } from '../constants/platform'
import { useTranslation } from 'react-i18next'

export default function PlatformWhatsAppWidget() {
  const { t } = useTranslation('landing')
  const [isOpen, setIsOpen] = useState(false)

  const openPlatformWhatsApp = (messageKey: string) => {
    const message = encodeURIComponent(t(messageKey))
    window.open(`https://wa.me/${PLATFORM_WHATSAPP}?text=${message}`, '_blank')
    setIsOpen(false)
    toast.success(t('whatsappWidget.opening'))
  }

  const quickMessages = [
    {
      key: 'whatsappWidget.messages.generalHelp',
      icon: '💬',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
    },
    {
      key: 'whatsappWidget.messages.setupStore',
      icon: '🏪',
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
    },
    {
      key: 'whatsappWidget.messages.pricing',
      icon: '💰',
      color: 'bg-green-50 hover:bg-green-100 border-green-200'
    },
    {
      key: 'whatsappWidget.messages.technicalIssue',
      icon: '🔧',
      color: 'bg-red-50 hover:bg-red-100 border-red-200'
    },
    {
      key: 'whatsappWidget.messages.multiLanguage',
      icon: '🌍',
      color: 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
    },
    {
      key: 'whatsappWidget.messages.payments',
      icon: '💳',
      color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200'
    },
    {
      key: 'whatsappWidget.messages.whatsappIntegration',
      icon: '📱',
      color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
    },
    {
      key: 'whatsappWidget.messages.customDomain',
      icon: '🔗',
      color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200'
    },
    {
      key: 'whatsappWidget.messages.migration',
      icon: '🚀',
      color: 'bg-pink-50 hover:bg-pink-100 border-pink-200'
    },
    {
      key: 'whatsappWidget.messages.bulkOrders',
      icon: '📦',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
    }
  ]

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50">
        {isOpen && (
          <div className="mb-4 w-[380px] max-h-[600px] animate-slide-up bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{t('whatsappWidget.title')}</h3>
                    <p className="text-sm text-green-100">{t('whatsappWidget.subtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Messages */}
            <div className="p-4 max-h-[500px] overflow-y-auto">
              <p className="text-sm text-gray-600 mb-3">{t('whatsappWidget.selectTopic')}</p>
              <div className="space-y-2">
                {quickMessages.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => openPlatformWhatsApp(msg.key)}
                    className={`w-full flex items-center justify-between p-3 border rounded-lg transition-all ${msg.color}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{msg.icon}</span>
                      <span className="text-sm font-medium text-gray-700 text-left">
                        {t(msg.key)}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>

              {/* Custom Message Option */}
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => openPlatformWhatsApp('whatsappWidget.messages.custom')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-lg"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  {t('whatsappWidget.customMessage')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all flex items-center justify-center group"
          aria-label="Open WhatsApp Chat"
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <MessageCircle className="w-7 h-7 group-hover:animate-bounce" />
          )}
        </button>
      </div>
    </>
  )
}