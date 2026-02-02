// frontend/lib/businessContextHelper.ts
/**
 * Helper to extract business context from current domain
 * Use this in API routes and client-side fetches
 */

export function extractBusinessSlugFromHostname(hostname?: string): string | null {
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '')
  
  if (!host) return null
  
  // For local development
  if (host === 'localhost' || host.includes('127.0.0.1')) {
    // Check localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dev-business-slug') || null
    }
    return null
  }
  
  // Extract subdomain from hostname
  // Example: chrenisfarm.mypadifood.com -> chrenisfarm
  const parts = host.split('.')
  
  // If www.mypadifood.com or mypadifood.com (no subdomain)
  if (parts.length <= 2 || parts[0] === 'www') {
    return null
  }
  
  return parts[0] // Return subdomain
}

/**
 * Add business context header to fetch options
 */
export function addBusinessContextHeader(
  headers: HeadersInit = {}
): HeadersInit {
  const slug = extractBusinessSlugFromHostname()
  
  if (slug) {
    return {
      ...headers,
      'X-Business-Slug': slug
    }
  }
  
  return headers
}

/**
 * Create fetch wrapper that automatically adds business context
 */
export async function fetchWithBusinessContext(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = addBusinessContextHeader(options.headers)
  
  return fetch(url, {
    ...options,
    headers
  })
}