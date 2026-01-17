// frontend/pages/admin/settings.js - CORRECT LOCATION
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [settings, setSettings] = useState({
    businessName: '',
    businessType: 'food',
    phone: '',
    email: '',
    address: '',
    description: '',
    whatsappNumber: '',
    currency: 'NGN',
    language: 'en',
    logo: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setLogoPreview(data.logo || '');
      }
    } catch (err) {
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Logo file must be under 2MB');
        return;
      }

      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUpload = async () => {
    if (!logoFile) return;

    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      setSaving(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/logo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.ok) {
        setMessage('✓ Logo uploaded successfully!');
        setSettings({ ...settings, logo: data.logoUrl });
        setLogoFile(null);
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogo = async () => {
    if (!confirm('Delete logo?')) return;

    try {
      setSaving(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings/logo`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();

      if (data.ok) {
        setMessage('✓ Logo deleted successfully!');
        setSettings({ ...settings, logo: '' });
        setLogoPreview('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      setError('Delete failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await response.json();

      if (data.ok) {
        setMessage('✓ Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.error || 'Save failed');
      }
    } catch (err) {
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ margin: '0 auto 16px', width: '48px', height: '48px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50', margin: '0 0 8px 0' }}>
                Business Settings
              </h1>
              <p style={{ color: '#6c757d', margin: 0 }}>Manage your business information and preferences</p>
            </div>
            <button
              onClick={() => router.push('/admin')}
              style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', color: '#155724', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ background: '#f8d7da', border: '1px solid #f5c6cb', color: '#721c24', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px' }}>
            ✕ {error}
          </div>
        )}

        {/* Logo Section */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50', marginBottom: '20px' }}>
            Business Logo
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '24px', alignItems: 'start' }}>
            {/* Logo Preview */}
            <div style={{ width: '128px', height: '128px', borderRadius: '12px', border: '2px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f8f9fa' }}>
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '48px' }}>🏪</span>
              )}
            </div>

            {/* Upload Controls */}
            <div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleLogoChange}
                style={{ display: 'block', width: '100%', marginBottom: '12px' }}
              />
              <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '16px' }}>
                Max size: 2MB. Formats: JPEG, PNG, WebP
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                {logoFile && (
                  <button
                    onClick={handleLogoUpload}
                    disabled={saving}
                    style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}
                  >
                    {saving ? 'Uploading...' : 'Upload Logo'}
                  </button>
                )}

                {settings.logo && (
                  <button
                    onClick={handleDeleteLogo}
                    disabled={saving}
                    style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}
                  >
                    Delete Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Business Info Form */}
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50', marginBottom: '24px' }}>
            Business Information
          </h2>

          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Business Name */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#495057', marginBottom: '8px' }}>
                Business Name *
              </label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '14px' }}
                placeholder="My Awesome Food Business"
              />
            </div>

            {/* Business Type */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#495057', marginBottom: '8px' }}>
                Business Type
              </label>
              <select
                value={settings.businessType}
                onChange={(e) => setSettings({ ...settings, businessType: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '14px' }}
              >
                <option value="food">Food & Restaurant</option>
                <option value="fashion">Fashion & Boutique</option>
                <option value="electronics">Electronics</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="general">General Store</option>
              </select>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#495057', marginBottom: '8px' }}>
                WhatsApp Number * (with country code)
              </label>
              <input
                type="tel"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '14px' }}
                placeholder="2348012345678"
              />
              <p style={{ fontSize: '13px', color: '#6c757d', marginTop: '6px' }}>
                ⚠️ This is where customers will send orders
              </p>
            </div>

            {/* Phone & Email */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#495057', marginBottom: '8px' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#495057', marginBottom: '8px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#495057', marginBottom: '8px' }}>
                Business Address
              </label>
              <textarea
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#495057', marginBottom: '8px' }}>
                Description
              </label>
              <textarea
                value={settings.description || ''}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={4}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
                placeholder="Tell customers about your business..."
              />
            </div>

            {/* Currency & Language */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#495057', marginBottom: '8px' }}>
                  Currency
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="NGN">₦ NGN - Nigerian Naira</option>
                  <option value="USD">$ USD - US Dollar</option>
                  <option value="GBP">£ GBP - British Pound</option>
                  <option value="EUR">€ EUR - Euro</option>
                  <option value="GHS">GH₵ GHS - Ghanaian Cedi</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#495057', marginBottom: '8px' }}>
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ced4da', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="yo">Yorùbá</option>
                  <option value="ig">Igbo</option>
                  <option value="ha">Hausa</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #dee2e6' }}>
              <button
                type="button"
                onClick={() => router.push('/admin')}
                style={{ padding: '10px 24px', border: '1px solid #ced4da', background: 'white', color: '#495057', borderRadius: '8px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                style={{ padding: '10px 24px', background: '#007bff', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}