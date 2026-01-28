// components/public/Footer.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Facebook, Instagram, Mail, Phone, MapPin, MessageCircle, Linkedin, Youtube, Send } from 'lucide-react'
import { BusinessSettings } from '@/types'
import toast from 'react-hot-toast'

interface FooterProps {
  settings?: BusinessSettings | null
}

// X (Twitter) SVG Icon
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// TikTok SVG Icon
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  // Collect social media links dynamically
  const socialLinks = [
    {
      url: settings?.facebookUrl,
      icon: Facebook,
      label: 'Facebook',
      hoverColor: 'hover:bg-blue-600'
    },
    {
      url: settings?.instagramUrl,
      icon: Instagram,
      label: 'Instagram',
      hoverColor: 'hover:bg-pink-600'
    },
    {
      url: settings?.twitterUrl,
      icon: XIcon,
      label: 'X (Twitter)',
      hoverColor: 'hover:bg-gray-900'
    },
    {
      url: settings?.linkedinUrl,
      icon: Linkedin,
      label: 'LinkedIn',
      hoverColor: 'hover:bg-blue-700'
    },
    {
      url: settings?.tiktokUrl,
      icon: TikTokIcon,
      label: 'TikTok',
      hoverColor: 'hover:bg-black'
    },
    {
      url: settings?.youtubeUrl,
      icon: Youtube,
      label: 'YouTube',
      hoverColor: 'hover:bg-red-600'
    },
  ].filter(link => link.url)

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setSubscribing(true)

    try {
      // Create WhatsApp message for newsletter subscription
      const message = `Newsletter Subscription Request

Email: ${email}
Business: ${settings?.businessName || 'MyBusiness'}
Date: ${new Date().toLocaleString()}

Please add me to your newsletter mailing list for updates on new products and special offers.`

      const whatsappNumber = settings?.whatsappNumber?.replace(/[^\d]/g, '') || ''
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_blank')

      // Show success message
      toast.success('Opening WhatsApp to complete subscription!')
      
      // Clear email input
      setEmail('')
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('Failed to process subscription. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  // Get newsletter text based on business type
  const getNewsletterText = () => {
    const businessType = settings?.businessType || 'food'
    const texts = {
      food: 'Subscribe to get updates on new menu items and special offers.',
      fashion: 'Get notified about new arrivals, exclusive deals, and fashion trends.',
      electronics: 'Stay updated with the latest gadgets, tech deals, and product launches.',
      pharmacy: 'Receive health tips, product updates, and special wellness offers.',
      hotel: 'Get exclusive booking deals, seasonal offers, and travel tips.',
      farm: 'Fresh harvest alerts, seasonal produce updates, and farm news.',
      shortlet: 'New property listings, special rates, and booking deals.',
      default: 'Subscribe for updates on new products and exclusive offers.'
    }
    return texts[businessType as keyof typeof texts] || texts.default
  }

  return (
    <footer className="bg-gray-900 dark:bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Business Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.businessName || 'Business Logo'}
                  width={40}
                  height={40}
                  className="rounded-lg object-contain"
                />
              ) : (
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg"></div>
                </div>
              )}
              <div>
                <h3 className="font-bold text-xl">{settings?.businessName || 'MyBusiness'}</h3>
              </div>
            </div>
            
            {/* Business Motto */}
            {settings?.businessMotto && (
              <p className="text-primary-400 text-sm italic mb-4">
                "{settings.businessMotto}"
              </p>
            )}
            
            <p className="text-gray-400 mb-6">
              {settings?.footerText || settings?.description || 'Quality products and excellent service delivered to your doorstep.'}
            </p>
            
            {/* Social Media Links */}
            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link, index) => {
                  const IconComponent = link.icon
                  return (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center ${link.hoverColor} transition-colors`}
                      title={link.label}
                    >
                      <IconComponent />
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/#products" className="text-gray-400 hover:text-white transition-colors">
                  {settings?.businessType === 'hotel' || settings?.businessType === 'shortlet' ? 'Listings' : 'Products'}
                </a>
              </li>
              <li>
                <a href="/track" className="text-gray-400 hover:text-white transition-colors">
                  Track Order
                </a>
              </li>
              <li>
                <a href="/#contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              {(settings?.footerPhone || settings?.phone) && (
                <li className="flex items-start">
                  <Phone className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <a 
                      href={`tel:${settings.footerPhone || settings.phone}`}
                      className="font-medium hover:text-primary-400 transition-colors"
                    >
                      {settings.footerPhone || settings.phone}
                    </a>
                    <p className="text-sm text-gray-400">Phone</p>
                  </div>
                </li>
              )}
              {(settings?.footerEmail || settings?.email) && (
                <li className="flex items-start">
                  <Mail className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <a 
                      href={`mailto:${settings.footerEmail || settings.email}`}
                      className="font-medium hover:text-primary-400 transition-colors break-all"
                    >
                      {settings.footerEmail || settings.email}
                    </a>
                    <p className="text-sm text-gray-400">Email</p>
                  </div>
                </li>
              )}
              {(settings?.footerAddress || settings?.address) && (
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{settings.footerAddress || settings.address}</p>
                    <p className="text-sm text-gray-400">Address</p>
                  </div>
                </li>
              )}
              {settings?.whatsappNumber && (
                <li className="flex items-start">
                  <MessageCircle className="w-5 h-5 text-green-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <a 
                      href={`https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-green-400 transition-colors"
                    >
                      {settings.whatsappNumber}
                    </a>
                    <p className="text-sm text-gray-400">WhatsApp</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-gray-400 mb-4 text-sm">
              {getNewsletterText()}
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="flex">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  disabled={subscribing}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                />
                <button 
                  type="submit"
                  disabled={subscribing || !email}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-r-lg font-medium transition-colors flex items-center justify-center min-w-[60px]"
                >
                  {subscribing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                We'll contact you via WhatsApp to confirm your subscription
              </p>
            </form>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            {settings?.footerCopyright?.replace('{year}', currentYear.toString()) ||
              `© ${currentYear} ${settings?.businessName || 'MyBusiness'}. All rights reserved.`}
          </p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#refund" className="hover:text-white transition-colors">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}