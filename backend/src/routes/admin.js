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
const { 
  logProductChange, 
  logOrderChange, 
  logPaymentConfirmation,
  getRecentActivities 
} = require('../utils/activityLogger');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/admin/analytics
 * Get comprehensive analytics data
 */
router.get('/analytics', adminAuth, asyncHandler(async (req, res) => {
  try {
    const analytics = await getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
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
  
  try {
    const stats = await getSalesStatistics(period);
    res.json(stats);
  } catch (error) {
    console.error('Sales stats error:', error);
    res.status(500).json({ error: 'Failed to load sales statistics' });
  }
}));

/**
 * GET /api/admin/daily-sales
 * Get daily sales for chart (last N days)
 */
router.get('/daily-sales', adminAuth, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const numDays = Math.min(parseInt(days), 365); // Max 1 year
  
  try {
    const sales = await getDailySales(numDays);
    res.json(sales);
  } catch (error) {
    console.error('Daily sales error:', error);
    res.status(500).json({ error: 'Failed to load daily sales' });
  }
}));

/**
 * GET /api/admin/product-performance
 * Get product performance metrics
 */
router.get('/product-performance', adminAuth, asyncHandler(async (req, res) => {
  try {
    const performance = await getProductPerformance();
    res.json(performance);
  } catch (error) {
    console.error('Product performance error:', error);
    res.status(500).json({ error: 'Failed to load product performance' });
  }
}));

/**
 * GET /api/admin/customer-insights
 * Get customer insights (top customers)
 */
router.get('/customer-insights', adminAuth, asyncHandler(async (req, res) => {
  try {
    const insights = await getCustomerInsights();
    res.json(insights);
  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({ error: 'Failed to load customer insights' });
  }
}));

/**
 * GET /api/admin/payment-stats
 * Get payment statistics
 */
router.get('/payment-stats', adminAuth, asyncHandler(async (req, res) => {
  try {
    const stats = await getPaymentStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Payment stats error:', error);
    res.status(500).json({ error: 'Failed to load payment statistics' });
  }
}));

/**
 * GET /api/admin/revenue-breakdown
 * Get revenue breakdown by payment method
 */
router.get('/revenue-breakdown', adminAuth, asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  
  try {
    const breakdown = await getRevenueBreakdown(period);
    res.json(breakdown);
  } catch (error) {
    console.error('Revenue breakdown error:', error);
    res.status(500).json({ error: 'Failed to load revenue breakdown' });
  }
}));

/**
 * GET /api/admin/activity
 * Get admin activity log (last 24 hours) - UPDATED WITH LOGGER
 */
router.get('/activity', superAdminAuth, asyncHandler(async (req, res) => {
  const { hours = 24, limit = 100 } = req.query;
  
  try {
    const activity = await getRecentActivities(Number(hours), Number(limit));
    res.json(activity);
  } catch (error) {
    console.error('Activity log error:', error);
    
    // Fallback: Try direct Prisma query
    try {
      const threshold = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);
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
        take: Math.min(Number(limit), 500),
      });
      res.json(activity);
    } catch (fallbackError) {
      // If ActivityLog table doesn't exist, return empty array
      if (fallbackError.code === 'P2021') {
        res.json([]);
      } else {
        res.status(500).json({ error: 'Failed to load activity log' });
      }
    }
  }
}));

/**
 * GET /api/admin/stale-payments
 * Get count of payments pending > 24 hours
 */
router.get('/stale-payments', adminAuth, asyncHandler(async (req, res) => {
  const { hours = 24 } = req.query;
  
  try {
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
  } catch (error) {
    console.error('Stale payments error:', error);
    res.status(500).json({ error: 'Failed to load stale payments' });
  }
}));

/**
 * GET /api/admin/low-stock
 * Get products with low stock
 */
router.get('/low-stock', adminAuth, asyncHandler(async (req, res) => {
  const { threshold = 5 } = req.query;
  
  try {
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
  } catch (error) {
    console.error('Low stock error:', error);
    res.status(500).json({ error: 'Failed to load low stock products' });
  }
}));

/**
 * GET /api/admin/statistics
 * Get order and payment statistics for dashboard
 */
router.get('/statistics', adminAuth, asyncHandler(async (req, res) => {
  try {
    // Get order status statistics
    const statusStats = await prisma.order.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Get payment status statistics
    const paymentStats = await prisma.order.groupBy({
      by: ['paymentStatus'],
      _count: {
        id: true
      }
    });

    // Convert to object format
    const statusMap = {};
    statusStats.forEach(stat => {
      statusMap[stat.status] = stat._count.id;
    });

    const paymentMap = {};
    paymentStats.forEach(stat => {
      paymentMap[stat.paymentStatus] = stat._count.id;
    });

    res.json({
      status: statusMap,
      payment: paymentMap
    });
  } catch (error) {
    console.error('Statistics error:', error);
    // Return empty statistics if there's an error
    res.json({
      status: {},
      payment: {}
    });
  }
}));

/**
 * POST /api/admin/log-product-change
 * Manually log a product change (for testing or external actions)
 */
router.post('/log-product-change', superAdminAuth, asyncHandler(async (req, res) => {
  const { 
    productId, 
    action = 'UPDATE_PRODUCT', 
    changes,
    notes 
  } = req.body;
  
  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }
  
  try {
    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Log the activity
    await logProductChange(
      req.user.id,
      action,
      productId,
      changes || { notes: notes || 'Manual log' },
      req.ip,
      req.get('user-agent')
    );
    
    res.json({ 
      success: true, 
      message: 'Product change logged',
      productId,
      action 
    });
  } catch (error) {
    console.error('Log product change error:', error);
    res.status(500).json({ error: 'Failed to log product change' });
  }
}));

/**
 * POST /api/admin/log-order-change
 * Manually log an order change
 */
router.post('/log-order-change', superAdminAuth, asyncHandler(async (req, res) => {
  const { 
    orderId, 
    oldStatus, 
    newStatus, 
    notes 
  } = req.body;
  
  if (!orderId || !oldStatus || !newStatus) {
    return res.status(400).json({ 
      error: 'Order ID, oldStatus, and newStatus are required' 
    });
  }
  
  try {
    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Log the activity
    await logOrderChange(
      req.user.id,
      orderId,
      oldStatus,
      newStatus,
      notes || 'Manual status change',
      req.ip,
      req.get('user-agent')
    );
    
    res.json({ 
      success: true, 
      message: 'Order change logged',
      orderId,
      oldStatus,
      newStatus 
    });
  } catch (error) {
    console.error('Log order change error:', error);
    res.status(500).json({ error: 'Failed to log order change' });
  }
}));

/**
 * POST /api/admin/log-payment-confirmation
 * Manually log a payment confirmation
 */
router.post('/log-payment-confirmation', superAdminAuth, asyncHandler(async (req, res) => {
  const { 
    orderId, 
    paymentMethod = 'MANUAL', 
    amount,
    notes 
  } = req.body;
  
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }
  
  try {
    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
    });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Log the activity
    await logPaymentConfirmation(
      req.user.id,
      orderId,
      paymentMethod,
      amount || order.totalAmount,
      req.ip,
      req.get('user-agent')
    );
    
    res.json({ 
      success: true, 
      message: 'Payment confirmation logged',
      orderId,
      paymentMethod,
      amount: amount || order.totalAmount
    });
  } catch (error) {
    console.error('Log payment confirmation error:', error);
    res.status(500).json({ error: 'Failed to log payment confirmation' });
  }
}));

/**
 * GET /api/admin/activity-summary
 * Get activity summary (counts by action type)
 */
router.get('/activity-summary', superAdminAuth, asyncHandler(async (req, res) => {
  const { hours = 24 } = req.query;
  const threshold = new Date(Date.now() - Number(hours) * 60 * 60 * 1000);
  
  try {
    const activitySummary = await prisma.activityLog.groupBy({
      by: ['action'],
      where: {
        createdAt: { gte: threshold }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });
    
    const totalCount = await prisma.activityLog.count({
      where: {
        createdAt: { gte: threshold }
      }
    });
    
    res.json({
      total: totalCount,
      period: `${hours} hours`,
      summary: activitySummary.map(item => ({
        action: item.action,
        count: item._count.id
      }))
    });
  } catch (error) {
    console.error('Activity summary error:', error);
    res.json({
      total: 0,
      period: `${hours} hours`,
      summary: []
    });
  }
}));

/**
 * GET /api/admin/dashboard-summary
 * Get complete dashboard summary in one request
 */
router.get('/dashboard-summary', adminAuth, asyncHandler(async (req, res) => {
  try {
    const [
      analytics,
      stalePayments,
      lowStock,
      recentActivity,
      statusStats,
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
      getRecentActivities(24, 10).catch(() => []),
      (async () => {
        try {
          const statusStats = await prisma.order.groupBy({
            by: ['status'],
            _count: {
              id: true
            }
          });
          
          const paymentStats = await prisma.order.groupBy({
            by: ['paymentStatus'],
            _count: {
              id: true
            }
          });
          
          return {
            status: statusStats.reduce((acc, stat) => {
              acc[stat.status] = stat._count.id;
              return acc;
            }, {}),
            payment: paymentStats.reduce((acc, stat) => {
              acc[stat.paymentStatus] = stat._count.id;
              return acc;
            }, {})
          };
        } catch (error) {
          return { status: {}, payment: {} };
        }
      })(),
    ]);
    
    res.json({
      analytics,
      alerts: {
        stalePayments,
        lowStock,
      },
      recentActivity,
      statistics: statusStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ 
      error: 'Failed to load dashboard summary',
      details: error.message 
    });
  }
}));

module.exports = router;