// backend/src/routes/users.js
/**
 * Users routes (super-admin only)
 * backend/src/routes/users.js
 */
const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { BCRYPT, ROLES, DEFAULT } = require('../config/constants');
const { superAdminAuth } = require('../middleware/auth');
const { validateUserCreation, validateIdParam } = require('../middleware/validation');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/users
 * Get all users (super-admin only)
 */
router.get('/', superAdminAuth, asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
      forcePasswordChange: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(users);
}));

/**
 * GET /api/users/:id
 * Get single user (super-admin only)
 */
router.get('/:id', superAdminAuth, validateIdParam, asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
      forcePasswordChange: true,
      securityQuestion: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json(user);
}));

/**
 * POST /api/users
 * Create new user (super-admin only)
 */
router.post('/', superAdminAuth, validateUserCreation, asyncHandler(async (req, res) => {
  const { email, role, securityQuestion, securityAnswer } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('User already exists', 400);
  }

  const passwordHash = await bcrypt.hash(DEFAULT.PASSWORD, BCRYPT.SALT_ROUNDS);
  const securityAnswerHash = securityAnswer
    ? await bcrypt.hash(securityAnswer, BCRYPT.SALT_ROUNDS)
    : null;

  const user = await prisma.user.create({
    data: {
      email,
      role: role || ROLES.ADMIN,
      passwordHash,
      forcePasswordChange: true,
      active: true,
      securityQuestion: securityQuestion || null,
      securityAnswerHash,
    },
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
      forcePasswordChange: true,
    },
  });

  res.status(201).json({
    ok: true,
    user,
    message: `User created with default password: ${DEFAULT.PASSWORD}`,
  });
}));

/**
 * PATCH /api/users/:id/status
 * Activate or suspend user (super-admin only)
 */
router.patch('/:id/status', superAdminAuth, validateIdParam, asyncHandler(async (req, res) => {
  const { active } = req.body;

  if (typeof active !== 'boolean') {
    throw new AppError('Active status must be boolean', 400);
  }

  // Prevent suspending self
  if (req.user.id === Number(req.params.id) && !active) {
    throw new AppError('Cannot suspend your own account', 400);
  }

  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { active },
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
    },
  });

  res.json({ ok: true, user });
}));

/**
 * PUT /api/users/:id
 * Update user details (super-admin only)
 */
router.put('/:id', superAdminAuth, validateIdParam, asyncHandler(async (req, res) => {
  const { email, role, securityQuestion } = req.body;

  const data = {};
  if (email) data.email = email;
  if (role && role !== ROLES.SUPER_ADMIN) data.role = role;
  if (securityQuestion !== undefined) data.securityQuestion = securityQuestion;

  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data,
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
      securityQuestion: true,
    },
  });

  res.json({ ok: true, user });
}));

/**
 * DELETE /api/users/:id
 * Delete user (super-admin only)
 */
router.delete('/:id', superAdminAuth, validateIdParam, asyncHandler(async (req, res) => {
  // Prevent deleting self
  if (req.user.id === Number(req.params.id)) {
    throw new AppError('Cannot delete your own account', 400);
  }

  await prisma.user.delete({
    where: { id: Number(req.params.id) },
  });

  res.json({ ok: true, message: 'User deleted successfully' });
}));

/**
 * POST /api/users/:id/reset-password
 * Reset user password to default (super-admin only)
 */
router.post('/:id/reset-password', superAdminAuth, validateIdParam, asyncHandler(async (req, res) => {
  const passwordHash = await bcrypt.hash(DEFAULT.PASSWORD, BCRYPT.SALT_ROUNDS);

  await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: {
      passwordHash,
      forcePasswordChange: true,
    },
  });

  res.json({
    ok: true,
    message: `Password reset to: ${DEFAULT.PASSWORD}`,
  });
}));

module.exports = router;