// backend/src/controllers/userController.js
const bcrypt = require('bcrypt');
const prisma = require('../lib/prisma');

// ============================================================================
// GET ALL USERS - WITH TENANT ISOLATION
// ============================================================================
async function getAllUsers(req, res) {
  const where = {};

  // 🔥 TENANT ISOLATION: Super-admin sees all, others see only their business
  if (req.user.role !== 'super-admin') {
    where.businessId = req.user.businessId;
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      role: true,
      businessId: true,  // ✅ ADDED
      firstName: true,
      lastName: true,
      phone: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  res.json(users);
}

// ============================================================================
// CREATE USER - WITH BUSINESS ASSIGNMENT
// ============================================================================
async function createUser(req, res) {
  const { email, password, firstName, lastName, phone, role, businessId } = req.body;

  if (!email || !password) {
    throw new Error('Email and password required');
  }

  // Permission check: Staff cannot create users
  if (req.user.role === 'staff') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Staff cannot create users' 
    });
  }

  // 🔥 BUSINESS ASSIGNMENT LOGIC
  let assignedBusinessId = req.user.businessId;

  // Super-admin can choose business or create super-admin
  if (req.user.role === 'super-admin') {
    if (role === 'super-admin') {
      assignedBusinessId = null;  // Super-admins don't belong to a business
    } else {
      assignedBusinessId = businessId || null;
    }
  }

  // Admin can ONLY create users in their business
  if (req.user.role === 'admin') {
    if (!assignedBusinessId) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Admin must have a business assigned' 
      });
    }
    
    if (role === 'super-admin') {
      return res.status(403).json({ 
        ok: false, 
        error: 'Admin cannot create super-admin' 
      });
    }
  }

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('User already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: role || 'staff',
      businessId: assignedBusinessId,  // 🔥 KEY LINE
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      active: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      businessId: true,
      firstName: true,
      lastName: true,
      phone: true,
      active: true,
    },
  });

  console.log(`✅ User created: ${user.email} (${user.role}) by ${req.user.email} - Business: ${assignedBusinessId || 'none'}`);

  res.status(201).json({ ok: true, user });
}

// ============================================================================
// UPDATE USER - WITH TENANT SECURITY
// ============================================================================
async function updateUser(req, res) {
  const userId = Number(req.params.id);
  const { role, active, ...otherUpdates } = req.body;

  // Get the target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!targetUser) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }

  // 🔥 TENANT SECURITY CHECK
  if (
    req.user.role !== 'super-admin' &&
    targetUser.businessId !== req.user.businessId
  ) {
    return res.status(403).json({
      ok: false,
      error: 'You cannot manage users from another business'
    });
  }

  // Admin cannot modify super-admin
  if (req.user.role === 'admin' && targetUser.role === 'super-admin') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Admin cannot modify super-admin accounts' 
    });
  }

  // Admin cannot promote to super-admin
  if (req.user.role === 'admin' && role === 'super-admin') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Admin cannot create or promote to super-admin' 
    });
  }

  const updateData = { ...otherUpdates };
  if (role !== undefined) updateData.role = role;
  if (active !== undefined) updateData.active = active;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      role: true,
      businessId: true,
      firstName: true,
      lastName: true,
      phone: true,
      active: true,
    },
  });

  console.log(`✅ User updated: ${user.email} by ${req.user.email}`);

  res.json({ ok: true, user });
}

// ============================================================================
// SUSPEND USER - WITH TENANT SECURITY
// ============================================================================
async function suspendUser(req, res) {
  const userId = Number(req.params.id);

  if (userId === req.user.id) {
    return res.status(400).json({ 
      ok: false, 
      error: 'Cannot suspend your own account' 
    });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!targetUser) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }

  // 🔥 TENANT SECURITY CHECK
  if (
    req.user.role !== 'super-admin' &&
    targetUser.businessId !== req.user.businessId
  ) {
    return res.status(403).json({
      ok: false,
      error: 'You cannot manage users from another business'
    });
  }

  if (req.user.role === 'admin' && targetUser.role === 'super-admin') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Admin cannot suspend super-admin' 
    });
  }

  if (req.user.role === 'staff') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Staff cannot suspend users' 
    });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { active: false },
    select: {
      id: true,
      email: true,
      role: true,
      businessId: true,
      firstName: true,
      lastName: true,
      active: true,
    },
  });

  console.log(`⚠️ User suspended: ${user.email} by ${req.user.email}`);

  res.json({ ok: true, message: 'User suspended', user });
}

// ============================================================================
// REACTIVATE USER - WITH TENANT SECURITY
// ============================================================================
async function reactivateUser(req, res) {
  const userId = Number(req.params.id);

  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!targetUser) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }

  // 🔥 TENANT SECURITY CHECK
  if (
    req.user.role !== 'super-admin' &&
    targetUser.businessId !== req.user.businessId
  ) {
    return res.status(403).json({
      ok: false,
      error: 'You cannot manage users from another business'
    });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { active: true },
    select: {
      id: true,
      email: true,
      role: true,
      businessId: true,
      firstName: true,
      lastName: true,
      active: true,
    },
  });

  console.log(`✅ User reactivated: ${user.email} by ${req.user.email}`);

  res.json({ ok: true, message: 'User reactivated', user });
}

// ============================================================================
// DELETE USER - WITH TENANT SECURITY
// ============================================================================
async function deleteUser(req, res) {
  const userId = Number(req.params.id);

  if (userId === req.user.id) {
    return res.status(400).json({ 
      ok: false, 
      error: 'Cannot delete your own account' 
    });
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!targetUser) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }

  // 🔥 TENANT SECURITY CHECK
  if (
    req.user.role !== 'super-admin' &&
    targetUser.businessId !== req.user.businessId
  ) {
    return res.status(403).json({
      ok: false,
      error: 'You cannot manage users from another business'
    });
  }

  if (req.user.role === 'admin' && targetUser.role === 'super-admin') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Admin cannot delete super-admin' 
    });
  }

  if (req.user.role === 'staff') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Staff cannot delete users' 
    });
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  console.log(`🗑️ User deleted: ${targetUser.email} by ${req.user.email}`);

  res.json({ ok: true, message: 'User deleted' });
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  suspendUser,
  reactivateUser,
  deleteUser,
};