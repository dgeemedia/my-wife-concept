/**
 * API utility functions
 */

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Get authorization header with token
 */
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Handle API errors
 */
function handleApiError(error) {
  if (error.response) {
    return error.response.data?.error || 'An error occurred';
  }
  if (error.request) {
    return 'Network error. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred';
}

/**
 * Generic API request function
 */
async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, requiresAuth = false } = options;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
    ...(requiresAuth && getAuthHeaders()),
  };

  const config = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Auth API
export const authApi = {
  login: (credentials) => 
    apiRequest('/api/auth/login', { method: 'POST', body: credentials }),
  
  register: (data) => 
    apiRequest('/api/auth/register', { method: 'POST', body: data }),
  
  changePassword: (data) => 
    apiRequest('/api/auth/change-password', { 
      method: 'POST', 
      body: data, 
      requiresAuth: true 
    }),
  
  recoverPassword: (data) => 
    apiRequest('/api/auth/recover-password', { method: 'POST', body: data }),
  
  getSecurityQuestion: (email) => 
    apiRequest('/api/auth/security-question', { method: 'POST', body: { email } }),
  
  getMe: () => 
    apiRequest('/api/auth/me', { requiresAuth: true }),

  firstLogin: (data) => 
    apiRequest('/api/auth/first-login', { 
      method: 'POST', 
      body: data, 
      requiresAuth: true 
    }),
  
  setSecurityQuestion: (data) => 
    apiRequest('/api/auth/security-question', { 
      method: 'POST', 
      body: data, 
      requiresAuth: true 
    }),
  
  changePasswordWithCurrent: (data) => 
    apiRequest('/api/auth/change-password-with-current', { 
      method: 'POST', 
      body: data, 
      requiresAuth: true 
    }),
};

// Products API
export const productsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/products${query ? `?${query}` : ''}`);
  },
  
  getOne: (id) => 
    apiRequest(`/api/products/${id}`),
  
  create: (data) => 
    apiRequest('/api/products', { 
      method: 'POST', 
      body: data, 
      requiresAuth: true 
    }),
  
  update: (id, data) => 
    apiRequest(`/api/products/${id}`, { 
      method: 'PUT', 
      body: data, 
      requiresAuth: true 
    }),
  
  updateStock: (id, stock) => 
    apiRequest(`/api/products/${id}/stock`, { 
      method: 'PATCH', 
      body: { stock }, 
      requiresAuth: true 
    }),
  
  delete: (id) => 
    apiRequest(`/api/products/${id}`, { 
      method: 'DELETE', 
      requiresAuth: true 
    }),
};

// Orders API
export const ordersApi = {
  createQuick: (data) => 
    apiRequest('/api/orders', { method: 'POST', body: data }),
  
  checkout: (data) => 
    apiRequest('/api/orders/checkout', { method: 'POST', body: data }),
  
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/orders${query ? `?${query}` : ''}`, { requiresAuth: true });
  },
  
  getOne: (id) => 
    apiRequest(`/api/orders/${id}`, { requiresAuth: true }),
  
  exportCSV: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/orders/export/csv`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  },
  
  delete: (id) => 
    apiRequest(`/api/orders/${id}`, { 
      method: 'DELETE', 
      requiresAuth: true 
    }),

  confirmPayment: (orderId, data) =>
    apiRequest(`/api/orders/${orderId}/confirm-payment`, {
      method: 'POST',
      body: data,
      requiresAuth: true
    }),

  rejectPayment: (orderId, data) =>
    apiRequest(`/api/orders/${orderId}/reject-payment`, {
      method: 'POST',
      body: data,
      requiresAuth: true
    }),
};

// Users API
export const usersApi = {
  getAll: () => 
    apiRequest('/api/users', { requiresAuth: true }),
  
  getOne: (id) => 
    apiRequest(`/api/users/${id}`, { requiresAuth: true }),
  
  create: (data) => 
    apiRequest('/api/users', { 
      method: 'POST', 
      body: data, 
      requiresAuth: true 
    }),
  
  updateStatus: (id, active) => 
    apiRequest(`/api/users/${id}/status`, { 
      method: 'PATCH', 
      body: { active }, 
      requiresAuth: true 
    }),
  
  update: (id, data) => 
    apiRequest(`/api/users/${id}`, { 
      method: 'PUT', 
      body: data, 
      requiresAuth: true 
    }),
  
  delete: (id) => 
    apiRequest(`/api/users/${id}`, { 
      method: 'DELETE', 
      requiresAuth: true 
    }),
  
  resetPassword: (id) => 
    apiRequest(`/api/users/${id}/reset-password`, { 
      method: 'POST', 
      requiresAuth: true 
    }),
};

// Tracking API - NEW
export const trackingApi = {
  getOrdersByStatus: (status, limit = 50, offset = 0) => {
    const query = new URLSearchParams({ limit, offset }).toString();
    return apiRequest(`/api/tracking/status/${status}${query ? `?${query}` : ''}`, { 
      requiresAuth: true 
    });
  },
  
  getStatusStatistics: () => 
    apiRequest('/api/tracking/statistics', { requiresAuth: true }),
  
  updateOrderStatus: (orderId, status, notes) => 
    apiRequest(`/api/tracking/${orderId}/status`, {
      method: 'PATCH',
      body: { status, notes },
      requiresAuth: true
    }),
  
  cancelOrder: (orderId, reason) => 
    apiRequest(`/api/tracking/${orderId}/cancel`, {
      method: 'POST',
      body: { reason },
      requiresAuth: true
    }),
  
  getOrderStatusHistory: (orderId) => 
    apiRequest(`/api/tracking/${orderId}/history`, {
      requiresAuth: true
    }),
  
  bulkUpdateStatus: (orderIds, status, notes) => 
    apiRequest('/api/tracking/bulk-update', {
      method: 'POST',
      body: { orderIds, status, notes },
      requiresAuth: true
    }),
};

// Analytics API
export const analyticsApi = {
  getStats: () => 
    apiRequest('/api/admin/analytics', { requiresAuth: true }),
};

// Admin API
export const adminApi = {
  getAnalytics: () => 
    apiRequest('/api/admin/analytics', { requiresAuth: true }),
  
  getSalesStats: (period) => 
    apiRequest(`/api/admin/sales-stats/${period}`, { requiresAuth: true }),
  
  getDailySales: (days = 30) => 
    apiRequest(`/api/admin/daily-sales?days=${days}`, { requiresAuth: true }),
  
  getProductPerformance: () => 
    apiRequest('/api/admin/product-performance', { requiresAuth: true }),
  
  getCustomerInsights: () => 
    apiRequest('/api/admin/customer-insights', { requiresAuth: true }),
  
  getPaymentStats: () => 
    apiRequest('/api/admin/payment-stats', { requiresAuth: true }),
};

// Upload API
export const uploadApi = {
  image: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    return data;
  },
};

// Testimonials API
export const testimonialsApi = {
  getAll: () => apiRequest('/api/testimonials'),
};

export default {
  auth: authApi,
  products: productsApi,
  orders: ordersApi,
  users: usersApi,
  tracking: trackingApi,
  analytics: analyticsApi,
  admin: adminApi,
  upload: uploadApi,
  testimonials: testimonialsApi,
};