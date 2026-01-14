// backend/src/utils/analytics.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get analytics data (TENANT FILTERED)
 */
async function getAnalytics(tenantId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where = { tenantId }; // CRITICAL: Filter by tenant

  const [
    ordersToday,
    revenueTodayAggregate,
    totalOrders,
    totalRevenueAggregate,
    topProducts,
    lowStockProducts,
  ] = await Promise.all([
    // Orders today (any payment status)
    prisma.order.count({
      where: { ...where, createdAt: { gte: today } },
    }),

    // Revenue today (ONLY confirmed payments)
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { ...where, createdAt: { gte: today }, paymentStatus: 'CONFIRMED' },
    }),

    // Total orders (any status)
    prisma.order.count({ where }),

    // Total revenue (ONLY confirmed payments)
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { ...where, paymentStatus: 'CONFIRMED' },
    }),

    // Top products (based on confirmed orders only)
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { tenantId, paymentStatus: 'CONFIRMED' }, // CRITICAL: Filter through order relation
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),

    // Low stock products for this tenant
    prisma.product.findMany({
      where: { 
        ...where,
        stock: { lte: 5 },
      },
      orderBy: { stock: 'asc' },
    }),
  ]);

  // Optimize: fetch product details in one query to avoid N+1
  const productIds = topProducts.map(p => p.productId).filter(Boolean);
  let productMap = {};
  if (productIds.length > 0) {
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        tenantId,
      },
      select: { id: true, name: true },
    });
    productMap = Object.fromEntries(products.map(p => [p.id, p.name]));
  }

  const topProductsWithDetails = topProducts.map((item) => ({
    productId: item.productId,
    name: productMap[item.productId] || null,
    totalSold: item._sum.quantity,
  }));

  return {
    ordersToday,
    revenueToday: (revenueTodayAggregate && revenueTodayAggregate._sum && revenueTodayAggregate._sum.totalAmount) || 0,
    totalOrders,
    totalRevenue: (totalRevenueAggregate && totalRevenueAggregate._sum && totalRevenueAggregate._sum.totalAmount) || 0,
    topProducts: topProductsWithDetails,
    lowStockProducts,
  };
}

/**
 * Get revenue by date range (TENANT FILTERED)
 */
async function getRevenueByDateRange(tenantId, startDate, endDate) {
  const revenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      tenantId,
      paymentStatus: 'CONFIRMED',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return revenue._sum.totalAmount || 0;
}

/**
 * Get orders by date range (TENANT FILTERED)
 */
async function getOrdersByDateRange(tenantId, startDate, endDate) {
  const orders = await prisma.order.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
}

module.exports = {
  getAnalytics,
  getRevenueByDateRange,
  getOrdersByDateRange,
};
