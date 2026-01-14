// frontend/lib/auth.js
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const auth = {
  setToken(token) {
    // Consider using httpOnly cookies in production
    localStorage.setItem(TOKEN_KEY, token);
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
    if (!token) return false;
    
    // Check token expiration (JWT)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },
};