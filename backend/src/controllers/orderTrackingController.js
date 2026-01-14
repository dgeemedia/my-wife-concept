// backend/src/controllers/orderTrackingController.js
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');
const { formatOrderMessage } = require('../utils/whatsapp');
const { createLogger } = require('../utils/logger');

const prisma = new PrismaClient();
const logger = createLogger('OrderTracking');

/**
 * Order Status Enum (must match Prisma schema)
 */
const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
};

/**
 * Update order status
 */
async function updateOrderStatus(orderId, status, notes = null, userId = null) {
  const validStatuses = Object.values(OrderStatus);
  
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const order = await prisma.order.findUnique({
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

  // Build status history
  const currentHistory = order.statusHistory ? JSON.parse(order.statusHistory) : [];
  const newHistoryEntry = {
    status,
    timestamp: new Date().toISOString(),
    userId,
    notes,
  };
  currentHistory.push(newHistoryEntry);

  // Update order
  const updatedOrder = await prisma.order.update({
    where: { id: Number(orderId) },
    data: {
      status,
      statusHistory: JSON.stringify(currentHistory),
      ...(notes && { notes }),
    },
    include: {
      items: {
        include: { product: true },
      },
    },
  });

  logger.info(`Order #${orderId} status updated to ${status}`, {
    orderId,
    status,
    userId,
  });

  // TODO: Send notification to customer (WhatsApp/SMS/Email)
  // await notifyCustomer(updatedOrder, status);

  return {
    ok: true,
    order: updatedOrder,
    message: `Order status updated to ${status}`,
  };
}

/**
 * Get order status by ID (public endpoint)
 */
async function getOrderStatus(orderId, phone) {
  const order = await prisma.order.findFirst({
    where: {
      id: Number(orderId),
      phone: phone, // Verify order belongs to this phone number
    },
    select: {
      id: true,
      status: true,
      statusHistory: true,
      customerName: true,
      totalAmount: true,
      createdAt: true,
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

  return {
    ok: true,
    order: {
      ...order,
      statusHistory: order.statusHistory ? JSON.parse(order.statusHistory) : [],
    },
  };
}

/**
 * Get order status history
 */
async function getOrderStatusHistory(orderId) {
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    select: {
      id: true,
      status: true,
      statusHistory: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return {
    ok: true,
    currentStatus: order.status,
    history: order.statusHistory ? JSON.parse(order.statusHistory) : [],
  };
}

/**
 * Get orders by status (admin)
 */
async function getOrdersByStatus(status, limit = 50, offset = 0) {
  const validStatuses = Object.values(OrderStatus);
  
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const orders = await prisma.order.findMany({
    where: { status },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    skip: Number(offset),
  });

  const total = await prisma.order.count({
    where: { status },
  });

  return {
    orders,
    total,
    status,
    limit: Number(limit),
    offset: Number(offset),
  };
}

/**
 * Get status statistics (admin dashboard)
 */
async function getStatusStatistics() {
  const stats = await Promise.all(
    Object.values(OrderStatus).map(async (status) => {
      const count = await prisma.order.count({ where: { status } });
      return { status, count };
    })
  );

  return {
    ok: true,
    statistics: stats,
    totalOrders: stats.reduce((sum, item) => sum + item.count, 0),
  };
}

/**
 * Bulk update order statuses
 */
async function bulkUpdateStatus(orderIds, status, notes = null, userId = null) {
  const validStatuses = Object.values(OrderStatus);
  
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const historyEntry = {
    status,
    timestamp: new Date().toISOString(),
    userId,
    notes,
    bulk: true,
  };

  const results = await Promise.all(
    orderIds.map(async (orderId) => {
      try {
        const order = await prisma.order.findUnique({
          where: { id: Number(orderId) },
        });

        if (!order) {
          return { orderId, success: false, error: 'Order not found' };
        }

        const currentHistory = order.statusHistory ? JSON.parse(order.statusHistory) : [];
        currentHistory.push(historyEntry);

        await prisma.order.update({
          where: { id: Number(orderId) },
          data: {
            status,
            statusHistory: JSON.stringify(currentHistory),
            ...(notes && { notes }),
          },
        });

        return { orderId, success: true };
      } catch (error) {
        return { orderId, success: false, error: error.message };
      }
    })
  );

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  logger.info(`Bulk status update: ${successful} succeeded, ${failed} failed`, {
    status,
    userId,
  });

  return {
    ok: true,
    message: `Updated ${successful} orders, ${failed} failed`,
    results,
  };
}

/**
 * Cancel order
 */
async function cancelOrder(orderId, reason, userId = null) {
  const order = await prisma.$transaction(async (tx) => {
    const orderToCancel = await tx.order.findUnique({
      where: { id: Number(orderId) },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!orderToCancel) {
      throw new AppError('Order not found', 404);
    }

    if (orderToCancel.status === OrderStatus.DELIVERED) {
      throw new AppError('Cannot cancel delivered order', 400);
    }

    // Restore stock
    for (const item of orderToCancel.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      });
    }

    // Update order status
    const currentHistory = orderToCancel.statusHistory 
      ? JSON.parse(orderToCancel.statusHistory) 
      : [];
    
    currentHistory.push({
      status: OrderStatus.CANCELLED,
      timestamp: new Date().toISOString(),
      userId,
      notes: reason,
    });

    const updatedOrder = await tx.order.update({
      where: { id: Number(orderId) },
      data: {
        status: OrderStatus.CANCELLED,
        statusHistory: JSON.stringify(currentHistory),
        notes: reason,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    return updatedOrder;
  });

  logger.info(`Order #${orderId} cancelled`, { orderId, reason, userId });

  return {
    ok: true,
    order,
    message: 'Order cancelled successfully',
  };
}

module.exports = {
  OrderStatus,
  updateOrderStatus,
  getOrderStatus,
  getOrderStatusHistory,
  getOrdersByStatus,
  getStatusStatistics,
  bulkUpdateStatus,
  cancelOrder,
};