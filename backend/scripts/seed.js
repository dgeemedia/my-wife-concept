const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  try {
    // Create admin user
    const passwordHash = await bcrypt.hash('Admin123456', 12);
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@mypadifood.com' },
      update: {},
      create: {
        email: 'admin@mypadifood.com',
        passwordHash,
        role: 'super-admin',
        firstName: 'Admin',
        lastName: 'User',
        active: true,
      },
    });

    console.log('✅ Admin user created:', admin.email);

    // Create initial business settings
    const settings = await prisma.businessSettings.upsert({
      where: { id: 1 },
      update: {},
      create: {
        businessName: 'MyPadiFood',
        businessType: 'food',
        phone: '+234 811 025 2143',
        whatsappNumber: '2348110252143',
        currency: 'NGN',
        language: 'en',
        primaryColor: '#10B981',
        secondaryColor: '#F59E0B',
        footerCopyright: `© ${new Date().getFullYear()} All rights reserved.`
      },
    });

    console.log('✅ Business settings created');

    // Create sample products
    const products = await prisma.product.createMany({
      data: [
        {
          name: 'Jollof Rice',
          price: 2500,
          stock: 50,
          description: 'Delicious Nigerian Jollof Rice with chicken',
          imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500'
        },
        {
          name: 'Fried Rice',
          price: 2000,
          stock: 30,
          description: 'Tasty fried rice with vegetables',
          imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500'
        },
        {
          name: 'Chicken & Chips',
          price: 3000,
          stock: 25,
          description: 'Crispy fried chicken with chips',
          imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500'
        }
      ],
      skipDuplicates: true,
    });

    console.log('✅ Sample products created');

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });