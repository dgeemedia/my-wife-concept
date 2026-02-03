// backend/src/controllers/notificationController.js
const prisma = require('../lib/prisma');

// Get all notifications for a user (excluding archived ones by default)
async function getNotifications(req, res) {
  const { limit = 20, includeArchived = false } = req.query;
  
  // Calculate date 30 days ago
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Build where clause
  const whereClause = includeArchived === 'true' 
    ? {} 
    : { createdAt: { gte: thirtyDaysAgo } };
  
  // 🔥 TENANT ISOLATION
  if (req.user.role !== 'super-admin') {
    whereClause.businessId = req.user.businessId;
  }
  
  const notifications = await prisma.notification.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
  });
  
  // Count unread notifications (only non-archived)
  const unreadCountWhere = { 
    read: false,
    createdAt: { gte: thirtyDaysAgo }
  };
  
  if (req.user.role !== 'super-admin') {
    unreadCountWhere.businessId = req.user.businessId;
  }
  
  const unreadCount = await prisma.notification.count({
    where: unreadCountWhere
  });
  
  // Count archived notifications
  const archivedCountWhere = { 
    createdAt: { lt: thirtyDaysAgo }
  };
  
  if (req.user.role !== 'super-admin') {
    archivedCountWhere.businessId = req.user.businessId;
  }
  
  const archivedCount = await prisma.notification.count({
    where: archivedCountWhere
  });
  
  res.json({
    success: true,
    notifications,
    unreadCount,
    archivedCount
  });
}

// Get archived notifications (older than 30 days)
async function getArchivedNotifications(req, res) {
  const { limit = 50 } = req.query;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const whereClause = { 
    createdAt: { lt: thirtyDaysAgo }
  };
  
  // 🔥 TENANT ISOLATION
  if (req.user.role !== 'super-admin') {
    whereClause.businessId = req.user.businessId;
  }
  
  const notifications = await prisma.notification.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
  });
  
  const totalArchived = await prisma.notification.count({
    where: whereClause
  });
  
  res.json({
    success: true,
    notifications,
    totalArchived
  });
}

// Mark notification as read
async function markAsRead(req, res) {
  const { id } = req.params;
  
  // 🔥 SECURITY: Verify notification belongs to user's business
  const notification = await prisma.notification.findUnique({
    where: { id: Number(id) }
  });
  
  if (!notification) {
    return res.status(404).json({ 
      success: false,
      error: 'Notification not found' 
    });
  }
  
  // 🔥 TENANT SECURITY CHECK
  if (req.user.role !== 'super-admin' && notification.businessId !== req.user.businessId) {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied' 
    });
  }
  
  const updatedNotification = await prisma.notification.update({
    where: { id: Number(id) },
    data: { 
      read: true,
      readAt: new Date()
    }
  });
  
  res.json({
    success: true,
    notification: updatedNotification
  });
}

// Mark all notifications as read (only non-archived ones)
async function markAllAsRead(req, res) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const whereClause = { 
    read: false,
    createdAt: { gte: thirtyDaysAgo }
  };
  
  // 🔥 TENANT ISOLATION
  if (req.user.role !== 'super-admin') {
    whereClause.businessId = req.user.businessId;
  }
  
  await prisma.notification.updateMany({
    where: whereClause,
    data: { 
      read: true,
      readAt: new Date()
    }
  });
  
  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}

// Delete old archived notifications (optional cleanup - run as cron job)
async function deleteOldNotifications(req, res) {
  const { days = 90 } = req.query; // Delete notifications older than 90 days
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - Number(days));
  
  const whereClause = {
    createdAt: { lt: cutoffDate }
  };
  
  // 🔥 TENANT ISOLATION (only super-admin can delete across all businesses)
  if (req.user.role !== 'super-admin') {
    whereClause.businessId = req.user.businessId;
  }
  
  const result = await prisma.notification.deleteMany({
    where: whereClause
  });
  
  res.json({
    success: true,
    message: `Deleted ${result.count} old notifications`,
    deletedCount: result.count
  });
}

// Create notification (helper function for internal use)
async function createNotification({ type, title, message, link, orderId, productId, businessId }) {
  try {
    // ✅ VALIDATE: businessId is required for tenant isolation
    if (!businessId) {
      console.warn('⚠️ Notification created without businessId - this may cause issues');
    }
    
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        link,
        orderId,
        productId,
        businessId,  // 🔥 CRITICAL: Assign to business
        read: false
      }
    });
    
    console.log(`📬 Created notification for business ${businessId}: ${title}`);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

module.exports = {
  getNotifications,
  getArchivedNotifications,
  markAsRead,
  markAllAsRead,
  deleteOldNotifications,
  createNotification
};