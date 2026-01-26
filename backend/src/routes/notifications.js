// backend/src/routes/notifications.js
const express = require('express');
const { getNotifications, markAsRead, markAllAsRead } = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/', authMiddleware, asyncHandler(getNotifications));
router.patch('/:id/read', authMiddleware, asyncHandler(markAsRead));
router.post('/read-all', authMiddleware, asyncHandler(markAllAsRead));

module.exports = router;