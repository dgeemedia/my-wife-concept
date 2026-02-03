// backend/src/middleware/subdomain.js
const prisma = require('../lib/prisma');
/**
 * Extracts the business slug from a raw hostname string.
 *
 * Handles every pattern we need to support:
 *   LOCAL DEV  →  "houseofqg.localhost"       → "houseofqg"
 *                 "chrenisfarm.localhost"      → "chrenisfarm"
 *                 "localhost"                  → null  (no subdomain)
 *   PRODUCTION →  "chrenisfarm.mypadifood.com" → "chrenisfarm"
 *                 "mypadifood.com"            → null  (root / landing)
 *                 "www.mypadifood.com"        → null
 *
 * Port numbers are stripped before parsing so "houseofqg.localhost:3000"
 * works identically to "houseofqg.localhost".
 */
function parseSlugFromHostname(hostname) {
  if (!hostname) return null;

  // Strip port if present  →  "houseofqg.localhost:3000" → "houseofqg.localhost"
  const host = hostname.split(':')[0];

  const parts = host.split('.');

  // ── LOCAL DEV: *.localhost ──────────────────────────────────────────
  // parts = ["houseofqg", "localhost"]  →  return "houseofqg"
  // parts = ["localhost"]               →  return null (bare localhost)
  if (parts[parts.length - 1] === 'localhost') {
    return parts.length >= 2 ? parts[0] : null;
  }

  // ── PRODUCTION: *.domain.tld ────────────────────────────────────────
  // parts = ["chrenisfarm", "mypadifood", "com"]  →  return "chrenisfarm"
  // parts = ["mypadifood", "com"]                 →  return null
  // parts = ["www", "mypadifood", "com"]          →  return null
  if (parts.length <= 2) return null;
  if (parts[0] === 'www') return null;

  return parts[0];
}

/**
 * Middleware to extract and attach business context from subdomain.
 * This runs BEFORE authentication for public routes.
 */
async function extractSubdomain(req, res, next) {
  try {
    const hostname = req.hostname || req.get('host');
    console.log(`🔍 Extracting subdomain from: ${hostname}`);

    // 1. Allow an explicit override header (useful for tests / curl)
    const headerSlug = req.get('X-Business-Slug');

    // 2. Parse the actual hostname
    const parsedSlug = parseSlugFromHostname(hostname);

    // Header takes priority, then parsed hostname
    const slug = headerSlug || parsedSlug;

    if (!slug) {
      console.log('ℹ️  No subdomain detected (root / landing page)');
      return next();
    }

    const business = await prisma.business.findUnique({
      where: { slug }
    });

    if (business) {
      req.businessId   = business.id;
      req.businessSlug = business.slug;
      console.log(`✅ Subdomain resolved: "${slug}" → Business ID ${business.id}`);
    } else {
      console.warn(`⚠️  No business found for subdomain: "${slug}"`);
    }

    next();
  } catch (error) {
    console.error('❌ Subdomain extraction error:', error);
    next(); // Continue even if extraction fails
  }
}

/**
 * Middleware to require business context (for protected routes).
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
  requireBusiness,
  parseSlugFromHostname // exported so frontend shared-logic tests can reuse if needed
};