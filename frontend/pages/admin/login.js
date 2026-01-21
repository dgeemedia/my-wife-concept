// frontend/pages/admin/login.js - USING NEW AUTH HELPER
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { auth } from '../../lib/auth';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ ONLY check auth on mount - NO redirects here
  useEffect(() => {
    // Just clear any stale data
    if (!auth.isAuthenticated()) {
      auth.clear();
    }
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    console.log('🔵 Logging in...');

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    console.log('🔵 Response:', data);

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Store data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    console.log('✅ Stored auth data');
    console.log('Token:', localStorage.getItem('token')?.substring(0, 20) + '...');
    console.log('User:', JSON.parse(localStorage.getItem('user')));

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log('🚀 Redirecting to dashboard...');

    // FORCE full page load
    window.location.href = '/admin/dashboard';

  } catch (err) {
    console.error('❌ Login error:', err);
    setError(err.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h1 className="admin-title">Admin Login</h1>
          <p className="admin-subtitle">MyPadiFood Dashboard</p>
        </div>

        {error && (
          <div className="admin-error">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            disabled={loading}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="admin-links">
          <Link href="/admin/forgot-password">Forgot Password?</Link>
          <span> • </span>
          <Link href="/">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}
