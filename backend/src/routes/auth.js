// backend/src/routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const {
  validateUserRegistration,
  validateLogin,
  validatePasswordChange,
  validatePasswordRecovery,
} = require('../middleware/validation');

const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { authMiddleware, superAdminAuth } = require('../middleware/auth');

const {
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
} = require('../controllers/authController');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Bootstrap or Super Admin Registration
 */
const bootstrapOrSuperAdmin = async (req, res, next) => {
  const userCount = await prisma.user.count();
  if (userCount === 0) return next();
  return superAdminAuth(req, res, next);
};

/**
 * POST /api/auth/register
 */
router.post(
  '/register',
  validateUserRegistration,
  bootstrapOrSuperAdmin,
  asyncHandler(async (req, res) => {
    const result = await register(req);
    res.status(201).json(result);
  })
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  validateLogin,
  asyncHandler(async (req, res) => {
    const result = await login(req);
    res.json(result);
  })
);

/**
 * POST /api/auth/change-password
 * Super-admin can change another user's password
 */
router.post(
  '/change-password',
  authMiddleware,
  validatePasswordChange,
  asyncHandler(async (req, res) => {
    const requestUserId = req.user.id;
    const targetUserId = req.body.userId
      ? Number(req.body.userId)
      : requestUserId;

    const result = await changePassword(req, requestUserId, targetUserId);
    res.json(result);
  })
);

/**
 * POST /api/auth/change-password-with-current
 * User must supply current password
 */
router.post(
  '/change-password-with-current',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const requestUserId = req.user.id;
    const targetUserId = req.body.userId
      ? Number(req.body.userId)
      : requestUserId;

    const result = await changePasswordWithCurrent(
      req,
      requestUserId,
      targetUserId
    );
    res.json(result);
  })
);

/**
 * POST /api/auth/first-login
 */
router.post(
  '/first-login',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await firstLogin(req);
    res.json(result);
  })
);

/**
 * POST /api/auth/recover-password
 */
router.post(
  '/recover-password',
  validatePasswordRecovery,
  asyncHandler(async (req, res) => {
    const result = await recoverPassword(req);
    res.json(result);
  })
);

/**
 * GET /api/auth/security-question?email=
 */
router.get(
  '/security-question',
  asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (!email) {
      throw new AppError('email query parameter is required', 400);
    }

    const result = await getSecurityQuestion(email);
    res.json(result);
  })
);

/**
 * POST /api/auth/security-question
 */
router.post(
  '/security-question',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await setSecurityQuestion(req, req.user.id);
    res.json(result);
  })
);

/**
 * GET /api/auth/me
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await getCurrentUser(req.user.id);
    res.json(result);
  })
);

/**
 * POST /api/auth/logout
 */
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await logout(req);
    res.json(result);
  })
);

module.exports = router;
