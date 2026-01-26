// ============================================================================
// UPDATED PRODUCT ROUTES - WITH IMAGE MANAGEMENT
// backend/src/routes/products.js
// ============================================================================

const express = require('express');
const { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  addProductImage,
  deleteProductImage,
  reorderProductImages
} = require('../controllers/productController');
const { authMiddleware, requireSuperAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Existing product routes
router.get('/', asyncHandler(getAllProducts));
router.get('/:id', asyncHandler(getProductById));
router.post('/', authMiddleware, requireSuperAdmin, asyncHandler(createProduct));
router.put('/:id', authMiddleware, requireSuperAdmin, asyncHandler(updateProduct));
router.delete('/:id', authMiddleware, requireSuperAdmin, asyncHandler(deleteProduct));

// NEW: Image management routes
router.post('/:productId/images', authMiddleware, requireSuperAdmin, asyncHandler(addProductImage));
router.delete('/images/:imageId', authMiddleware, requireSuperAdmin, asyncHandler(deleteProductImage));
router.put('/:productId/images/reorder', authMiddleware, requireSuperAdmin, asyncHandler(reorderProductImages));

module.exports = router;