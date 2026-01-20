// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { JWT } = require('../config/constants');
const { PrismaClient } = require('@prisma/client');
const { logLogin, logLogout } = require('../utils/activityLogger');

const prisma = new PrismaClient();

/**
 * Auth middleware - logs admin logins
 */
async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT.SECRET);
    
    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, active: true },
    });
    
    if (!user || !user.active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    // Attach user to request
    req.user = user;
    
    // Log login activity for admin routes
    if (req.originalUrl.includes('/api/admin') || req.originalUrl.includes('/api/orders')) {
      logLogin(user.id, req.ip, req.get('user-agent'));
    }
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Admin auth middleware
 */
function adminAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  next();
}

/**
 * Super admin auth middleware
 */
function superAdminAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (req.user.role !== 'super-admin') {
    return res.status(403).json({ error: 'Super admin access required' });
  }
  
  next();
}

module.exports = {
  authMiddleware,
  adminAuth,
  superAdminAuth,
};