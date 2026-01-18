// frontend/lib/auth.js
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const auth = {
  setToken(token) {
    // Consider using httpOnly cookies in production
    localStorage.setItem(TOKEN_KEY, token);
    // Store expiry time
    const payload = JSON.parse(atob(token.split('.')[1]));
    localStorage.setItem('token_expiry', payload.exp * 1000);
  },
  
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  isAuthenticated() {
    const token = this.getToken();
    const expiry = localStorage.getItem('token_expiry');
    if (!token || !expiry) return false;
    
    // Check if token expired
    if (Date.now() > parseInt(expiry)) {
      this.clear();
      return false;
    }
    
    return true;
  },
  
  // Add auto-refresh before expiry
  shouldRefresh() {
    const expiry = localStorage.getItem('token_expiry');
    if (!expiry) return false;
    
    // Refresh 5 minutes before expiry
    return Date.now() > (parseInt(expiry) - 5 * 60 * 1000);
  },
};