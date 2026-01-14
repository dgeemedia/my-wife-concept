// backend/src/config/constants.js
const crypto = require('crypto');

/**
 * Generate secure random password
 */
function generateSecurePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

/**
 * Application configuration constants
 */
module.exports = {
  // JWT Configuration
  JWT: {
    SECRET: process.env.JWT_SECRET || 'supersecret-change-in-production',
    EXPIRES_IN: '4h',
    REFRESH_EXPIRES_IN: '7d',
  },

  // Bcrypt Configuration
  BCRYPT: {
    SALT_ROUNDS: 10,
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_AUTH_ATTEMPTS: 5,
    MAX_API_REQUESTS: 100,
    MAX_ORDER_ATTEMPTS: 10, // NEW: Specific limit for orders
    MAX_UPLOAD_ATTEMPTS: 20, // NEW: For image uploads
  },

  // Cloudinary Configuration
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
    FOLDER: process.env.CLOUDINARY_FOLDER || 'food-app',
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },

  // Server Configuration
  SERVER: {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    API_VERSION: 'v1',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  },

  // WhatsApp Configuration
  WHATSAPP: {
    NUMBER: process.env.WHATSAPP_NUMBER || '2348110252143',
    BUSINESS_NAME: process.env.BUSINESS_NAME || 'MyPadiFood',
  },

  // User Roles
  ROLES: {
    SUPER_ADMIN: 'super-admin',
    ADMIN: 'admin',
  },

  // Default Credentials - SECURITY IMPROVED
  DEFAULT: {
    PASSWORD_LENGTH: 16,
    generatePassword: generateSecurePassword,
  },

  // Order Configuration
  ORDER: {
    MAX_ITEMS: 50,
    MAX_QUANTITY_PER_ITEM: 100,
    MIN_TOTAL_AMOUNT: 0,
    MAX_TOTAL_AMOUNT: 10000000, // 10M Naira
  },

  // Cache Configuration
  CACHE: {
    TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 100, // Maximum cache entries
  },

  // Session Configuration
  SESSION: {
    PENDING_ORDER_TTL: 30 * 60 * 1000, // 30 minutes
  },

  // Backup Configuration
  BACKUP: {
    ENABLED: process.env.BACKUP_ENABLED === 'true',
    SCHEDULE: '0 2 * * *', // Daily at 2 AM
    RETENTION_DAYS: 30,
    DIRECTORY: process.env.BACKUP_DIR || './backups',
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
    ORDER_TRACKING: process.env.FEATURE_ORDER_TRACKING === 'true',
    SMS_NOTIFICATIONS: process.env.FEATURE_SMS === 'true',
    EMAIL_NOTIFICATIONS: process.env.FEATURE_EMAIL === 'true',
    ANALYTICS: process.env.FEATURE_ANALYTICS !== 'false', // Default true
    MULTI_CURRENCY: process.env.FEATURE_MULTI_CURRENCY === 'true',
  },
};