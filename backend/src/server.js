// backend/src/server.js - PRODUCTION-READY VERSION
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { SERVER, RATE_LIMIT, CLOUDINARY } = require('./config/constants');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');
const { createLogger } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const trackingRoutes = require('./routes/tracking');
const settingsRoutes = require('./routes/settings');
const adminRoutes = require('./routes/admin');

const app = express();
const prisma = new PrismaClient({
  log: SERVER.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
const logger = createLogger('Server');

// ============================================================================
// SECURITY CONFIGURATIONS
// ============================================================================

// Trust proxy in production (for rate limiting behind reverse proxy)
if (SERVER.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Helmet security headers with production-ready settings
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Required for Next.js
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", process.env.CORS_ORIGIN || "*"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configuration with validation
const allowedOrigins = SERVER.CORS_ORIGIN 
  ? SERVER.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all origins in development
    if (SERVER.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check against allowed origins in production
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin:', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// Body parsing with limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// REQUEST LOGGING & MONITORING
// ============================================================================

// Request ID middleware for tracking
app.use((req, res, next) => {
  req.id = crypto.randomBytes(16).toString('hex');
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Request logging with sanitization
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[logLevel](`${req.method} ${req.path} ${res.statusCode}`, {
      requestId: req.id,
      duration: `${duration}ms`,
      statusCode: res.statusCode,
    });
  });

  next();
});

// ============================================================================
// RATE LIMITING
// ============================================================================

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_API_REQUESTS,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => SERVER.NODE_ENV === 'development', // Skip in development
});

// Strict auth limiter
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_AUTH_ATTEMPTS,
  message: { error: 'Too many authentication attempts, please try again later' },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Order creation limiter
const orderLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_ORDER_ATTEMPTS,
  message: { error: 'Too many order attempts, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload limiter
const uploadLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_UPLOAD_ATTEMPTS,
  message: { error: 'Too many upload attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/recover-password', authLimiter);
app.use('/api/orders', orderLimiter);
app.use('/api/upload', uploadLimiter);

// ============================================================================
// CLOUDINARY CONFIGURATION
// ============================================================================

if (CLOUDINARY.CLOUD_NAME) {
  cloudinary.config({
    cloud_name: CLOUDINARY.CLOUD_NAME,
    api_key: CLOUDINARY.API_KEY,
    api_secret: CLOUDINARY.API_SECRET,
  });
  logger.info('Cloudinary configured successfully');
} else {
  logger.warn('Cloudinary not configured - image uploads will fail');
}

// ============================================================================
// MULTER FILE UPLOAD CONFIGURATION
// ============================================================================

const upload = multer({ 
  dest: '/tmp/uploads',
  limits: {
    fileSize: CLOUDINARY.MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.'));
    }
  },
});

// ============================================================================
// HEALTH CHECK ENDPOINTS
// ============================================================================

// Liveness probe
app.get('/alive', (req, res) => {
  res.status(200).json({ 
    alive: true,
    timestamp: new Date().toISOString(),
  });
});

// Readiness probe
app.get('/ready', asyncHandler(async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ 
      ready: true,
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({ 
      ready: false, 
      database: 'disconnected',
      error: error.message,
    });
  }
}));

// Comprehensive health check
app.get('/health', asyncHandler(async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: SERVER.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
  };

  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.database = 'connected';
    
    // Cloudinary check
    healthCheck.cloudinary = CLOUDINARY.CLOUD_NAME ? 'configured' : 'not configured';
    
    // Memory check
    const memUsage = process.memoryUsage();
    healthCheck.memory = {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    };

  } catch (error) {
    healthCheck.database = 'disconnected';
    healthCheck.status = 'unhealthy';
    logger.error('Health check failed', { error: error.message });
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
}));

// ============================================================================
// API ROUTES - SINGLE TENANT
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

// ============================================================================
// IMAGE UPLOAD ENDPOINT
// ============================================================================

app.post('/api/upload', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!CLOUDINARY.CLOUD_NAME) {
    return res.status(500).json({ 
      error: 'Image upload not configured. Please contact administrator.' 
    });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: CLOUDINARY.FOLDER,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    logger.info('Image uploaded successfully', { 
      publicId: result.public_id,
      requestId: req.id,
    });

    res.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    logger.error('Image upload failed', { 
      error: error.message,
      requestId: req.id,
    });
    throw error;
  }
}));

// ============================================================================
// PUBLIC ENDPOINTS
// ============================================================================

// Testimonials (public)
app.get('/api/testimonials', (req, res) => {
  res.json([
    { id: 1, author: 'Ada Okafor', content: 'Delicious pies! Fast delivery and excellent service.' },
    { id: 2, author: 'Chinedu Eze', content: 'Great taste and friendly owner. Highly recommended!' },
    { id: 3, author: 'Amaka Johnson', content: 'Best local food in Lagos. Always fresh and tasty!' },
  ]);
});

// Analytics endpoint (admin only)
const { adminAuth } = require('./middleware/auth');
const { getAnalytics } = require('./utils/analytics');

app.get('/api/admin/analytics', adminAuth, asyncHandler(async (req, res) => {
  const analytics = await getAnalytics();
  res.json(analytics);
}));

// ============================================================================
// ERROR HANDLERS
// ============================================================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use((err, req, res, next) => {
  // Don't log client errors in production
  if (err.statusCode >= 500 || SERVER.NODE_ENV === 'development') {
    logger.error('Unhandled error', {
      requestId: req.id,
      message: err.message,
      stack: SERVER.NODE_ENV === 'development' ? err.stack : undefined,
      path: req.path,
      method: req.method,
    });
  }
  
  errorHandler(err, req, res, next);
});

// ============================================================================
// SERVER STARTUP & SHUTDOWN
// ============================================================================

const PORT = SERVER.PORT;
const server = app.listen(PORT, () => {
  logger.info('='.repeat(60));
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${SERVER.NODE_ENV}`);
  logger.info(`📡 Health: http://localhost:${PORT}/health`);
  logger.info(`🏪 Mode: Single-Tenant`);
  logger.info(`🔒 CORS Origins: ${allowedOrigins.join(', ')}`);
  logger.info('='.repeat(60));
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  
  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      // Close database connections
      await prisma.$disconnect();
      logger.info('Database connection closed');
      
      // Exit successfully
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { 
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  
  // In production, exit on unhandled rejection
  if (SERVER.NODE_ENV === 'production') {
    gracefulShutdown('UNHANDLED_REJECTION');
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack,
  });
  
  // Always exit on uncaught exception
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

module.exports = app;