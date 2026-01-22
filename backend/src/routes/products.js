// backend/src/routes/products.js

const express = require('express');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authMiddleware, requireRole } = require('../middleware/auth');
const {
  validateProduct,
  validateIdParam,
} = require('../middleware/validation');

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
} = require('../controllers/productController');

const { logProductChange } = require('../utils/activityLogger');

const router = express.Router();

/**
 * GET /api/products
 * Public
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const products = await getAllProducts(req.query);
    res.json(products);
  })
);

/**
 * GET /api/products/:id
 * Public
 */
router.get(
  '/:id',
  validateIdParam,
  asyncHandler(async (req, res) => {
    const product = await getProductById(req.params.id);
    res.json(product);
  })
);

/**
 * POST /api/products
 * Admin only
 */
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  validateProduct,
  asyncHandler(async (req, res) => {
    const product = await createProduct(req.body);

    await logProductChange(
      req.user.id,
      'CREATE_PRODUCT',
      product.id,
      req.body,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json(product);
  })
);

/**
 * PUT /api/products/:id
 * Admin only
 */
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  validateIdParam,
  validateProduct,
  asyncHandler(async (req, res) => {
    const oldProduct = await getProductById(req.params.id);
    const product = await updateProduct(req.params.id, req.body);

    const changes = {};
    Object.keys(req.body).forEach((key) => {
      if (oldProduct[key] !== req.body[key]) {
        changes[key] = { from: oldProduct[key], to: req.body[key] };
      }
    });

    await logProductChange(
      req.user.id,
      'UPDATE_PRODUCT',
      product.id,
      changes,
      req.ip,
      req.get('user-agent')
    );

    res.json(product);
  })
);

/**
 * PATCH /api/products/:id
 * Admin only
 */
router.patch(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  validateIdParam,
  asyncHandler(async (req, res) => {
    if (Object.keys(req.body).length === 0) {
      throw new AppError('At least one field must be provided for update', 400);
    }

    const existing = await getProductById(req.params.id);

    const product = await updateProduct(req.params.id, {
      name: req.body.name ?? existing.name,
      price: req.body.price ?? existing.price,
      stock: req.body.stock ?? existing.stock,
      description: req.body.description ?? existing.description,
      imageUrl: req.body.imageUrl ?? existing.imageUrl,
    });

    res.json(product);
  })
);

/**
 * PATCH /api/products/:id/stock
 * Admin only
 */
router.patch(
  '/:id/stock',
  authMiddleware,
  requireRole('admin'),
  validateIdParam,
  asyncHandler(async (req, res) => {
    const { stock } = req.body;

    if (stock === undefined || isNaN(Number(stock))) {
      throw new AppError('stock must be a valid number', 400);
    }

    const product = await updateProductStock(req.params.id, Number(stock));
    res.json(product);
  })
);

/**
 * DELETE /api/products/:id
 * Admin only
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  validateIdParam,
  asyncHandler(async (req, res) => {
    const result = await deleteProduct(req.params.id);
    res.json(result);
  })
);

module.exports = router;
