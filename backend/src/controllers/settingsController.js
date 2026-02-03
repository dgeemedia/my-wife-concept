// backend/src/controllers/settingsController.js
const prisma = require('../lib/prisma');

/**
 * Safely parse supportedLanguages field
 */
function parseSupportedLanguages(value) {
  if (!value) {
    return ['en', 'fr', 'yo', 'ig', 'ha'];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      return value.split(',').map(lang => lang.trim()).filter(Boolean);
    }
  }

  return ['en', 'fr', 'yo', 'ig', 'ha'];
}

/**
 * Safely stringify supportedLanguages for database storage
 */
function stringifySupportedLanguages(value) {
  if (!value) {
    return JSON.stringify(['en', 'fr', 'yo', 'ig', 'ha']);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return value;
      }
    } catch (e) {
      const langs = value.split(',').map(lang => lang.trim()).filter(Boolean);
      return JSON.stringify(langs);
    }
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  return JSON.stringify(['en', 'fr', 'yo', 'ig', 'ha']);
}

// ============================================================================
// GET SETTINGS - WITH TENANT CONTEXT
// ============================================================================
async function getSettings(req, res) {
  // Determine businessId from context
  let businessId;
  
  if (req.user) {
    // Authenticated request
    businessId = req.user.businessId;
  } else if (req.businessId) {
    // Public request with subdomain context
    businessId = req.businessId;
  }

  if (!businessId) {
    // Try to get first business (for initial setup or super-admin)
    const firstBusiness = await prisma.business.findFirst();
    
    if (firstBusiness) {
      businessId = firstBusiness.id;
    } else {
      // No business exists - check old BusinessSettings for migration
      const oldSettings = await prisma.businessSettings.findFirst();
      
      if (oldSettings) {
        // Return old settings for backward compatibility
        const parsedSettings = {
          ...oldSettings,
          supportedLanguages: parseSupportedLanguages(oldSettings.supportedLanguages)
        };
        return res.json(parsedSettings);
      }
      
      // Return default settings
      return res.json({
        id: 0,
        businessName: process.env.BUSINESS_NAME || 'My Business',
        businessType: 'food',
        phone: process.env.WHATSAPP_NUMBER || '',
        whatsappNumber: process.env.WHATSAPP_NUMBER || '',
        currency: 'NGN',
        language: 'en',
        primaryColor: '#10B981',
        secondaryColor: '#F59E0B',
        autoDetectLanguage: true,
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'fr', 'yo', 'ig', 'ha']
      });
    }
  }

  // Get business settings
  let settings = await prisma.business.findUnique({
    where: { id: businessId }
  });

  if (!settings) {
    return res.status(404).json({ error: 'Business not found' });
  }

  // Parse JSON fields safely
  const parsedSettings = {
    ...settings,
    supportedLanguages: parseSupportedLanguages(settings.supportedLanguages)
  };

  res.json(parsedSettings);
}

// ============================================================================
// UPDATE SETTINGS - WITH TENANT SECURITY
// ============================================================================
async function updateSettings(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // ============================================================
    // RESOLVE targetBusinessId
    // Priority: 1) explicit body.businessId  2) subdomain middleware
    //           3) user's own businessId     4) first business in DB
    // ============================================================
    let targetBusinessId = null;

    if (req.body.businessId) {
      // Explicit businessId in body (super-admin selecting a business)
      targetBusinessId = Number(req.body.businessId);
    } else if (req.businessId) {
      // Subdomain middleware attached it
      targetBusinessId = req.businessId;
    } else if (req.user.businessId) {
      // Normal admin/staff — use their own business
      targetBusinessId = req.user.businessId;
    } else {
      // Super-admin with no explicit target — fall back to first business
      const firstBusiness = await prisma.business.findFirst();
      if (firstBusiness) {
        targetBusinessId = firstBusiness.id;
      }
    }

    if (!targetBusinessId) {
      return res.status(400).json({
        error: 'Could not determine which business to update. Please specify businessId.'
      });
    }

    // Only super-admin can update OTHER businesses
    if (req.user.role !== 'super-admin' && req.user.businessId !== targetBusinessId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = { ...req.body };
    delete updateData.businessId; // Never overwrite the businessId column itself
    delete updateData.slug;       // Never change slug via settings

    // Stringify JSON fields safely
    if (updateData.supportedLanguages) {
      updateData.supportedLanguages = stringifySupportedLanguages(updateData.supportedLanguages);
    }

    let settings = await prisma.business.findUnique({
      where: { id: targetBusinessId }
    });

    if (!settings) {
      return res.status(404).json({ error: 'Business not found' });
    }

    settings = await prisma.business.update({
      where: { id: targetBusinessId },
      data: updateData,
    });

    const parsedSettings = {
      ...settings,
      supportedLanguages: parseSupportedLanguages(settings.supportedLanguages)
    };

    console.log(`✅ Business settings updated: ${settings.businessName} (ID: ${settings.id})`);

    res.json({ ok: true, settings: parsedSettings });
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to update settings',
      details: error.message
    });
  }
}

// ============================================================================
// BACKWARD COMPATIBILITY: Update old BusinessSettings if needed
// ============================================================================
async function migrateOldSettings(req, res) {
  try {
    // Only super-admin can trigger migration
    if (req.user?.role !== 'super-admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const oldSettings = await prisma.businessSettings.findFirst();
    
    if (!oldSettings) {
      return res.json({ ok: false, message: 'No old settings to migrate' });
    }

    // Check if business already exists
    const existingBusiness = await prisma.business.findUnique({
      where: { slug: oldSettings.slug }
    });

    if (existingBusiness) {
      return res.json({ 
        ok: false, 
        message: 'Business already migrated',
        business: existingBusiness
      });
    }

    // Create business from old settings
    const business = await prisma.business.create({
      data: {
        slug: oldSettings.slug,
        businessName: oldSettings.businessName,
        businessType: oldSettings.businessType,
        businessMotto: oldSettings.businessMotto,
        phone: oldSettings.phone,
        email: oldSettings.email,
        address: oldSettings.address,
        description: oldSettings.description,
        logo: oldSettings.logo,
        primaryColor: oldSettings.primaryColor,
        secondaryColor: oldSettings.secondaryColor,
        currency: oldSettings.currency,
        language: oldSettings.language,
        supportedLanguages: oldSettings.supportedLanguages,
        autoDetectLanguage: oldSettings.autoDetectLanguage,
        defaultLanguage: oldSettings.defaultLanguage,
        whatsappNumber: oldSettings.whatsappNumber,
        facebookUrl: oldSettings.facebookUrl,
        twitterUrl: oldSettings.twitterUrl,
        instagramUrl: oldSettings.instagramUrl,
        youtubeUrl: oldSettings.youtubeUrl,
        linkedinUrl: oldSettings.linkedinUrl,
        tiktokUrl: oldSettings.tiktokUrl,
        footerText: oldSettings.footerText,
        footerCopyright: oldSettings.footerCopyright,
        footerAddress: oldSettings.footerAddress,
        footerEmail: oldSettings.footerEmail,
        footerPhone: oldSettings.footerPhone,
      }
    });

    res.json({ 
      ok: true, 
      message: 'Settings migrated successfully',
      business 
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Migration failed',
      details: error.message 
    });
  }
}

module.exports = {
  getSettings,
  updateSettings,
  migrateOldSettings
};