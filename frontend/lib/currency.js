// frontend/lib/currency.js
// Currency formatting and conversion utilities

/**
 * Supported currencies configuration
 */
export const currencies = {
  NGN: {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    locale: 'en-NG',
    decimals: 2,
    position: 'before',
    countries: ['Nigeria'],
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
    decimals: 2,
    position: 'before',
    countries: ['United States'],
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    locale: 'en-GB',
    decimals: 2,
    position: 'before',
    countries: ['United Kingdom'],
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'de-DE',
    decimals: 2,
    position: 'before',
    countries: ['Germany', 'France', 'Italy', 'Spain'],
  },
  GHS: {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    locale: 'en-GH',
    decimals: 2,
    position: 'before',
    countries: ['Ghana'],
  },
  KES: {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    locale: 'en-KE',
    decimals: 2,
    position: 'before',
    countries: ['Kenya'],
  },
  ZAR: {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    locale: 'en-ZA',
    decimals: 2,
    position: 'before',
    countries: ['South Africa'],
  },
  // West African CFA Franc (Benin, Togo, etc.)
  XOF: { 
    code: 'XOF', 
    name: 'West African CFA Franc', 
    symbol: 'CFA', 
    locale: 'fr-BJ',
    decimals: 0, // No decimals for XOF
    position: 'after',
    countries: ['Benin', 'Togo', 'Burkina Faso', 'Senegal', 'Mali', 'Niger', 'Ivory Coast'] 
  },
  // Asian currencies
  CNY: { 
    code: 'CNY', 
    name: 'Chinese Yuan', 
    symbol: '¥', 
    locale: 'zh-CN',
    decimals: 2,
    position: 'before',
    countries: ['China'] 
  },
  JPY: { 
    code: 'JPY', 
    name: 'Japanese Yen', 
    symbol: '¥', 
    locale: 'ja-JP',
    decimals: 0,
    position: 'before',
    countries: ['Japan'] 
  },
  INR: { 
    code: 'INR', 
    name: 'Indian Rupee', 
    symbol: '₹', 
    locale: 'en-IN',
    decimals: 2,
    position: 'before',
    countries: ['India'] 
  },
  // Other African
  EGP: { 
    code: 'EGP', 
    name: 'Egyptian Pound', 
    symbol: 'E£', 
    locale: 'ar-EG',
    decimals: 2,
    position: 'before',
    countries: ['Egypt'] 
  },
  TZS: { 
    code: 'TZS', 
    name: 'Tanzanian Shilling', 
    symbol: 'TSh', 
    locale: 'sw-TZ',
    decimals: 0,
    position: 'before',
    countries: ['Tanzania'] 
  },
  UGX: { 
    code: 'UGX', 
    name: 'Ugandan Shilling', 
    symbol: 'USh', 
    locale: 'en-UG',
    decimals: 0,
    position: 'before',
    countries: ['Uganda'] 
  },
};

/**
 * Get currency configuration
 */
export const getCurrency = (code = 'NGN') => {
  return currencies[code] || currencies.NGN;
};

/**
 * Format amount with currency
 */
export const formatCurrency = (amount, currencyCode = 'NGN') => {
  const currency = getCurrency(currencyCode);
  const formatted = new Intl.NumberFormat(currency.locale, {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(amount);
  
  return currency.position === 'before' 
    ? `${currency.symbol}${formatted}`
    : `${formatted} ${currency.symbol}`;
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString, currencyCode = 'NGN') => {
  const currency = getCurrency(currencyCode);
  const cleaned = currencyString
    .replace(currency.symbol, '')
    .replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Convert between currencies
 * WARNING: Uses simplified rates. Use real API in production!
 * Recommended: https://exchangeratesapi.io/
 */
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  // Exchange rates relative to USD (update these from real API)
  const rates = {
    NGN: 0.0013,
    USD: 1,
    GBP: 1.27,
    EUR: 1.09,
    GHS: 0.082,
    KES: 0.0077,
    ZAR: 0.054,
    XOF: 0.0017,
    CNY: 0.14,
    JPY: 0.0067,
    INR: 0.012,
    EGP: 0.032,
    TZS: 0.00043,
    UGX: 0.00027,
  };
  
  if (fromCurrency === toCurrency) return amount;
  
  const usdAmount = amount * (rates[fromCurrency] || 1);
  const convertedAmount = usdAmount / (rates[toCurrency] || 1);
  
  return Math.round(convertedAmount * 100) / 100;
};

/**
 * Get currency by country
 */
export const getCurrencyByCountry = (countryName) => {
  for (const [code, currency] of Object.entries(currencies)) {
    if (currency.countries.some(c => c.toLowerCase() === countryName.toLowerCase())) {
      return currency;
    }
  }
  return currencies.NGN;
};

/**
 * Validate currency code
 */
export const isValidCurrency = (code) => {
  return Object.keys(currencies).includes(code);
};

/**
 * Get all supported currencies
 */
export const getSupportedCurrencies = () => {
  return Object.values(currencies);
};

/**
 * Get currency options for select dropdown
 */
export const getCurrencyOptions = () => {
  return Object.values(currencies).map(currency => ({
    value: currency.code,
    label: `${currency.symbol} ${currency.code} - ${currency.name}`,
    symbol: currency.symbol,
  }));
};

/**
 * Get default currency from environment
 */
export const getDefaultCurrency = () => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_CURRENCY || 'NGN';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.DEFAULT_CURRENCY || 'NGN';
  }
  return 'NGN';
};

export default {
  currencies,
  getCurrency,
  formatCurrency,
  parseCurrency,
  convertCurrency,
  getCurrencyByCountry,
  isValidCurrency,
  getSupportedCurrencies,
  getCurrencyOptions,
  getDefaultCurrency,
};