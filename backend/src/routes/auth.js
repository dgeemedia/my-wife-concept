// backend/src/routes/auth.js
/**
 * Authentication routes
 * Location: backend/src/routes/auth.js
 *
 * Routes:
 *  POST /api/auth/register
 *  POST /api/auth/login
 *  POST /api/auth/change-password
 *  POST /api/auth/recover-password
 *  POST /api/auth/security-question
 *  GET  /api/auth/me
 *
 * Notes:
 *  - If the users table is empty, public registration is allowed (bootstrap).
 *    Once at least one user exists, registration requires super-admin auth.
 */

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
const {
  register,
  login,
  changePassword,
  recoverPassword,
  getSecurityQuestion,
  getCurrentUser,
} = require('../controllers/authController');
const { authMiddleware, superAdminAuth } = require('../middleware/auth');
const { BCRYPT, ROLES } = require('../config/constants');

const prisma = new PrismaClient();
const router = express.Router();

/**
 * Custom middleware for bootstrap registration
 * Allows registration if no users exist, otherwise requires super-admin
 */
const bootstrapOrSuperAdmin = async (req, res, next) => {
  const userCount = await prisma.user.count();
  
  if (userCount === 0) {
    // Bootstrap mode - no auth required
    return next();
  }
  
  // Users exist - require super-admin auth
  return superAdminAuth(req, res, next);
};

/**
 * POST /register
 * - If no users exist => allow registration (bootstrap root user)
 * - If users exist => require super-admin auth
 */
router.post(
  '/register',
  validateUserRegistration,
  bootstrapOrSuperAdmin,
  asyncHandler(async (req, res) => {
    const result = await register(req, res);
    res.status(201).json(result);
  })
);

/**
 * POST /login
 */
router.post(
  '/login',
  validateLogin,
  asyncHandler(async (req, res) => {
    const result = await login(req, res);
    res.json(result);
  })
);

/**
 * POST /change-password
 * - If userId provided in body and requesting user is super-admin, allow changing other users' passwords.
 * - Otherwise change own password (auth required).
 */
router.post(
  '/change-password',
  authMiddleware,
  validatePasswordChange,
  asyncHandler(async (req, res) => {
    const requestUserId = req.user.id;
    // body may include userId (target)
    const targetUserId = req.body.userId ? Number(req.body.userId) : requestUserId;

    const result = await changePassword(req, res, requestUserId, targetUserId);
    res.json(result);
  })
);

/**
 * POST /recover-password
 */
router.post(
  '/recover-password',
  validatePasswordRecovery,
  asyncHandler(async (req, res) => {
    const result = await recoverPassword(req, res);
    res.json(result);
  })
);

/**
 * POST /security-question
 * - Set/Update security question & answer for currently authenticated user.
 * - Requires auth.
 */
router.post(
  '/security-question',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { securityQuestion, securityAnswer } = req.body;

    if (!securityQuestion || !securityAnswer) {
      throw new AppError('securityQuestion and securityAnswer are required', 400);
    }

    const securityAnswerHash = await bcrypt.hash(securityAnswer, BCRYPT.SALT_ROUNDS);

    await prisma.user.update({
      where: { id: Number(req.user.id) },
      data: {
        securityQuestion,
        securityAnswerHash,
      },
    });

    res.json({ ok: true, message: 'Security question set' });
  })
);

/**
 * GET /security-question?email=...
 * - Get security question for a given email (for recover flow)
 */
router.get(
  '/security-question',
  asyncHandler(async (req, res) => {
    const { email } = req.query;
    
    if (!email) {
      throw new AppError('email query parameter is required', 400);
    }
    
    const data = await getSecurityQuestion(email);
    res.json(data);
  })
);

/**
 * GET /me
 */
router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const data = await getCurrentUser(Number(req.user.id));
    res.json(data);
  })
);

/**
 * POST /logout
 * - Client-side token invalidation endpoint
 */
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (req, res) => {
    // Since JWT is stateless, client should remove the token
    // This endpoint exists for API consistency
    res.json({
      ok: true,
      message: 'Logged out successfully. Please remove your token client-side.'
    });
  })
);

/**
 * POST /first-login
 * First login - change password and set security question
 */
router.post(
  '/first-login',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await firstLogin(req, res);
    res.json(result);
  })
);

/**
 * POST /security-question
 * Set security question and answer
 */
router.post(
  '/security-question',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const result = await setSecurityQuestion(req, res, req.user.id);
    res.json(result);
  })
);

/**
 * POST /change-password-with-current
 * Change password with current password verification
 */
router.post(
  '/change-password-with-current',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const requestUserId = req.user.id;
    const targetUserId = req.body.userId ? Number(req.body.userId) : requestUserId;
    
    const result = await changePasswordWithCurrent(req, res, requestUserId, targetUserId);
    res.json(result);
  })
);

module.exports = router;
