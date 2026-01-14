// frontend/components/LanguageSelector.jsx
import { useState, useEffect, useRef } from 'react';
import { languages } from '../lib/i18n';

export default function LanguageSelector({ currentLanguage, onLanguageChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = languages[currentLanguage] || languages.en;

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <span className="language-flag">{currentLang.flag}</span>
        <span className="language-code">{currentLang.code.toUpperCase()}</span>
        <svg
          className={`language-arrow ${isOpen ? 'open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="language-dropdown">
          {Object.values(languages).map((lang) => (
            <button
              key={lang.code}
              className={`language-option ${
                lang.code === currentLanguage ? 'active' : ''
              }`}
              onClick={() => {
                onLanguageChange(lang.code);
                setIsOpen(false);
              }}
            >
              <span className="language-flag">{lang.flag}</span>
              <span className="language-name">{lang.name}</span>
              {lang.code === currentLanguage && (
                <span className="language-check">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .language-selector {
          position: relative;
        }

        .language-selector-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .language-selector-button:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .language-flag {
          font-size: 18px;
          line-height: 1;
        }

        .language-code {
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .language-arrow {
          transition: transform 0.2s;
        }

        .language-arrow.open {
          transform: rotate(180deg);
        }

        .language-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          min-width: 200px;
          z-index: 1000;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          background: white;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: background 0.2s;
          color: #333;
        }

        .language-option:hover {
          background: #f5f5f5;
        }

        .language-option.active {
          background: #e8f5e9;
          color: #2e7d32;
        }

        .language-name {
          flex: 1;
          font-size: 14px;
        }

        .language-check {
          color: #4caf50;
          font-weight: bold;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .language-dropdown {
            right: -8px;
            min-width: 180px;
          }

          .language-selector-button {
            padding: 6px 10px;
            font-size: 13px;
          }

          .language-code {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}