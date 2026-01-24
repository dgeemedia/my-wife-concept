// frontend/app/(public)/layout.tsx
'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { getCurrencySymbol } from '@/lib/currency'

// Create Currency Context
const CurrencyContext = createContext({ 
  currency: 'NGN', 
  symbol: '₦',
  format: (amount: number, options?: any) => `${'₦'}${amount.toLocaleString()}`
})

export const useCurrency = () => useContext(CurrencyContext)

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Function to fetch settings
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings?' + new Date().getTime(), {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings')
        }
        
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        console.error('Error fetching settings:', error)
        // Use default settings if fetch fails
        setSettings({
          businessName: 'My Business',
          primaryColor: '#10B981',
          secondaryColor: '#F59E0B',
          currency: 'NGN',
          logo: null
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()

    // Listen for settings updates from other tabs/windows
    const handleSettingsUpdate = (event: CustomEvent) => {
      setSettings(event.detail)
    }

    window.addEventListener('settings-updated' as any, handleSettingsUpdate as EventListener)
    
    return () => {
      window.removeEventListener('settings-updated' as any, handleSettingsUpdate as EventListener)
    }
  }, [])

  // Apply theme colors from settings
  useEffect(() => {
    if (settings) {
      const primaryColor = settings.primaryColor || '#10B981'
      const secondaryColor = settings.secondaryColor || '#F59E0B'
      
      // Set main color variables
      document.documentElement.style.setProperty('--color-primary', primaryColor)
      document.documentElement.style.setProperty('--color-secondary', secondaryColor)
      
      // Calculate and set color shades
      try {
        // Convert hex to RGB for opacity variations
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : { r: 16, g: 185, b: 129 } // Default teal
        }
        
        const primaryRgb = hexToRgb(primaryColor)
        const secondaryRgb = hexToRgb(secondaryColor)
        
        // Set RGB values for CSS use
        document.documentElement.style.setProperty('--color-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`)
        document.documentElement.style.setProperty('--color-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`)
        
        // Set opacity variants
        document.documentElement.style.setProperty('--color-primary-50', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)`)
        document.documentElement.style.setProperty('--color-primary-100', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`)
        document.documentElement.style.setProperty('--color-primary-200', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`)
        document.documentElement.style.setProperty('--color-primary-300', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`)
        document.documentElement.style.setProperty('--color-primary-400', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.4)`)
        document.documentElement.style.setProperty('--color-primary-500', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)`)
        document.documentElement.style.setProperty('--color-primary-600', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.6)`)
        document.documentElement.style.setProperty('--color-primary-700', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.7)`)
        document.documentElement.style.setProperty('--color-primary-800', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)`)
        document.documentElement.style.setProperty('--color-primary-900', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.9)`)
        
        // Set hover variants
        const darkenColor = (r: number, g: number, b: number, amount: number) => {
          return `rgb(${Math.max(0, r - amount)}, ${Math.max(0, g - amount)}, ${Math.max(0, b - amount)})`
        }
        
        const lightenColor = (r: number, g: number, b: number, amount: number) => {
          return `rgb(${Math.min(255, r + amount)}, ${Math.min(255, g + amount)}, ${Math.min(255, b + amount)})`
        }
        
        document.documentElement.style.setProperty('--color-primary-hover', darkenColor(primaryRgb.r, primaryRgb.g, primaryRgb.b, 20))
        document.documentElement.style.setProperty('--color-primary-light', lightenColor(primaryRgb.r, primaryRgb.g, primaryRgb.b, 40))
      } catch (error) {
        console.warn('Could not parse theme colors:', error)
      }
    }
  }, [settings])

  // Create currency formatting function
  const createCurrencyFormatter = (currencyCode: string) => {
    const symbol = getCurrencySymbol(currencyCode)
    
    return (amount: number, options?: {
      minimumFractionDigits?: number
      maximumFractionDigits?: number
      showSymbol?: boolean
    }) => {
      const {
        minimumFractionDigits = 0,
        maximumFractionDigits = 2,
        showSymbol = true
      } = options || {}
      
      // Special formatting for specific currencies
      if (['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currencyCode)) {
        // Western format: $1,234.56
        return `${showSymbol ? symbol : ''}${amount.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        })}`
      } else if (['NGN', 'GHS', 'KES', 'TZS', 'UGX', 'ZAR'].includes(currencyCode)) {
        // African format (usually whole numbers): ₦1,234
        return `${showSymbol ? symbol : ''}${amount.toLocaleString('en-US', { 
          minimumFractionDigits: minimumFractionDigits, 
          maximumFractionDigits: maximumFractionDigits 
        })}`
      } else if (['XOF', 'XAF', 'DZD', 'MAD', 'TND'].includes(currencyCode)) {
        // French African format: 1 234 CFA
        return `${amount.toLocaleString('fr-FR', { 
          minimumFractionDigits: minimumFractionDigits, 
          maximumFractionDigits: maximumFractionDigits 
        })}${showSymbol ? ` ${symbol}` : ''}`
      } else if (['EGP', 'SDG', 'SSP'].includes(currencyCode)) {
        // Arabic format: ١٬٢٣٤ E£
        return `${showSymbol ? '' : ''}${amount.toLocaleString('ar-EG')}${showSymbol ? ` ${symbol}` : ''}`
      } else {
        // Default format
        return `${showSymbol ? symbol : ''}${amount.toLocaleString('en-US', { 
          minimumFractionDigits: minimumFractionDigits, 
          maximumFractionDigits: maximumFractionDigits 
        })}`
      }
    }
  }

  // Create currency context value
  const currencyValue = {
    currency: settings?.currency || 'NGN',
    symbol: getCurrencySymbol(settings?.currency || 'NGN'),
    format: createCurrencyFormatter(settings?.currency || 'NGN')
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your store...</p>
        </div>
      </div>
    )
  }

  return (
    <SettingsProvider>
      <CurrencyContext.Provider value={currencyValue}>
        <div className="min-h-screen flex flex-col">
          <Header 
            businessName={settings?.businessName}
            logo={settings?.logo}
            primaryColor={settings?.primaryColor}
          />
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <CartDrawer />
        </div>
      </CurrencyContext.Provider>
    </SettingsProvider>
  )
}