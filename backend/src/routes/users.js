// backend/src/routes/users.js
const express = require('express');
const { getAllUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { authMiddleware, requireSuperAdmin } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

router.get('/', authMiddleware, requireSuperAdmin, asyncHandler(getAllUsers));
router.post('/', authMiddleware, requireSuperAdmin, asyncHandler(createUser));
router.put('/:id', authMiddleware, requireSuperAdmin, asyncHandler(updateUser));
router.delete('/:id', authMiddleware, requireSuperAdmin, asyncHandler(deleteUser));

module.exports = router;