// backend/src/controllers/productController.js
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

/**
 * Get all products (TENANT FILTERED)
 */
async function getAllProducts(req, query) {
  const { search, inStock } = query;
  const where = {
    tenantId: req.tenant.id, // CRITICAL: Filter by tenant
  };

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
 * Get single product (TENANT FILTERED)
 */
async function getProductById(req, id) {
  const product = await prisma.product.findFirst({
    where: { 
      id: Number(id),
      tenantId: req.tenant.id, // CRITICAL: Verify tenant owns this product
    },
  });

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  return product;
}

/**
 * Create product (TENANT SCOPED)
 */
async function createProduct(req, data) {
  const { name, price, stock, description, imageUrl } = data;

  const product = await prisma.product.create({
    data: {
      name,
      price: Number(price),
      stock: Number(stock),
      description: description || '',
      imageUrl: imageUrl || '',
      tenantId: req.tenant.id, // CRITICAL: Assign to tenant
    },
  });

  return product;
}

/**
 * Update product (TENANT FILTERED)
 */
async function updateProduct(req, id, data) {
  const { name, price, stock, description, imageUrl } = data;

  // Verify tenant owns product before updating
  await getProductById(req, id);

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
 * Update product stock (TENANT FILTERED)
 */
async function updateProductStock(req, id, stock) {
  // Verify tenant owns product
  await getProductById(req, id);

  const product = await prisma.product.update({
    where: { id: Number(id) },
    data: { stock: Number(stock) },
  });

  return product;
}

/**
 * Delete product (TENANT FILTERED)
 */
async function deleteProduct(req, id) {
  // Verify tenant owns product
  await getProductById(req, id);

  // Check if product has orders for this tenant
  const orderItems = await prisma.orderItem.count({
    where: {
      productId: Number(id),
      order: { tenantId: req.tenant.id }, // ensure count scoped to the tenant
    },
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
