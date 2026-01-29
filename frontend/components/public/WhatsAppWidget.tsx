// components/public/WhatsAppWidget.tsx
'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Send, HelpCircle, Package, Phone } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import toast from 'react-hot-toast'

interface QuickMessage {
  id: string
  icon: React.ElementType
  label: string
  message: string
  color: string
  gradient: string
}

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const { settings } = useSettings()

  // Show widget after a short delay for smooth entrance
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const quickMessages: QuickMessage[] = [
    {
      id: 'booking',
      icon: Package,
      label: 'Need help with booking?',
      message: `Hi! I need help with booking/ordering from ${settings?.businessName || 'your store'}. Can you assist me?`,
      color: 'from-blue-500 to-cyan-500',
      gradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    },
    {
      id: 'tracking',
      icon: Package,
      label: 'How do I track my order?',
      message: `Hello! I'd like to track my order. Can you help me with the tracking details?`,
      color: 'from-purple-500 to-pink-500',
      gradient: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    },
    {
      id: 'general',
      icon: HelpCircle,
      label: 'General Enquiry',
      message: `Hi! I have a general question about ${settings?.businessName || 'your business'}. Can we chat?`,
      color: 'from-green-500 to-emerald-500',
      gradient: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    },
    {
      id: 'support',
      icon: Phone,
      label: 'Customer Support',
      message: `Hello! I need customer support. Is anyone available to help me?`,
      color: 'from-orange-500 to-red-500',
      gradient: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
    },
  ]

  const openWhatsApp = (message: string) => {
    const whatsappNumber = settings?.whatsappNumber?.replace(/[^\d]/g, '') || ''
    
    if (!whatsappNumber) {
      toast.error('WhatsApp number not configured')
      return
    }

    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
    setCustomMessage('')
    toast.success('Opening WhatsApp...')
  }

  const handleCustomMessageSend = () => {
    if (!customMessage.trim()) {
      toast.error('Please type a message')
      return
    }
    openWhatsApp(customMessage)
  }

  const handleQuickMessageClick = (message: string) => {
    openWhatsApp(message)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Chat Widget Container */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Panel */}
        {isOpen && (
          <div className="mb-4 w-[380px] max-w-[calc(100vw-3rem)] animate-slide-up-fade">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 translate-y-12"></div>
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <MessageCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Chat with Us</h3>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <p className="text-sm text-white/90">Online now</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {/* Welcome Message */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    👋 Hi! How can we help you today? Choose a quick option below or type your message.
                  </p>
                </div>

                {/* Quick Messages */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Quick Messages
                  </p>
                  {quickMessages.map((msg, index) => {
                    const Icon = msg.icon
                    return (
                      <button
                        key={msg.id}
                        onClick={() => handleQuickMessageClick(msg.message)}
                        className={`w-full ${msg.gradient} p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-left group animate-slide-in-right`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${msg.color} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 flex-1">
                            {msg.label}
                          </span>
                          <Send className="w-4 h-4 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Custom Message */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Or Type Your Message
                  </p>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomMessageSend()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    />
                    <button
                      onClick={handleCustomMessageSend}
                      disabled={!customMessage.trim()}
                      className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all hover:shadow-lg disabled:shadow-none flex items-center justify-center min-w-[50px]"
                      aria-label="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Footer Note */}
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
                  You'll be redirected to WhatsApp to continue the conversation
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 flex items-center justify-center group ${
            isOpen ? 'rotate-0' : 'animate-bounce-subtle'
          }`}
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? (
            <X className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 group-hover:scale-110 transition-transform" />
              {/* Notification Dot */}
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes slide-up-fade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes bounce-subtle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-slide-up-fade {
          animation: slide-up-fade 0.3s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
          opacity: 0;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}