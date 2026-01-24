// ============================================================================
// UPDATED ORDER CONTROLLER WITH PHONE NORMALIZATION
// backend/src/controllers/orderController.js
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to normalize phone numbers
function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, ''); // Remove all non-digit characters
}

async function checkout(req, res) {
  const { customerName, phone, address, email, message, items } = req.body;

  if (!customerName || !phone || !items || items.length === 0) {
    throw new Error('Missing required fields');
  }

  // ⭐ FIX: Normalize phone number before saving
  const normalizedPhone = normalizePhone(phone);
  
  console.log('📝 Creating order for phone:', normalizedPhone);

  // Validate and prepare order data BEFORE starting transaction
  let totalAmount = 0;
  const orderItems = [];
  const productUpdates = [];
  
  // Fetch all products first
  const productIds = items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } }
  });
  
  // Create a map for quick lookup
  const productMap = new Map(products.map(p => [p.id, p]));
  
  // Validate all items BEFORE transaction
  for (const item of items) {
    const product = productMap.get(item.productId);
    
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    
    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    
    totalAmount += product.price * item.quantity;
    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price,
    });
    productUpdates.push({ id: product.id, quantity: item.quantity });
  }
  
  // Prepare status history
  const statusHistory = JSON.stringify([{
    status: 'PENDING',
    timestamp: new Date().toISOString(),
    notes: 'Order created',
  }]);
  
  // Now run a FAST transaction with increased timeout
  const order = await prisma.$transaction(async (tx) => {
    // Create order with items in one operation
    const newOrder = await tx.order.create({
      data: {
        customerName,
        phone: normalizedPhone,  // ⭐ CHANGED: Use normalized phone
        address: address || '',
        email: email || '',
        message: message || '',
        totalAmount,
        currency: 'NGN',
        paymentStatus: 'PENDING',
        status: 'PENDING',
        statusHistory,
        items: { create: orderItems },
      },
    });
    
    // Update stock in batch
    await Promise.all(
      productUpdates.map(({ id, quantity }) =>
        tx.product.update({
          where: { id },
          data: { stock: { decrement: quantity } },
        })
      )
    );
    
    return newOrder;
  }, {
    maxWait: 10000,
    timeout: 15000,
  });

  // Fetch complete order with items AFTER transaction
  const completeOrder = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      items: { include: { product: true } },
    },
  });

  console.log('✅ Order created successfully:', completeOrder.id);

  res.status(201).json({
    success: true,
    order: {
      ...completeOrder,
      statusHistory: JSON.parse(completeOrder.statusHistory || '[]')
    },
  });
}

async function getAllOrders(req, res) {
  const { page = 1, limit = 50, status, paymentStatus, search } = req.query;

  const where = {};
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (search) {
    // ⭐ IMPROVED: Normalize phone search
    const normalizedSearch = normalizePhone(search);
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: normalizedSearch } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const ordersWithParsedHistory = orders.map(order => ({
    ...order,
    statusHistory: order.statusHistory ? JSON.parse(order.statusHistory) : []
  }));

  res.json({
    success: true,
    orders: ordersWithParsedHistory,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
}

async function getOrderById(req, res) {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  res.json({ 
    success: true, 
    order: {
      ...order,
      statusHistory: order.statusHistory ? JSON.parse(order.statusHistory) : []
    }
  });
}

async function confirmPayment(req, res) {
  const { paymentMethod } = req.body;

  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const history = order.statusHistory ? JSON.parse(order.statusHistory) : [];
  history.push({
    status: 'CONFIRMED',
    timestamp: new Date().toISOString(),
    notes: `Payment confirmed via ${paymentMethod || 'CASH'}`,
  });

  const updatedOrder = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: {
      paymentStatus: 'CONFIRMED',
      paymentMethod: paymentMethod || 'CASH',
      paymentConfirmedAt: new Date(),
      paymentConfirmedBy: req.user.id,
      status: 'CONFIRMED',
      statusHistory: JSON.stringify(history),
    },
    include: {
      items: { include: { product: true } },
    },
  });

  console.log('💰 Payment confirmed for order:', updatedOrder.id);

  res.json({ 
    success: true, 
    order: {
      ...updatedOrder,
      statusHistory: JSON.parse(updatedOrder.statusHistory)
    }
  });
}

async function updateOrderStatus(req, res) {
  const { status, notes } = req.body;

  const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    throw new Error('Invalid status');
  }

  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const history = order.statusHistory ? JSON.parse(order.statusHistory) : [];
  history.push({
    status,
    timestamp: new Date().toISOString(),
    notes: notes || `Status updated to ${status}`,
  });

  const updatedOrder = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: {
      status,
      statusHistory: JSON.stringify(history),
    },
    include: {
      items: { include: { product: true } },
    },
  });

  console.log(`📦 Order ${updatedOrder.id} status updated to:`, status);

  res.json({ 
    success: true, 
    order: {
      ...updatedOrder,
      statusHistory: JSON.parse(updatedOrder.statusHistory)
    }
  });
}

async function trackOrder(req, res) {
  const { orderId } = req.params;
  const { phone } = req.query;

  if (!phone) {
    throw new Error('Phone number required');
  }

  // ⭐ FIX: Normalize phone for comparison
  const normalizedPhone = normalizePhone(phone);
  
  console.log('🔍 Tracking order:', orderId, 'for phone:', normalizedPhone);

  const order = await prisma.order.findFirst({
    where: {
      id: Number(orderId),
      phone: normalizedPhone,  // ⭐ CHANGED: Use normalized phone
    },
    include: {
      items: { include: { product: { select: { name: true, imageUrl: true } } } },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  res.json({
    success: true,
    order: {
      ...order,
      statusHistory: order.statusHistory ? JSON.parse(order.statusHistory) : [],
    },
  });
}

async function deleteOrder(req, res) {
  const order = await prisma.order.findUnique({
    where: { id: Number(req.params.id) },
    include: { items: true },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.paymentStatus === 'PENDING') {
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }

  await prisma.order.delete({
    where: { id: Number(req.params.id) },
  });

  console.log('🗑️ Order deleted:', req.params.id);

  res.json({ success: true, message: 'Order deleted' });
}

module.exports = {
  checkout,
  getAllOrders,
  getOrderById,
  confirmPayment,
  updateOrderStatus,
  trackOrder,
  deleteOrder,
};