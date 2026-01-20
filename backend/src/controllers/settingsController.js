// backend/src/controllers/settingsController.js
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');
const cloudinary = require('cloudinary').v2;

const prisma = new PrismaClient();

/**
 * Get business settings
 */
async function getSettings() {
  let settings = await prisma.businessSettings.findFirst();

  if (!settings) {
    // Create default settings
    settings = await prisma.businessSettings.create({
      data: {
        businessName: process.env.BUSINESS_NAME || 'My Business',
        businessType: process.env.BUSINESS_TYPE || 'food',
        phone: process.env.WHATSAPP_NUMBER || '',
        whatsappNumber: process.env.WHATSAPP_NUMBER || '',
        currency: process.env.DEFAULT_CURRENCY || 'NGN',
        language: 'en',
      },
    });
  }

  return settings;
}

/**
 * Update business settings
 */
async function updateSettings(data, userId) {
  const settings = await prisma.businessSettings.findFirst();

  if (!settings) {
    throw new AppError('Settings not found', 404);
  }

  const updateData = {};

  // Allow updating these fields
  const allowedFields = [
    'businessName',
    'businessType',
    'phone',
    'email',
    'address',
    'description',
    'whatsappNumber',
    'primaryColor',
    'secondaryColor',
    'currency',
    'language',
    'logo'
  ];

  // 🔥 ADD NEW FOOTER FIELDS
  const footerFields = [
    'facebookUrl', 'twitterUrl', 'instagramUrl', 'youtubeUrl',
    'linkedinUrl', 'tiktokUrl', 'whatsappUrl', 'footerText',
    'footerCopyright', 'footerAddress', 'footerEmail', 'footerPhone',
    'termsUrl', 'privacyUrl', 'refundPolicyUrl', 'contactEmail',
    'contactPhone', 'contactAddress'
  ];
  
  allowedFields.push(...footerFields);

  allowedFields.forEach(field => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const updated = await prisma.businessSettings.update({
    where: { id: settings.id },
    data: updateData,
  });

  return {
    ok: true,
    settings: updated,
    message: 'Settings updated successfully',
  };
}

/**
 * Upload business logo
 */
async function uploadLogo(file, userId) {
  if (!file) {
    throw new AppError('No file provided', 400);
  }

  try {
    // Upload to Cloudinary with optimization
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'business-logos',
      transformation: [
        { width: 400, height: 400, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    });

    // Update settings with new logo URL
    const settings = await prisma.businessSettings.findFirst();
    
    const updated = await prisma.businessSettings.update({
      where: { id: settings.id },
      data: { logo: result.secure_url },
    });

    return {
      ok: true,
      logoUrl: result.secure_url,
      settings: updated,
      message: 'Logo uploaded successfully',
    };
  } catch (error) {
    throw new AppError('Logo upload failed: ' + error.message, 500);
  }
}

/**
 * Delete business logo
 */
async function deleteLogo(userId) {
  const settings = await prisma.businessSettings.findFirst();

  if (!settings || !settings.logo) {
    throw new AppError('No logo to delete', 404);
  }

  // Extract public_id from Cloudinary URL
  const publicId = settings.logo.split('/').slice(-2).join('/').split('.')[0];

  try {
    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId);

    // Update settings
    const updated = await prisma.businessSettings.update({
      where: { id: settings.id },
      data: { logo: null },
    });

    return {
      ok: true,
      settings: updated,
      message: 'Logo deleted successfully',
    };
  } catch (error) {
    throw new AppError('Logo deletion failed: ' + error.message, 500);
  }
}

/**
 * Update WhatsApp number
 */
async function updateWhatsAppNumber(whatsappNumber, userId) {
  if (!whatsappNumber) {
    throw new AppError('WhatsApp number is required', 400);
  }

  // Validate phone number format (basic validation)
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  
  if (cleanNumber.length < 10 || cleanNumber.length > 15) {
    throw new AppError('Invalid phone number format', 400);
  }

  const settings = await prisma.businessSettings.findFirst();

  const updated = await prisma.businessSettings.update({
    where: { id: settings.id },
    data: { whatsappNumber: cleanNumber },
  });

  return {
    ok: true,
    whatsappNumber: cleanNumber,
    message: 'WhatsApp number updated successfully',
  };
}

module.exports = {
  getSettings,
  updateSettings,
  uploadLogo,
  deleteLogo,
  updateWhatsAppNumber,
};