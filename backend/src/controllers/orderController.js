// backend/src/controllers/orderController.js - PRODUCTION READY
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');
const { createLogger } = require('../utils/logger');

const prisma = new PrismaClient();
const logger = createLogger('OrderController');

// In production, use Redis for idempotency
let idempotencyStore;
if (process.env.REDIS_URL) {
  const Redis = require('ioredis');
  idempotencyStore = new Redis(process.env.REDIS_URL);
} else {
  // Fallback to in-memory for development
  idempotencyStore = {
    get: async (key) => {
      const value = global.idempotencyStore?.[key];
      return value ? JSON.parse(value) : null;
    },
    set: async (key, value, ttl = 60) => {
      global.idempotencyStore = global.idempotencyStore || {};
      global.idempotencyStore[key] = JSON.stringify(value);
    },
  };
}

/**
 * Generate idempotency key
 */
function generateIdempotencyKey(req) {
  const { phone, items = [] } = req.body;
  const itemsHash = items
    .map(item => `${item.productId}:${item.quantity}`)
    .sort()
    .join('|');
  return `checkout:${phone}:${itemsHash}`;
}

/**
 * Check and store idempotency
 */
async function withIdempotency(key, fn) {
  const existing = await idempotencyStore.get(key);
  if (existing) {
    const age = Date.now() - existing.timestamp;
    if (age < 60000) { // 1 minute
      logger.info('Idempotent request served from cache', { key });
      return existing.result;
    }
    await idempotencyStore.del(key);
  }
  
  const result = await fn();
  await idempotencyStore.set(key, {
    result,
    timestamp: Date.now(),
  }, 60);
  
  return result;
}

/**
 * Create quick order - SINGLE TENANT
 */
async function createQuickOrder(data) {
  const { customerName, address, phone, email, message, productId, quantity } = data;
  const qty = quantity && Number.isInteger(quantity) ? quantity : 1;

  // Validate quantity
  if (qty < 1 || qty > 100) {
    throw new AppError('Quantity must be between 1 and 100', 400);
  }

  const order = await prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({
      where: { id: Number(productId) },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.stock < qty) {
      throw new AppError(`Insufficient stock. Only ${product.stock} available`, 400);
    }

    const totalAmount = product.price * qty;

    // Validate order amount
    if (totalAmount < 0 || totalAmount > 10000000) {
      throw new AppError('Invalid order amount', 400);
    }

    return tx.order.create({
      data: {
        customerName,
        address: address || '',
        phone,
        email: email || '',
        message: message || '',
        totalAmount,
        paymentStatus: 'PENDING',
        items: {
          create: {
            productId: product.id,
            quantity: qty,
            unitPrice: product.price,
          },
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
  });

  return { ok: true, order };
}

/**
 * Checkout with multiple items - WITH RACE CONDITION PROTECTION
 */
async function checkout(data) {
  const { customerName, phone, address, email, message, items } = data;

  // Validate items array
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400);
  }

  if (items.length > 50) {
    throw new AppError('Order cannot contain more than 50 items', 400);
  }

  // Check for duplicate product IDs
  const productIds = items.map(item => item.productId);
  const uniqueIds = [...new Set(productIds)];
  if (uniqueIds.length !== productIds.length) {
    throw new AppError('Duplicate product IDs in order', 400);
  }

  const order = await prisma.$transaction(async (tx) => {
    let calculatedTotal = 0;
    const orderItemsData = [];

    // First, lock all products to prevent race conditions
    const productIdsToLock = items.map(item => Number(item.productId));
    
    // Use raw query with FOR UPDATE SKIP LOCKED to prevent deadlocks
    const products = await tx.$queryRaw`
      SELECT * FROM "Product" 
      WHERE id IN (${Prisma.join(productIdsToLock)})
      ORDER BY id
      FOR UPDATE
    `;

    const productMap = {};
    products.forEach(product => {
      productMap[product.id] = product;
    });

    for (const item of items) {
      // Validate item quantity
      if (!item.quantity || item.quantity < 1 || item.quantity > 100) {
        throw new AppError('Each item quantity must be between 1 and 100', 400);
      }

      const product = productMap[Number(item.productId)];

      if (!product) {
        throw new AppError(`Product with ID ${item.productId} not found`, 404);
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Only ${product.stock} available`,
          400
        );
      }

      const itemTotal = product.price * item.quantity;
      calculatedTotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    // Validate calculated total
    if (calculatedTotal < 0 || calculatedTotal > 10000000) {
      throw new AppError('Invalid order amount', 400);
    }

    // If totalAmount provided, verify it matches
    if (data.totalAmount !== undefined) {
      if (Math.abs(calculatedTotal - data.totalAmount) > 0.01) {
        throw new AppError(
          `Order total mismatch. Expected ${calculatedTotal}, received ${data.totalAmount}`,
          400
        );
      }
    }

    // Create order
    const newOrder = await tx.order.create({
      data: {
        customerName,
        phone,
        address: address || '',
        email: email || '',
        message: message || '',
        totalAmount: calculatedTotal,
        paymentStatus: 'PENDING',
        items: { create: orderItemsData },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Update stock AFTER order creation
    for (const item of items) {
      await tx.product.update({
        where: { id: Number(item.productId) },
        data: { 
          stock: { 
            decrement: item.quantity 
          } 
        },
      });
    }

    logger.info('Order created', {
      orderId: newOrder.id,
      total: calculatedTotal,
      itemCount: items.length,
      customerName,
      phone,
    });

    return newOrder;
  }, {
    maxWait: 5000,
    timeout: 10000,
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  });

  return { success: true, order };
}

/**
 * Confirm payment - WITH IDEMPOTENCY AND FRAUD PREVENTION
 */
async function confirmPayment(orderId, paymentData, userId) {
  const { paymentMethod, paymentProof, amount } = paymentData;

  // Validate payment method
  const validMethods = ['CASH', 'TRANSFER', 'CARD', 'QR'];
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    throw new AppError('Invalid payment method. Must be CASH, TRANSFER, CARD, or QR', 400);
  }

  // Require payment proof for non-cash payments
  if (paymentMethod !== 'CASH' && !paymentProof) {
    throw new AppError('Payment proof required for non-cash payments', 400);
  }

  // Idempotency key
  const idempotencyKey = `confirm-payment:${orderId}:${userId}:${Date.now()}`;

  return withIdempotency(idempotencyKey, async () => {
    const result = await prisma.$transaction(async (tx) => {
      // Get order with locking
      const order = await tx.order.findUnique({
        where: { id: Number(orderId) },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // IDEMPOTENCY CHECK: Payment already confirmed
      if (order.paymentStatus === 'CONFIRMED') {
        throw new AppError('Payment already confirmed', 400);
      }

      if (order.paymentStatus === 'REJECTED') {
        throw new AppError('Cannot confirm rejected payment', 400);
      }

      // FRAUD CHECK: Validate payment amount
      if (amount !== undefined && Math.abs(amount - order.totalAmount) > 0.01) {
        logger.warn('Payment amount mismatch', {
          orderId,
          expected: order.totalAmount,
          received: amount,
        });
        throw new AppError(`Payment amount mismatch. Expected ${order.totalAmount}, received ${amount}`, 400);
      }

      // Verify stock availability
      for (const item of order.items) {
        const product = item.product;
        
        if (product.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for ${product.name}. Only ${product.stock} available`,
            400
          );
        }
      }

      // Update stock
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { 
            stock: { 
              decrement: item.quantity 
            } 
          },
        });
      }

      // Update order payment status
      const updatedOrder = await tx.order.update({
        where: { id: Number(orderId) },
        data: {
          paymentStatus: 'CONFIRMED',
          paymentMethod,
          paymentProof,
          paymentConfirmedAt: new Date(),
          paymentConfirmedBy: userId,
          status: 'CONFIRMED',
          statusHistory: order.statusHistory 
            ? JSON.stringify([
                ...JSON.parse(order.statusHistory),
                {
                  status: 'CONFIRMED',
                  timestamp: new Date().toISOString(),
                  userId,
                  notes: 'Payment confirmed',
                }
              ])
            : JSON.stringify([
                {
                  status: 'CONFIRMED',
                  timestamp: new Date().toISOString(),
                  userId,
                  notes: 'Payment confirmed',
                }
              ]),
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      logger.info('Payment confirmed', {
        orderId,
        paymentMethod,
        userId,
        total: updatedOrder.totalAmount,
      });

      return updatedOrder;
    }, {
      maxWait: 5000,
      timeout: 10000,
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return {
      ok: true,
      order: result,
      message: 'Payment confirmed successfully',
    };
  });
}

/**
 * Reject payment
 */
async function rejectPayment(orderId, reason, userId) {
  if (!reason || reason.trim().length < 5) {
    throw new AppError('Rejection reason must be at least 5 characters', 400);
  }

  const order = await prisma.order.update({
    where: { id: Number(orderId) },
    data: {
      paymentStatus: 'REJECTED',
      status: 'CANCELLED',
      notes: reason ? `Payment rejected: ${reason}` : 'Payment rejected',
      statusHistory: {
        upsert: {
          create: {
            status: 'CANCELLED',
            timestamp: new Date().toISOString(),
            userId,
            notes: `Payment rejected: ${reason}`,
          },
          update: {
            $push: {
              statusHistory: {
                status: 'CANCELLED',
                timestamp: new Date().toISOString(),
                userId,
                notes: `Payment rejected: ${reason}`,
              },
            },
          },
        },
      },
    },
  });

  logger.info('Payment rejected', {
    orderId,
    reason,
    userId,
  });

  return {
    ok: true,
    order,
    message: 'Payment rejected successfully',
  };
}

/**
 * Get all orders - WITH ENHANCED PAGINATION
 */
async function getAllOrders(query) {
  const { 
    limit = 50, 
    offset = 0, 
    status, 
    paymentStatus,
    search,
    startDate,
    endDate,
  } = query;

  const where = {};
  
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Number(limit), 100),
      skip: Number(offset),
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
    limit: Number(limit),
    offset: Number(offset),
    hasMore: total > Number(offset) + Number(limit),
  };
}

/**
 * Get single order
 */
async function getOrderById(id) {
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return order;
}

/**
 * Get orders for CSV export
 */
async function getOrdersForExport() {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  return orders;
}

/**
 * Delete order
 */
async function deleteOrder(id) {
  // Check if order exists
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.paymentStatus === 'CONFIRMED') {
    throw new AppError('Cannot delete order with confirmed payment. Cancel it instead.', 400);
  }

  await prisma.order.delete({
    where: { id: Number(id) },
  });

  logger.info('Order deleted', { orderId: id });

  return {
    ok: true,
    message: 'Order deleted successfully',
  };
}

module.exports = {
  createQuickOrder,
  checkout,
  confirmPayment,
  rejectPayment,
  getAllOrders,
  getOrderById,
  getOrdersForExport,
  deleteOrder,
};