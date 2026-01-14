// backend/src/server.js - SINGLE-TENANT VERSION (Phase 1)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
const { SERVER, RATE_LIMIT, CLOUDINARY } = require('./config/constants');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');
const { createLogger } = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users');
const trackingRoutes = require('./routes/tracking');

const app = express();
const prisma = new PrismaClient();
const logger = createLogger('Server');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: SERVER.CORS_ORIGIN,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_API_REQUESTS,
  message: 'Too many requests, please try again later',
});

const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_AUTH_ATTEMPTS,
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true,
});

const orderLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_ORDER_ATTEMPTS,
  message: 'Too many order attempts',
});

const uploadLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_UPLOAD_ATTEMPTS,
  message: 'Too many upload attempts',
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/orders', orderLimiter);
app.use('/api/upload', uploadLimiter);

// Cloudinary configuration
if (CLOUDINARY.CLOUD_NAME) {
  cloudinary.config({
    cloud_name: CLOUDINARY.CLOUD_NAME,
    api_key: CLOUDINARY.API_KEY,
    api_secret: CLOUDINARY.API_SECRET,
  });
  logger.info('Cloudinary configured');
}

// Multer for file uploads
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

// Health check
app.get('/health', asyncHandler(async (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: SERVER.NODE_ENV,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.database = 'connected';
  } catch (error) {
    healthCheck.database = 'disconnected';
    healthCheck.status = 'unhealthy';
    logger.error('Database health check failed', { error: error.message });
  }

  res.status(healthCheck.status === 'healthy' ? 200 : 503).json(healthCheck);
}));

app.get('/ready', asyncHandler(async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ready: true });
  } catch (error) {
    res.status(503).json({ ready: false, error: error.message });
  }
}));

app.get('/alive', (req, res) => {
  res.status(200).json({ alive: true });
});

// ============================================================================
// API ROUTES - SINGLE TENANT (NO MIDDLEWARE)
// ============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tracking', trackingRoutes);

// Image upload
app.post('/api/upload', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!CLOUDINARY.CLOUD_NAME) {
    return res.status(500).json({ error: 'Cloudinary not configured' });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: CLOUDINARY.FOLDER,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto' },
      ],
    });

    logger.info('Image uploaded successfully', { publicId: result.public_id });

    res.json({
      ok: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    logger.error('Image upload failed', { error: error.message });
    throw error;
  }
}));

// Public endpoints
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

// Business settings endpoint
app.get('/api/settings', asyncHandler(async (req, res) => {
  let settings = await prisma.businessSettings.findFirst();
  
  if (!settings) {
    // Create default settings
    settings = await prisma.businessSettings.create({
      data: {
        businessName: process.env.BUSINESS_NAME || 'My Business',
        businessType: process.env.BUSINESS_TYPE || 'general',
        phone: process.env.WHATSAPP_NUMBER || '',
        whatsappNumber: process.env.WHATSAPP_NUMBER || '',
        currency: process.env.DEFAULT_CURRENCY || 'NGN',
        language: 'en',
      },
    });
  }
  
  res.json(settings);
}));

// Update settings (admin only)
app.patch('/api/settings', adminAuth, asyncHandler(async (req, res) => {
  const settings = await prisma.businessSettings.findFirst();
  
  const updated = await prisma.businessSettings.update({
    where: { id: settings.id },
    data: req.body,
  });
  
  res.json(updated);
}));

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  errorHandler(err, req, res, next);
});

// Start server
const PORT = SERVER.PORT;
const server = app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${SERVER.NODE_ENV}`);
  logger.info(`📡 Health: http://localhost:${PORT}/health`);
  logger.info(`🏪 Mode: Single-Tenant`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received, shutting down gracefully`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    try {
      await prisma.$disconnect();
      logger.info('Database connection closed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
});
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

module.exports = app;