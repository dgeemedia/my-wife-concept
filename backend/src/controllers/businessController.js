// backend/src/controllers/businessController.js
const prisma = require('../lib/prisma');

// ============================================================================
// GET BUSINESS BY SLUG (Public - used by frontend subdomain routing)
// ============================================================================
async function getBusinessBySlug(req, res) {
  const { slug } = req.params;
  
  const business = await prisma.business.findUnique({
    where: { slug }
  });
  
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }
  
  res.json(business);
}

// ============================================================================
// GET ALL BUSINESSES (Super-admin only)
// ============================================================================
async function getAllBusinesses(req, res) {
  if (req.user.role !== 'super-admin') {
    return res.status(403).json({ error: 'Forbidden: Super-admin access required' });
  }
  
  const businesses = await prisma.business.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          users: true,
          products: true,
          orders: true
        }
      }
    }
  });
  
  res.json(businesses);
}

// ============================================================================
// GET SINGLE BUSINESS (Authenticated)
// ============================================================================
async function getBusiness(req, res) {
  const businessId = Number(req.params.id);
  
  // Super-admin can view any business, others only their own
  if (req.user.role !== 'super-admin' && req.user.businessId !== businessId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      _count: {
        select: {
          users: true,
          products: true,
          orders: true
        }
      }
    }
  });
  
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }
  
  res.json(business);
}

// ============================================================================
// CREATE BUSINESS (Super-admin only)
// ============================================================================
async function createBusiness(req, res) {
  if (req.user.role !== 'super-admin') {
    return res.status(403).json({ error: 'Forbidden: Super-admin access required' });
  }
  
  const {
    slug,
    businessName,
    businessType,
    phone,
    whatsappNumber,
    ...otherData
  } = req.body;
  
  // Validate required fields
  if (!slug || !businessName || !phone || !whatsappNumber) {
    return res.status(400).json({ 
      error: 'slug, businessName, phone, and whatsappNumber are required' 
    });
  }
  
  // Check if slug already exists
  const existing = await prisma.business.findUnique({
    where: { slug }
  });
  
  if (existing) {
    return res.status(400).json({ error: 'Business with this slug already exists' });
  }
  
  const business = await prisma.business.create({
    data: {
      slug,
      businessName,
      businessType: businessType || 'food',
      phone,
      whatsappNumber,
      ...otherData
    }
  });
  
  console.log(`✅ Created business: ${business.businessName} (${business.slug})`);
  
  res.status(201).json(business);
}

// ============================================================================
// UPDATE BUSINESS
// ============================================================================
async function updateBusiness(req, res) {
  const businessId = Number(req.params.id);
  
  // Super-admin can update any business, others only their own
  if (req.user.role !== 'super-admin' && req.user.businessId !== businessId) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const { slug, ...updateData } = req.body;
  
  // Don't allow changing slug (would break subdomain routing)
  if (slug && slug !== (await prisma.business.findUnique({ where: { id: businessId } }))?.slug) {
    if (req.user.role !== 'super-admin') {
      return res.status(403).json({ error: 'Only super-admin can change business slug' });
    }
  }
  
  const business = await prisma.business.update({
    where: { id: businessId },
    data: slug ? { slug, ...updateData } : updateData
  });
  
  console.log(`✅ Updated business: ${business.businessName}`);
  
  res.json(business);
}

// ============================================================================
// DELETE BUSINESS (Super-admin only)
// ============================================================================
async function deleteBusiness(req, res) {
  if (req.user.role !== 'super-admin') {
    return res.status(403).json({ error: 'Forbidden: Super-admin access required' });
  }
  
  const businessId = Number(req.params.id);
  
  // Check if business has users/products/orders
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      _count: {
        select: {
          users: true,
          products: true,
          orders: true
        }
      }
    }
  });
  
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }
  
  // Warn if business has data
  if (business._count.users > 0 || business._count.products > 0 || business._count.orders > 0) {
    console.warn(`⚠️ Deleting business ${business.businessName} with ${business._count.users} users, ${business._count.products} products, ${business._count.orders} orders`);
  }
  
  await prisma.business.delete({
    where: { id: businessId }
  });
  
  console.log(`🗑️ Deleted business: ${business.businessName}`);
  
  res.json({ ok: true, message: 'Business deleted' });
}

// ============================================================================
// GET CURRENT USER'S BUSINESS
// ============================================================================
async function getCurrentBusiness(req, res) {
  if (!req.user.businessId) {
    return res.status(404).json({ error: 'User has no associated business' });
  }
  
  const business = await prisma.business.findUnique({
    where: { id: req.user.businessId }
  });
  
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }
  
  res.json(business);
}

module.exports = {
  getBusinessBySlug,
  getAllBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getCurrentBusiness
};