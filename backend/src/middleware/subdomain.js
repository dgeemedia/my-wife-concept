// backend/src/middleware/subdomain.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Middleware to extract and attach business context from subdomain
 * This runs BEFORE authentication for public routes
 */
async function extractSubdomain(req, res, next) {
  try {
    const hostname = req.hostname || req.get('host');
    
    console.log(`🔍 Extracting subdomain from: ${hostname}`);
    
    // For local development
    if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
      // You can set a default business for local testing
      // Or extract from a custom header: req.get('X-Business-Slug')
      const testSlug = req.get('X-Business-Slug') || 'chrenisfarm';
      const business = await prisma.business.findUnique({
        where: { slug: testSlug }
      });
      
      if (business) {
        req.businessId = business.id;
        req.businessSlug = business.slug;
        console.log(`✅ Local dev - using business: ${business.slug} (ID: ${business.id})`);
      }
      
      return next();
    }
    
    // Extract subdomain from hostname
    // Example: chrenisfarm.mypadifood.com -> chrenisfarm
    const parts = hostname.split('.');
    
    // If www.mypadifood.com or mypadifood.com (no subdomain)
    if (parts.length <= 2 || parts[0] === 'www') {
      console.log('ℹ️ No subdomain detected (landing page)');
      return next();
    }
    
    // Get the subdomain (first part)
    const subdomain = parts[0];
    
    // Look up business by slug
    const business = await prisma.business.findUnique({
      where: { slug: subdomain }
    });
    
    if (business) {
      req.businessId = business.id;
      req.businessSlug = business.slug;
      console.log(`✅ Subdomain detected: ${subdomain} -> Business ID: ${business.id}`);
    } else {
      console.warn(`⚠️ No business found for subdomain: ${subdomain}`);
    }
    
    next();
  } catch (error) {
    console.error('❌ Subdomain extraction error:', error);
    next(); // Continue even if subdomain extraction fails
  }
}

/**
 * Middleware to require business context (for protected routes)
 */
function requireBusiness(req, res, next) {
  if (!req.businessId && !req.user?.businessId) {
    return res.status(400).json({ 
      error: 'Business context required. Please access via subdomain.' 
    });
  }
  
  // If not set from subdomain, use user's business
  if (!req.businessId && req.user?.businessId) {
    req.businessId = req.user.businessId;
  }
  
  next();
}

module.exports = {
  extractSubdomain,
  requireBusiness
};