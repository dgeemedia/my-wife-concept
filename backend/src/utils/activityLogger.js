// backend/src/utils/activityLogger.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Log an activity
 * @param {number} userId - User ID who performed the action
 * @param {string} action - Action type (LOGIN, CREATE_PRODUCT, UPDATE_ORDER, etc.)
 * @param {string} entity - Entity type (product, order, user)
 * @param {number} entityId - ID of the entity
 * @param {object} details - Additional details
 * @param {string} ipAddress - User's IP address
 * @param {string} userAgent - User's browser/device info
 */
async function logActivity({
  userId,
  action,
  entity = null,
  entityId = null,
  details = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        userAgent,
      },
    });
    console.log(`✅ Activity logged: ${action} by user ${userId}`);
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    // Don't throw - keep application running even if logging fails
  }
}

/**
 * Log admin login
 */
async function logLogin(userId, ipAddress, userAgent) {
  return logActivity({
    userId,
    action: 'LOGIN',
    entity: 'user',
    entityId: userId,
    ipAddress,
    userAgent,
    details: { timestamp: new Date().toISOString() },
  });
}

/**
 * Log admin logout
 */
async function logLogout(userId, ipAddress, userAgent) {
  return logActivity({
    userId,
    action: 'LOGOUT',
    entity: 'user',
    entityId: userId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log product creation/update
 */
async function logProductChange(userId, action, productId, changes, ipAddress, userAgent) {
  return logActivity({
    userId,
    action,
    entity: 'product',
    entityId: productId,
    ipAddress,
    userAgent,
    details: { 
      productId, 
      changes, 
      timestamp: new Date().toISOString() 
    },
  });
}

/**
 * Log order status change
 */
async function logOrderChange(userId, orderId, oldStatus, newStatus, notes, ipAddress, userAgent) {
  return logActivity({
    userId,
    action: 'UPDATE_ORDER_STATUS',
    entity: 'order',
    entityId: orderId,
    ipAddress,
    userAgent,
    details: {
      orderId,
      oldStatus,
      newStatus,
      notes,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log payment confirmation
 */
async function logPaymentConfirmation(userId, orderId, paymentMethod, amount, ipAddress, userAgent) {
  return logActivity({
    userId,
    action: 'CONFIRM_PAYMENT',
    entity: 'order',
    entityId: orderId,
    ipAddress,
    userAgent,
    details: {
      orderId,
      paymentMethod,
      amount,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Get recent activities
 */
async function getRecentActivities(hours = 24, limit = 50) {
  const threshold = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return prisma.activityLog.findMany({
    where: {
      createdAt: { gte: threshold },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

module.exports = {
  logActivity,
  logLogin,
  logLogout,
  logProductChange,
  logOrderChange,
  logPaymentConfirmation,
  getRecentActivities,
};