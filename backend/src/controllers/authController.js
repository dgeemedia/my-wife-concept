// backend/src/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { JWT, BCRYPT, ROLES } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

/**
 * Register new super-admin
 */
async function register(req, res) {
  const { email, password, role } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('User already exists', 400);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT.SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: role || ROLES.SUPER_ADMIN,
      forcePasswordChange: true,
      active: true,
    },
  });

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * Login user
 */
async function login(req, res) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.active) {
    throw new AppError('Account suspended. Contact administrator.', 403);
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    JWT.SECRET,
    { expiresIn: JWT.EXPIRES_IN }
  );

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      forcePasswordChange: user.forcePasswordChange,
    },
    token,
  };
}

/**
 * Change password
 */
async function changePassword(req, res, userId, targetUserId) {
  const { newPassword } = req.body;

  // Users can only change their own password unless they're super-admin
  if (targetUserId !== userId && req.user.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Forbidden', 403);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT.SALT_ROUNDS);

  await prisma.user.update({
    where: { id: Number(targetUserId) },
    data: {
      passwordHash,
      forcePasswordChange: false,
    },
  });

  return { ok: true, message: 'Password changed successfully' };
}

/**
 * Recover password using security question
 */
async function recoverPassword(req, res) {
  const { email, answer, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.securityAnswerHash) {
    throw new AppError('Invalid request', 400);
  }

  const isValidAnswer = await bcrypt.compare(answer, user.securityAnswerHash);
  if (!isValidAnswer) {
    throw new AppError('Incorrect answer', 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT.SALT_ROUNDS);

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      forcePasswordChange: false,
    },
  });

  return { ok: true, message: 'Password reset successful' };
}

/**
 * Get security question
 */
async function getSecurityQuestion(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { securityQuestion: true },
  });

  if (!user || !user.securityQuestion) {
    throw new AppError('No security question set for this account', 404);
  }

  return { question: user.securityQuestion };
}

/**
 * Get current user
 */
async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
      forcePasswordChange: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return { user };
}

module.exports = {
  register,
  login,
  changePassword,
  recoverPassword,
  getSecurityQuestion,
  getCurrentUser,
};
