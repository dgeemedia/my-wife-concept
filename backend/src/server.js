// backend/src/server.js - PRODUCTION READY WITH ALL FIXES
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const multer = require('multer');
const { fileTypeFromBuffer } = require('file-type'); // Added for file validation
const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { SERVER, RATE_LIMIT, CLOUDINARY, SECURITY } = require('./config/constants');
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
const testimonialsRoutes = require('./routes/testimonials');

const app = express();

// Initialize Prisma with connection pooling
const prisma = new PrismaClient({
  log: SERVER.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

const logger = createLogger('Server');

// ============================================================================
// SECURITY CONFIGURATIONS
// ============================================================================

// Trust proxy (needed behind Nginx)
app.set('trust proxy', 1);

// Response compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
}));

// Enhanced Cookie parser
app.use(cookieParser({
  httpOnly: true,
  secure: SERVER.NODE_ENV === 'production',
  sameSite: 'strict',
}));

// Generate nonce for CSP
const generateNonce = () => crypto.randomBytes(16).toString('base64');

app.use((req, res, next) => {
  res.locals.nonce = generateNonce();
  next();
});

// Enhanced Helmet with nonce support
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for React
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "https://res.cloudinary.com"
      ],
      connectSrc: [
        "'self'",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "ws://localhost:5000",
        "https://api.mypadifood.com",
        "wss://api.mypadifood.com"
      ],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      frameAncestors: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// ============================================================================
// CORS CONFIGURATION - UPDATED FOR BOTH PRODUCTION AND DEVELOPMENT
// ============================================================================

// CORS configuration for production AND development
const allowedOrigins = SERVER.CORS_ORIGIN 
  ? SERVER.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : [];

// ALWAYS add localhost in development
if (SERVER.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:3000');
  allowedOrigins.push('http://127.0.0.1:3000');
  allowedOrigins.push('http://localhost:3001'); // Next.js dev server alternative port
}

console.log('🔒 CORS Configuration:', {
  environment: SERVER.NODE_ENV,
  allowedOrigins: allowedOrigins
});

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with NO origin (Postman, curl, direct browser access)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, be more permissive
    if (SERVER.NODE_ENV === 'development') {
      // Allow localhost with any port
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
    }
    
    // Check against allowed origins
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    logger.warn('CORS blocked origin:', { origin, allowedOrigins });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400,
}));

// Body parsing with strict limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100,
}));

// ============================================================================
// REQUEST LOGGING & MONITORING
// ============================================================================

app.use((req, res, next) => {
  req.id = crypto.randomBytes(16).toString('hex');
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Enhanced request logging
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Skip logging for health checks
  if (req.path === '/health' || req.path === '/ready' || req.path === '/alive') {
    return next();
  }
  
  logger.info(`${req.method} ${req.path}`, {
    requestId: req.id,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    referer: req.get('referer'),
  });

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    if (res.statusCode >= 400) {
      logger.error(`${req.method} ${req.path} ${res.statusCode}`, {
        requestId: req.id,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        userAgent: req.get('user-agent'),
        ip: req.ip,
      });
    } else if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.path}`, {
        requestId: req.id,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
      });
    }
  });

  next();
});

// ============================================================================
// RATE LIMITING
// ============================================================================

const createRateLimiter = (windowMs, max, skipSuccessful = false) => rateLimit({
  windowMs,
  max,
  message: { 
    error: 'Too many requests, please try again later',
    retryAfter: Math.ceil(windowMs / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: skipSuccessful,
  keyGenerator: (req) => {
    // Use IP + user agent for better rate limiting
    return `${req.ip}-${req.get('user-agent')}`;
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      requestId: req.id,
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({ 
      error: 'Too many requests, please try again later',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  },
});

const apiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100 // 100 requests per window
);

const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  5, // 5 login attempts per window
  true // Skip successful requests
);

const orderLimiter = createRateLimiter(
  15 * 60 * 1000,
  20 // 20 orders per window
);

const uploadLimiter = createRateLimiter(
  15 * 60 * 1000,
  10 // 10 uploads per window
);

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/recover-password', authLimiter);
app.use('/api/orders', orderLimiter);
app.use('/api/upload', uploadLimiter);

// ============================================================================
// FILE UPLOAD SECURITY
// ============================================================================

// Enhanced multer configuration with buffer storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: CLOUDINARY.MAX_FILE_SIZE || 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: async (req, file, cb) => {
    try {
      // MIME type validation
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp',
        'image/gif'
      ];
      
      if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error('Invalid file type. Only images allowed.'));
      }
      
      // File signature validation (when buffer is available)
      if (file.buffer) {
        const fileType = await fileTypeFromBuffer(file.buffer);
        if (!fileType || !['jpg', 'png', 'webp', 'gif'].includes(fileType.ext)) {
          return cb(new Error('Invalid file signature. File may be corrupted.'));
        }
      }
      
      // File name validation
      const fileName = file.originalname.toLowerCase();
      if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        return cb(new Error('Invalid file name.'));
      }
      
      cb(null, true);
    } catch (error) {
      cb(error);
    }
  },
});

// ============================================================================
// CLOUDINARY CONFIGURATION
// ============================================================================

if (CLOUDINARY.CLOUD_NAME) {
  cloudinary.config({
    cloud_name: CLOUDINARY.CLOUD_NAME,
    api_key: CLOUDINARY.API_KEY,
    api_secret: CLOUDINARY.API_SECRET,
    secure: true,
  });
  logger.info('Cloudinary configured successfully');
} else {
  logger.warn('Cloudinary not configured - image uploads will fail');
}

// ============================================================================
// ROUTES
// ============================================================================

// Health checks (no authentication)
app.get('/alive', (req, res) => {
  res.status(200).json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    service: 'mypadifood-api',
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.get('/ready', asyncHandler(async (req, res) => {
  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    
    // Cloudinary health check (optional)
    if (CLOUDINARY.CLOUD_NAME) {
      await cloudinary.api.ping();
    }
    
    res.status(200).json({ 
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'connected',
        cloudinary: CLOUDINARY.CLOUD_NAME ? 'connected' : 'not_configured',
      }
    });
  } catch (error) {
    logger.error('Readiness check failed', { error: error.message });
    res.status(503).json({ 
      status: 'not_ready', 
      error: error.message,
      checks: {
        database: 'error',
        cloudinary: 'error',
      }
    });
  }
}));

app.get('/health', asyncHandler(async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: SERVER.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    node: process.version,
    checks: {},
  };

  try {
    // Database check with timeout
    const dbCheck = prisma.$queryRaw`SELECT 1`;
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 8000)
    );
    await Promise.race([dbCheck, timeout]);
    healthCheck.checks.database = { status: 'healthy', responseTime: 'ok' };
    
    // Memory usage
    const memUsage = process.memoryUsage();
    healthCheck.checks.memory = {
      status: memUsage.heapUsed / memUsage.heapTotal < 0.9 ? 'healthy' : 'warning',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB',
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
    };
    
    // Load average (Unix only)
    if (process.platform !== 'win32') {
      const load = require('os').loadavg();
      healthCheck.checks.system = {
        load: load,
        cpuCount: require('os').cpus().length,
      };
    }
    
    // Cloudinary
    healthCheck.checks.cloudinary = CLOUDINARY.CLOUD_NAME ? 'configured' : 'not_configured';
    
  } catch (error) {
    healthCheck.status = 'unhealthy';
    healthCheck.error = error.message;
    healthCheck.checks.database = { status: 'unhealthy', error: error.message };
    logger.error('Health check failed', { error: error.message });
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/testimonials', testimonialsRoutes);

// Upload endpoint with enhanced security
// REPLACE the upload endpoint in your server.js with this:
// Find the section with: app.post('/api/upload', ...)

app.post('/api/upload', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!CLOUDINARY.CLOUD_NAME) {
    return res.status(500).json({ 
      error: 'Image upload service not configured. Please add Cloudinary credentials to .env file.' 
    });
  }

  try {
    // Additional security check
    if (req.file.size > (CLOUDINARY.MAX_FILE_SIZE || 5 * 1024 * 1024)) {
      return res.status(400).json({ error: 'File too large (max 5MB)' });
    }

    // Upload to Cloudinary using upload method with buffer
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: CLOUDINARY.FOLDER || 'mypadifood',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
          public_id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        (error, result) => {
          if (error) {
            logger.error('Cloudinary upload error', { 
              error: error.message,
              requestId: req.id,
            });
            reject(error);
          } else {
            logger.info('Image uploaded successfully', { 
              publicId: result.public_id,
              requestId: req.id,
              size: req.file.size,
            });
            resolve(result);
          }
        }
      );

      // Write buffer to stream
      uploadStream.end(req.file.buffer);
    });

    const result = await uploadPromise;

    res.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
    
  } catch (error) {
    logger.error('Image upload failed', { 
      error: error.message,
      requestId: req.id,
      fileSize: req.file?.size,
    });
    
    res.status(500).json({
      error: 'Upload failed: ' + error.message
    });
  }
}));

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// ============================================================================
// SERVER STARTUP
// ============================================================================

const PORT = SERVER.PORT || 5000;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info('='.repeat(60));
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🌍 Environment: ${SERVER.NODE_ENV}`);
    logger.info(`📡 Health: http://localhost:${PORT}/health`);
    logger.info(`🔒 CORS Origins: ${allowedOrigins.join(', ')}`);
    logger.info(`📦 API Base: http://localhost:${PORT}/api`);
    logger.info(`⚡ Node.js: ${process.version}`);
    logger.info('='.repeat(60));
    
    // Log startup metrics
    const memUsage = process.memoryUsage();
    logger.info('Startup memory usage:', {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    });
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    
    server.close(async () => {
      logger.info('HTTP server closed');
      
      try {
        await prisma.$disconnect();
        logger.info('Database connection closed');
        
        // Close other connections if any
        if (global.redisClient) {
          await global.redisClient.quit();
          logger.info('Redis connection closed');
        }
        
        logger.info('Graceful shutdown completed');
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

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  
  // Handle uncaught errors
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { 
      promise, 
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });
  
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', {
      message: error.message,
      stack: error.stack,
    });
    
    // Try to shutdown gracefully
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });
}

module.exports = app;