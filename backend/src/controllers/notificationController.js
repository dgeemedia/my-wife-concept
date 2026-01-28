// backend/src/controllers/notificationController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  
  const notifications = await prisma.notification.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
  });
  
  // Count unread notifications (only non-archived)
  const unreadCount = await prisma.notification.count({
    where: { 
      read: false,
      createdAt: { gte: thirtyDaysAgo }
    }
  });
  
  // Count archived notifications
  const archivedCount = await prisma.notification.count({
    where: { 
      createdAt: { lt: thirtyDaysAgo }
    }
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
  
  const notifications = await prisma.notification.findMany({
    where: { 
      createdAt: { lt: thirtyDaysAgo }
    },
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
  });
  
  const totalArchived = await prisma.notification.count({
    where: { 
      createdAt: { lt: thirtyDaysAgo }
    }
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
  
  const notification = await prisma.notification.update({
    where: { id: Number(id) },
    data: { 
      read: true,
      readAt: new Date()
    }
  });
  
  res.json({
    success: true,
    notification
  });
}

// Mark all notifications as read (only non-archived ones)
async function markAllAsRead(req, res) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await prisma.notification.updateMany({
    where: { 
      read: false,
      createdAt: { gte: thirtyDaysAgo }
    },
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
  
  const result = await prisma.notification.deleteMany({
    where: {
      createdAt: { lt: cutoffDate }
    }
  });
  
  res.json({
    success: true,
    message: `Deleted ${result.count} old notifications`,
    deletedCount: result.count
  });
}

// Create notification (helper function for internal use)
async function createNotification({ type, title, message, link, orderId, productId }) {
  try {
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        link,
        orderId,
        productId,
        read: false
      }
    });
    
    console.log(`📬 Created notification: ${title}`);
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