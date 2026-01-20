// frontend/components/Footer.jsx - UPDATED VERSION
import { useState, useEffect } from 'react';

export default function Footer() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <footer className="footer">Loading...</footer>;
  }

  const currentYear = new Date().getFullYear();
  const copyrightText = settings?.footerCopyright?.replace('{year}', currentYear) 
    || `© ${currentYear} ${settings?.businessName || 'MyPadiFood'}. All rights reserved.`;

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Business Info */}
          <div className="footer-section">
            <h3 className="footer-heading">{settings?.businessName || 'MyPadiFood'}</h3>
            <p className="footer-text">{settings?.footerText || 'Delicious local foods delivered to your doorstep'}</p>
            
            {/* Contact Info */}
            <div className="footer-contact">
              {settings?.contactEmail && (
                <p className="footer-contact-item">📧 {settings.contactEmail}</p>
              )}
              {settings?.contactPhone && (
                <p className="footer-contact-item">📞 {settings.contactPhone}</p>
              )}
              {settings?.contactAddress && (
                <p className="footer-contact-item">📍 {settings.contactAddress}</p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <div className="footer-links">
              <a href="/" className="footer-link">Home</a>
              <a href="#menu" className="footer-link">Menu</a>
              <a href="/cart" className="footer-link">Cart</a>
              {settings?.termsUrl && (
                <a href={settings.termsUrl} className="footer-link">Terms of Service</a>
              )}
              {settings?.privacyUrl && (
                <a href={settings.privacyUrl} className="footer-link">Privacy Policy</a>
              )}
            </div>
          </div>

          {/* Social Media */}
          {settings && (
            <div className="footer-section">
              <h4 className="footer-heading">Follow Us</h4>
              <div className="footer-social">
                {settings.facebookUrl && (
                  <a href={settings.facebookUrl} className="social-link" target="_blank" rel="noopener noreferrer">
                    <span className="social-icon">📘</span> Facebook
                  </a>
                )}
                {settings.instagramUrl && (
                  <a href={settings.instagramUrl} className="social-link" target="_blank" rel="noopener noreferrer">
                    <span className="social-icon">📷</span> Instagram
                  </a>
                )}
                {settings.twitterUrl && (
                  <a href={settings.twitterUrl} className="social-link" target="_blank" rel="noopener noreferrer">
                    <span className="social-icon">🐦</span> Twitter
                  </a>
                )}
                {settings.youtubeUrl && (
                  <a href={settings.youtubeUrl} className="social-link" target="_blank" rel="noopener noreferrer">
                    <span className="social-icon">📺</span> YouTube
                  </a>
                )}
                {settings.whatsappUrl && (
                  <a href={settings.whatsappUrl} className="social-link" target="_blank" rel="noopener noreferrer">
                    <span className="social-icon">💬</span> WhatsApp
                  </a>
                )}
                {settings.tiktokUrl && (
                  <a href={settings.tiktokUrl} className="social-link" target="_blank" rel="noopener noreferrer">
                    <span className="social-icon">🎵</span> TikTok
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            {copyrightText}
          </p>
          <div className="footer-legal">
            {settings?.footerAddress && (
              <span className="footer-address">{settings.footerAddress}</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}