// frontend/lib/auth.ts
// Cookie-based authentication (matches your auth API route)

export function setToken(token: string) {
  // Store in localStorage as backup (for client-side checks)
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
  }
  
  // Cookie is set by the API route, so we don't need to set it here
  // The auth API route already does: res.cookies.set('auth_token', data.token, ...)
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  
  // Try to get from cookie first
  const cookies = document.cookie.split(';')
  const authCookie = cookies.find(c => c.trim().startsWith('auth_token='))
  if (authCookie) {
    return authCookie.split('=')[1]
  }
  
  // Fallback to localStorage
  return localStorage.getItem('token')
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
    
    // Clear cookie by setting it to expire
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}