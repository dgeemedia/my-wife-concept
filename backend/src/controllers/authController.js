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

    // Check if user needs to set security question
  const needsSecuritySetup = !user.hasSecurityQuestion;

  return {
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      forcePasswordChange: user.forcePasswordChange,
      hasSecurityQuestion: user.hasSecurityQuestion,
      needsSecuritySetup: needsSecuritySetup,
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

/**
 * Change password with current password verification (for own account)
 */
async function changePasswordWithCurrent(req, res, userId, targetUserId) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  // Users can only change their own password unless they're super-admin
  if (targetUserId !== userId && req.user.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Forbidden', 403);
  }

  // Get user's current password
  const user = await prisma.user.findUnique({
    where: { id: Number(targetUserId) },
    select: { passwordHash: true, forcePasswordChange: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // If changing own password, verify current password
  if (targetUserId === userId) {
    const isValidCurrent = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValidCurrent) {
      throw new AppError('Current password is incorrect', 400);
    }
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT.SALT_ROUNDS);

  // Update password
  await prisma.user.update({
    where: { id: Number(targetUserId) },
    data: {
      passwordHash,
      forcePasswordChange: false, // User has changed password
      lastPasswordChange: new Date(),
    },
  });

  return { ok: true, message: 'Password changed successfully' };
}

/**
 * Set security question and answer
 */
async function setSecurityQuestion(req, res, userId) {
  const { securityQuestion, securityAnswer } = req.body;

  if (!securityQuestion || !securityAnswer) {
    throw new AppError('Security question and answer are required', 400);
  }

  if (securityQuestion.length > 200) {
    throw new AppError('Security question too long (max 200 characters)', 400);
  }

  if (securityAnswer.length < 2) {
    throw new AppError('Security answer must be at least 2 characters', 400);
  }

  const securityAnswerHash = await bcrypt.hash(securityAnswer, BCRYPT.SALT_ROUNDS);

  await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      securityQuestion,
      securityAnswerHash,
      hasSecurityQuestion: true,
    },
  });

  return { ok: true, message: 'Security question set successfully' };
}

/**
 * First login - change password and set security question
 */
async function firstLogin(req, res) {
  const userId = req.user.id;
  const { currentPassword, newPassword, securityQuestion, securityAnswer } = req.body;

  // Validate all fields
  if (!currentPassword || !newPassword || !securityQuestion || !securityAnswer) {
    throw new AppError('All fields are required', 400);
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { passwordHash: true, forcePasswordChange: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Verify current password
  const isValidCurrent = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValidCurrent) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Validate new password
  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters', 400);
  }

  // Hash new password and security answer
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT.SALT_ROUNDS);
  const securityAnswerHash = await bcrypt.hash(securityAnswer, BCRYPT.SALT_ROUNDS);

  // Update user
  await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      passwordHash,
      securityQuestion,
      securityAnswerHash,
      forcePasswordChange: false,
      hasSecurityQuestion: true,
      lastPasswordChange: new Date(),
    },
  });

  return { 
    ok: true, 
    message: 'Password changed and security question set successfully' 
  };
}

module.exports = {
  register,
  login,
  changePassword,
  recoverPassword,
  getSecurityQuestion,
  getCurrentUser,
  changePasswordWithCurrent,
  setSecurityQuestion,
  firstLogin,
};
