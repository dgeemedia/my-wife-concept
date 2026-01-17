// backend/src/controllers/productController.js 
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
 * Create product
 */
async function createProduct(data) {
  const { name, price, stock, description, imageUrl } = data;

  const product = await prisma.product.create({
    data: {
      name,
      price: Number(price),
      stock: Number(stock),
      description: description || '',
      imageUrl: imageUrl || '',
    },
  });

  return product;
}

/**
 * Update product
 */
async function updateProduct(id, data) {
  const { name, price, stock, description, imageUrl } = data;

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: {
      name,
      price: Number(price),
      stock: Number(stock),
      description: description || '',
      imageUrl: imageUrl || '',
    },
  });

  return product;
}

/**
 * Update product stock
 */
async function updateProductStock(id, stock) {
  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: { stock: Number(stock) },
  });

  return product;
}

/**
 * Delete product
 */
async function deleteProduct(id) {
  // Check if product has orders
  const orderItems = await prisma.orderItem.count({
    where: { productId: Number(id) },
  });

  if (orderItems > 0) {
    throw new AppError('Cannot delete product with existing orders', 400);
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