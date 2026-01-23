// components/public/Footer.tsx
'use client'

import { Facebook, Instagram, Mail, Phone, MapPin, MessageCircle, Linkedin, Youtube } from 'lucide-react'
import { BusinessSettings } from '@/types'

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
  ].filter(link => link.url) // Only show links that exist

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Business Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg"></div>
              </div>
              <div>
                <h3 className="font-bold text-xl">{settings?.businessName || 'MyPadiFood'}</h3>
                <p className="text-gray-400 text-sm">Fresh meals delivered</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              {settings?.footerText || settings?.description || 'Order delicious meals and get them delivered to your doorstep'}
            </p>
            
            {/* Social Media Links - Only show if there are any */}
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
                <a href="#products" className="text-gray-400 hover:text-white transition-colors">
                  Menu
                </a>
              </li>
              <li>
                <a href="/track" className="text-gray-400 hover:text-white transition-colors">
                  Track Order
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors">
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
                    <p className="font-medium">{settings.footerPhone || settings.phone}</p>
                    <p className="text-sm text-gray-400">Phone</p>
                  </div>
                </li>
              )}
              {(settings?.footerEmail || settings?.email) && (
                <li className="flex items-start">
                  <Mail className="w-5 h-5 text-primary-400 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{settings.footerEmail || settings.email}</p>
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
                    <p className="font-medium">{settings.whatsappNumber}</p>
                    <p className="text-sm text-gray-400">WhatsApp</p>
                  </div>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to get updates on new menu items and special offers.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent focus:outline-none"
              />
              <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-r-lg font-medium transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            {settings?.footerCopyright?.replace('{year}', currentYear.toString()) ||
              `© ${currentYear} ${settings?.businessName || 'MyPadiFood'}. All rights reserved.`}
          </p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Refund Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}