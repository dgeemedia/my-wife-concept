// frontend/lib/domain-helper.ts

export function getBaseDomain(): string {
  const env = process.env.NODE_ENV
  const customDomain = process.env.NEXT_PUBLIC_DOMAIN
  
  if (customDomain) {
    return customDomain
  }
  
  return env === 'production' ? 'mypadifood.com' : 'localhost:3000'
}

/**
 * Get the full business URL with protocol
 */
export function getBusinessUrl(slug: string): string {
  const baseDomain = getBaseDomain()
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  
  return `${protocol}://${slug}.${baseDomain}`
}

/**
 * Get the business domain without protocol
 */
export function getBusinessDomain(slug: string): string {
  const baseDomain = getBaseDomain()
  return `${slug}.${baseDomain}`
}

/**
 * Get the platform dashboard URL
 */
export function getPlatformUrl(): string {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const baseDomain = getBaseDomain()
  
  if (process.env.NODE_ENV === 'production') {
    return `${protocol}://platform.${baseDomain}`
  }
  
  return `${protocol}://platform.${baseDomain}`
}

/**
 * Check if current environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Get display domain for UI
 * In production: always shows .mypadifood.com
 * In development: shows .localhost:3000 for actual functionality
 * 
 * @param slug - Business slug
 * @param forDisplay - If true, shows production domain even in dev (for client-facing UI)
 */
export function getDisplayDomain(slug: string, forDisplay: boolean = false): string {
  // If this is for display purposes (client-facing), always show production domain
  if (forDisplay) {
    return `${slug}.mypadifood.com`
  }
  
  // Otherwise, show actual working domain based on environment
  return getBusinessDomain(slug)
}

/**
 * Format business URL for display in modals and UI
 * Shows production domain to clients, but actual domain internally
 */
export function formatBusinessUrlForDisplay(slug: string, showActualUrl: boolean = false): {
  displayUrl: string
  actualUrl: string
  protocol: string
} {
  const displayUrl = `${slug}.mypadifood.com`
  const actualUrl = getBusinessDomain(slug)
  const protocol = isProduction() ? 'https' : 'http'
  
  return {
    displayUrl,
    actualUrl: showActualUrl ? actualUrl : displayUrl,
    protocol
  }
}