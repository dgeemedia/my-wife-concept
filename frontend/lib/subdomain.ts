// frontend/lib/subdomain.ts

/**
 * Extract subdomain from hostname
 * Works both client-side (browser) and server-side (Next.js)
 */
export function getSubdomain(hostname?: string): string | null {
  // Use provided hostname or get from browser
  let host = hostname;
  
  if (!host && typeof window !== 'undefined') {
    host = window.location.hostname;
  }
  
  if (!host) return null;
  
  // Remove port if present
  host = host.split(':')[0];
  
  // Local development - localhost
  if (host === 'localhost' || host === '127.0.0.1') {
    // For local testing, you can return a test slug
    // or return null to show landing page
    return null; // Change to 'chrenisfarm' for testing specific business
  }
  
  // Extract subdomain from hostname
  // Example: chrenisfarm.mypadifood.com → chrenisfarm
  const parts = host.split('.');
  
  // Special cases to ignore
  const ignoredSubdomains = ['www', 'platform', 'api', 'admin'];
  
  // If it's mypadifood.com (no subdomain) or ignored subdomain
  if (parts.length <= 2 || ignoredSubdomains.includes(parts[0])) {
    return null; // This is the landing page or special subdomain
  }
  
  // Return the subdomain (first part)
  return parts[0];
}

/**
 * Check if current page is the main landing page (no subdomain)
 */
export function isLandingPage(hostname?: string): boolean {
  return getSubdomain(hostname) === null;
}

/**
 * Check if current page is a business subdomain
 */
export function isBusinessSubdomain(hostname?: string): boolean {
  const subdomain = getSubdomain(hostname);
  return subdomain !== null && subdomain !== 'platform';
}

/**
 * Check if current page is the platform dashboard
 */
export function isPlatformSubdomain(hostname?: string): boolean {
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : '');
  return host.split('.')[0] === 'platform';
}

/**
 * Get subdomain from Next.js request headers (server-side)
 * Use this in API routes and server components
 */
export function getSubdomainFromHeaders(headers: Headers): string | null {
  const host = headers.get('host');
  return getSubdomain(host || undefined);
}