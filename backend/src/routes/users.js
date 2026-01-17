// backend/src/controllers/userController.js
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { BCRYPT, ROLES } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');
const { generateSecurePassword } = require('../config/constants');

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
      hasSecurityQuestion: true,
      securityQuestionResetAt: true,
      securityQuestionResetBy: true,
      createdAt: true,
      lastLogin: true,
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
      hasSecurityQuestion: true,
      securityQuestion: true,
      securityQuestionResetAt: true,
      securityQuestionResetBy: true,
      securityQuestionResetReason: true,
      createdAt: true,
      lastLogin: true,
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

  // Generate secure temporary password
  const tempPassword = generateSecurePassword(12);
  const passwordHash = await bcrypt.hash(tempPassword, BCRYPT.SALT_ROUNDS);

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
      hasSecurityQuestion: !!securityQuestion,
    },
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
      forcePasswordChange: true,
      hasSecurityQuestion: true,
    },
  });

  return {
    ok: true,
    user,
    tempPassword,
    message: 'User created successfully.',
  };
}

/**
 * Create user with onboarding (forces security setup)
 */
async function createUserWithOnboarding(data) {
  const { email, role } = data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('User already exists', 400);
  }

  // Generate secure temporary password
  const tempPassword = generateSecurePassword(12);
  const passwordHash = await bcrypt.hash(tempPassword, BCRYPT.SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      role: role || ROLES.ADMIN,
      passwordHash,
      forcePasswordChange: true,
      securityQuestion: null,
      securityAnswerHash: null,
      hasSecurityQuestion: false, // User must set this on first login
      active: true,
    },
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
      forcePasswordChange: true,
      hasSecurityQuestion: true,
    },
  });

  return {
    ok: true,
    user,
    tempPassword,
    message: 'User created. They must change password and set security question on first login.',
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
  const { email, role } = data;

  const updateData = {};
  if (email) updateData.email = email;
  if (role && role !== ROLES.SUPER_ADMIN) updateData.role = role;

  const user = await prisma.user.update({
    where: { id: Number(id) },
    data: updateData,
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
  const tempPassword = generateSecurePassword(12);
  const passwordHash = await bcrypt.hash(tempPassword, BCRYPT.SALT_ROUNDS);

  await prisma.user.update({
    where: { id: Number(id) },
    data: {
      passwordHash,
      forcePasswordChange: true,
      lastPasswordChange: new Date(),
    },
  });

  return {
    ok: true,
    tempPassword,
    message: 'Password reset successful',
  };
}

/**
 * Reset user's security question
 */
async function resetUserSecurityQuestion(id, resetByUserId, reason) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true, hasSecurityQuestion: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (!user.hasSecurityQuestion) {
    throw new AppError('User does not have a security question set', 400);
  }

  await prisma.user.update({
    where: { id: Number(id) },
    data: {
      securityQuestion: null,
      securityAnswerHash: null,
      hasSecurityQuestion: false,
      securityQuestionResetAt: new Date(),
      securityQuestionResetBy: resetByUserId,
      securityQuestionResetReason: reason || null,
      forcePasswordChange: false, // Only reset security, not password
    },
  });

  return {
    ok: true,
    message: 'Security question reset successfully',
  };
}

/**
 * Force user to set security question
 */
async function forceSecuritySetup(id) {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: { id: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  await prisma.user.update({
    where: { id: Number(id) },
    data: {
      hasSecurityQuestion: false,
      securityQuestion: null,
      securityAnswerHash: null,
    },
  });

  return {
    ok: true,
    message: 'User will be required to set security question on next login',
  };
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  createUserWithOnboarding,
  updateUserStatus,
  updateUser,
  deleteUser,
  resetUserPassword,
  resetUserSecurityQuestion,
  forceSecuritySetup,
};