// frontend/lib/api.js

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, requiresAuth = false } = options;

  const requestHeaders = {
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
    ...(requiresAuth ? getAuthHeaders() : {}),
  };

  const config = { method, headers: requestHeaders };
  if (body) config.body = body instanceof FormData ? body : JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  // ✅ DON'T AUTO-REDIRECT ON 401 - Let calling code handle it
  const contentType = response.headers.get('content-type');
  const data = contentType && contentType.includes('application/json')
    ? await response.json()
    : { text: await response.text() };

  if (!response.ok) {
    throw new Error(data?.error || data?.message || 'API Error');
  }

  return data;
}

// Export all your API functions (keep existing ones)
export const authApi = {
  login: (credentials) =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: credentials,
    }),

  getMe: () =>
    apiRequest('/api/auth/me', { requiresAuth: true }),

  changePassword: (data) =>
    apiRequest('/api/auth/change-password', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  firstLogin: (data) =>
    apiRequest('/api/auth/first-login', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  setSecurityQuestion: (data) =>
    apiRequest('/api/auth/security-question', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),
};

/* =========================
   PRODUCTS API
========================= */
export const productsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/products${query ? `?${query}` : ''}`);
  },

  getOne: (id) => apiRequest(`/api/products/${id}`),

  create: (data) =>
    apiRequest('/api/products', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  update: (id, data) =>
    apiRequest(`/api/products/${id}`, {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    }),

  updateStock: (id, stock) =>
    apiRequest(`/api/products/${id}/stock`, {
      method: 'PATCH',
      body: { stock },
      requiresAuth: true,
    }),

  delete: (id) =>
    apiRequest(`/api/products/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

/* =========================
   ORDERS API
========================= */
export const ordersApi = {
  createQuick: (data) =>
    apiRequest('/api/orders', {
      method: 'POST',
      body: data,
    }),

  checkout: (data) =>
    apiRequest('/api/orders/checkout', {
      method: 'POST',
      body: data,
    }),

  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/orders${query ? `?${query}` : ''}`, {
      requiresAuth: true,
    });
  },

  getOne: (id) =>
    apiRequest(`/api/orders/${id}`, { requiresAuth: true }),

  confirmPayment: (orderId, data) =>
    apiRequest(`/api/orders/${orderId}/confirm-payment`, {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  rejectPayment: (orderId, data) =>
    apiRequest(`/api/orders/${orderId}/reject-payment`, {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  delete: (id) =>
    apiRequest(`/api/orders/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),

  exportCSV: async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/api/orders/export/csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Export failed');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

/* =========================
   USERS API
========================= */
export const usersApi = {
  getAll: () =>
    apiRequest('/api/users', { requiresAuth: true }),

  getOne: (id) =>
    apiRequest(`/api/users/${id}`, { requiresAuth: true }),

  create: (data) =>
    apiRequest('/api/users', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  update: (id, data) =>
    apiRequest(`/api/users/${id}`, {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    }),

  updateStatus: (id, active) =>
    apiRequest(`/api/users/${id}/status`, {
      method: 'PATCH',
      body: { active },
      requiresAuth: true,
    }),

  resetPassword: (id) =>
    apiRequest(`/api/users/${id}/reset-password`, {
      method: 'POST',
      requiresAuth: true,
    }),

  delete: (id) =>
    apiRequest(`/api/users/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

/* =========================
   TRACKING API
========================= */
export const trackingApi = {
  getOrdersByStatus: (status, limit = 50, offset = 0) =>
    apiRequest(
      `/api/tracking/status/${status}?limit=${limit}&offset=${offset}`,
      { requiresAuth: true }
    ),

  getStatusStatistics: () =>
    apiRequest('/api/tracking/statistics', {
      requiresAuth: true,
    }),

  updateOrderStatus: (orderId, status, notes) =>
    apiRequest(`/api/tracking/${orderId}/status`, {
      method: 'PATCH',
      body: { status, notes },
      requiresAuth: true,
    }),

  cancelOrder: (orderId, reason) =>
    apiRequest(`/api/tracking/${orderId}/cancel`, {
      method: 'POST',
      body: { reason },
      requiresAuth: true,
    }),

  getOrderStatusHistory: (orderId) =>
    apiRequest(`/api/tracking/${orderId}/history`, {
      requiresAuth: true,
    }),

  bulkUpdateStatus: (orderIds, status, notes) =>
    apiRequest('/api/tracking/bulk-update', {
      method: 'POST',
      body: { orderIds, status, notes },
      requiresAuth: true,
    }),
};

/* =========================
   ADMIN / ANALYTICS API
========================= */
export const analyticsApi = {
  getStats: () =>
    apiRequest('/api/admin/analytics', { requiresAuth: true }),
};

export const adminApi = {
  getAnalytics: () =>
    apiRequest('/api/admin/analytics', { requiresAuth: true }),

  getSalesStats: (period) =>
    apiRequest(`/api/admin/sales-stats/${period}`, {
      requiresAuth: true,
    }),

  getDailySales: (days = 30) =>
    apiRequest(`/api/admin/daily-sales?days=${days}`, {
      requiresAuth: true,
    }),

  getProductPerformance: () =>
    apiRequest('/api/admin/product-performance', {
      requiresAuth: true,
    }),

  getCustomerInsights: () =>
    apiRequest('/api/admin/customer-insights', {
      requiresAuth: true,
    }),

  getPaymentStats: () =>
    apiRequest('/api/admin/payment-stats', {
      requiresAuth: true,
    }),
};

/* =========================
   UPLOAD API
========================= */
export const uploadApi = {
  image: async (file) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');

    return data;
  },
};
/* =========================
   TESTIMONIALS API
========================= */
export const testimonialsApi = {
  getAll: () => apiRequest('/api/testimonials'),

  create: (data) =>
    apiRequest('/api/testimonials', {
      method: 'POST',
      body: data,
      requiresAuth: true,
    }),

  update: (id, data) =>
    apiRequest(`/api/testimonials/${id}`, {
      method: 'PUT',
      body: data,
      requiresAuth: true,
    }),

  delete: (id) =>
    apiRequest(`/api/testimonials/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

/* =========================
   SETTINGS API
========================= */
export const settingsApi = {
  getSettings: () => apiRequest('/api/settings'),
  
  updateSettings: (data) =>
    apiRequest('/api/settings', {
      method: 'PATCH',
      body: data,
      requiresAuth: true,
    }),
  
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    
    return apiRequest('/api/settings/logo', {
      method: 'POST',
      body: formData,
      requiresAuth: true,
    });
  },
  
  deleteLogo: () =>
    apiRequest('/api/settings/logo', {
      method: 'DELETE',
      requiresAuth: true,
    }),
};

/* =========================
   DEFAULT AGGREGATE EXPORT
   (DO NOT REMOVE)
========================= */
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
  settings: settingsApi,
};
