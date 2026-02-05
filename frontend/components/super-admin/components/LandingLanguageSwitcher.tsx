// frontend/components/super-admin/components/LandingLanguageSwitcher.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { getLanguageInfo, SUPPORTED_LANGUAGES, type LanguageInfo } from '@/lib/i18n'

export default function LandingLanguageSwitcher() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [currentLang, setCurrentLang] = useState(i18n.language)

  useEffect(() => {
    setCurrentLang(i18n.language)
  }, [i18n.language])

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng)
    setIsOpen(false)
    
    // Store user preference
    localStorage.setItem('user-language', lng)
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('language-changed', { detail: lng }))
    
    // Apply RTL if needed
    document.documentElement.dir = getLanguageInfo(lng).rtl ? 'rtl' : 'ltr'
  }

  const currentLangInfo = getLanguageInfo(currentLang)

  // Group languages by region for better organization
  const languagesByRegion: Record<string, LanguageInfo[]> = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    if (!acc[lang.region]) {
      acc[lang.region] = []
    }
    acc[lang.region].push(lang)
    return acc
  }, {} as Record<string, LanguageInfo[]>)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
        aria-label="Select Language"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
        <span className="hidden sm:inline font-medium text-sm text-gray-700">
          {currentLangInfo.flag} {currentLangInfo.nativeName}
        </span>
        <span className="inline sm:hidden font-medium text-sm text-gray-700">
          {currentLangInfo.flag}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-50 border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Select Language / Choisir la langue
                </h3>
              </div>
              
              {Object.entries(languagesByRegion).map(([region, languages]) => (
                <div key={region} className="py-2">
                  <div className="px-4 py-1">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      {region}
                    </span>
                  </div>
                  {languages.map((lang: LanguageInfo) => {
                    const isActive = currentLang === lang.code
                    return (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-3 transition-all duration-150 ${
                          isActive 
                            ? 'bg-blue-50 border-l-2 border-blue-500' 
                            : 'border-l-2 border-transparent'
                        }`}
                      >
                        <span className="text-2xl flex-shrink-0">{lang.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {lang.nativeName}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {lang.name}
                          </div>
                        </div>
                        {isActive && (
                          <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
              
              <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">
                  🌍 Language auto-detected. Select your preference above.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  )
}