// backend/src/controllers/userController.js
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { BCRYPT, ROLES, DEFAULT } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

/**
 * Get all users
 */
async function getAllUsers() {
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

  return users;
}

/**
 * Get single user
 */
async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
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

  return user;
}

/**
 * Create new user
 */
async function createUser(data) {
  const { email, role, securityQuestion, securityAnswer } = data;

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

  return {
    ok: true,
    user,
    message: `User created with default password: ${DEFAULT.PASSWORD}`,
  };
}

/**
 * Update user status
 */
async function updateUserStatus(id, active, requestUserId) {
  // Prevent suspending self
  if (requestUserId === Number(id) && !active) {
    throw new AppError('Cannot suspend your own account', 400);
  }

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: { active },
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
    },
  });

  return { ok: true, user };
}

/**
 * Update user details
 */
async function updateUser(id, data) {
  const { email, role, securityQuestion } = data;

  const updateData = {};
  if (email) updateData.email = email;
  if (role && role !== ROLES.SUPER_ADMIN) updateData.role = role;
  if (securityQuestion !== undefined) updateData.securityQuestion = securityQuestion;

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
      securityQuestion: true,
    },
  });

  return { ok: true, user };
}

/**
 * Delete user
 */
async function deleteUser(id, requestUserId) {
  // Prevent deleting self
  if (requestUserId === Number(id)) {
    throw new AppError('Cannot delete your own account', 400);
  }

  await prisma.user.delete({
    where: { id: Number(id) },
  });

  return { ok: true, message: 'User deleted successfully' };
}

/**
 * Reset user password
 */
async function resetUserPassword(id) {
  const passwordHash = await bcrypt.hash(DEFAULT.PASSWORD, BCRYPT.SALT_ROUNDS);

  await prisma.user.update({
    where: { id: Number(id) },
    data: {
      passwordHash,
      forcePasswordChange: true,
    },
  });

  return {
    ok: true,
    message: `Password reset to: ${DEFAULT.PASSWORD}`,
  };
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUserStatus,
  updateUser,
  deleteUser,
  resetUserPassword,
};
