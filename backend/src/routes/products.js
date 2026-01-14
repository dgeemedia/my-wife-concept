// backend/src/routes/products.js
/**
 * Product management routes
 * Location: backend/src/routes/products.js
 *
 * Routes:
 *  GET    /api/products
 *  GET    /api/products/:id
 *  POST   /api/products        (admin)
 *  PUT    /api/products/:id    (admin)
 *  PATCH  /api/products/:id/stock (admin)
 *  DELETE /api/products/:id    (admin)
 */

const express = require('express');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { adminAuth } = require('../middleware/auth');
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

const router = express.Router();

/**
 * GET /api/products
 * Public - Get all products with optional filters
 * Query params: search, inStock (true/false)
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
 * Public - Get single product by ID
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
 * Admin only - Create new product
 */
router.post(
  '/',
  adminAuth,
  validateProduct,
  asyncHandler(async (req, res) => {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  })
);

/**
 * PUT /api/products/:id
 * Admin only - Update entire product
 */
router.put(
  '/:id',
  adminAuth,
  validateIdParam,
  validateProduct,
  asyncHandler(async (req, res) => {
    const product = await updateProduct(req.params.id, req.body);
    res.json(product);
  })
);

/**
 * PATCH /api/products/:id
 * Admin only - Partially update product (any fields)
 */
router.patch(
  '/:id',
  adminAuth,
  validateIdParam,
  asyncHandler(async (req, res) => {
    const { name, price, stock, description, imageUrl } = req.body;
    
    // Validate at least one field is provided
    if (Object.keys(req.body).length === 0) {
      throw new AppError('At least one field must be provided for update', 400);
    }

    // Get existing product first
    const existingProduct = await getProductById(req.params.id);
    
    // Update only provided fields
    const updateData = {
      name: name !== undefined ? name : existingProduct.name,
      price: price !== undefined ? Number(price) : existingProduct.price,
      stock: stock !== undefined ? Number(stock) : existingProduct.stock,
      description: description !== undefined ? description : existingProduct.description,
      imageUrl: imageUrl !== undefined ? imageUrl : existingProduct.imageUrl,
    };

    const product = await updateProduct(req.params.id, updateData);
    res.json(product);
  })
);

/**
 * PATCH /api/products/:id/stock
 * Admin only - update stock only
 * Body: { stock: <number> }
 */
router.patch(
  '/:id/stock',
  adminAuth,
  validateIdParam,
  asyncHandler(async (req, res) => {
    const { stock } = req.body;
    
    if (stock === undefined || isNaN(Number(stock))) {
      throw new AppError('stock is required and must be a valid number', 400);
    }
    
    const numericStock = Number(stock);
    if (numericStock < 0) {
      throw new AppError('stock cannot be negative', 400);
    }

    const product = await updateProductStock(req.params.id, numericStock);
    res.json(product);
  })
);

/**
 * DELETE /api/products/:id
 * Admin only - Delete product
 */
router.delete(
  '/:id',
  adminAuth,
  validateIdParam,
  asyncHandler(async (req, res) => {
    const result = await deleteProduct(req.params.id);
    res.json(result);
  })
);

/**
 * GET /api/products/search/suggestions
 * Public - Get product search suggestions
 * Query params: q (search query), limit (default: 10)
 */
router.get(
  '/search/suggestions',
  asyncHandler(async (req, res) => {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const suggestions = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        imageUrl: true,
      },
      take: Math.min(Number(limit), 50), // Cap at 50 for safety
    });

    res.json(suggestions);
  })
);

module.exports = router;
