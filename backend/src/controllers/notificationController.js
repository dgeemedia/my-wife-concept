// backend/src/controllers/notificationController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all notifications for a user
async function getNotifications(req, res) {
  const { limit = 20 } = req.query;
  
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
  });
  
  const unreadCount = await prisma.notification.count({
    where: { read: false }
  });
  
  res.json({
    success: true,
    notifications,
    unreadCount
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

// Mark all notifications as read
async function markAllAsRead(req, res) {
  await prisma.notification.updateMany({
    where: { read: false },
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
  markAsRead,
  markAllAsRead,
  createNotification
};