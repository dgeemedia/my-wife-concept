// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { JWT } = require('../config/constants');

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT.SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, active: true },
    });

    if (!user || !user.active) {
      return res.status(401).json({ error: 'User inactive' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Role guard factory
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Convenience middlewares
const adminAuth = [authMiddleware, requireRole('admin')];
const superAdminAuth = requireRole('super_admin');

module.exports = {
  authMiddleware,
  requireRole,
  adminAuth,
  superAdminAuth,
};
