// frontend/pages/admin/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: 'SuperAdmin@mypadifood.com',
    password: 'Emergency123',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('');

  // Test backend connection on component mount
  useEffect(() => {
    checkBackend();
  }, []);

  const checkBackend = async () => {
    try {
      const response = await fetch('http://localhost:5000/health');
      const data = await response.json();
      setBackendStatus(`✅ Backend running: ${data.status}`);
    } catch (err) {
      setBackendStatus('❌ Backend not running on http://localhost:5000');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const text = await response.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: 'Invalid server response' };
      }

      if (response.ok && data.ok) {
        // Store token and user
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Route based on user state
        if (data.user.forcePasswordChange) {
          router.push('/admin/first-login');
        } else if (!data.user.hasSecurityQuestion) {
          router.push('/admin/set-security');
        } else {
          router.push('/admin');
        }
      } else {
        setError(data.error || `Login failed (Status: ${response.status})`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(`Connection error: ${err.message}. Make sure backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  const testLoginDirectly = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'SuperAdmin@mypadifood.com',
          password: 'Emergency123',
        }),
      });

      const text = await response.text();
      console.log('Direct test response:', text);

      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: 'Invalid JSON' };
      }

      alert(
        `Direct test:\nStatus: ${response.status}\nOK: ${response.ok}\nData:\n${JSON.stringify(
          data,
          null,
          2
        )}`
      );
    } catch (err) {
      alert(`Direct test failed: ${err.message}`);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h1 className="admin-title">Admin Login</h1>
          <p className="admin-subtitle">MyPadiFood Dashboard</p>

          {backendStatus && (
            <p
              className="admin-subtitle"
              style={{
                color: backendStatus.includes('✅') ? 'green' : 'red',
              }}
            >
              {backendStatus}
            </p>
          )}
        </div>

        {error && (
          <div className="admin-error">
            {error}
            <div style={{ marginTop: '10px', fontSize: '12px' }}>
              <strong>Debug Info:</strong>
              <br />
              Email: {formData.email}
              <br />
              Backend: http://localhost:5000
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label className="admin-label">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="admin-input"
              disabled={loading}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="admin-input"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`admin-button ${loading ? 'home-button-disabled' : ''}`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            type="button"
            onClick={testLoginDirectly}
            style={{
              background: 'none',
              border: '1px solid #ccc',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Test Direct Login
          </button>
        </div>

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
