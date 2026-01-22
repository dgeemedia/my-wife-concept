// backend/src/routes/auth.js
const express = require('express');
const prisma = require('../utils/prisma');

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

const router = express.Router();

/**
 * Bootstrap / super-admin logic
 */
const bootstrapOrSuperAdmin = async (req, res, next) => {
  const userCount = await prisma.user.count();
  if (userCount === 0) return next();
  return superAdminAuth(req, res, next);
};

router.post(
  '/register',
  validateUserRegistration,
  bootstrapOrSuperAdmin,
  asyncHandler(async (req, res) => {
    res.status(201).json(await register(req));
  })
);

router.post(
  '/login',
  validateLogin,
  asyncHandler(async (req, res) => {
    res.json(await login(req));
  })
);

router.post(
  '/change-password',
  authMiddleware,
  validatePasswordChange,
  asyncHandler(async (req, res) => {
    const requestUserId = req.user.id;
    const targetUserId = req.body.userId
      ? Number(req.body.userId)
      : requestUserId;

    res.json(await changePassword(req, requestUserId, targetUserId));
  })
);

router.post(
  '/change-password-with-current',
  authMiddleware,
  asyncHandler(async (req, res) => {
    res.json(
      await changePasswordWithCurrent(req, req.user.id, req.body.userId ?? req.user.id)
    );
  })
);

router.post(
  '/first-login',
  authMiddleware,
  asyncHandler(async (req, res) => {
    res.json(await firstLogin(req));
  })
);

router.post(
  '/recover-password',
  validatePasswordRecovery,
  asyncHandler(async (req, res) => {
    res.json(await recoverPassword(req));
  })
);

router.get(
  '/security-question',
  asyncHandler(async (req, res) => {
    if (!req.query.email) {
      throw new AppError('email query parameter is required', 400);
    }
    res.json(await getSecurityQuestion(req.query.email));
  })
);

router.post(
  '/security-question',
  authMiddleware,
  asyncHandler(async (req, res) => {
    res.json(await setSecurityQuestion(req, req.user.id));
  })
);

router.get(
  '/me',
  authMiddleware,
  asyncHandler(async (req, res) => {
    res.json(await getCurrentUser(req.user.id));
  })
);

router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (req, res) => {
    res.json(await logout(req));
  })
);

module.exports = router;
