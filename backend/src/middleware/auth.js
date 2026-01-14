// backend/src/middleware/auth.js
/**
 * Authentication middleware
 * backend/src/middleware/auth.js
 */
const jwt = require('jsonwebtoken');
const { JWT, ROLES } = require('../config/constants');

/**
 * Verify JWT token and attach user to request
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized - No token provided' });
  }

  try {
    const payload = jwt.verify(token, JWT.SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Ensure user is admin or super-admin
 */
function adminAuth(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }
    next();
  });
}

/**
 * Ensure user is super-admin only
 */
function superAdminAuth(req, res, next) {
  authMiddleware(req, res, () => {
    if (req.user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ error: 'Forbidden - Super admin access required' });
    }
    next();
  });
}

module.exports = {
  authMiddleware,
  adminAuth,
  superAdminAuth,
};