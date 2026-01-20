// backend/middleware/validation.js
/**
 * Input validation middleware
 * File: backend/src/middleware/validation.js
 */
const { body, param, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

/**
 * Validate checkout request
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
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Valid phone number required (10-15 digits)'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Valid email required'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address too long'),
  body('message')
    .optional()
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
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Valid phone number required'),
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
    .withMessage('Name must be between 2 and 200 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Valid price required'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Valid stock number required'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description too long'),
  body('imageUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Valid image URL required'),
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
 * Validate payment confirmation (admin action)
 */
const validatePaymentConfirmation = [
  body('paymentReference')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Invalid payment reference'),

  body('amountPaid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Invalid payment amount'),

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
};