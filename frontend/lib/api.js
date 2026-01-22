// frontend/lib/api.js
import { auth } from './auth';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/* =========================
   AUTH HEADER HELPER
========================= */
function getAuthHeaders() {
  const token = auth.getToken();
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

/* =========================
   TRY REFRESH
   Calls /api/auth/refresh with cookies included.
   Returns true if refreshed and local token was updated.
========================= */
async function tryRefreshToken() {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // important: send refresh cookie
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return false;
    const data = await res.json();
    if (data?.token) {
      auth.setToken(data.token);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Refresh token failed', err && err.message);
    return false;
  }
}

/* =========================
   GENERIC API REQUEST (with single retry on 401)
========================= */
async function apiRequest(endpoint, options = {}) {
  const {
    method = 'GET',
    body,
    headers = {},
    requiresAuth = false,
    _retry = false, // internal to avoid infinite loops
  } = options;

  if (requiresAuth && !auth.isAuthenticated()) {
    // If token expired but refresh available, try refresh
    if (auth.shouldRefresh()) {
      const refreshed = await tryRefreshToken();
      if (!refreshed) throw new Error('Not authenticated');
    } else {
      throw new Error('Not authenticated');
    }
  }

  const requestHeaders = {
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
    ...(requiresAuth ? getAuthHeaders() : {}),
  };

  const config = { method, headers: requestHeaders };
  if (body) config.body = body instanceof FormData ? body : JSON.stringify(body);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);

    const contentType = response.headers.get('content-type');
    const data =
      contentType && contentType.includes('application/json')
        ? await response.json()
        : { text: await response.text() };

    if (!response.ok) {
      // 401: try refresh once, then clear auth if still invalid
      if (response.status === 401 && !_retry) {
        const refreshed = await tryRefreshToken();
        if (refreshed) {
          // retry original request once
          return apiRequest(endpoint, { method, body, headers, requiresAuth, _retry: true });
        }
        auth.clear();
        if (typeof window !== 'undefined') window.location.href = '/admin/login';
        throw new Error('Not authenticated');
      }

      if (response.status === 403) {
        throw new Error('Forbidden');
      }

      throw new Error(data?.error || data?.message || 'API Error');
    }

    return data;
  } catch (error) {
    console.error('API Request failed:', { endpoint, message: error.message });
    throw error;
  }
}

/* =========================
   EXPORTS (auth, products, orders, users, tracking, admin, upload, testimonials)
   Recreate your original method signatures — adapt if you had other helper functions.
========================= */

export const authApi = {
  login: (credentials) => apiRequest('/api/auth/login', { method: 'POST', body: credentials }),
  register: (data) => apiRequest('/api/auth/register', { method: 'POST', body: data }),
  getMe: () => apiRequest('/api/auth/me', { requiresAuth: true }),
  changePassword: (data) => apiRequest('/api/auth/change-password', { method: 'POST', body: data, requiresAuth: true }),
  firstLogin: (data) => apiRequest('/api/auth/first-login', { method: 'POST', body: data, requiresAuth: true }),
  setSecurityQuestion: (data) => apiRequest('/api/auth/security-question', { method: 'POST', body: data, requiresAuth: true }),
};

export const productsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/products${query ? `?${query}` : ''}`);
  },
  getOne: (id) => apiRequest(`/api/products/${id}`),
  create: (data) => apiRequest('/api/products', { method: 'POST', body: data, requiresAuth: true }),
  update: (id, data) => apiRequest(`/api/products/${id}`, { method: 'PUT', body: data, requiresAuth: true }),
  updateStock: (id, stock) => apiRequest(`/api/products/${id}/stock`, { method: 'PATCH', body: { stock }, requiresAuth: true }),
  delete: (id) => apiRequest(`/api/products/${id}`, { method: 'DELETE', requiresAuth: true }),
};

export const ordersApi = {
  createQuick: (data) => apiRequest('/api/orders', { method: 'POST', body: data }),
  checkout: (data) => apiRequest('/api/orders/checkout', { method: 'POST', body: data }),
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/api/orders${query ? `?${query}` : ''}`, { requiresAuth: true });
  },
  getOne: (id) => apiRequest(`/api/orders/${id}`, { requiresAuth: true }),
  confirmPayment: (orderId, data) => apiRequest(`/api/orders/${orderId}/confirm-payment`, { method: 'POST', body: data, requiresAuth: true }),
  rejectPayment: (orderId, data) => apiRequest(`/api/orders/${orderId}/reject-payment`, { method: 'POST', body: data, requiresAuth: true }),
  delete: (id) => apiRequest(`/api/orders/${id}`, { method: 'DELETE', requiresAuth: true }),
  exportCSV: async () => {
    const token = auth.getToken();
    if (!token) throw new Error('Not authenticated');
    const res = await fetch(`${API_URL}/api/orders/export/csv`, { headers: { Authorization: `Bearer ${token}` } });
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

export const usersApi = {
  getAll: () => apiRequest('/api/users', { requiresAuth: true }),
  getOne: (id) => apiRequest(`/api/users/${id}`, { requiresAuth: true }),
  create: (data) => apiRequest('/api/users', { method: 'POST', body: data, requiresAuth: true }),
  update: (id, data) => apiRequest(`/api/users/${id}`, { method: 'PUT', body: data, requiresAuth: true }),
  updateStatus: (id, active) => apiRequest(`/api/users/${id}/status`, { method: 'PATCH', body: { active }, requiresAuth: true }),
  resetPassword: (id) => apiRequest(`/api/users/${id}/reset-password`, { method: 'POST', requiresAuth: true }),
  delete: (id) => apiRequest(`/api/users/${id}`, { method: 'DELETE', requiresAuth: true }),
};

export const trackingApi = {
  getOrdersByStatus: (status, limit = 50, offset = 0) => apiRequest(`/api/tracking/status/${status}?limit=${limit}&offset=${offset}`, { requiresAuth: true }),
  getStatusStatistics: () => apiRequest('/api/tracking/statistics', { requiresAuth: true }),
  updateOrderStatus: (orderId, status, notes) => apiRequest(`/api/tracking/${orderId}/status`, { method: 'PATCH', body: { status, notes }, requiresAuth: true }),
  cancelOrder: (orderId, reason) => apiRequest(`/api/tracking/${orderId}/cancel`, { method: 'POST', body: { reason }, requiresAuth: true }),
  getOrderStatusHistory: (orderId) => apiRequest(`/api/tracking/${orderId}/history`, { requiresAuth: true }),
  bulkUpdateStatus: (orderIds, status, notes) => apiRequest('/api/tracking/bulk-update', { method: 'POST', body: { orderIds, status, notes }, requiresAuth: true }),
};

export const analyticsApi = {
  getStats: () => apiRequest('/api/admin/analytics', { requiresAuth: true }),
};

export const adminApi = {
  getAnalytics: () => apiRequest('/api/admin/analytics', { requiresAuth: true }),
  getSalesStats: (period) => apiRequest(`/api/admin/sales-stats/${period}`, { requiresAuth: true }),
  getDailySales: (days = 30) => apiRequest(`/api/admin/daily-sales?days=${days}`, { requiresAuth: true }),
  getProductPerformance: () => apiRequest('/api/admin/product-performance', { requiresAuth: true }),
  getCustomerInsights: () => apiRequest('/api/admin/customer-insights', { requiresAuth: true }),
  getPaymentStats: () => apiRequest('/api/admin/payment-stats', { requiresAuth: true }),
};

export const uploadApi = {
  image: async (file) => {
    const token = auth.getToken();
    if (!token) throw new Error('Not authenticated');
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};

export const testimonialsApi = {
  getAll: () => apiRequest('/api/testimonials'),
  create: (data) => apiRequest('/api/testimonials', { method: 'POST', body: data, requiresAuth: true }),
  update: (id, data) => apiRequest(`/api/testimonials/${id}`, { method: 'PUT', body: data, requiresAuth: true }),
  delete: (id) => apiRequest(`/api/testimonials/${id}`, { method: 'DELETE', requiresAuth: true }),
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
