// backend/src/routes/orders.js - FIXED VERSION
const express = require('express');
const { Parser } = require('json2csv');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { adminAuth, superAdminAuth } = require('../middleware/auth');
const {
  validateOrder,
  validateCheckout,
  validateIdParam,
  validatePaymentConfirmation,
} = require('../middleware/validation');

const {
  createQuickOrder,
  checkout,
  getAllOrders,
  getOrderById,
  getOrdersForExport,
  deleteOrder,
  confirmPayment,
  rejectPayment,
  getOrderStats,
} = require('../controllers/orderController');

const router = express.Router();

/**
 * POST /api/orders
 * Quick single-item order (public)
 */
router.post(
  '/',
  validateOrder,
  asyncHandler(async (req, res) => {
    console.log('🔵 Quick order endpoint hit:', req.body);
    const result = await createQuickOrder(req.body);
    res.status(201).json(result);
  })
);

/**
 * POST /api/orders/checkout
 * Cart checkout (public) - FIXED
 */
router.post(
  '/checkout',
  validateCheckout,
  asyncHandler(async (req, res) => {
    console.log('🔵 Checkout endpoint hit');
    console.log('🔵 Request body:', req.body);
    
    const result = await checkout(req.body);
    
    console.log('🟢 Checkout successful:', result);
    res.status(201).json(result);
  })
);

/**
 * GET /api/orders
 * Admin only - list orders with filtering
 */
router.get(
  '/',
  adminAuth,
  asyncHandler(async (req, res) => {
    const result = await getAllOrders(req.query);
    res.json(result);
  })
);

/**
 * GET /api/orders/stats/summary
 * Admin only - order statistics summary (MUST BE BEFORE /:id)
 */
router.get(
  '/stats/summary',
  adminAuth,
  asyncHandler(async (req, res) => {
    const result = await getOrderStats(req.query);
    res.json(result);
  })
);

/**
 * GET /api/orders/export/csv
 * Super admin only - export orders as CSV (MUST BE BEFORE /:id)
 */
router.get(
  '/export/csv',
  superAdminAuth,
  asyncHandler(async (req, res) => {
    const orders = await getOrdersForExport();

    const formattedOrders = orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address || '',
      email: order.email || '',
      message: order.message || '',
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.status,
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
      itemsCount: order.items.length,
      itemsSummary: order.items.map(item => 
        `${item.product?.name || 'Unknown'} (x${item.quantity})`
      ).join('; ')
    }));

    const fields = [
      { label: 'Order ID', value: 'id' },
      { label: 'Customer Name', value: 'customerName' },
      { label: 'Phone', value: 'phone' },
      { label: 'Address', value: 'address' },
      { label: 'Email', value: 'email' },
      { label: 'Total Amount', value: 'totalAmount' },
      { label: 'Payment Status', value: 'paymentStatus' },
      { label: 'Order Status', value: 'orderStatus' },
      { label: 'Currency', value: 'currency' },
      { label: 'Date', value: 'createdAt' },
      { label: 'Items Count', value: 'itemsCount' },
      { label: 'Items Summary', value: 'itemsSummary' }
    ];

    try {
      const parser = new Parser({ fields });
      const csv = parser.parse(formattedOrders);

      const fileName = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
      
      res.header('Content-Type', 'text/csv');
      res.header('Content-Disposition', `attachment; filename="${fileName}"`);
      res.send(csv);
    } catch (error) {
      console.error('CSV generation error:', error);
      throw new AppError('Failed to generate CSV export', 500);
    }
  })
);

/**
 * GET /api/orders/export/json
 * Super admin only - export orders as JSON (MUST BE BEFORE /:id)
 */
router.get(
  '/export/json',
  superAdminAuth,
  asyncHandler(async (req, res) => {
    const orders = await getOrdersForExport();
    
    const fileName = `orders-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(JSON.stringify(orders, null, 2));
  })
);

/**
 * GET /api/orders/:id
 * Admin only - single order
 */
router.get(
  '/:id',
  adminAuth,
  validateIdParam,
  asyncHandler(async (req, res) => {
    const result = await getOrderById(req.params.id);
    res.json(result);
  })
);

/**
 * DELETE /api/orders/:id
 * Super admin only - delete an order
 */
router.delete(
  '/:id',
  superAdminAuth,
  validateIdParam,
  asyncHandler(async (req, res) => {
    const result = await deleteOrder(req.params.id);
    res.json(result);
  })
);

/**
 * POST /api/orders/:id/confirm-payment
 * Admin only - confirm payment
 */
router.post(
  '/:id/confirm-payment',
  adminAuth,
  validateIdParam,
  validatePaymentConfirmation,
  asyncHandler(async (req, res) => {
    const { paymentMethod, paymentProof, amount } = req.body;
    const userId = req.user.id;

    const result = await confirmPayment(
      req.params.id,
      { paymentMethod, paymentProof, amount },
      userId
    );
    
    res.json(result);
  })
);

/**
 * POST /api/orders/:id/reject-payment
 * Admin only - reject payment
 */
router.post(
  '/:id/reject-payment',
  adminAuth,
  validateIdParam,
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const userId = req.user.id;

    if (!reason || reason.trim().length < 5) {
      throw new AppError('Rejection reason must be at least 5 characters', 400);
    }

    const result = await rejectPayment(req.params.id, reason, userId);
    res.json(result);
  })
);

module.exports = router;