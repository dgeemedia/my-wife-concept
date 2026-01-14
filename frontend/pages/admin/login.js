// frontend/pages/admin/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authApi } from '../../lib/api';

export default function AdminLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(formData);

      if (response.ok) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        if (response.user.forcePasswordChange) {
          router.push('/admin/change-password');
        } else {
          router.push('/admin');
        }
      } else {
        setError(response.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h1 className="admin-title">🍲 Admin Login</h1>
          <p className="admin-subtitle">MyPadiFood Dashboard</p>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label className="admin-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="admin-input"
              placeholder="admin@example.com"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="admin-input"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`admin-button ${loading ? 'home-button-disabled' : ''}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="admin-links">
          <Link href="/admin/forgot-password" className="admin-link">
            Forgot Password?
          </Link>
          <span className="admin-separator">•</span>
          <Link href="/" className="admin-link">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}