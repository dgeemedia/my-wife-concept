// backend/src/routes/users.js
const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { superAdminAuth } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  createUser,
  createUserWithOnboarding,
  updateUserStatus,
  updateUser,
  deleteUser,
  resetUserPassword,
  resetUserSecurityQuestion,
} = require('../controllers/userController');

const router = express.Router();

/**
 * GET /api/users
 * Get all users (super-admin only)
 */
router.get('/', superAdminAuth, asyncHandler(async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
}));

/**
 * GET /api/users/:id
 * Get single user by ID
 */
router.get('/:id', superAdminAuth, asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  res.json(user);
}));

/**
 * POST /api/users
 * Create new user with temporary password
 */
router.post('/', superAdminAuth, asyncHandler(async (req, res) => {
  const result = await createUser(req.body);
  res.status(201).json(result);
}));

/**
 * POST /api/users/onboarding
 * Create new user with onboarding flow (forces password + security question setup)
 */
router.post('/onboarding', superAdminAuth, asyncHandler(async (req, res) => {
  const result = await createUserWithOnboarding(req.body);
  res.status(201).json(result);
}));

/**
 * PATCH /api/users/:id/status
 * Toggle user active/inactive status
 */
router.patch('/:id/status', superAdminAuth, asyncHandler(async (req, res) => {
  const { active } = req.body;
  
  if (typeof active !== 'boolean') {
    return res.status(400).json({ error: 'active must be a boolean' });
  }
  
  const result = await updateUserStatus(
    req.params.id, 
    active,
    req.user.id
  );
  res.json(result);
}));

/**
 * PUT /api/users/:id
 * Update user details
 */
router.put('/:id', superAdminAuth, asyncHandler(async (req, res) => {
  const result = await updateUser(req.params.id, req.body);
  res.json(result);
}));

/**
 * DELETE /api/users/:id
 * Delete user (cannot delete self)
 */
router.delete('/:id', superAdminAuth, asyncHandler(async (req, res) => {
  const result = await deleteUser(req.params.id, req.user.id);
  res.json(result);
}));

/**
 * POST /api/users/:id/reset-password
 * Reset user password to new temporary password
 */
router.post('/:id/reset-password', superAdminAuth, asyncHandler(async (req, res) => {
  const result = await resetUserPassword(req.params.id);
  res.json(result);
}));

/**
 * POST /api/users/:id/reset-security
 * Reset user's security question (forces them to set new one)
 */
router.post('/:id/reset-security', superAdminAuth, asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const result = await resetUserSecurityQuestion(
    req.params.id,
    req.user.id,
    reason
  );
  res.json(result);
}));

module.exports = router;