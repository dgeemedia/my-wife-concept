// frontend/components/public/Header.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/components/cart/CartProvider'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '@/components/public/LanguageSwitcher'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  businessName?: string
  logo?: string
  primaryColor?: string
}

export default function Header({ businessName = 'MyPadiFood', logo, primaryColor }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, openCart } = useCart()
  const { t } = useTranslation()

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              {logo ? (
                <Image
                  src={logo}
                  alt={businessName}
                  width={40}
                  height={40}
                  className="rounded-lg object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                     style={{ backgroundColor: primaryColor || 'var(--color-primary, #10B981)' }}>
                  <div className="w-8 h-8 bg-white rounded-md"></div>
                </div>
              )}
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {businessName}
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors">
              {t('header.home')}
            </Link>
            <Link href="#products" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors">
              View Store
            </Link>
            <Link href="/track" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors">
              {t('header.trackOrder')}
            </Link>
            <Link href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors">
              {t('header.contact')}
            </Link>
            <Link 
              href="/dashboard/login" 
              className="px-4 py-1 rounded-lg font-medium border transition-colors"
              style={{
                color: primaryColor || 'var(--color-primary, #10B981)',
                borderColor: primaryColor || 'var(--color-primary, #10B981)'
              }}
            >
              {t('header.login')}
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <LanguageSwitcher />
            <ThemeToggle />
            
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={t('header.cart')}
            >
              <ShoppingCart className="w-6 h-6 dark:text-white" />
              {itemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
                  style={{ backgroundColor: primaryColor || 'var(--color-primary, #10B981)' }}
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-6 h-6 dark:text-white" /> : <Menu className="w-6 h-6 dark:text-white" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                {t('header.home')}
              </Link>
              <Link 
                href="#products" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                View Store
              </Link>
              <Link 
                href="/track" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                {t('header.trackOrder')}
              </Link>
              <Link 
                href="#contact" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                {t('header.contact')}
              </Link>
              <Link 
                href="/dashboard/login" 
                className="px-4 py-2 rounded-lg font-medium border text-center"
                onClick={() => setMenuOpen(false)}
                style={{
                  color: primaryColor || 'var(--color-primary, #10B981)',
                  borderColor: primaryColor || 'var(--color-primary, #10B981)'
                }}
              >
                {t('header.login')}
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}