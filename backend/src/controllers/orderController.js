// backend/src/controllers/orderController.js - FIXED VERSION
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');
const { formatOrderMessage } = require('../utils/whatsapp');

const prisma = new PrismaClient();

/**
 * Create quick single-item order
 */
async function createQuickOrder(data) {
  const { customerName, phone, productId, quantity = 1, address, email, message } = data;

  // Verify product exists and has stock
  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.stock < quantity) {
    throw new AppError(`Insufficient stock. Only ${product.stock} available.`, 400);
  }

  // Calculate total
  const totalAmount = product.price * quantity;

  // Create order
  const order = await prisma.order.create({
    data: {
      customerName,
      phone,
      address: address || '',
      email: email || '',
      message: message || '',
      totalAmount,
      currency: 'NGN',
      paymentStatus: 'PENDING',
      status: 'PENDING',
      items: {
        create: [
          {
            productId: product.id,
            quantity,
            unitPrice: product.price,
          },
        ],
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Update product stock
  await prisma.product.update({
    where: { id: product.id },
    data: { stock: { decrement: quantity } },
  });

  return {
    success: true,
    order,
    message: 'Order created successfully',
  };
}

/**
 * Checkout with cart items - FIXED (Optimized for transaction timeout)
 */
async function checkout(data) {
  console.log('🔵 Checkout function called with:', data);

  try {
    const { customerName, phone, address, email, message, items } = data;

    // Validation
    if (!customerName || !phone) {
      throw new AppError('Customer name and phone are required', 400);
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    console.log('🔵 Validating products...');

    // STEP 1: Verify all products exist and calculate total BEFORE transaction
    let totalAmount = 0;
    const orderItems = [];
    const productUpdates = [];

    // Fetch all products in one query for better performance
    const productIds = items.map(item => Number(item.productId));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Create a map for quick lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    // Validate and prepare data
    for (const item of items) {
      const product = productMap.get(Number(item.productId));

      if (!product) {
        throw new AppError(`Product with ID ${item.productId} not found`, 404);
      }

      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Only ${product.stock} available.`,
          400
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });

      productUpdates.push({
        id: product.id,
        quantity: item.quantity,
      });
    }

    console.log('🔵 Creating order with total:', totalAmount);

    // STEP 2: Fast transaction with optimized queries
    const order = await prisma.$transaction(
      async (tx) => {
        // Create the order with items in one query
        const newOrder = await tx.order.create({
          data: {
            customerName: customerName.trim(),
            phone: phone.trim(),
            address: address?.trim() || '',
            email: email?.trim() || '',
            message: message?.trim() || '',
            totalAmount,
            currency: 'NGN',
            paymentStatus: 'PENDING',
            status: 'PENDING',
            items: {
              create: orderItems,
            },
          },
        });

        // Update all product stocks in parallel
        await Promise.all(
          productUpdates.map(({ id, quantity }) =>
            tx.product.update({
              where: { id },
              data: { stock: { decrement: quantity } },
            })
          )
        );

        return newOrder;
      },
      {
        maxWait: 10000, // 10 seconds max wait
        timeout: 15000, // 15 seconds timeout
      }
    );

    // STEP 3: Fetch the complete order with relations AFTER transaction
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log('🟢 Order created successfully:', completeOrder.id);

    return {
      success: true,
      order: completeOrder,
      message: 'Order created successfully',
    };
  } catch (error) {
    console.error('❌ Checkout error:', error);
    
    // Re-throw AppError as-is
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle Prisma-specific errors
    if (error.code === 'P2034') {
      throw new AppError('Transaction timeout. Please try again.', 500);
    }
    
    // Wrap other errors
    throw new AppError(error.message || 'Checkout failed', 500);
  }
}

/**
 * Get all orders with filtering
 */
async function getAllOrders(query) {
  const {
    page = 1,
    limit = 50,
    status,
    paymentStatus,
    phone,
    startDate,
    endDate,
    search,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const where = {};

  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (phone) where.phone = { contains: phone };
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

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
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    success: true,
    orders,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  };
}

/**
 * Get single order by ID
 */
async function getOrderById(id) {
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  return { success: true, order };
}

/**
 * Get orders for export
 */
async function getOrdersForExport() {
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });
}

/**
 * Delete order
 */
async function deleteOrder(id) {
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Restore stock if order was pending
  if (order.paymentStatus === 'PENDING') {
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

  await prisma.order.delete({
    where: { id: Number(id) },
  });

  return {
    success: true,
    message: 'Order deleted successfully',
  };
}

/**
 * Confirm payment
 */
async function confirmPayment(orderId, paymentData, userId) {
  const { paymentMethod, paymentProof, amount } = paymentData;

  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.paymentStatus === 'CONFIRMED') {
    throw new AppError('Payment already confirmed', 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: Number(orderId) },
    data: {
      paymentStatus: 'CONFIRMED',
      paymentMethod: paymentMethod || 'CASH',
      paymentProof: paymentProof || null,
      paymentConfirmedAt: new Date(),
      paymentConfirmedBy: userId,
      status: 'CONFIRMED',
      totalAmount: amount || order.totalAmount,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return {
    success: true,
    order: updatedOrder,
    message: 'Payment confirmed successfully',
  };
}

/**
 * Reject payment
 */
async function rejectPayment(orderId, reason, userId) {
  const order = await prisma.order.findUnique({
    where: { id: Number(orderId) },
    include: { items: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Restore stock
  for (const item of order.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: Number(orderId) },
    data: {
      paymentStatus: 'FAILED',
      status: 'CANCELLED',
      notes: reason,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return {
    success: true,
    order: updatedOrder,
    message: 'Payment rejected',
  };
}

/**
 * Get order statistics
 */
async function getOrderStats(query) {
  const { startDate, endDate } = query;
  
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [
    totalOrders,
    pendingOrders,
    confirmedOrders,
    totalRevenue,
  ] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.count({ where: { ...where, paymentStatus: 'PENDING' } }),
    prisma.order.count({ where: { ...where, paymentStatus: 'CONFIRMED' } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { ...where, paymentStatus: 'CONFIRMED' },
    }),
  ]);

  return {
    success: true,
    stats: {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
    },
  };
}

module.exports = {
  createQuickOrder,
  checkout,
  getAllOrders,
  getOrderById,
  getOrdersForExport,
  deleteOrder,
  confirmPayment,
  rejectPayment,
  getOrderStats,
};