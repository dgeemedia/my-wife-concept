// frontend/components/super-admin/components/PlatformWhatsAppWidget.tsx
'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { PLATFORM_WHATSAPP } from '../constants/platform'

export default function PlatformWhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)

  const openPlatformWhatsApp = () => {
    const message = encodeURIComponent('Hi, I need help with MyPadiFood platform')
    window.open(`https://wa.me/${PLATFORM_WHATSAPP}?text=${message}`, '_blank')
    setIsOpen(false)
    toast.success('Opening WhatsApp...')
  }

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
          <div className="mb-4 w-[320px] animate-slide-up bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold">Chat with Us</h3>
                    <p className="text-sm">Platform Support</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <button
                onClick={openPlatformWhatsApp}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chat
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all flex items-center justify-center"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      </div>
    </>
  )
}