// backend/src/controllers/settingsController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
      },
    });
  }

  res.json(settings);
}

async function updateSettings(req, res) {
  let settings = await prisma.businessSettings.findFirst();

  if (!settings) {
    settings = await prisma.businessSettings.create({
      data: req.body,
    });
  } else {
    settings = await prisma.businessSettings.update({
      where: { id: settings.id },
      data: req.body,
    });
  }

  res.json({ ok: true, settings });
}

module.exports = {
  getSettings,
  updateSettings,
};