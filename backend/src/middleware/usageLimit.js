// backend/src/middleware/usageLimit.js
const { PrismaClient } = require('@prisma/client');
const { createLogger } = require('../utils/logger');

const prisma = new PrismaClient();
const logger = createLogger('UsageLimit');

/**
 * Plan limits configuration
 */
const PLAN_LIMITS = {
  free: {
    ordersPerMonth: 10, // Changed from daily to monthly
    users: 1,
    storageLimit: 100, // MB
    features: ['basic'],
  },
  starter: {
    ordersPerMonth: 50,
    users: 2,
    storageLimit: 1000,
    features: ['basic', 'whatsapp', 'tracking', 'analytics'],
    overageRate: 300, // ₦300 per extra order
  },
  business: {
    ordersPerMonth: 200,
    users: 5,
    storageLimit: 5000,
    features: ['basic', 'whatsapp', 'tracking', 'analytics', 'sms', 'email', 'custom-domain'],
    overageRate: 200, // ₦200 per extra order
  },
  professional: {
    ordersPerMonth: -1, // Unlimited
    users: -1,
    storageLimit: -1,
    features: ['all'],
    overageRate: 0,
  },
};

/**
 * Check if tenant has exceeded order limit
 */
async function checkOrderLimit(req, res, next) {
  try {
    const tenant = req.tenant;
    
    if (!tenant) {
      return res.status(401).json({
        error: 'Tenant not found',
        message: 'Please sign up to start accepting orders',
      });
    }

    // Check subscription status
    if (tenant.status !== 'active') {
      return res.status(403).json({
        error: 'Subscription inactive',
        message: 'Your subscription is not active. Please contact support.',
        status: tenant.status,
      });
    }

    // Check if subscription expired
    if (tenant.subscriptionExpiry && new Date() > new Date(tenant.subscriptionExpiry)) {
      // Grace period: 7 days
      const daysSinceExpiry = Math.floor(
        (new Date() - new Date(tenant.subscriptionExpiry)) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceExpiry > 7) {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: { status: 'suspended' },
        });

        return res.status(402).json({
          error: 'Subscription expired',
          message: 'Your subscription expired. Please renew to continue.',
          expiredOn: tenant.subscriptionExpiry,
          upgradeUrl: `${process.env.FRONTEND_URL}/upgrade`,
        });
      } else {
        // Within grace period - show warning
        req.warningMessage = `Your subscription expires in ${7 - daysSinceExpiry} days. Please renew.`;
      }
    }

    // Reset monthly counter if new month
    const lastReset = new Date(tenant.lastResetDate || tenant.createdAt);
    const now = new Date();
    
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          ordersThisMonth: 0,
          lastResetDate: now,
        },
      });
      tenant.ordersThisMonth = 0;
    }

    // Get plan limits
    const planLimits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.free;
    
    // Professional plan has unlimited orders
    if (planLimits.ordersPerMonth === -1) {
      return next();
    }

    // Check if limit reached
    if (tenant.ordersThisMonth >= planLimits.ordersPerMonth) {
      // Allow overages for paid plans
      if (tenant.plan !== 'free' && planLimits.overageRate) {
        const overages = tenant.ordersThisMonth - planLimits.ordersPerMonth + 1;
        const overageCost = overages * planLimits.overageRate;

        logger.warn(`Tenant ${tenant.id} (${tenant.subdomain}) exceeded limit`, {
          plan: tenant.plan,
          limit: planLimits.ordersPerMonth,
          current: tenant.ordersThisMonth,
          overages,
          overageCost,
        });

        // Allow order but flag for billing
        req.isOverage = true;
        req.overageCost = overageCost;
        req.warningMessage = `You've exceeded your plan limit. Overage charges apply: ₦${overageCost.toLocaleString()}`;
        
        return next();
      }

      // Free plan: Hard stop
      return res.status(402).json({
        error: 'Order limit reached',
        message: `You've reached your ${planLimits.ordersPerMonth} orders/month limit.`,
        currentPlan: tenant.plan,
        ordersThisMonth: tenant.ordersThisMonth,
        limit: planLimits.ordersPerMonth,
        upgradeUrl: `${process.env.FRONTEND_URL}/upgrade`,
        recommendations: [
          {
            plan: 'starter',
            limit: PLAN_LIMITS.starter.ordersPerMonth,
            price: '₦15,000/month',
          },
          {
            plan: 'business',
            limit: PLAN_LIMITS.business.ordersPerMonth,
            price: '₦35,000/month',
          },
        ],
      });
    }

    // Increment order counter
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        ordersThisMonth: { increment: 1 },
      },
    });

    // Show warning when approaching limit (80%)
    const usagePercent = (tenant.ordersThisMonth / planLimits.ordersPerMonth) * 100;
    if (usagePercent >= 80) {
      req.warningMessage = `You've used ${tenant.ordersThisMonth}/${planLimits.ordersPerMonth} orders (${Math.round(usagePercent)}%). Consider upgrading.`;
    }

    logger.info(`Order created for tenant ${tenant.subdomain}`, {
      ordersThisMonth: tenant.ordersThisMonth + 1,
      limit: planLimits.ordersPerMonth,
      usagePercent: Math.round(usagePercent),
    });

    next();
  } catch (error) {
    logger.error('Usage limit check failed', { error: error.message });
    next(error);
  }
}

/**
 * Check if tenant can access a feature
 */
function checkFeatureAccess(featureName) {
  return (req, res, next) => {
    const tenant = req.tenant;
    
    if (!tenant) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Tenant not found',
      });
    }

    const planLimits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.free;
    
    // Professional plan has all features
    if (planLimits.features.includes('all')) {
      return next();
    }

    // Check if feature is available in plan
    if (!planLimits.features.includes(featureName)) {
      return res.status(403).json({
        error: 'Feature not available',
        message: `The '${featureName}' feature is not available in your ${tenant.plan} plan.`,
        currentPlan: tenant.plan,
        upgradeUrl: `${process.env.FRONTEND_URL}/upgrade`,
        availableIn: Object.keys(PLAN_LIMITS).filter(
          plan => PLAN_LIMITS[plan].features.includes(featureName) || PLAN_LIMITS[plan].features.includes('all')
        ),
      });
    }

    next();
  };
}

/**
 * Get tenant usage statistics
 */
async function getTenantUsage(tenantId) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
          users: true,
        },
      },
    },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  const planLimits = PLAN_LIMITS[tenant.plan] || PLAN_LIMITS.free;

  return {
    plan: tenant.plan,
    status: tenant.status,
    subscriptionExpiry: tenant.subscriptionExpiry,
    usage: {
      orders: {
        current: tenant.ordersThisMonth,
        limit: planLimits.ordersPerMonth,
        percent: planLimits.ordersPerMonth === -1 
          ? 0 
          : Math.round((tenant.ordersThisMonth / planLimits.ordersPerMonth) * 100),
      },
      users: {
        current: tenant._count.users,
        limit: planLimits.users,
      },
      products: {
        current: tenant._count.products,
        limit: -1, // No limit on products
      },
    },
    features: planLimits.features,
    limits: planLimits,
  };
}

/**
 * Check if tenant is in trial period
 */
function isInTrialPeriod(tenant) {
  if (tenant.plan !== 'free') return false;
  
  const daysSinceCreation = Math.floor(
    (new Date() - new Date(tenant.createdAt)) / (1000 * 60 * 60 * 24)
  );
  
  return daysSinceCreation <= 7;
}

/**
 * Middleware to handle trial period
 */
async function checkTrialPeriod(req, res, next) {
  const tenant = req.tenant;
  
  if (!tenant) return next();
  
  if (tenant.plan === 'free') {
    const inTrial = isInTrialPeriod(tenant);
    
    if (!inTrial) {
      // Trial expired - require upgrade
      return res.status(402).json({
        error: 'Trial expired',
        message: 'Your 7-day free trial has ended. Please upgrade to continue.',
        trialEndedOn: new Date(tenant.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
        upgradeUrl: `${process.env.FRONTEND_URL}/upgrade`,
      });
    } else {
      // Still in trial - show days remaining
      const daysRemaining = 7 - Math.floor(
        (new Date() - new Date(tenant.createdAt)) / (1000 * 60 * 60 * 24)
      );
      req.trialDaysRemaining = daysRemaining;
    }
  }
  
  next();
}

module.exports = {
  checkOrderLimit,
  checkFeatureAccess,
  getTenantUsage,
  isInTrialPeriod,
  checkTrialPeriod,
  PLAN_LIMITS,
};