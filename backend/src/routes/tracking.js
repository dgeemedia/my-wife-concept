// backend/src/routes/tracking.js - NEW FILE

const express = require('express');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { adminAuth } = require('../middleware/auth');
const {
  updateOrderStatus,
  getOrderStatus,
  getOrdersByStatus,
  getStatusStatistics,
  cancelOrder,
} = require('../controllers/orderTrackingController');

const router = express.Router();

/**
 * PUBLIC ENDPOINT - Customer can track order with order ID + phone number
 * No authentication required - security through phone verification
 */
router.get(
  '/track/:orderId',
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { phone } = req.query;

    if (!phone) {
      throw new AppError('Phone number is required to track order', 400);
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Get order
    const order = await prisma.order.findFirst({
      where: {
        id: Number(orderId),
        phone: cleanPhone,
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new AppError('Order not found or phone number mismatch', 404);
    }

    // CRITICAL: Only show tracking if payment confirmed
    if (order.paymentStatus !== 'CONFIRMED') {
      return res.json({
        ok: true,
        order: {
          id: order.id,
          customerName: order.customerName,
          totalAmount: order.totalAmount,
          paymentStatus: order.paymentStatus,
          message: 'Payment pending. Your order will be processed once payment is confirmed.',
        },
      });
    }

    // Payment confirmed - show full tracking
    const result = {
      ok: true,
      order: {
        ...order,
        statusHistory: order.statusHistory ? JSON.parse(order.statusHistory) : [],
      },
    };

    res.json(result);
  })
);

/**
 * ADMIN ENDPOINTS - Require authentication
 */

// Update order status
router.patch(
  '/:orderId/status',
  adminAuth,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id;

    const result = await updateOrderStatus(orderId, status, notes, userId);
    res.json(result);
  })
);

// Get orders by status
router.get(
  '/status/:status',
  adminAuth,
  asyncHandler(async (req, res) => {
    const { status } = req.params;
    const { limit, offset } = req.query;

    const result = await getOrdersByStatus(status, limit, offset);
    res.json(result);
  })
);

// Get status statistics
router.get(
  '/statistics',
  adminAuth,
  asyncHandler(async (req, res) => {
    const result = await getStatusStatistics();
    res.json(result);
  })
);

// Cancel order (restore stock)
router.post(
  '/:orderId/cancel',
  adminAuth,
  asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const result = await cancelOrder(orderId, reason, userId);
    res.json(result);
  })
);

module.exports = router;
