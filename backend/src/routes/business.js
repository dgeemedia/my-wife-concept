// backend/src/routes/business.js
const express = require('express');
const router = express.Router();
const { 
  getBusinessBySlug,
  getAllBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getCurrentBusiness
} = require('../controllers/businessController');
const { authMiddleware, requireSuperAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================================================
// PUBLIC ROUTES (no auth required)
// ============================================================================

// GET /api/business/by-slug/:slug
// Used by frontend to load business data from subdomain
router.get('/by-slug/:slug', asyncHandler(getBusinessBySlug));

// ============================================================================
// AUTHENTICATED ROUTES
// ============================================================================

// GET /api/business/current
// Get current user's business
router.get('/current', authMiddleware, asyncHandler(getCurrentBusiness));

// GET /api/business/:id
// Get single business (user's own or super-admin can view any)
router.get('/:id', authMiddleware, asyncHandler(getBusiness));

// ============================================================================
// SUPER-ADMIN ONLY ROUTES
// ============================================================================

// GET /api/business
// List all businesses (super-admin only)
router.get('/', authMiddleware, requireSuperAdmin, asyncHandler(getAllBusinesses));

// POST /api/business
// Create new business (super-admin only)
router.post('/', authMiddleware, requireSuperAdmin, asyncHandler(createBusiness));

// PUT /api/business/:id
// Update business
router.put('/:id', authMiddleware, asyncHandler(updateBusiness));

// DELETE /api/business/:id
// Delete business (super-admin only)
router.delete('/:id', authMiddleware, requireSuperAdmin, asyncHandler(deleteBusiness));

module.exports = router;