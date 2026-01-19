// backend/src/config/constants.js
const crypto = require('crypto');

/**
 * Validate required environment variables
 */
function validateEnvironment() {
  const required = [
    'JWT_SECRET',
    'DATABASE_URL',
    'WHATSAPP_NUMBER',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `FATAL: Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error(
      'FATAL: JWT_SECRET must be at least 32 characters long.\n' +
      'Generate a strong secret with: openssl rand -base64 64'
    );
  }

  console.log('✅ Environment validation passed');
}

// Run validation immediately
validateEnvironment();

/**
 * Generate secure random password
 */
function generateSecurePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = 4; i < length; i++) {
    const randomBytes = crypto.randomBytes(1);
    password += charset[randomBytes[0] % charset.length];
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Application configuration constants
 */
module.exports = {
  // JWT Configuration
  JWT: {
    SECRET: process.env.JWT_SECRET, // NO FALLBACK - must be set
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '4h',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    ALGORITHM: 'HS256',
  },

  // Bcrypt Configuration
  BCRYPT: {
    SALT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },

  // Default Values for User Creation
  DEFAULT: {
    PASSWORD: process.env.DEFAULT_USER_PASSWORD || generateSecurePassword(12),
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    MAX_AUTH_ATTEMPTS: parseInt(process.env.RATE_LIMIT_AUTH || '5', 10),
    MAX_API_REQUESTS: parseInt(process.env.RATE_LIMIT_API || '100', 10),
    MAX_ORDER_ATTEMPTS: parseInt(process.env.RATE_LIMIT_ORDER || '10', 10),
    MAX_UPLOAD_ATTEMPTS: parseInt(process.env.RATE_LIMIT_UPLOAD || '20', 10),
  },

  // Cloudinary Configuration
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    API_KEY: process.env.CLOUDINARY_API_KEY || '',
    API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    FOLDER: process.env.CLOUDINARY_FOLDER || 'food-app',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },

  // Server Configuration
  SERVER: {
    PORT: parseInt(process.env.PORT || '5000', 10),
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_VERSION: 'v1',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  },

  // WhatsApp Configuration
  WHATSAPP: {
    NUMBER: process.env.WHATSAPP_NUMBER,
    BUSINESS_NAME: process.env.BUSINESS_NAME || 'MyPadiFood',
  },

  // User Roles
  ROLES: {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'admin',
  },

  // Password Generation Function
  generateSecurePassword,

  // Order Configuration
  ORDER: {
    MAX_ITEMS: 50,
    MAX_QUANTITY_PER_ITEM: 100,
    MIN_TOTAL_AMOUNT: 0,
    MAX_TOTAL_AMOUNT: 10000000, // 10M Naira
  },

  // Product Configuration
  PRODUCT: {
    MAX_PRICE: 10000000,
    MAX_STOCK: 1000000,
    MAX_NAME_LENGTH: 200,
    MIN_NAME_LENGTH: 2,
  },

  // Cache Configuration
  CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 100,
  },

  // Session Configuration
  SESSION: {
    PENDING_ORDER_TTL: 30 * 60 * 1000, // 30 minutes
  },

  // Notification Configuration
  NOTIFICATIONS: {
    EMAIL_ENABLED: process.env.EMAIL_ENABLED === 'true',
    SMS_ENABLED: process.env.SMS_ENABLED === 'true',
    PUSH_ENABLED: process.env.PUSH_ENABLED === 'true',
  },

  // Multi-Currency Support
  CURRENCY: {
    DEFAULT: process.env.DEFAULT_CURRENCY || 'NGN',
    SUPPORTED: ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'ZAR'],
    SYMBOLS: {
      NGN: '₦',
      USD: '$',
      GBP: '£',
      EUR: '€',
      GHS: 'GH₵',
      KES: 'KSh',
      ZAR: 'R',
    },
  },

  // Business Types for Template Customization
  BUSINESS_TYPES: {
    FOOD: 'food',
    FASHION: 'fashion',
    ELECTRONICS: 'electronics',
    PHARMACY: 'pharmacy',
    GENERAL: 'general',
  },

  // Feature Flags
  FEATURES: {
    ORDER_TRACKING: process.env.FEATURE_ORDER_TRACKING !== 'false',
    SMS_NOTIFICATIONS: process.env.FEATURE_SMS === 'true',
    EMAIL_NOTIFICATIONS: process.env.FEATURE_EMAIL === 'true',
    ANALYTICS: process.env.FEATURE_ANALYTICS !== 'false',
    MULTI_CURRENCY: process.env.FEATURE_MULTI_CURRENCY === 'true',
  },

  // Alert Thresholds
  ALERTS: {
    STALE_PAYMENT_HOURS: 24,
    LOW_STOCK_THRESHOLD: 5,
    ACTIVITY_LOG_RETENTION_DAYS: 90,
  },

  // Database Configuration
  DATABASE: {
    CONNECTION_LIMIT: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    POOL_TIMEOUT: parseInt(process.env.DB_POOL_TIMEOUT || '10', 10),
    QUERY_TIMEOUT: parseInt(process.env.DB_QUERY_TIMEOUT || '30000', 10),
  },

  // Security
  SECURITY: {
    ENABLE_CSRF: process.env.ENABLE_CSRF !== 'false',
    CSRF_COOKIE_NAME: '_csrf',
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  },
};