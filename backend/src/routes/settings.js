// backend/src/routes/settings.js
const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authMiddleware, requireSuperAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/', asyncHandler(getSettings));
router.patch('/', authMiddleware, requireSuperAdmin, asyncHandler(updateSettings));

module.exports = router;