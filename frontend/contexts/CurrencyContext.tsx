// frontend/contexts/CurrencyContext.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useSettings } from './SettingsContext'
import { getCurrencySymbol } from '@/lib/currency'

interface CurrencyContextType {
  currency: string
  symbol: string
  format: (amount: number, currencyOverride?: string) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings()
  
  const currency = settings?.currency || 'NGN'
  const symbol = getCurrencySymbol(currency)
  
  const format = (amount: number, currencyOverride?: string): string => {
    const currencyCode = currencyOverride || currency
    const currencySymbol = getCurrencySymbol(currencyCode)
    
    // Special formatting for different currencies
    if (['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currencyCode)) {
      return `${currencySymbol}${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}`
    } else if (['NGN', 'GHS', 'KES', 'TZS', 'UGX', 'ZAR'].includes(currencyCode)) {
      return `${currencySymbol}${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      })}`
    } else if (['XOF', 'XAF', 'DZD', 'MAD', 'TND'].includes(currencyCode)) {
      return `${amount.toLocaleString('fr-FR', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      })} ${currencySymbol}`
    } else if (['EGP', 'SDG', 'SSP'].includes(currencyCode)) {
      return `${amount.toLocaleString('ar-EG')} ${currencySymbol}`
    } else {
      return `${currencySymbol}${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      })}`
    }
  }
  
  return (
    <CurrencyContext.Provider value={{ currency, symbol, format }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}