// backend/src/middleware/errorHandler.js
/**
 * Global error handler, async wrapper, and NotFound handler
 * Location: backend/src/middleware/errorHandler.js
 *
 * Exports:
 *  - asyncHandler(fn)
 *  - AppError
 *  - notFoundHandler
 *  - errorHandler
 */

const { Prisma } = require('@prisma/client');

class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * asyncHandler - wrap async route handlers to forward errors to express
 * usage: router.get('/', asyncHandler(async (req, res) => { ... }));
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * notFoundHandler - used as the 404 middleware (placed before errorHandler)
 * Behavior: passes an AppError(404) to next()
 */
function notFoundHandler(req, res, next) {
  next(new AppError('Not Found', 404));
}

/**
 * errorHandler - final error middleware
 * - translates Prisma errors to friendly messages/status codes
 * - handles AppError specially
 * - logs unexpected errors (only minimal data shown in production)
 */
function errorHandler(err, req, res, next) {
  // Default values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let extra = null;

  // JWT Error Handling
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  // Multer Error Handling (file upload)
  else if (err.name === 'MulterError') {
    statusCode = 400;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File too large. Maximum 5MB allowed.';
    } else {
      message = err.message;
    }
  }
  // AppError (our custom)
  else if (err instanceof AppError) {
    statusCode = err.statusCode || 500;
    message = err.message || message;
    extra = err.details || null;
  }
  // Prisma known errors
  else if (err && err instanceof Prisma.PrismaClientKnownRequestError) {
    // Known Prisma client errors
    switch (err.code) {
      case 'P2002':
        // Unique constraint failed
        statusCode = 400;
        // build a helpful message containing the target field if available
        const target = err.meta && err.meta.target ? err.meta.target : null;
        message = `Duplicate entry: ${target ? target.join(', ') : 'Unique constraint failed'}`;
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint failed';
        break;
      case 'P2000':
        statusCode = 400;
        message = 'Input value too long';
        break;
      case 'P2011':
        statusCode = 400;
        message = 'Null constraint violation';
        break;
      case 'P2016':
        statusCode = 400;
        message = 'Query constraint violation';
        break;
      default:
        statusCode = 400;
        message = 'Database error';
        break;
    }
    extra = err.meta || null;
  }
  // Express Validator errors (from validation middleware)
  else if (err && err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message || 'Validation error';
  }
  // Other validation errors
  else if (err && err.array && typeof err.array === 'function') {
    // This handles express-validator errors
    statusCode = 400;
    message = 'Validation failed';
    extra = err.array().map(e => ({ field: e.path, message: e.msg }));
  }
  // Generic Error fallback
  else if (err instanceof Error) {
    statusCode = err.statusCode || statusCode;
    message = err.message || message;
    if (err.details) extra = err.details;
  } else {
    // If someone passed a plain object
    message = JSON.stringify(err);
  }

  // Logging - be mindful in production
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    // show stack in dev
    console.error('Error caught by global errorHandler:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
      code: err.code,
      meta: err.meta,
    });
  } else {
    // minimal logging in production
    console.error('Server error:', err.message || err);
  }

  // Response payload
  const payload = {
    ok: false,
    error: message,
  };

  if (extra && process.env.NODE_ENV === 'development') {
    payload.details = extra;
  }

  res.status(statusCode).json(payload);
}

module.exports = {
  asyncHandler,
  AppError,
  notFoundHandler,
  errorHandler,
};
