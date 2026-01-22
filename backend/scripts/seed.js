// ============================================================================
// SIMPLIFIED SEED SCRIPT
// backend/scripts/seed.js
// ============================================================================

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@mypadifood.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123456';

  // Create super-admin
  let user = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!user) {
    const hash = await bcrypt.hash(adminPassword, 12);
    
    user = await prisma.user.create({
      data: {
        email: adminEmail.toLowerCase(),
        passwordHash: hash,
        role: 'super-admin',
        active: true,
        firstName: 'Business',
        lastName: 'Owner',
        phone: process.env.WHATSAPP_NUMBER || '+2348110252143',
      },
    });
    
    console.log('✅ Created super-admin:', adminEmail);
    console.log('📋 Password:', adminPassword);
  } else {
    console.log('ℹ️ Super-admin already exists');
  }

  // Create default business settings
  const settings = await prisma.businessSettings.findFirst();
  if (!settings) {
    await prisma.businessSettings.create({
      data: {
        businessName: process.env.BUSINESS_NAME || 'MyPadiFood',
        businessType: 'food',
        phone: process.env.WHATSAPP_NUMBER || '+2348110252143',
        email: adminEmail,
        description: 'Fresh, delicious meals delivered to your doorstep',
        whatsappNumber: process.env.WHATSAPP_NUMBER || '+2348110252143',
        currency: 'NGN',
        language: 'en',
        primaryColor: '#10B981',
        secondaryColor: '#F59E0B',
      },
    });
    console.log('✅ Created default business settings');
  }

  // Create sample products
  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: 'Jollof Rice Special',
          price: 2500,
          stock: 50,
          description: 'Our signature jollof rice with chicken, plantain, and coleslaw',
        },
        {
          name: 'Fried Rice Combo',
          price: 2800,
          stock: 30,
          description: 'Delicious fried rice with mixed vegetables and choice of protein',
        },
        {
          name: 'Pounded Yam & Egusi',
          price: 3500,
          stock: 25,
          description: 'Traditional pounded yam served with rich egusi soup',
        },
      ],
    });
    console.log('✅ Created sample products');
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
