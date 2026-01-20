// backend/src/routes/testimonials.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

// GET /api/testimonials
router.get('/', asyncHandler(async (req, res) => {
  // Return empty array for now since we don't have testimonials table
  res.json([]);
}));

module.exports = router;