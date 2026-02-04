// backend/src/controllers/businessController.js
const prisma = require('../lib/prisma');

const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Generate random password
function generatePassword(length = 12) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

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
    // ✅ NEW: Admin account details
    adminEmail,
    adminFirstName,
    adminLastName,
    adminPhone,
    ...otherData
  } = req.body;
  
  // Validate required fields
  if (!slug || !businessName || !phone || !whatsappNumber) {
    return res.status(400).json({ 
      error: 'slug, businessName, phone, and whatsappNumber are required' 
    });
  }

  // ✅ Validate admin email is provided
  if (!adminEmail) {
    return res.status(400).json({ 
      error: 'Admin email is required to create business owner account' 
    });
  }
  
  // Check if slug already exists
  const existing = await prisma.business.findUnique({
    where: { slug }
  });
  
  if (existing) {
    return res.status(400).json({ error: 'Business with this slug already exists' });
  }

  // Check if admin email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (existingUser) {
    return res.status(400).json({ error: 'A user with this email already exists' });
  }

  try {
    // ✅ Generate random password for admin
    const generatedPassword = generatePassword(12);
    const passwordHash = await bcrypt.hash(generatedPassword, 12);

    // ✅ Create business and admin in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the business
      const business = await tx.business.create({
        data: {
          slug,
          businessName,
          businessType: businessType || 'food',
          phone,
          whatsappNumber,
          isActive: true,
          ...otherData
        }
      });

      // 2. Create the admin user for this business
      const admin = await tx.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: 'admin',
          firstName: adminFirstName || 'Admin',
          lastName: adminLastName || '',
          phone: adminPhone || phone,
          active: true,
          businessId: business.id
        }
      });

      return { business, admin, generatedPassword };
    });

    console.log(`✅ Created business: ${result.business.businessName} (${result.business.slug})`);
    console.log(`✅ Created admin user: ${result.admin.email} for business ID ${result.business.id}`);

    // ✅ Return business info with admin credentials
    res.status(201).json({
      ok: true,
      business: result.business,
      admin: {
        id: result.admin.id,
        email: result.admin.email,
        firstName: result.admin.firstName,
        lastName: result.admin.lastName,
        // ✅ IMPORTANT: Return the generated password (only shown once!)
        temporaryPassword: result.generatedPassword
      },
      message: 'Business and admin account created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating business:', error);
    res.status(500).json({ 
      error: 'Failed to create business and admin account',
      details: error.message 
    });
  }
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

// Toggle business active status (suspend/reactivate)
async function toggleBusinessStatus(req, res) {
  if (req.user.role !== 'super-admin') {
    return res.status(403).json({ error: 'Forbidden: Super-admin access required' });
  }
  
  const businessId = Number(req.params.id);
  const { isActive, suspensionReason } = req.body;
  
  const business = await prisma.business.findUnique({
    where: { id: businessId }
  });
  
  if (!business) {
    return res.status(404).json({ error: 'Business not found' });
  }
  
  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      isActive: isActive,
      suspendedAt: !isActive ? new Date() : null,
      suspensionReason: !isActive ? suspensionReason : null
    }
  });
  
  console.log(`${isActive ? '✅ Reactivated' : '⚠️ Suspended'} business: ${business.businessName}`);
  
  res.json({
    ok: true,
    message: isActive ? 'Business reactivated' : 'Business suspended',
    business: updated
  });
}

module.exports = {
  getBusinessBySlug,
  getAllBusinesses,
  getBusiness,
  createBusiness,
  updateBusiness,
  deleteBusiness,
  getCurrentBusiness,
  toggleBusinessStatus
};