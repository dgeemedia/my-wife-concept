// frontend/components/public/Header.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/components/cart/CartProvider'
import ThemeToggle from './ThemeToggle'

interface HeaderProps {
  businessName?: string
}

export default function Header({ businessName = 'MyPadiFood' }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, openCart } = useCart()

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">{businessName}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">
              Home
            </Link>
            <Link href="#products" className="text-gray-700 hover:text-primary-600 font-medium">
              Products
            </Link>
            <Link href="/track" className="text-gray-700 hover:text-primary-600 font-medium">
              Track Order
            </Link>
            <Link href="#contact" className="text-gray-700 hover:text-primary-600 font-medium">
              Contact
            </Link>
            {/* Admin Login Link */}
            <Link 
              href="/dashboard/login" 
              className="text-primary-600 hover:text-primary-700 font-medium border border-primary-600 px-4 py-1 rounded-lg"
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
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <div className="md:hidden border-t py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="#products" 
                className="text-gray-700 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                href="/track" 
                className="text-gray-700 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Track Order
              </Link>
              <Link 
                href="#contact" 
                className="text-gray-700 hover:text-primary-600 font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Link>
              {/* Admin Login Link (Mobile) */}
              <Link 
                href="/dashboard/login" 
                className="text-primary-600 hover:text-primary-700 font-medium border border-primary-600 px-4 py-2 rounded-lg text-center"
                onClick={() => setMenuOpen(false)}
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