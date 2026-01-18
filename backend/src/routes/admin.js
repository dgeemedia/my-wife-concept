// backend/src/routes/admin.js
const express = require('express');
const { adminAuth, superAdminAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getAnalytics,
  getSalesStatistics,
  getDailySales,
  getProductPerformance,
  getCustomerInsights,
  getPaymentStatistics,
  getRevenueBreakdown,
} = require('../utils/analytics');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics data
 */
router.get('/analytics', adminAuth, asyncHandler(async (req, res) => {
  const analytics = await getAnalytics();
  res.json(analytics);
}));

/**
 * GET /api/admin/sales-stats/:period
 * Get sales statistics for specific period
 */
router.get('/sales-stats/:period', adminAuth, asyncHandler(async (req, res) => {
  const { period } = req.params;
  const validPeriods = ['today', 'week', 'month', 'year'];
  
  if (!validPeriods.includes(period)) {
    return res.status(400).json({ 
      error: `Invalid period. Must be one of: ${validPeriods.join(', ')}` 
    });
  }
  
  const stats = await getSalesStatistics(period);
  res.json(stats);
}));

/**
 * GET /api/admin/daily-sales
 * Get daily sales for chart (last N days)
 */
router.get('/daily-sales', adminAuth, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const numDays = Math.min(parseInt(days), 365); // Max 1 year
  
  const sales = await getDailySales(numDays);
  res.json(sales);
}));

/**
 * GET /api/admin/product-performance
 * Get product performance metrics
 */
router.get('/product-performance', adminAuth, asyncHandler(async (req, res) => {
  const performance = await getProductPerformance();
  res.json(performance);
}));

/**
 * GET /api/admin/customer-insights
 * Get customer insights (top customers)
 */
router.get('/customer-insights', adminAuth, asyncHandler(async (req, res) => {
  const insights = await getCustomerInsights();
  res.json(insights);
}));

/**
 * GET /api/admin/payment-stats
 * Get payment statistics
 */
router.get('/payment-stats', adminAuth, asyncHandler(async (req, res) => {
  const stats = await getPaymentStatistics();
  res.json(stats);
}));

/**
 * GET /api/admin/revenue-breakdown
 * Get revenue breakdown by payment method
 */
router.get('/revenue-breakdown', adminAuth, asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  const breakdown = await getRevenueBreakdown(period);
  res.json(breakdown);
}));

/**
 * GET /api/admin/activity
 * Get admin activity log (last 24 hours)
 * Note: Requires ActivityLog model in schema
 */
router.get('/activity', superAdminAuth, asyncHandler(async (req, res) => {
  const { hours = 24, limit = 100 } = req.query;
  
  const threshold = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);
  
  // Check if ActivityLog table exists
  try {
    const activity = await prisma.activityLog.findMany({
      where: { createdAt: { gte: threshold } },
      include: { 
        user: { 
          select: { 
            email: true,
            role: true,
          } 
        } 
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 500), // Max 500
    });
    
    res.json(activity);
  } catch (error) {
    // If ActivityLog doesn't exist yet, return empty array
    if (error.code === 'P2021') {
      res.json([]);
    } else {
      throw error;
    }
  }
}));

/**
 * GET /api/admin/stale-payments
 * Get count of payments pending > 24 hours
 */
router.get('/stale-payments', adminAuth, asyncHandler(async (req, res) => {
  const { hours = 24 } = req.query;
  
  const threshold = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);
  
  const count = await prisma.order.count({
    where: {
      paymentStatus: 'PENDING',
      createdAt: { lt: threshold },
    },
  });
  
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: 'PENDING',
      createdAt: { lt: threshold },
    },
    select: {
      id: true,
      customerName: true,
      phone: true,
      totalAmount: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });
  
  res.json({
    count,
    threshold: threshold.toISOString(),
    orders,
  });
}));

/**
 * GET /api/admin/low-stock
 * Get products with low stock
 */
router.get('/low-stock', adminAuth, asyncHandler(async (req, res) => {
  const { threshold = 5 } = req.query;
  
  const products = await prisma.product.findMany({
    where: {
      stock: {
        lte: Number(threshold),
        gte: 0,
      },
    },
    orderBy: { stock: 'asc' },
  });
  
  res.json({
    count: products.length,
    threshold: Number(threshold),
    products,
  });
}));

/**
 * GET /api/admin/dashboard-summary
 * Get complete dashboard summary in one request
 */
router.get('/dashboard-summary', adminAuth, asyncHandler(async (req, res) => {
  const [
    analytics,
    stalePayments,
    lowStock,
    recentActivity,
  ] = await Promise.all([
    getAnalytics(),
    prisma.order.count({
      where: {
        paymentStatus: 'PENDING',
        createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.product.count({
      where: { stock: { lte: 5, gte: 0 } },
    }),
    // Try to get activity, return empty if table doesn't exist
    prisma.activityLog.findMany({
      where: { 
        createdAt: { 
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) 
        } 
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }).catch(() => []),
  ]);
  
  res.json({
    analytics,
    alerts: {
      stalePayments,
      lowStock,
    },
    recentActivity,
  });
}));

module.exports = router;