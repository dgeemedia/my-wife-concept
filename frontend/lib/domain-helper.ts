// frontend/lib/domain-helper.ts
/**
 * Helper functions for domain management across environments
 */

/**
 * Get the base domain based on environment
 */
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
 * Get display domain for UI (shows production domain in both dev and prod)
 */
export function getDisplayDomain(slug: string, showDevDomain: boolean = false): string {
  if (showDevDomain && !isProduction()) {
    return `${slug}.localhost:3000`
  }
  return `${slug}.mypadifood.com`
}