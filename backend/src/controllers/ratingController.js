// ============================================================================
// RATING CONTROLLER
// backend/src/controllers/ratingController.js
// ============================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Submit or update rating
async function submitRating(req, res) {
  const { productId } = req.params;
  const { phone, rating, comment } = req.body;
  
  // Validate
  if (!phone || !rating) {
    throw new Error('Phone number and rating are required');
  }
  
  if (rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }
  
  // Normalize phone number
  const normalizedPhone = phone.replace(/\D/g, '');
  
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: Number(productId) }
  });
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Check if customer has ordered this product
  const hasOrdered = await prisma.orderItem.findFirst({
    where: {
      productId: Number(productId),
      order: {
        phone: normalizedPhone,
        status: 'DELIVERED'
      }
    }
  });
  
  if (!hasOrdered) {
    return res.status(403).json({
      success: false,
      error: 'You can only rate products you have purchased and received'
    });
  }
  
  // Upsert rating
  const productRating = await prisma.productRating.upsert({
    where: {
      productId_phone: {
        productId: Number(productId),
        phone: normalizedPhone
      }
    },
    update: {
      rating,
      comment: comment || null
    },
    create: {
      productId: Number(productId),
      phone: normalizedPhone,
      rating,
      comment: comment || null
    }
  });
  
  // Calculate new average rating
  const ratings = await prisma.productRating.aggregate({
    where: { productId: Number(productId) },
    _avg: { rating: true },
    _count: true
  });
  
  res.json({
    success: true,
    rating: productRating,
    averageRating: ratings._avg.rating || 0,
    totalRatings: ratings._count || 0
  });
}

// Get ratings for a product
async function getProductRatings(req, res) {
  const { productId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  
  const [ratings, total, stats] = await Promise.all([
    prisma.productRating.findMany({
      where: { productId: Number(productId) },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: Number(limit),
      select: {
        rating: true,
        comment: true,
        createdAt: true,
        phone: true // Masked in response
      }
    }),
    prisma.productRating.count({
      where: { productId: Number(productId) }
    }),
    prisma.productRating.aggregate({
      where: { productId: Number(productId) },
      _avg: { rating: true },
      _count: true
    })
  ]);
  
  // Mask phone numbers
  const maskedRatings = ratings.map(r => ({
    ...r,
    phone: r.phone.slice(-4).padStart(r.phone.length, '*')
  }));
  
  res.json({
    success: true,
    ratings: maskedRatings,
    averageRating: stats._avg.rating || 0,
    totalRatings: stats._count || 0,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  });
}

// Check if user can rate
async function canRate(req, res) {
  const { productId } = req.params;
  const { phone } = req.query;
  
  if (!phone) {
    throw new Error('Phone number required');
  }
  
  const normalizedPhone = phone.replace(/\D/g, '');
  
  // Check if has ordered and delivered
  const hasOrdered = await prisma.orderItem.findFirst({
    where: {
      productId: Number(productId),
      order: {
        phone: normalizedPhone,
        status: 'DELIVERED'
      }
    }
  });
  
  // Check if already rated
  const existingRating = await prisma.productRating.findUnique({
    where: {
      productId_phone: {
        productId: Number(productId),
        phone: normalizedPhone
      }
    }
  });
  
  res.json({
    success: true,
    canRate: !!hasOrdered,
    hasRated: !!existingRating,
    rating: existingRating || null
  });
}

module.exports = {
  submitRating,
  getProductRatings,
  canRate
};
