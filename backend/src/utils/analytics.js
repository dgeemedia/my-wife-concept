// backend/src/utils/analytics.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Helper: Get start date for period
 */
function getStartDate(period) {
  const now = new Date();
  
  switch (period) {
    case 'today':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return today;
      
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
      
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
      
    default:
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }
}

/**
 * Get analytics data for dashboard
 */
async function getAnalytics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    ordersToday,
    revenueTodayAggregate,
    totalOrders,
    totalRevenueAggregate,
    topProducts,
    lowStockProducts,
    recentOrders,
    ordersByStatus,
  ] = await Promise.all([
    // Orders today (all statuses)
    prisma.order.count({
      where: { createdAt: { gte: today } },
    }),

    // Revenue today (ONLY confirmed payments)
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { 
        createdAt: { gte: today }, 
        paymentStatus: 'CONFIRMED' 
      },
    }),

    // Total orders (all time)
    prisma.order.count(),

    // Total revenue (ONLY confirmed payments)
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: 'CONFIRMED' },
    }),

    // Top products (based on confirmed orders only)
    prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { paymentStatus: 'CONFIRMED' },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),

    // Low stock products
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      orderBy: { stock: 'asc' },
      take: 10,
    }),

    // Recent orders
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true },
        },
      },
    }),

    // Orders by status
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  // Fetch product details for top products
  const productIds = topProducts.map(p => p.productId).filter(Boolean);
  let productMap = {};
  
  if (productIds.length > 0) {
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true, imageUrl: true },
    });
    productMap = Object.fromEntries(products.map(p => [p.id, p]));
  }

  const topProductsWithDetails = topProducts.map((item) => ({
    productId: item.productId,
    name: productMap[item.productId]?.name || 'Unknown Product',
    price: productMap[item.productId]?.price || 0,
    imageUrl: productMap[item.productId]?.imageUrl || null,
    totalSold: item._sum.quantity,
  }));

  // Format orders by status
  const orderStatusMap = {};
  ordersByStatus.forEach(item => {
    orderStatusMap[item.status] = item._count.id;
  });

  return {
    ordersToday,
    revenueToday: revenueTodayAggregate?._sum?.totalAmount || 0,
    totalOrders,
    totalRevenue: totalRevenueAggregate?._sum?.totalAmount || 0,
    topProducts: topProductsWithDetails,
    lowStockProducts,
    recentOrders,
    ordersByStatus: orderStatusMap,
  };
}

/**
 * Get revenue by date range
 */
async function getRevenueByDateRange(startDate, endDate) {
  const revenue = await prisma.order.aggregate({
    _sum: { totalAmount: true },
    where: {
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
 * Get orders by date range
 */
async function getOrdersByDateRange(startDate, endDate) {
  const orders = await prisma.order.findMany({
    where: {
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

/**
 * Get sales statistics for a specific period
 */
async function getSalesStatistics(period = 'week') {
  const startDate = getStartDate(period);

  const [orderCount, revenue, averageOrderValue] = await Promise.all([
    prisma.order.count({
      where: { createdAt: { gte: startDate } },
    }),

    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'CONFIRMED',
      },
    }),

    prisma.order.aggregate({
      _avg: { totalAmount: true },
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'CONFIRMED',
      },
    }),
  ]);

  return {
    period,
    startDate: startDate.toISOString(),
    orderCount,
    revenue: revenue._sum.totalAmount || 0,
    averageOrderValue: averageOrderValue._avg.totalAmount || 0,
  };
}

/**
 * Get daily sales for chart (last N days)
 */
async function getDailySales(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: startDate },
      paymentStatus: 'CONFIRMED',
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
  });

  // Group by date
  const salesByDate = {};
  orders.forEach(order => {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!salesByDate[date]) {
      salesByDate[date] = { date, revenue: 0, orders: 0 };
    }
    salesByDate[date].revenue += order.totalAmount;
    salesByDate[date].orders += 1;
  });

  // Convert to array and sort
  return Object.values(salesByDate).sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
}

/**
 * Get product performance metrics
 */
async function getProductPerformance() {
  const products = await prisma.product.findMany({
    include: {
      items: {
        where: {
          order: { paymentStatus: 'CONFIRMED' },
        },
      },
    },
  });

  const performance = products.map(product => {
    const totalSold = product.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = product.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      totalSold,
      totalRevenue,
      imageUrl: product.imageUrl,
    };
  });

  return performance.sort((a, b) => b.totalRevenue - a.totalRevenue);
}

/**
 * Get customer insights (top customers by order count)
 */
async function getCustomerInsights() {
  const customers = await prisma.order.groupBy({
    by: ['phone', 'customerName'],
    where: { paymentStatus: 'CONFIRMED' },
    _count: { id: true },
    _sum: { totalAmount: true },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  });

  return customers.map(customer => ({
    phone: customer.phone,
    name: customer.customerName,
    orderCount: customer._count.id,
    totalSpent: customer._sum.totalAmount || 0,
  }));
}

/**
 * Get payment statistics
 */
async function getPaymentStatistics() {
  const [confirmed, pending, rejected] = await Promise.all([
    prisma.order.count({ where: { paymentStatus: 'CONFIRMED' } }),
    prisma.order.count({ where: { paymentStatus: 'PENDING' } }),
    prisma.order.count({ where: { paymentStatus: 'REJECTED' } }),
  ]);

  const total = confirmed + pending + rejected;

  return {
    confirmed,
    pending,
    rejected,
    total,
    confirmationRate: total > 0 ? ((confirmed / total) * 100).toFixed(2) : 0,
  };
}

/**
 * Get revenue breakdown by payment method
 */
async function getRevenueBreakdown(period = 'month') {
  const startDate = getStartDate(period);

  const breakdown = await prisma.order.groupBy({
    by: ['paymentMethod'],
    where: {
      paymentStatus: 'CONFIRMED',
      createdAt: { gte: startDate },
    },
    _sum: { totalAmount: true },
    _count: { id: true },
  });

  return {
    period,
    startDate: startDate.toISOString(),
    breakdown: breakdown.map(item => ({
      paymentMethod: item.paymentMethod || 'UNSPECIFIED',
      revenue: item._sum.totalAmount || 0,
      orderCount: item._count.id,
    })),
  };
}

module.exports = {
  getAnalytics,
  getRevenueByDateRange,
  getOrdersByDateRange,
  getSalesStatistics,
  getDailySales,
  getProductPerformance,
  getCustomerInsights,
  getPaymentStatistics,
  getRevenueBreakdown,
};