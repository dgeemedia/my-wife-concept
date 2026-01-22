// backend/src/routes/upload.js
const express = require('express');
const upload = require('../middleware/upload');
const { authMiddleware } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.post('/', authMiddleware, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new Error('No file uploaded');
  }

  const imageUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`;
  
  res.json({
    ok: true,
    imageUrl,
    filename: req.file.filename
  });
}));

module.exports = router;