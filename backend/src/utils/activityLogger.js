// backend/src/utils/activityLogger.js
const prisma = require('./prisma');

/**
 * Generic activity logger (best-effort)
 */
async function logActivity({
  userId,
  action,
  entity = null,
  entityId = null,
  details = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    // NEVER break auth or API flows
    console.error('Activity log failed:', err.message);
  }
}

async function logLogin(userId, ip, ua) {
  return logActivity({
    userId,
    action: 'LOGIN',
    entity: 'user',
    entityId: userId,
    ipAddress: ip,
    userAgent: ua,
  });
}

async function logLogout(userId, ip, ua) {
  return logActivity({
    userId,
    action: 'LOGOUT',
    entity: 'user',
    entityId: userId,
    ipAddress: ip,
    userAgent: ua,
  });
}

module.exports = {
  logActivity,
  logLogin,
  logLogout,
};
