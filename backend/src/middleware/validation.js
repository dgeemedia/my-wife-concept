// backend/src/middleware/validation.js - CRITICAL FIX
const { body, param, validationResult } = require('express-validator');

/**
 * Handle validation errors - FIXED
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg).join(', ');
    console.error('❌ Validation errors:', errors.array());
    return res.status(400).json({ 
      success: false,
      error: errorMessages,
      details: errors.array() 
    });
  }
  next();
};

/**
 * Validate checkout request - FIXED TO MATCH YOUR FRONTEND
 */
const validateCheckout = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be 10-15 characters'),
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Valid email required'),
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address too long'),
  body('message')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Message too long'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item required'),
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID required'),
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  body('items.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  handleValidationErrors,
];

/**
 * Validate single order
 */
const validateOrder = [
  body('customerName')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be 10-15 characters'),
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID required'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  handleValidationErrors,
];

/**
 * Validate product creation/update
 */
const validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters')
    .customSanitizer(value => value.trim()),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .custom(value => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error('Price must be a valid number');
      }
      if (num < 0) {
        throw new Error('Price cannot be negative');
      }
      if (num > 10000000) {
        throw new Error('Price too high (max 10,000,000)');
      }
      return true;
    }),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .custom(value => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error('Stock must be a valid number');
      }
      if (num < 0) {
        throw new Error('Stock cannot be negative');
      }
      if (num > 1000000) {
        throw new Error('Stock too high (max 1,000,000)');
      }
      if (!Number.isInteger(num)) {
        throw new Error('Stock must be a whole number');
      }
      return true;
    }),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description too long (max 1000 characters)')
    .customSanitizer(value => value || ''),
  body('imageUrl')
    .optional()
    .trim()
    .customSanitizer(value => value || ''),
  handleValidationErrors,
];

/**
 * Validate user registration
 */
const validateUserRegistration = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'super-admin'])
    .withMessage('Invalid role'),
  handleValidationErrors,
];

/**
 * Validate user creation by super-admin
 */
const validateUserCreation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin'])
    .withMessage('Invalid role'),
  body('securityQuestion')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Security question too long'),
  body('securityAnswer')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Security answer must be between 2 and 200 characters'),
  handleValidationErrors,
];

/**
 * Validate login
 */
const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password required'),
  handleValidationErrors,
];

/**
 * Validate password change
 */
const validatePasswordChange = [
  body('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Valid user ID required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  handleValidationErrors,
];

/**
 * Validate password recovery
 */
const validatePasswordRecovery = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email required')
    .normalizeEmail(),
  body('answer')
    .trim()
    .notEmpty()
    .withMessage('Answer required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  handleValidationErrors,
];

/**
 * Validate ID parameter
 */
const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Valid ID required'),
  handleValidationErrors,
];

/**
 * Validate payment confirmation
 */
const validatePaymentConfirmation = [
  body('paymentMethod')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Invalid payment method'),
  body('paymentProof')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Payment proof URL too long'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Invalid payment amount'),
  handleValidationErrors,
];

/**
 * Validate stock update
 */
const validateStockUpdate = [
  body('stock')
    .notEmpty()
    .withMessage('Stock value is required')
    .custom(value => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error('Stock must be a valid number');
      }
      if (num < 0) {
        throw new Error('Stock cannot be negative');
      }
      if (num > 1000000) {
        throw new Error('Stock too high (max 1,000,000)');
      }
      if (!Number.isInteger(num)) {
        throw new Error('Stock must be a whole number');
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  validateCheckout,
  validateOrder,
  validateProduct,
  validateUserRegistration,
  validateUserCreation,
  validateLogin,
  validatePasswordChange,
  validatePasswordRecovery,
  validateIdParam,
  validatePaymentConfirmation,
  validateStockUpdate,
};