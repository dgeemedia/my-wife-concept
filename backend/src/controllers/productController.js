// ============================================================================
// UPDATED PRODUCT CONTROLLER - WITH RATINGS
// backend/src/controllers/productController.js
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllProducts(req, res) {
  // Fetch products with rating stats
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      ratings: {
        select: {
          rating: true
        }
      }
    }
  });
  
  // Calculate average rating and count for each product
  const productsWithRatings = products.map(product => {
    const ratings = product.ratings || [];
    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0 
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
      : 0;
    
    // Remove the ratings array and add computed values
    const { ratings: _, ...productData } = product;
    
    return {
      ...productData,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalRatings
    };
  });
  
  console.log(`📦 Fetched ${productsWithRatings.length} products with ratings`);
  
  res.json(productsWithRatings);
}

async function getProductById(req, res) {
  const product = await prisma.product.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      ratings: {
        select: {
          rating: true,
          comment: true,
          createdAt: true,
          phone: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 10 // Get latest 10 ratings
      }
    }
  });

  if (!product) {
    throw new Error('Product not found');
  }
  
  // Calculate rating stats
  const ratings = product.ratings || [];
  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0 
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
    : 0;
  
  // Mask phone numbers in ratings
  const maskedRatings = ratings.map(r => ({
    ...r,
    phone: r.phone.slice(-4).padStart(r.phone.length, '*')
  }));
  
  const { ratings: _, ...productData } = product;
  
  const productWithRatings = {
    ...productData,
    averageRating: Math.round(averageRating * 10) / 10,
    totalRatings,
    recentRatings: maskedRatings
  };

  console.log(`📦 Fetched product ${product.id} with ${totalRatings} ratings`);

  res.json(productWithRatings);
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

  console.log(`✅ Created product: ${product.name}`);

  res.status(201).json(product);
}

async function updateProduct(req, res) {
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  
  console.log(`✅ Updated product: ${product.id}`);
  
  res.json(product);
}

async function deleteProduct(req, res) {
  await prisma.product.delete({
    where: { id: Number(req.params.id) },
  });
  
  console.log(`🗑️ Deleted product: ${req.params.id}`);
  
  res.json({ ok: true, message: 'Product deleted' });
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};