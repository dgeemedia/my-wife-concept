// backend/src/controllers/settingsController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Safely parse supportedLanguages field
 * Handles both JSON strings and comma-separated strings
 */
function parseSupportedLanguages(value) {
  if (!value) {
    return ['en', 'fr', 'yo', 'ig', 'ha'];
  }

  // If it's already an array, return it
  if (Array.isArray(value)) {
    return value;
  }

  // If it's a string, try to parse it
  if (typeof value === 'string') {
    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      // Not valid JSON, treat as comma-separated string
      return value.split(',').map(lang => lang.trim()).filter(Boolean);
    }
  }

  // Fallback to default
  return ['en', 'fr', 'yo', 'ig', 'ha'];
}

/**
 * Safely stringify supportedLanguages for database storage
 */
function stringifySupportedLanguages(value) {
  if (!value) {
    return JSON.stringify(['en', 'fr', 'yo', 'ig', 'ha']);
  }

  // If it's already a string that looks like JSON, return it
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return value; // Already valid JSON
      }
    } catch (e) {
      // Not valid JSON, treat as comma-separated and convert
      const langs = value.split(',').map(lang => lang.trim()).filter(Boolean);
      return JSON.stringify(langs);
    }
  }

  // If it's an array, stringify it
  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  // Fallback
  return JSON.stringify(['en', 'fr', 'yo', 'ig', 'ha']);
}

async function getSettings(req, res) {
  let settings = await prisma.businessSettings.findFirst();

  if (!settings) {
    settings = await prisma.businessSettings.create({
      data: {
        businessName: process.env.BUSINESS_NAME || 'My Business',
        phone: process.env.WHATSAPP_NUMBER || '',
        whatsappNumber: process.env.WHATSAPP_NUMBER || '',
        currency: 'NGN',
        language: 'en',
        primaryColor: '#10B981',
        secondaryColor: '#F59E0B',
        autoDetectLanguage: true,
        defaultLanguage: 'en',
        supportedLanguages: JSON.stringify(['en', 'fr', 'yo', 'ig', 'ha'])
      },
    });
  }

  // Parse JSON fields safely
  const parsedSettings = {
    ...settings,
    supportedLanguages: parseSupportedLanguages(settings.supportedLanguages)
  };

  res.json(parsedSettings);
}

async function updateSettings(req, res) {
  try {
    let settings = await prisma.businessSettings.findFirst();

    const updateData = { ...req.body };
    
    // Stringify JSON fields safely
    if (updateData.supportedLanguages) {
      updateData.supportedLanguages = stringifySupportedLanguages(updateData.supportedLanguages);
    }

    if (!settings) {
      settings = await prisma.businessSettings.create({
        data: updateData,
      });
    } else {
      settings = await prisma.businessSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    // Parse JSON fields for response
    const parsedSettings = {
      ...settings,
      supportedLanguages: parseSupportedLanguages(settings.supportedLanguages)
    };

    res.json({ ok: true, settings: parsedSettings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ 
      ok: false, 
      error: 'Failed to update settings',
      details: error.message 
    });
  }
}

module.exports = {
  getSettings,
  updateSettings
};