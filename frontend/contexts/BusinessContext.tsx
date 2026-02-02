// frontend/contexts/BusinessContext.tsx
'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Business {
  id: number
  slug: string
  businessName: string
  businessType: string
  phone: string
  whatsappNumber: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  currency?: string
  language?: string
}

interface BusinessContextType {
  business: Business | null
  loading: boolean
  error: string | null
  refreshBusiness: () => Promise<void>
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const extractSubdomain = () => {
    if (typeof window === 'undefined') return null
    
    const hostname = window.location.hostname
    
    // For local development
    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
      // Check localStorage or return default for testing
      return localStorage.getItem('dev-business-slug') || 'chrenisfarm'
    }
    
    // Extract subdomain
    // Example: chrenisfarm.mypadifood.com -> chrenisfarm
    const parts = hostname.split('.')
    
    // If www.mypadifood.com or mypadifood.com (no subdomain)
    if (parts.length <= 2 || parts[0] === 'www') {
      return null
    }
    
    return parts[0]
  }

  const fetchBusiness = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const subdomain = extractSubdomain()
      
      if (!subdomain) {
        // No subdomain - this is the main landing page
        // Use default business or don't load business context
        setLoading(false)
        return
      }
      
      const response = await fetch(`/api/business/by-slug/${subdomain}`)
      
      if (!response.ok) {
        throw new Error(`Business '${subdomain}' not found`)
      }
      
      const data = await response.json()
      setBusiness(data)
      
      // Store in localStorage for dev purposes
      if (hostname.includes('localhost')) {
        localStorage.setItem('dev-business-slug', subdomain)
      }
    } catch (err: any) {
      console.error('Failed to fetch business:', err)
      setError(err.message || 'Failed to load business')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBusiness()
  }, [])

  const refreshBusiness = async () => {
    await fetchBusiness()
  }

  return (
    <BusinessContext.Provider 
      value={{ 
        business, 
        loading, 
        error,
        refreshBusiness 
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusiness() {
  const context = useContext(BusinessContext)
  if (context === undefined) {
    throw new Error('useBusiness must be used within BusinessProvider')
  }
  return context
}