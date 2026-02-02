// frontend/lib/subdomain.ts

export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For testing locally, you can return a test slug
    return 'chrenisfarm';
  }
  
  // Extract subdomain from hostname
  // Example: chrenisfarm.mypadifood.com → chrenisfarm
  const parts = hostname.split('.');
  
  // If it's www.mypadifood.com or mypadifood.com (no subdomain)
  if (parts.length <= 2 || parts[0] === 'www') {
    return null; // This is the landing page
  }
  
  // Return the subdomain (first part)
  return parts[0];
}

export function isLandingPage(): boolean {
  return getSubdomain() === null;
}