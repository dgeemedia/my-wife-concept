// frontend/components/Header.jsx - Updated version
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCartItemCount } from '../lib/cart';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from '../lib/i18n';

export default function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Multi-language support
  const { t, language, changeLanguage } = useTranslation();

  useEffect(() => {
    updateCartCount();
    checkAuth();
    fetchSettings();

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const updateCartCount = () => {
    setCartCount(getCartItemCount());
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <header className="header">
        <div className="header-container">
          <div className="header-logo-placeholder">
            <div className="header-logo-skeleton"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/">
          <div className="header-logo">
            {settings?.logo ? (
              <img 
                src={settings.logo} 
                alt={settings.businessName || 'Business Logo'} 
                className="header-logo-image"
              />
            ) : (
              <strong className="header-logo-text">
                {settings?.businessName || process.env.NEXT_PUBLIC_BUSINESS_NAME || '🍲 MyPadiFood'}
              </strong>
            )}
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="header-desktop-nav">
          <Link href="/" className="header-link">{t('home')}</Link>
          <Link href="/cart" className="header-link">
            <span className="header-cart-link">
              🛒 {t('cart')}
              {cartCount > 0 && (
                <span className="header-badge">{cartCount}</span>
              )}
            </span>
          </Link>

          {/* Language Selector */}
          <LanguageSelector
            currentLanguage={language}
            onLanguageChange={changeLanguage}
          />

          {!isAuthenticated ? (
            <Link href="/admin/login" className="header-link">{t('admin')}</Link>
          ) : (
            <>
              <Link href="/admin" className="header-link">Dashboard</Link>
              <button onClick={handleLogout} className="header-logout-btn">
                {t('logout')}
              </button>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="header-mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="header-mobile-nav">
          <Link href="/" className="header-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            {t('home')}
          </Link>
          <Link href="/cart" className="header-mobile-link" onClick={() => setMobileMenuOpen(false)}>
            {t('cart')} {cartCount > 0 && `(${cartCount})`}
          </Link>
          
          {/* Mobile Language Selector */}
          <div className="header-mobile-language">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={(lang) => {
                changeLanguage(lang);
                setMobileMenuOpen(false);
              }}
            />
          </div>

          {!isAuthenticated ? (
            <Link href="/admin/login" className="header-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              {t('admin')}
            </Link>
          ) : (
            <>
              <Link href="/admin" className="header-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <button 
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }} 
                className="header-mobile-logout-btn"
              >
                {t('logout')}
              </button>
            </>
          )}
        </nav>
      )}

      <style jsx>{`
        .header-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          cursor: pointer;
        }
        
        .header-logo-image {
          max-height: 50px;
          max-width: 200px;
          object-fit: contain;
        }
        
        .header-logo-text {
          font-size: 1.5rem;
          color: #333;
        }
        
        .header-logo-placeholder {
          height: 50px;
          width: 200px;
          display: flex;
          align-items: center;
        }
        
        .header-logo-skeleton {
          width: 100%;
          height: 30px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 4px;
        }
        
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </header>
  );
}