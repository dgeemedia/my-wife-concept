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

/**
 * Extracts the business slug from window.location.hostname.
 */
function extractSubdomain(): string | null {
  if (typeof window === 'undefined') return null

  const host = window.location.hostname.split(':')[0]
  const parts = host.split('.')

  // LOCAL DEV: *.localhost
  if (parts[parts.length - 1] === 'localhost') {
    return parts.length >= 2 ? parts[0] : null
  }

  // PRODUCTION: *.domain.tld
  if (parts.length <= 2) return null
  if (parts[0] === 'www') return null

  // Ignore special subdomains
  const ignoredSubdomains = ['platform', 'api', 'admin']
  if (ignoredSubdomains.includes(parts[0])) return null

  return parts[0]
}

export function BusinessProvider({ children }: { children: ReactNode }) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBusiness = async () => {
    try {
      setLoading(true)
      setError(null)

      const subdomain = extractSubdomain()

      if (!subdomain) {
        // Root domain - no business context needed
        setBusiness(null)
        setLoading(false)
        return
      }

      const response = await fetch(`/api/business/by-slug/${subdomain}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Business '${subdomain}' not found`)
        }
        throw new Error(`Failed to load business: ${response.statusText}`)
      }

      const data = await response.json()
      setBusiness(data)
      setError(null)
    } catch (err: any) {
      console.error('Failed to fetch business:', err)
      setError(err.message || 'Failed to load business')
      setBusiness(null)
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