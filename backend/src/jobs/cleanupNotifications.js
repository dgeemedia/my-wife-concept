// backend/src/jobs/cleanupNotifications.js
/**
 * Optional Cron Job: Clean up notifications older than 90 days
 * 
 * This script can be run as a scheduled task (e.g., daily) to permanently delete
 * notifications that are older than 90 days to keep the database clean.
 * 
 * Setup with node-cron:
 * 1. Install: npm install node-cron
 * 2. Add to your server.js or create a separate jobs/scheduler file
 * 
 * Example usage:
 * const cron = require('node-cron');
 * const { cleanupOldNotifications } = require('./jobs/cleanupNotifications');
 * 
 * // Run every day at 2 AM
 * cron.schedule('0 2 * * *', cleanupOldNotifications);
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupOldNotifications(daysToKeep = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    console.log(`🧹 Starting notification cleanup for notifications older than ${daysToKeep} days...`);
    
    const result = await prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate }
      }
    });
    
    console.log(`✅ Cleanup complete: Deleted ${result.count} old notifications`);
    return result.count;
  } catch (error) {
    console.error('❌ Notification cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If run directly (not imported)
if (require.main === module) {
  cleanupOldNotifications()
    .then(count => {
      console.log(`Script completed. Deleted ${count} notifications.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { cleanupOldNotifications };