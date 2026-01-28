// frontend/lib/api.ts
// API client that uses your Next.js API routes (which handle cookies automatically)

class ApiClient {
  private baseUrl = '/api' // Use Next.js API routes, not backend directly

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    
    // Get token from localStorage as backup
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Important: Include cookies in all requests
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }), // Add Authorization header
        ...options.headers,
      },
    }

    const response = await fetch(url, config)
    
    // Parse response
    const contentType = response.headers.get('content-type')
    let data
    
    if (contentType?.includes('application/json')) {
      data = await response.json()
    } else {
      const text = await response.text()
      throw new Error(`Invalid response: ${text.substring(0, 100)}`)
    }

    // Handle errors
    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`)
    }

    return data
  }

  async get(endpoint: string) {
    return this.request(endpoint, {
      method: 'GET',
    })
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }
}

export default new ApiClient()