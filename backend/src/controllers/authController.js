// backend/src/controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { JWT, BCRYPT, ROLES } = require('../config/constants');
const { AppError } = require('../middleware/errorHandler');
const { logLogout } = require('../utils/activityLogger');

const prisma = new PrismaClient();

/**
 * Register (bootstrap super-admin)
 */
async function register(req) {
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
 * Login
 */
async function login(req) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT.SECRET,
    { expiresIn: JWT.EXPIRES_IN }
  );

  return {
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      forcePasswordChange: user.forcePasswordChange,
      hasSecurityQuestion: user.hasSecurityQuestion,
    },
  };
}

/**
 * Change password (admin or self)
 */
async function changePassword(req, requestUserId, targetUserId) {
  if (requestUserId !== targetUserId && req.user.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Forbidden', 403);
  }

  const { newPassword } = req.body;
  if (newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT.SALT_ROUNDS);

  await prisma.user.update({
    where: { id: Number(targetUserId) },
    data: {
      passwordHash,
      forcePasswordChange: false,
      lastPasswordChange: new Date(),
    },
  });

  return { ok: true, message: 'Password changed successfully' };
}

/**
 * Change password with current password
 */
async function changePasswordWithCurrent(req, requestUserId, targetUserId) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('All fields are required', 400);
  }

  if (requestUserId !== targetUserId && req.user.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Forbidden', 403);
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(targetUserId) },
  });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError('Current password is incorrect', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT.SALT_ROUNDS);

  await prisma.user.update({
    where: { id: Number(targetUserId) },
    data: {
      passwordHash,
      forcePasswordChange: false,
      lastPasswordChange: new Date(),
    },
  });

  return { ok: true, message: 'Password updated successfully' };
}

/**
 * Recover password via security question
 */
async function recoverPassword(req) {
  const { email, answer, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.securityAnswerHash) {
    throw new AppError('Invalid recovery request', 400);
  }

  const valid = await bcrypt.compare(answer, user.securityAnswerHash);
  if (!valid) {
    throw new AppError('Incorrect answer', 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT.SALT_ROUNDS);

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      forcePasswordChange: false,
      lastPasswordChange: new Date(),
    },
  });

  return { ok: true, message: 'Password reset successful' };
}

/**
 * Security question
 */
async function getSecurityQuestion(email) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { securityQuestion: true },
  });

  if (!user?.securityQuestion) {
    throw new AppError('No security question set', 404);
  }

  return { question: user.securityQuestion };
}

async function setSecurityQuestion(req, userId) {
  const { securityQuestion, securityAnswer } = req.body;

  const securityAnswerHash = await bcrypt.hash(
    securityAnswer,
    BCRYPT.SALT_ROUNDS
  );

  await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      securityQuestion,
      securityAnswerHash,
      hasSecurityQuestion: true,
    },
  });

  return { ok: true, message: 'Security question set' };
}

/**
 * First login
 */
async function firstLogin(req) {
  const { currentPassword, newPassword, securityQuestion, securityAnswer } =
    req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError('Current password incorrect', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT.SALT_ROUNDS);
  const securityAnswerHash = await bcrypt.hash(
    securityAnswer,
    BCRYPT.SALT_ROUNDS
  );

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      securityQuestion,
      securityAnswerHash,
      forcePasswordChange: false,
      hasSecurityQuestion: true,
      lastPasswordChange: new Date(),
    },
  });

  return { ok: true, message: 'First login setup completed' };
}

/**
 * Current user
 */
async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: {
      id: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  return { user };
}

/**
 * Logout
 */
async function logout(req) {
  try {
    // Log the logout activity
    await logLogout(req.user.id, req.ip, req.get('user-agent'));
  } catch (error) {
    console.error('Failed to log logout activity:', error);
    // Don't fail the logout if logging fails
  }

  await prisma.activityLog.create({
    data: {
      userId: req.user.id,
      action: 'LOGOUT',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    },
  });

  return { ok: true, message: 'Logged out successfully' };
}

module.exports = {
  register,
  login,
  changePassword,
  changePasswordWithCurrent,
  recoverPassword,
  getSecurityQuestion,
  setSecurityQuestion,
  firstLogin,
  getCurrentUser,
  logout,
};
