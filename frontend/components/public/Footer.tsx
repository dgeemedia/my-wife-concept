// components/public/Footer.tsx
'use client'

import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, MessageCircle } from 'lucide-react'
import { BusinessSettings } from '@/types'

interface FooterProps {
  settings?: BusinessSettings | null
}

export default function Footer({ settings }: FooterProps) {
  const currentYear = new Date().getFullYear()

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
              {settings?.description || 'Order delicious meals and get them delivered to your doorstep'}
            </p>
            <div className="flex space-x-4">
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.twitterUrl && (
                <a
                  href={settings.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-500 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
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
              {settings?.phone && (
                <li className="flex items-start">
                  <Phone className="w-5 h-5 text-primary-400 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{settings.phone}</p>
                    <p className="text-sm text-gray-400">Phone</p>
                  </div>
                </li>
              )}
              {settings?.footerEmail && (
                <li className="flex items-start">
                  <Mail className="w-5 h-5 text-primary-400 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{settings.footerEmail}</p>
                    <p className="text-sm text-gray-400">Email</p>
                  </div>
                </li>
              )}
              {settings?.footerAddress && (
                <li className="flex items-start">
                  <MapPin className="w-5 h-5 text-primary-400 mr-3 mt-1" />
                  <div>
                    <p className="font-medium">{settings.footerAddress}</p>
                    <p className="text-sm text-gray-400">Address</p>
                  </div>
                </li>
              )}
              {settings?.whatsappNumber && (
                <li className="flex items-start">
                  <MessageCircle className="w-5 h-5 text-green-400 mr-3 mt-1" />
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
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              `© ${currentYear} MyPadiFood. All rights reserved.`}
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