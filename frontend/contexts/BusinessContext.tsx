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
 *
 * LOCAL DEV
 *   "houseofqg.localhost"      → "houseofqg"
 *   "chrenisfarm.localhost"    → "chrenisfarm"
 *   "localhost"                → null   (root / dashboard)
 *
 * PRODUCTION
 *   "chrenisfarm.mypadifood.com" → "chrenisfarm"
 *   "mypadifood.com"             → null
 *   "www.mypadifood.com"         → null
 */
function extractSubdomain(): string | null {
  if (typeof window === 'undefined') return null

  // Strip port  →  "houseofqg.localhost:3000" → "houseofqg.localhost"
  const host = window.location.hostname.split(':')[0]
  const parts = host.split('.')

  // ── LOCAL DEV: *.localhost ──────────────────────────────────
  if (parts[parts.length - 1] === 'localhost') {
    return parts.length >= 2 ? parts[0] : null
  }

  // ── PRODUCTION: *.domain.tld ─────────────────────────────────
  if (parts.length <= 2) return null
  if (parts[0] === 'www') return null

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
        // Bare "localhost" or root production domain — no tenant context
        setLoading(false)
        return
      }

      const response = await fetch(`/api/business/by-slug/${subdomain}`)

      if (!response.ok) {
        throw new Error(`Business '${subdomain}' not found`)
      }

      const data = await response.json()
      setBusiness(data)
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