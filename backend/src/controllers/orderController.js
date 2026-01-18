// backend/src/controllers/orderController.js
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

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

    // VALIDATION: Check order amount
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
 * Checkout with multiple items - WITH VALIDATIONS
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

  const order = await prisma.$transaction(async (tx) => {
    let calculatedTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      // Validate item quantity
      if (!item.quantity || item.quantity < 1 || item.quantity > 100) {
        throw new AppError('Each item quantity must be between 1 and 100', 400);
      }

      const product = await tx.product.findUnique({
        where: { id: Number(item.productId) },
      });

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

    // VALIDATION: Check calculated total
    if (calculatedTotal < 0 || calculatedTotal > 10000000) {
      throw new AppError('Invalid order amount', 400);
    }

    // VALIDATION: If totalAmount provided, verify it matches
    if (data.totalAmount !== undefined) {
      if (Math.abs(calculatedTotal - data.totalAmount) > 0.01) {
        throw new AppError(
          `Order total mismatch. Expected ${calculatedTotal}, received ${data.totalAmount}`,
          400
        );
      }
    }

    return tx.order.create({
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
  });

  return { success: true, order };
}

/**
 * Confirm payment - WITH ENHANCED VALIDATION
 */
async function confirmPayment(orderId, paymentData, userId) {
  const { paymentMethod, paymentProof } = paymentData;

  // VALIDATION: Validate payment method
  const validMethods = ['CASH', 'TRANSFER', 'CARD'];
  if (!paymentMethod || !validMethods.includes(paymentMethod)) {
    throw new AppError('Invalid payment method. Must be CASH, TRANSFER, or CARD', 400);
  }

  // VALIDATION: Require payment proof for non-cash payments
  if (paymentMethod !== 'CASH' && !paymentProof) {
    throw new AppError('Payment proof required for non-cash payments', 400);
  }

  const order = await prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!existingOrder) {
      throw new AppError('Order not found', 404);
    }

    if (existingOrder.paymentStatus === 'CONFIRMED') {
      throw new AppError('Payment already confirmed', 400);
    }

    if (existingOrder.paymentStatus === 'REJECTED') {
      throw new AppError('Cannot confirm rejected payment', 400);
    }

    // VALIDATION: Verify stock availability before confirming
    for (const item of existingOrder.items) {
      const product = item.product;
      
      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Only ${product.stock} available`,
          400
        );
      }
    }

    // Update stock only AFTER payment confirmed
    for (const item of existingOrder.items) {
      await tx.product.update({
        where: { id: item.product.id },
        data: { stock: { decrement: item.quantity } },
      });
    }

    const updatedOrder = await tx.order.update({
      where: { id: Number(orderId) },
      data: {
        paymentStatus: 'CONFIRMED',
        paymentMethod,
        paymentProof,
        paymentConfirmedAt: new Date(),
        paymentConfirmedBy: userId,
        status: 'CONFIRMED',
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return updatedOrder;
  });

  return { ok: true, order, message: 'Payment confirmed successfully' };
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
    },
  });

  return { ok: true, order, message: 'Payment rejected successfully' };
}

/**
 * Get all orders - WITH PAGINATION
 */
async function getAllOrders(query) {
  const { limit = 50, offset = 0, status, search } = query;

  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
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
      take: Math.min(Number(limit), 100), // Max 100 per request
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
    take: 1000, // Limit export to 1000 orders
  });

  return orders;
}

/**
 * Delete order
 */
async function deleteOrder(id) {
  // Check if order has confirmed payment
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

  return { ok: true, message: 'Order deleted successfully' };
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