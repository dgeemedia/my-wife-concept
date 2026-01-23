// frontend/components/public/Header.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/components/cart/CartProvider'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  businessName?: string
  logo?: string
}

export default function Header({ businessName = 'MyPadiFood', logo }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, openCart } = useCart()

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
                     style={{ backgroundColor: 'var(--color-primary, #10B981)' }}>
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
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">
              Home
            </Link>
            <Link href="#products" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">
              Products
            </Link>
            <Link href="/track" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">
              Track Order
            </Link>
            <Link href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium">
              Contact
            </Link>
            <Link 
              href="/dashboard/login" 
              className="px-4 py-1 rounded-lg font-medium border transition-colors"
              style={{
                color: 'var(--color-primary, #10B981)',
                borderColor: 'var(--color-primary, #10B981)'
              }}
            >
              Admin Login
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ShoppingCart className="w-6 h-6 dark:text-white" />
              {itemCount > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--color-primary, #10B981)' }}
                >
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
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
                Home
              </Link>
              <Link 
                href="#products" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/track" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Track Order
              </Link>
              <Link 
                href="#contact" 
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                href="/dashboard/login" 
                className="px-4 py-2 rounded-lg font-medium border text-center"
                onClick={() => setMenuOpen(false)}
                style={{
                  color: 'var(--color-primary, #10B981)',
                  borderColor: 'var(--color-primary, #10B981)'
                }}
              >
                Admin Login
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}