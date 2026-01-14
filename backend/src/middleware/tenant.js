// backend/src/middleware/tenant.js

const { PrismaClient } = require('@prisma/client');
const { AppError } = require('./errorHandler');

const prisma = new PrismaClient();

/**
 * Resolve tenant from subdomain
 * Supports: subdomain.mypadifood.com OR custom domain
 */
async function resolveTenant(req, res, next) {
  try {
    const host = req.headers.host || req.hostname;
    
    let tenant;
    
    // Check if custom domain
    const customDomainTenant = await prisma.tenant.findFirst({
      where: { 
        customDomain: host,
        status: 'active',
      },
    });
    
    if (customDomainTenant) {
      tenant = customDomainTenant;
    } else {
      // Extract subdomain (e.g., mummykitchen from mummykitchen.mypadifood.com)
      const subdomain = host.split('.')[0];
      
      // Skip tenant resolution for main domain and admin
      if (subdomain === 'mypadifood' || subdomain === 'admin' || subdomain === 'www') {
        return next();
      }
      
      tenant = await prisma.tenant.findUnique({
        where: { 
          subdomain,
          status: 'active',
        },
      });
    }
    
    if (!tenant) {
      throw new AppError('Business not found or inactive', 404);
    }
    
    // Check subscription status
    if (tenant.plan !== 'free' && tenant.subscriptionExpiry) {
      if (new Date() > new Date(tenant.subscriptionExpiry)) {
        throw new AppError('Subscription expired. Please contact the business owner.', 403);
      }
    }
    
    // Attach tenant to request
    req.tenant = tenant;
    
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = { resolveTenant };