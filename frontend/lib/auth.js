// frontend/lib/auth.js
const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const TOKEN_EXPIRY_KEY = 'token_expiry';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/* ============================
   INTERNAL HELPERS
============================ */

/** Decode JWT payload safely */
function decodeJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

/** Store token + expiry */
function storeToken(token) {
  localStorage.setItem(TOKEN_KEY, token);

  const payload = decodeJwt(token);
  if (payload?.exp) {
    localStorage.setItem(TOKEN_EXPIRY_KEY, payload.exp * 1000);
  } else {
    // fallback 24h
    localStorage.setItem(TOKEN_EXPIRY_KEY, Date.now() + 24 * 60 * 60 * 1000);
    console.warn('⚠️ JWT has no exp — using fallback expiry');
  }
}

/** Clear auth */
function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  console.log('✅ Auth data cleared');
}

/* ============================
   AUTH OBJECT
============================ */
export const auth = {
  /* ----- BASIC STORAGE ----- */
  setToken(token) {
    if (typeof window === 'undefined') return;
    storeToken(token);
    console.log('✅ Token stored');
  },

  getToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setUser(user) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  clear() {
    if (typeof window === 'undefined') return;
    clearAuth();
  },

  /* ----- SESSION STATE ----- */
  isAuthenticated() {
    if (typeof window === 'undefined') return false;

    const token = this.getToken();
    const expiryRaw = localStorage.getItem(TOKEN_EXPIRY_KEY);
    const expiry = Number(expiryRaw);

    if (!token || !expiryRaw || Number.isNaN(expiry)) {
      clearAuth();
      return false;
    }

    if (Date.now() > expiry) {
      clearAuth();
      return false;
    }

    return true;
  },

  shouldRefresh() {
    const expiryRaw = localStorage.getItem(TOKEN_EXPIRY_KEY);
    const expiry = Number(expiryRaw);
    if (!expiryRaw || Number.isNaN(expiry)) return false;
    return Date.now() > expiry - 5 * 60 * 1000; // < 5 min left
  },

  /* ----- LOGIN / LOGOUT ----- */
  async login(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error || 'Login failed');

    this.setToken(data.token);
    this.setUser(data.user);

    return data.user;
  },

  async logout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
    } catch {}
    finally {
      clearAuth();
    }
  },

  /* ----- TOKEN REFRESH ----- */
  async refreshToken() {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.token) throw new Error('Refresh failed');

      storeToken(data.token);
      console.log('🔁 Token refreshed');
      return true;
    } catch (err) {
      console.warn('❌ Token refresh failed');
      clearAuth();
      return false;
    }
  },

  /* ----- VERIFY TOKEN ----- */
  async verifyToken() {
    if (!this.isAuthenticated()) return false;

    if (this.shouldRefresh()) {
      const refreshed = await this.refreshToken();
      if (!refreshed) return false;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${this.getToken()}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /* ----- SAFE EXECUTION ----- */
  withValidSession: async function (fn) {
    try {
      if (this.shouldRefresh()) {
        const ok = await this.refreshToken();
        if (!ok) throw new Error('Session expired');
      }
      return await fn();
    } catch (err) {
      if (
        err.message?.includes('401') ||
        err.message?.includes('Not authenticated') ||
        err.message?.includes('expired')
      ) {
        clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/admin/login';
        return;
      }
      throw err;
    }
  },
};
