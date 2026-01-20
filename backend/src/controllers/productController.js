// backend/src/controllers/productController.js - FIXED VERSION
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
 * Create product - FIXED VALIDATIONS
 */
async function createProduct(data) {
  const { name, price, stock, description, imageUrl } = data;

  // VALIDATION: Required fields
  if (!name || !price || stock === undefined || stock === null) {
    throw new AppError('Name, price, and stock are required', 400);
  }

  // VALIDATION: Product name
  const trimmedName = name.trim();
  if (trimmedName.length < 2) {
    throw new AppError('Product name must be at least 2 characters', 400);
  }

  if (trimmedName.length > 200) {
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
        equals: trimmedName,
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    throw new AppError('Product with this name already exists', 400);
  }

  // Create product with validated data
  const product = await prisma.product.create({
    data: {
      name: trimmedName,
      price: numPrice,
      stock: numStock,
      description: description?.trim() || '',
      imageUrl: imageUrl?.trim() || '',
    },
  });

  return product;
}

/**
 * Update product - FIXED VALIDATIONS
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

  const updateData = {};

  // VALIDATION: Product name
  if (name !== undefined) {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      throw new AppError('Product name must be at least 2 characters', 400);
    }

    if (trimmedName.length > 200) {
      throw new AppError('Product name too long (max 200 characters)', 400);
    }

    // Check for duplicate name (excluding current product)
    const duplicate = await prisma.product.findFirst({
      where: {
        name: {
          equals: trimmedName,
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

    updateData.name = trimmedName;
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

    updateData.price = numPrice;
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

    updateData.stock = numStock;
  }

  // Optional fields
  if (description !== undefined) {
    updateData.description = description?.trim() || '';
  }

  if (imageUrl !== undefined) {
    updateData.imageUrl = imageUrl?.trim() || '';
  }

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: updateData,
  });

  return product;
}

/**
 * Update product stock
 */
async function updateProductStock(id, stock) {
  if (stock === undefined || stock === null) {
    throw new AppError('Stock value is required', 400);
  }

  const numStock = Number(stock);

  if (isNaN(numStock)) {
    throw new AppError('Stock must be a valid number', 400);
  }

  if (numStock < 0) {
    throw new AppError('Stock cannot be negative', 400);
  }

  if (numStock > 1000000) {
    throw new AppError('Stock value too high (max 1,000,000)', 400);
  }

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
  const existing = await prisma.product.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    throw new AppError('Product not found', 404);
  }

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