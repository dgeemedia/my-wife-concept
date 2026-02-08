// lib/subdomain.ts - CLIENT-SIDE ONLY
'use client'

export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null
  
  const host = window.location.hostname
  const parts = host.split('.')
  
  // Local development
  if (host === 'localhost' || host === '127.0.0.1') {
    // For testing, use localStorage or query params
    const params = new URLSearchParams(window.location.search)
    return params.get('subdomain') || localStorage.getItem('dev-subdomain') || null
  }
  
  // Production
  if (parts.length <= 2 || parts[0] === 'www') return null
  if (parts[0] === 'platform') return 'platform'
  
  return parts[0]
}

// Alternative: Use this in your pages/components
export function useSubdomain(): string | null {
  if (typeof window === 'undefined') return null
  
  const host = window.location.hostname
  const subdomain = host.split('.')[0]
  
  if (host.includes('localhost')) {
    // Local dev - allow override
    const override = localStorage.getItem('dev-subdomain')
    return override || (host === 'localhost' ? null : subdomain)
  }
  
  if (subdomain === 'www' || subdomain === 'mypadifood') return null
  return subdomain
}