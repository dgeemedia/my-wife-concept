// backend/src/controllers/userController.js (UPDATED)
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAllUsers(req, res) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
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

async function createUser(req, res) {
  const { email, password, firstName, lastName, phone, role } = req.body;

  if (!email || !password) {
    throw new Error('Email and password required');
  }

  // ✅ PERMISSION CHECK: Only super-admin and admin can create users
  if (req.user.role !== 'super-admin' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Only super-admin and admin can create staff' 
    });
  }

  // ✅ PERMISSION CHECK: Staff cannot create other users
  if (req.user.role === 'staff') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Staff cannot create other staff members' 
    });
  }

  // ✅ PERMISSION CHECK: Admin cannot create super-admin
  if (req.user.role === 'admin' && role === 'super-admin') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Admin cannot create super-admin accounts' 
    });
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
      firstName: firstName || '',
      lastName: lastName || '',
      phone: phone || '',
      active: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      phone: true,
      active: true,
    },
  });

  console.log(`✅ User created: ${user.email} (${user.role}) by ${req.user.email}`);

  res.status(201).json({ ok: true, user });
}

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

  // ✅ PERMISSION CHECK: Admin cannot modify super-admin
  if (req.user.role === 'admin' && targetUser.role === 'super-admin') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Admin cannot modify super-admin accounts' 
    });
  }

  // ✅ PERMISSION CHECK: Admin cannot promote to super-admin
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
      firstName: true,
      lastName: true,
      phone: true,
      active: true,
    },
  });

  console.log(`✅ User updated: ${user.email} by ${req.user.email}`);

  res.json({ ok: true, user });
}

// NEW: Suspend user (soft delete - just deactivates)
async function suspendUser(req, res) {
  const userId = Number(req.params.id);

  // Prevent suspending yourself
  if (userId === req.user.id) {
    return res.status(400).json({ 
      ok: false, 
      error: 'Cannot suspend your own account' 
    });
  }

  // Get the target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!targetUser) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }

  // ✅ PERMISSION CHECK: Admin cannot suspend super-admin
  if (req.user.role === 'admin' && targetUser.role === 'super-admin') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Admin cannot suspend super-admin' 
    });
  }

  // ✅ PERMISSION CHECK: Staff cannot suspend anyone
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
      firstName: true,
      lastName: true,
      active: true,
    },
  });

  console.log(`⚠️ User suspended: ${user.email} by ${req.user.email}`);

  res.json({ ok: true, message: 'User suspended', user });
}

// NEW: Reactivate user
async function reactivateUser(req, res) {
  const userId = Number(req.params.id);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { active: true },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      active: true,
    },
  });

  console.log(`✅ User reactivated: ${user.email} by ${req.user.email}`);

  res.json({ ok: true, message: 'User reactivated', user });
}

async function deleteUser(req, res) {
  const userId = Number(req.params.id);

  // Prevent deleting yourself
  if (userId === req.user.id) {
    return res.status(400).json({ 
      ok: false, 
      error: 'Cannot delete your own account' 
    });
  }

  // Get the target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!targetUser) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }

  // ✅ PERMISSION CHECK: Admin cannot delete super-admin
  if (req.user.role === 'admin' && targetUser.role === 'super-admin') {
    return res.status(403).json({ 
      ok: false, 
      error: 'Admin cannot delete super-admin' 
    });
  }

  // ✅ PERMISSION CHECK: Staff cannot delete anyone
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