// frontend/contexts/SettingsContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { BusinessSettings } from '@/types'
import { applyThemeColors } from '@/lib/colorUtils'

interface SettingsContextType {
  settings: BusinessSettings | null
  loading: boolean
  refreshSettings: () => Promise<void>
  formatCurrency: (amount: number) => string
  t: (key: string) => string
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

const translations: Record<string, Record<string, string>> = {
  en: {
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.total': 'Total',
    'cart.checkout': 'Checkout',
    'product.addToCart': 'Add to Cart',
    'product.outOfStock': 'Out of Stock',
    'order.pending': 'Pending',
    'order.confirmed': 'Confirmed',
    'order.delivered': 'Delivered',
  },
  yo: {
    'cart.title': 'Àpótí Rírà',
    'cart.empty': 'Àpótí rẹ ṣófo',
    'cart.total': 'Àpapọ̀',
    'cart.checkout': 'Sanwó',
    'product.addToCart': 'Fi sí Àpótí',
    'product.outOfStock': 'Kò sí ní ìpamọ́',
    'order.pending': 'Ń dúró',
    'order.confirmed': 'Jẹ́rìísí',
    'order.delivered': 'Ti fi ránṣẹ́',
  },
  ig: {
    'cart.title': 'Akpa Ịzụta',
    'cart.empty': 'Akpa gị tọgbọrọ chakoo',
    'cart.total': 'Ngụkọta',
    'cart.checkout': 'Kwụọ Ụgwọ',
    'product.addToCart': 'Tinye na Akpa',
    'product.outOfStock': 'Ọ nweghị',
    'order.pending': 'Na-echere',
    'order.confirmed': 'Ekwenyela',
    'order.delivered': 'Enyefela',
  },
  ha: {
    'cart.title': 'Jakar Sayayya',
    'cart.empty': 'Jakar ku babu kome',
    'cart.total': 'Jimilla',
    'cart.checkout': 'Biya',
    'product.addToCart': 'Saka a Jaka',
    'product.outOfStock': 'Babu',
    'order.pending': 'Jira',
    'order.confirmed': 'An Tabbatar',
    'order.delivered': 'An Isarwa',
  },
}

const currencySymbols: Record<string, string> = {
  NGN: '₦',
  USD: '$',
  GBP: '£',
  EUR: '€',
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSettings = async () => {
    try {
      // Force fresh data by adding cache-busting parameter
      const timestamp = Date.now()
      const response = await fetch(`/api/settings?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.status}`)
      }
      
      const data = await response.json()
      setSettings(data)
      
      // Apply theme colors to CSS variables with RGB support
      if (data.primaryColor && data.secondaryColor) {
        applyThemeColors(data.primaryColor, data.secondaryColor)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      // Set default settings on error
      setSettings({
        id: 1,
        businessName: 'My Business',
        businessType: 'food',
        phone: '',
        whatsappNumber: '',
        currency: 'NGN',
        language: 'en',
        primaryColor: '#10B981',
        secondaryColor: '#F59E0B',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as BusinessSettings)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
    
    // Listen for settings updates from other parts of the app
    const handleSettingsUpdate = (event: any) => {
      if (event.detail) {
        setSettings(event.detail)
        // Apply theme colors immediately with RGB support
        if (event.detail.primaryColor && event.detail.secondaryColor) {
          applyThemeColors(event.detail.primaryColor, event.detail.secondaryColor)
        }
      } else {
        fetchSettings()
      }
    }
    
    window.addEventListener('settings-updated', handleSettingsUpdate)
    
    return () => {
      window.removeEventListener('settings-updated', handleSettingsUpdate)
    }
  }, [])

  const formatCurrency = (amount: number): string => {
    const currency = settings?.currency || 'NGN'
    const symbol = currencySymbols[currency] || currency
    
    // Format the number with proper localization
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })
    
    return `${symbol}${formattedAmount}`
  }

  const t = (key: string): string => {
    const language = settings?.language || 'en'
    return translations[language]?.[key] || translations['en'][key] || key
  }

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        loading, 
        refreshSettings: fetchSettings,
        formatCurrency,
        t
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}