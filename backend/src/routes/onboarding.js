// backend/src/routes/onboarding.js
const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/onboarding/businesses - Public route to list all businesses
async function getAllPublicBusinesses(req, res) {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        businessName: true,
        businessType: true,
        logo: true,
        description: true,
        phone: true,
        whatsappNumber: true,
        primaryColor: true,
        secondaryColor: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });
    
    res.json(businesses);
  } catch (error) {
    console.error('Error fetching public businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
}

// POST /api/onboarding/submit - Public route for business owner onboarding
async function submitOnboarding(req, res) {
  try {
    const {
      businessName,
      businessType,
      ownerName,
      ownerEmail,
      ownerPhone,
      description,
      preferredSlug
    } = req.body;

    // Validate required fields
    if (!businessName || !ownerName || !ownerEmail || !ownerPhone) {
      return res.status(400).json({ 
        error: 'Business name, owner name, email, and phone are required' 
      });
    }

    // Create onboarding request (you can create a new table for this)
    // For now, we'll just log it and send a success response
    console.log('📋 New onboarding request:', {
      businessName,
      businessType,
      ownerName,
      ownerEmail,
      ownerPhone,
      description,
      preferredSlug,
      timestamp: new Date().toISOString()
    });

    // TODO: Send email notification to super admin
    // TODO: Store in OnboardingRequest table

    res.json({
      ok: true,
      message: 'Thank you! Your onboarding request has been submitted. Our team will contact you within 24 hours.'
    });
  } catch (error) {
    console.error('Onboarding submission error:', error);
    res.status(500).json({ error: 'Failed to submit onboarding request' });
  }
}

router.get('/businesses', asyncHandler(getAllPublicBusinesses));
router.post('/submit', asyncHandler(submitOnboarding));

module.exports = router;