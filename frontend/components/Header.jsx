// frontend/components/Header.jsx - UPDATED WITH LANGUAGE SUPPORT
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
  
  // Multi-language support
  const { t, language, changeLanguage } = useTranslation();

  useEffect(() => {
    updateCartCount();
    checkAuth();

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link href="/">
          <strong className="header-logo">
            {process.env.NEXT_PUBLIC_BUSINESS_NAME || '🍲 MyPadiFood'}
          </strong>
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
    </header>
  );
}