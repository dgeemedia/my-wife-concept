// backend/src/controllers/productController.js - WITH STOCK VALIDATIONS
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

/**
 * Get all products - SINGLE TENANT
 */
async function getAllProducts(query) {
  const { search, inStock } = query;
  const where = {};

  if (search) {
    where.name = {
      contains: search,
      mode: 'insensitive',
    };
  }

  if (inStock === 'true') {
    where.stock = { gt: 0 };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return products;
}

/**
 * Get single product
 */
async function getProductById(id) {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

/**
 * Create product - WITH VALIDATIONS
 */
async function createProduct(data) {
  const { name, price, stock, description, imageUrl } = data;

  // VALIDATION: Product name
  if (!name || name.trim().length < 2) {
    throw new AppError('Product name must be at least 2 characters', 400);
  }

  if (name.length > 200) {
    throw new AppError('Product name too long (max 200 characters)', 400);
  }

  // VALIDATION: Price
  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice < 0) {
    throw new AppError('Price must be a positive number', 400);
  }

  if (numPrice > 10000000) {
    throw new AppError('Price too high (max 10,000,000)', 400);
  }

  // VALIDATION: Stock
  const numStock = Number(stock);
  if (isNaN(numStock) || numStock < 0) {
    throw new AppError('Stock must be a non-negative number', 400);
  }

  if (numStock > 1000000) {
    throw new AppError('Stock value too high (max 1,000,000)', 400);
  }

  // Check for duplicate name
  const existing = await prisma.product.findFirst({
    where: {
      name: {
        equals: name.trim(),
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    throw new AppError('Product with this name already exists', 400);
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      price: numPrice,
      stock: numStock,
      description: description?.trim() || '',
      imageUrl: imageUrl?.trim() || '',
    },
  });

  return product;
}

/**
 * Update product - WITH VALIDATIONS
 */
async function updateProduct(id, data) {
  const { name, price, stock, description, imageUrl } = data;

  // Get existing product
  const existing = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    throw new AppError('Product not found', 404);
  }

  // VALIDATION: Product name
  if (name !== undefined) {
    if (!name || name.trim().length < 2) {
      throw new AppError('Product name must be at least 2 characters', 400);
    }

    if (name.length > 200) {
      throw new AppError('Product name too long (max 200 characters)', 400);
    }

    // Check for duplicate name (excluding current product)
    const duplicate = await prisma.product.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
        id: {
          not: Number(id),
        },
      },
    });

    if (duplicate) {
      throw new AppError('Product with this name already exists', 400);
    }
  }

  // VALIDATION: Price
  if (price !== undefined) {
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      throw new AppError('Price must be a positive number', 400);
    }

    if (numPrice > 10000000) {
      throw new AppError('Price too high (max 10,000,000)', 400);
    }
  }

  // VALIDATION: Stock
  if (stock !== undefined) {
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      throw new AppError('Stock must be a non-negative number', 400);
    }

    if (numStock > 1000000) {
      throw new AppError('Stock value too high (max 1,000,000)', 400);
    }
  }

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      ...(name && { name: name.trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(description !== undefined && { description: description?.trim() || '' }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || '' }),
    },
  });

  return product;
}

/**
 * Update product stock - WITH ENHANCED VALIDATION
 */
async function updateProductStock(id, stock) {
  // VALIDATION: Stock must be provided
  if (stock === undefined || stock === null) {
    throw new AppError('Stock value is required', 400);
  }

  const numStock = Number(stock);

  // VALIDATION: Stock must be a number
  if (isNaN(numStock)) {
    throw new AppError('Stock must be a valid number', 400);
  }

  // VALIDATION: Stock cannot be negative
  if (numStock < 0) {
    throw new AppError('Stock cannot be negative', 400);
  }

  // VALIDATION: Stock cannot exceed maximum
  if (numStock > 1000000) {
    throw new AppError('Stock value too high (max 1,000,000)', 400);
  }

  // Check if product exists
  const existing = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    throw new AppError('Product not found', 404);
  }

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: { stock: numStock },
  });

  return product;
}

/**
 * Delete product
 */
async function deleteProduct(id) {
  // Check if product exists
  const existing = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    throw new AppError('Product not found', 404);
  }

  // Check if product has orders
  const orderItems = await prisma.orderItem.count({
    where: { productId: Number(id) },
  });

  if (orderItems > 0) {
    throw new AppError(
      'Cannot delete product with existing orders. Consider marking it out of stock instead.',
      400
    );
  }

  await prisma.product.delete({
    where: { id: Number(id) },
  });

  return { ok: true, message: 'Product deleted successfully' };
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
};