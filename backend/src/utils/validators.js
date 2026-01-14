// backend/src/utils/validators.js
/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number
 */
function isValidPhone(phone) {
  const phoneRegex = /^[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
}

/**
 * Validate password strength
 */
function isStrongPassword(password) {
  // At least 8 characters
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }

  // At least one letter and one number (optional, can be removed for simpler validation)
  // const hasLetter = /[a-zA-Z]/.test(password);
  // const hasNumber = /[0-9]/.test(password);
  // if (!hasLetter || !hasNumber) {
  //   return { valid: false, message: 'Password must contain letters and numbers' };
  // }

  return { valid: true };
}

/**
 * Sanitize string input
 */
function sanitizeString(input) {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate product data
 */
function validateProductData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Product name must be at least 2 characters');
  }

  if (data.price === undefined || data.price < 0) {
    errors.push('Valid price is required');
  }

  if (data.stock === undefined || data.stock < 0) {
    errors.push('Valid stock quantity is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate order data
 */
function validateOrderData(data) {
  const errors = [];

  if (!data.customerName || data.customerName.trim().length < 2) {
    errors.push('Customer name is required');
  }

  if (!isValidPhone(data.phone)) {
    errors.push('Valid phone number is required');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Valid email format required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

module.exports = {
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  sanitizeString,
  validateProductData,
  validateOrderData,
};
