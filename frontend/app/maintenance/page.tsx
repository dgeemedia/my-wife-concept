// frontend/app/maintenance/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Clock, Mail, Phone, MessageCircle } from 'lucide-react'

interface MaintenanceData {
  businessName: string
  logo?: string
  phone?: string
  whatsappNumber?: string
  email?: string
  primaryColor?: string
  suspensionReason?: string
  customMessage?: string
}

export default function MaintenancePage() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<MaintenanceData | null>(null)
  const slug = searchParams.get('slug')

  useEffect(() => {
    // In a real implementation, you'd fetch this from your API
    // For now, we'll use placeholder data
    setData({
      businessName: slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Our Business',
      phone: '+234 XXX XXX XXXX',
      whatsappNumber: '+234XXXXXXXXXX',
      email: 'support@business.com',
      primaryColor: '#3B82F6',
      suspensionReason: 'Subscription expired',
      customMessage: undefined
    })
  }, [slug])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleWhatsAppClick = () => {
    if (data.whatsappNumber) {
      const cleanNumber = data.whatsappNumber.replace(/[^0-9]/g, '')
      window.open(`https://wa.me/${cleanNumber}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Main Content */}
      <div className="max-w-2xl w-full">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with logo/icon */}
          <div 
            className="h-32 flex items-center justify-center"
            style={{ backgroundColor: data.primaryColor || '#3B82F6' }}
          >
            {data.logo ? (
              <img 
                src={data.logo} 
                alt={data.businessName}
                className="h-20 w-20 object-contain bg-white rounded-full p-2"
              />
            ) : (
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <Clock className="w-12 h-12 text-gray-700" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 text-center">
            {/* Main Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Platform Undergoing Maintenance
            </h1>

            {/* Subheading */}
            <div className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-100 rounded-full mb-6">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">Temporarily Unavailable</span>
            </div>

            {/* Message */}
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {data.customMessage || (
                <>
                  We're currently performing some updates to serve you better. 
                  <br className="hidden md:block" />
                  Please check back again soon.
                </>
              )}
            </p>

            {/* Reason (if subscription-related) */}
            {data.suspensionReason && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This platform is temporarily unavailable due to maintenance.
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Contact Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Need Assistance?
              </h2>

              <p className="text-gray-600 mb-6">
                Contact our support team for more information
              </p>

              {/* Contact Buttons */}
              <div className="grid md:grid-cols-3 gap-4">
                {/* WhatsApp */}
                {data.whatsappNumber && (
                  <button
                    onClick={handleWhatsAppClick}
                    className="flex flex-col items-center justify-center p-6 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl transition-all transform hover:scale-105 group"
                  >
                    <MessageCircle className="w-8 h-8 text-green-600 mb-2 group-hover:animate-bounce" />
                    <span className="text-sm font-medium text-green-700">WhatsApp</span>
                    <span className="text-xs text-green-600 mt-1">Chat with us</span>
                  </button>
                )}

                {/* Phone */}
                {data.phone && (
                  <a
                    href={`tel:${data.phone}`}
                    className="flex flex-col items-center justify-center p-6 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl transition-all transform hover:scale-105 group"
                  >
                    <Phone className="w-8 h-8 text-blue-600 mb-2 group-hover:animate-bounce" />
                    <span className="text-sm font-medium text-blue-700">Phone</span>
                    <span className="text-xs text-blue-600 mt-1">Call us</span>
                  </a>
                )}

                {/* Email */}
                {data.email && (
                  <a
                    href={`mailto:${data.email}`}
                    className="flex flex-col items-center justify-center p-6 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl transition-all transform hover:scale-105 group"
                  >
                    <Mail className="w-8 h-8 text-purple-600 mb-2 group-hover:animate-bounce" />
                    <span className="text-sm font-medium text-purple-700">Email</span>
                    <span className="text-xs text-purple-600 mt-1">Send a message</span>
                  </a>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Thank you for your patience and understanding
              </p>
              <p className="text-xs text-gray-400 mt-2">
                © {new Date().getFullYear()} {data.businessName}. All rights reserved.
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Floating Button */}
        {data.whatsappNumber && (
          <button
            onClick={handleWhatsAppClick}
            className="fixed bottom-6 right-6 w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all transform hover:scale-110 z-50 animate-pulse"
            aria-label="Contact via WhatsApp"
          >
            <MessageCircle className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  )
}