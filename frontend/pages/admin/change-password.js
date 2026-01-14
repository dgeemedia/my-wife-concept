// frontend/pages/admin/change-password.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { authApi } from '../../lib/api';

export default function ChangePassword() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authApi.changePassword({
        newPassword: formData.newPassword,
      });
      
      if (response.ok) {
        const user = JSON.parse(localStorage.getItem('user'));
        user.forcePasswordChange = false;
        localStorage.setItem('user', JSON.stringify(user));
        
        alert('Password changed successfully!');
        router.push('/admin');
      } else {
        setError(response.error || 'Password change failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <h1 className="admin-title">Change Password</h1>
        <p className="admin-subtitle">Please set a new password for your account</p>
        
        {error && <div className="admin-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-form-group">
            <label className="admin-label">New Password</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
              required
              minLength={8}
              className="admin-input"
              placeholder="Minimum 8 characters"
            />
          </div>
          
          <div className="admin-form-group">
            <label className="admin-label">Confirm Password</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              minLength={8}
              className="admin-input"
              placeholder="Confirm your new password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`admin-button ${loading ? 'home-button-disabled' : ''}`}
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}