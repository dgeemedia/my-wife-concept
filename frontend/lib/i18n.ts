// frontend/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { getCurrencySymbol } from './currency';

// Define language information with proper TypeScript
export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  rtl?: boolean;
}

// Comprehensive language catalog
export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  // West African Languages
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'International' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'West Africa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬', region: 'Nigeria' },
  { code: 'ig', name: 'Igbo', nativeName: 'Asụsụ Igbo', flag: '🇳🇬', region: 'Nigeria' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬', region: 'Nigeria' },
 
  // East African Languages
  { code: 'tz', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿', region: 'East Africa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', region: 'Ethiopia' },
  { code: 'om', name: 'Oromo', nativeName: 'Afaan Oromoo', flag: '🇪🇹', region: 'Ethiopia' },
 
  // North African Languages
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'North Africa', rtl: true },
 
  // Southern African Languages
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', region: 'South Africa' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦', region: 'South Africa' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', region: 'South Africa' },
 
  // Asian Languages
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'India' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', region: 'China' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Japan' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'Korea' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Vietnam' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'Thailand' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Indonesia' },
 
  // European Languages
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Europe' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Europe' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', region: 'Europe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Europe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Europe' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Europe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Europe' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', region: 'Europe' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', region: 'Europe' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', region: 'Europe' },
  
  // Eastern European Languages
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Eastern Europe' },
];

// Initialize i18n
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // UPDATED: Configure namespaces for dashboard translations
    ns: ['translation', 'dashboard', 'landing'],
    defaultNS: 'translation',
    
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
      cookieMinutes: 7 * 24 * 60, // 7 days
      lookupQuerystring: 'lang',
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
    },
    
    interpolation: {
      escapeValue: false,
      format: (value: any, format?: string, lng?: string) => {
        if (format === 'currency' && typeof value === 'number') {
          const currency = (i18n.store.data as any)?.[lng || 'en']?.currency || 'NGN';
          const symbol = getCurrencySymbol(currency);
          return `${symbol}${value.toLocaleString(lng)}`;
        }
        if (format === 'date' && value instanceof Date) {
          return new Intl.DateTimeFormat(lng).format(value);
        }
        return value;
      }
    },
    
    backend: {
      // UPDATED: Support multiple namespaces
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
    load: 'languageOnly',
    saveMissing: process.env.NODE_ENV === 'development',
    
    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'b', 'em'],
    }
  });

/**
 * Detect and set language automatically based on IP geolocation
 */
export async function detectAndSetLanguage(): Promise<string> {
  if (typeof window === 'undefined') return 'en';
  
  try {
    // Check if user has manually selected a language
    const userLang = localStorage.getItem('user-language');
    if (userLang && SUPPORTED_LANGUAGES.some(l => l.code === userLang)) {
      await i18n.changeLanguage(userLang);
      return userLang;
    }
    
    // Call backend to detect language from IP
    const response = await fetch('/api/language/detect');
    const data = await response.json();
    
    if (data.success && data.detectedLanguage) {
      const detectedLang = data.detectedLanguage.code;
      const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code);
      
      if (supportedCodes.includes(detectedLang)) {
        await i18n.changeLanguage(detectedLang);
        localStorage.setItem('auto-detected-lang', detectedLang);
        localStorage.setItem('user-country', data.ipCountry?.code || 'default');
        
        console.log(`🌍 Language auto-detected: ${detectedLang} (${data.ipCountry?.name})`);
        return detectedLang;
      }
    }
  } catch (error) {
    console.log('Language detection failed, using fallback:', error);
  }
  
  // Fallback to browser language or English
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
    await i18n.changeLanguage(browserLang);
    return browserLang;
  }
  
  await i18n.changeLanguage('en');
  return 'en';
}

/**
 * Get language information by code
 */
export function getLanguageInfo(code: string): LanguageInfo {
  return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
}

/**
 * Group languages by region
 */
export function getLanguagesByRegion(): Record<string, LanguageInfo[]> {
  return SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    if (!acc[lang.region]) {
      acc[lang.region] = [];
    }
    acc[lang.region].push(lang);
    return acc;
  }, {} as Record<string, LanguageInfo[]>);
}

/**
 * Get current language direction (LTR or RTL)
 */
export function getCurrentLanguageDirection(): 'ltr' | 'rtl' {
  const currentLang = i18n.language;
  const langInfo = getLanguageInfo(currentLang);
  return langInfo.rtl ? 'rtl' : 'ltr';
}

/**
 * Apply language direction to document
 */
export function applyLanguageDirection() {
  if (typeof document !== 'undefined') {
    const direction = getCurrentLanguageDirection();
    document.documentElement.dir = direction;
    document.documentElement.lang = i18n.language;
  }
}

// Apply direction when language changes
i18n.on('languageChanged', () => {
  applyLanguageDirection();
});

export default i18n;