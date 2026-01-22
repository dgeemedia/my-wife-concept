// backend/src/routes/products.js
const express = require('express');
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authMiddleware, requireSuperAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/', asyncHandler(getAllProducts));
router.get('/:id', asyncHandler(getProductById));
router.post('/', authMiddleware, requireSuperAdmin, asyncHandler(createProduct));
router.put('/:id', authMiddleware, requireSuperAdmin, asyncHandler(updateProduct));
router.delete('/:id', authMiddleware, requireSuperAdmin, asyncHandler(deleteProduct));

module.exports = router;