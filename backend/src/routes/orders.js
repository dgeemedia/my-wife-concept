// backend/src/routes/orders.js
/**
 * Order routes
 * Location: backend/src/routes/orders.js
 *
 * Routes:
 *  POST /api/orders                (public - single item quick order)
 *  POST /api/orders/checkout       (public - cart checkout)
 *  GET  /api/orders                (admin)
 *  GET  /api/orders/:id            (admin)
 *  GET  /api/orders/export/csv     (admin)
 *  DELETE /api/orders/:id          (admin)
 */

const express = require('express');
const { Parser } = require('json2csv');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { adminAuth } = require('../middleware/auth');
const {
  validateOrder,
  validateCheckout,
  validateIdParam,
} = require('../middleware/validation');

const {
  createQuickOrder,
  checkout,
  getAllOrders,
  getOrderById,
  getOrdersForExport,
  deleteOrder,
} = require('../controllers/orderController');
const { confirmPayment, rejectPayment } = require('../controllers/orderController');

const router = express.Router();

/**
 * POST /api/orders
 * Quick single-item order (public)
 */
router.post(
  '/',
  validateOrder,
  asyncHandler(async (req, res) => {
    const result = await createQuickOrder(req.body);
    res.status(201).json(result);
  })
);

/**
 * POST /api/orders/checkout
 * Cart checkout (public)
 */
router.post(
  '/checkout',
  validateCheckout,
  asyncHandler(async (req, res) => {
    const result = await checkout(req.body);
    res.status(201).json(result);
  })
);

/**
 * GET /api/orders
 * Admin - list orders (support limit/offset query)
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
 * GET /api/orders/:id
 * Admin - single order
 */
router.get(
  '/:id',
  adminAuth,
  validateIdParam,
  asyncHandler(async (req, res) => {
    const order = await getOrderById(req.params.id);
    res.json(order);
  })
);

/**
 * GET /api/orders/export/csv
 * Admin - export orders as CSV using json2csv for robust handling
 */
router.get(
  '/export/csv',
  adminAuth,
  asyncHandler(async (req, res) => {
    const orders = await getOrdersForExport();

    // Format data for CSV export
    const formattedOrders = orders.map(order => ({
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address || '',
      email: order.email || '',
      message: order.message || '',
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map(item => ({
        productId: item.productId,
        productName: item.product?.name || 'Unknown',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice
      })),
      itemsCount: order.items.length,
      itemsSummary: order.items.map(item => 
        `${item.product?.name || 'Unknown'} (x${item.quantity})`
      ).join('; ')
    }));

    // Define CSV fields
    const fields = [
      { label: 'Order ID', value: 'id' },
      { label: 'Customer Name', value: 'customerName' },
      { label: 'Phone', value: 'phone' },
      { label: 'Address', value: 'address' },
      { label: 'Email', value: 'email' },
      { label: 'Total Amount', value: 'totalAmount' },
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
 * Admin - export orders as JSON (optional bonus endpoint)
 */
router.get(
  '/export/json',
  adminAuth,
  asyncHandler(async (req, res) => {
    const orders = await getOrdersForExport();
    
    const fileName = `orders-export-${new Date().toISOString().slice(0, 10)}.json`;
    
    res.header('Content-Type', 'application/json');
    res.header('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(JSON.stringify(orders, null, 2));
  })
);

/**
 * DELETE /api/orders/:id
 * Admin - delete an order
 */
router.delete(
  '/:id',
  adminAuth,
  validateIdParam,
  asyncHandler(async (req, res) => {
    const result = await deleteOrder(req.params.id);
    res.json(result);
  })
);

/**
 * POST /api/orders/:id/confirm-payment
 */
router.post(
  '/:id/confirm-payment',
  adminAuth,
  validateIdParam,
  asyncHandler(async (req, res) => {
    const { paymentMethod, paymentProof } = req.body;
    const userId = req.user.id;

    const result = await confirmPayment(
      req.params.id,
      { paymentMethod, paymentProof },
      userId
    );
    res.json(result);
  })
);

/**
 * POST /api/orders/:id/reject-payment
 */
router.post(
  '/:id/reject-payment',
  adminAuth,
  validateIdParam,
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    const userId = req.user.id;

    const result = await rejectPayment(req.params.id, reason, userId);
    res.json(result);
  })
);

module.exports = router;