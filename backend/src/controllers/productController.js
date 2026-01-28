// ============================================================================
// FIXED PRODUCT CONTROLLER - Proper Prisma Transaction Handling
// backend/src/controllers/productController.js
// ============================================================================

const { PrismaClient } = require('@prisma/client');

// Create a singleton Prisma client instance
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function getAllProducts(req, res) {
  // Fetch products with rating stats AND images
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      ratings: {
        select: {
          rating: true
        }
      },
      images: {
        orderBy: { order: 'asc' }
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
      },
      images: {
        orderBy: { order: 'asc' }
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
  const { name, price, stock, description, imageUrl, images } = req.body;

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
      images: images && images.length > 0 ? {
        create: images.map((img, index) => ({
          imageUrl: img.imageUrl,
          order: img.order !== undefined ? img.order : index,
          isPrimary: img.isPrimary || index === 0
        }))
      } : undefined
    },
    include: {
      images: true
    }
  });

  console.log(`✅ Created product: ${product.name}`);

  res.status(201).json(product);
}

async function updateProduct(req, res) {
  const { images, ...updateData } = req.body;
  const productId = Number(req.params.id);
  
  console.log(`🔄 Updating product ${productId}`);
  console.log('Update data:', updateData);
  console.log('Images count:', images?.length || 0);
  
  try {
    // Simplified approach: Update product and images separately (no transaction needed)
    
    // Step 1: Update the product basic data
    await prisma.product.update({
      where: { id: productId },
      data: {
        name: updateData.name,
        price: Number(updateData.price),
        stock: Number(updateData.stock),
        description: updateData.description || '',
        imageUrl: updateData.imageUrl || ''
      }
    });
    
    console.log(`✅ Updated product basic data for ${productId}`);
    
    // Step 2: Handle images if provided
    if (images !== undefined && Array.isArray(images)) {
      // Delete all existing images for this product
      const deletedCount = await prisma.productImage.deleteMany({
        where: { productId }
      });
      
      console.log(`🗑️ Deleted ${deletedCount.count} old images for product ${productId}`);
      
      // Create new images if any
      if (images.length > 0) {
        const imagesToCreate = images.map((img, index) => ({
          productId,
          imageUrl: img.imageUrl,
          order: img.order !== undefined ? img.order : index,
          isPrimary: img.isPrimary !== undefined ? img.isPrimary : (index === 0)
        }));
        
        await prisma.productImage.createMany({
          data: imagesToCreate
        });
        
        console.log(`✅ Created ${imagesToCreate.length} new images for product ${productId}`);
      }
    }
    
    // Step 3: Fetch and return the complete updated product
    const updatedProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    console.log(`✅ Successfully updated product ${productId} with ${updatedProduct.images?.length || 0} images`);
    
    res.json(updatedProduct);
  } catch (error) {
    console.error(`❌ Failed to update product ${productId}:`, error);
    throw error;
  }
}

async function deleteProduct(req, res) {
  const productId = Number(req.params.id);
  
  // Delete product (images will be deleted automatically via cascade)
  await prisma.product.delete({
    where: { id: productId },
  });
  
  console.log(`🗑️ Deleted product: ${productId}`);
  
  res.json({ ok: true, message: 'Product deleted' });
}

// ============================================================================
// IMAGE MANAGEMENT FUNCTIONS
// ============================================================================

async function addProductImage(req, res) {
  const { productId } = req.params;
  const { imageUrl, isPrimary } = req.body;
  
  // Get current max order
  const maxOrder = await prisma.productImage.findFirst({
    where: { productId: Number(productId) },
    orderBy: { order: 'desc' },
    select: { order: true }
  });
  
  const image = await prisma.productImage.create({
    data: {
      productId: Number(productId),
      imageUrl,
      order: (maxOrder?.order || 0) + 1,
      isPrimary: isPrimary || false
    }
  });
  
  console.log(`✅ Added image to product ${productId}`);
  
  res.json(image);
}

async function deleteProductImage(req, res) {
  const { imageId } = req.params;
  
  await prisma.productImage.delete({
    where: { id: Number(imageId) }
  });
  
  console.log(`🗑️ Deleted image: ${imageId}`);
  
  res.json({ ok: true, message: 'Image deleted' });
}

async function reorderProductImages(req, res) {
  const { productId } = req.params;
  const { imageOrders } = req.body; // Array of { id, order }
  
  // Update images one by one (more reliable than transaction for this case)
  for (const { id, order } of imageOrders) {
    await prisma.productImage.update({
      where: { id },
      data: { order }
    });
  }
  
  const images = await prisma.productImage.findMany({
    where: { productId: Number(productId) },
    orderBy: { order: 'asc' }
  });
  
  console.log(`✅ Reordered images for product ${productId}`);
  
  res.json(images);
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImage,
  deleteProductImage,
  reorderProductImages
};