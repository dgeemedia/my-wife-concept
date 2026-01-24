// frontend/components/dashboard/CurrencyProvider.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { formatCurrency } from '@/lib/currency'

interface CurrencyContextType {
  currency: string
  symbol: string
  format: (amount: number, options?: any) => string
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState('NGN')
  const [symbol, setSymbol] = useState('₦')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
      
      if (response.ok) {
        const settings = await response.json()
        setCurrency(settings.currency || 'NGN')
        setSymbol(getCurrencySymbol(settings.currency || 'NGN'))
      }
    } catch (error) {
      console.error('Failed to fetch currency settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrencySymbol = (currencyCode: string) => {
    const symbols: Record<string, string> = {
      'NGN': '₦', 'USD': '$', 'GBP': '£', 'EUR': '€',
      'KES': 'KSh', 'GHS': '₵', 'ZAR': 'R', 'XOF': 'CFA',
      'XAF': 'FCFA', 'EGP': 'E£', 'MAD': 'د.م.', 'TND': 'د.ت',
    }
    return symbols[currencyCode] || '₦'
  }

  const format = (amount: number, options?: any) => {
    return formatCurrency(amount, currency, options)
  }

  return (
    <CurrencyContext.Provider value={{ currency, symbol, format, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}