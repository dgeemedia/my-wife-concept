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

    return tx.order.create({
      data: {
        customerName,
        address: address || '',
        phone,
        email: email || '',
        message: message || '',
        totalAmount: product.price * qty,
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
 * Checkout with multiple items
 */
async function checkout(data) {
  const { customerName, phone, address, email, message, items } = data;

  const order = await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
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

      totalAmount += product.price * item.quantity;
      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    return tx.order.create({
      data: {
        customerName,
        phone,
        address: address || '',
        email: email || '',
        message: message || '',
        totalAmount,
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
 * Confirm payment
 */
async function confirmPayment(orderId, paymentData, userId) {
  const { paymentMethod, paymentProof } = paymentData;

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

    // Update stock after payment confirmed
    for (const item of existingOrder.items) {
      const product = item.product;
      
      if (product.stock < item.quantity) {
        throw new AppError(
          `Stock changed. ${product.name} now has only ${product.stock} available`,
          400
        );
      }

      await tx.product.update({
        where: { id: product.id },
        data: { stock: product.stock - item.quantity },
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
 * Get all orders
 */
async function getAllOrders(query) {
  const { limit, offset } = query;

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    ...(limit && { take: Number(limit) }),
    ...(offset && { skip: Number(offset) }),
  });

  const total = await prisma.order.count();

  return {
    orders,
    total,
    limit: limit ? Number(limit) : null,
    offset: offset ? Number(offset) : 0,
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
  });

  return orders;
}

/**
 * Delete order
 */
async function deleteOrder(id) {
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