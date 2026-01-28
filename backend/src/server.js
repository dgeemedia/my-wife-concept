// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { cleanupOldNotifications } = require('./jobs/cleanupNotifications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api', require('./routes/ratings'));
app.use('/api/language', require('./routes/language'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Something went wrong',
  });
});

// ========================================
// CRON JOBS
// ========================================

// Schedule notification cleanup to run every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Running scheduled notification cleanup...');
  try {
    const deletedCount = await cleanupOldNotifications(90);
    console.log(`✅ Scheduled cleanup completed. Deleted ${deletedCount} notifications.`);
  } catch (error) {
    console.error('❌ Scheduled cleanup failed:', error);
  }
});

console.log('✅ Cron jobs scheduled');

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});