// backend/src/controllers/productController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllProducts(req, res) {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
}

async function getProductById(req, res) {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  res.json(product);
}

async function createProduct(req, res) {
  const { name, price, stock, description, imageUrl } = req.body;

  if (!name || !price || stock === undefined) {
    throw new Error('Name, price, and stock are required');
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      price: Number(price),
      stock: Number(stock),
      description: description?.trim() || '',
      imageUrl: imageUrl?.trim() || '',
    },
  });

  res.status(201).json(product);
}

async function updateProduct(req, res) {
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(product);
}

async function deleteProduct(req, res) {
  await prisma.product.delete({
    where: { id: Number(req.params.id) },
  });
  res.json({ ok: true, message: 'Product deleted' });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};