// backend/src/routes/settings.js
const express = require('express');
const multer = require('multer');
const { asyncHandler } = require('../middleware/errorHandler');
const { superAdminAuth } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  uploadLogo,
  deleteLogo,
  updateWhatsAppNumber,
} = require('../controllers/settingsController');

const router = express.Router();

// Multer config for logo upload
const upload = multer({
  dest: '/tmp/uploads',
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP allowed.'));
    }
  },
});

/**
 * GET /api/settings
 * Public - Get business settings
 */
router.get('/', asyncHandler(async (req, res) => {
  const settings = await getSettings();
  res.json(settings);
}));

/**
 * PATCH /api/settings
 * Super Admin only - Update business settings
 */
router.patch('/', superAdminAuth, asyncHandler(async (req, res) => {
  const result = await updateSettings(req.body, req.user.id);
  res.json(result);
}));

/**
 * POST /api/settings/logo
 * Super Admin only - Upload business logo
 */
router.post('/logo', superAdminAuth, upload.single('logo'), asyncHandler(async (req, res) => {
  const result = await uploadLogo(req.file, req.user.id);
  res.json(result);
}));

/**
 * DELETE /api/settings/logo
 * Super Admin only - Delete business logo
 */
router.delete('/logo', superAdminAuth, asyncHandler(async (req, res) => {
  const result = await deleteLogo(req.user.id);
  res.json(result);
}));

/**
 * PATCH /api/settings/whatsapp
 * Super Admin only - Update WhatsApp number
 */
router.patch('/whatsapp', superAdminAuth, asyncHandler(async (req, res) => {
  const { whatsappNumber } = req.body;
  const result = await updateWhatsAppNumber(whatsappNumber, req.user.id);
  res.json(result);
}));

module.exports = router;