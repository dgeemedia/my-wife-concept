// backend/src/controllers/userController.js
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
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
}

async function createUser(req, res) {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !password) {
    throw new Error('Email and password required');
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
      active: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      active: true,
    },
  });

  res.status(201).json({ ok: true, user });
}

async function updateUser(req, res) {
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: req.body,
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true,
      active: true,
    },
  });
  res.json({ ok: true, user });
}

async function deleteUser(req, res) {
  // Prevent deleting yourself
  if (Number(req.params.id) === req.user.id) {
    throw new Error('Cannot delete your own account');
  }

  await prisma.user.delete({
    where: { id: Number(req.params.id) },
  });
  res.json({ ok: true, message: 'User deleted' });
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};