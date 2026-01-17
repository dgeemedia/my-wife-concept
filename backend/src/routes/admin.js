// backend/src/routes/admin.js
const express = require('express');
const { adminAuth } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getAnalytics,
  getSalesStatistics,
  getDailySales,
  getProductPerformance,
  getCustomerInsights,
  getPaymentStatistics
} = require('../utils/analytics');

const router = express.Router();

// Admin analytics
router.get('/analytics', adminAuth, asyncHandler(async (req, res) => {
  const analytics = await getAnalytics();
  res.json(analytics);
}));

// Sales statistics
router.get('/sales-stats/:period', adminAuth, asyncHandler(async (req, res) => {
  const { period } = req.params;
  const stats = await getSalesStatistics(period);
  res.json(stats);
}));

// Daily sales chart
router.get('/daily-sales', adminAuth, asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const sales = await getDailySales(parseInt(days));
  res.json(sales);
}));

// Product performance
router.get('/product-performance', adminAuth, asyncHandler(async (req, res) => {
  const performance = await getProductPerformance();
  res.json(performance);
}));

// Customer insights
router.get('/customer-insights', adminAuth, asyncHandler(async (req, res) => {
  const insights = await getCustomerInsights();
  res.json(insights);
}));

// Payment statistics
router.get('/payment-stats', adminAuth, asyncHandler(async (req, res) => {
  const stats = await getPaymentStatistics();
  res.json(stats);
}));

module.exports = router;