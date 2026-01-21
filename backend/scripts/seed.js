// backend/scripts/seed.js - UPDATED
// Add this to your .env file:
// SEED_ADMIN_PASSWORD=Admin123456
// SEED_ADMIN_EMAIL=SuperAdmin@mypadifood.com

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'SuperAdmin@mypadifood.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123456';
  
  // Validate password
  if (adminPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  // Check if user exists
  let user = await prisma.user.findUnique({ where: { email: adminEmail } });
  
  if (!user) {
    const hash = await bcrypt.hash(adminPassword, 10);
    
    user = await prisma.user.create({
      data: {
        email: adminEmail.toLowerCase(), // Ensure lowercase
        passwordHash: hash,
        role: 'super-admin',
        active: true,
        forcePasswordChange: false,  // ✅ SET TO FALSE
        hasSecurityQuestion: true,   // ✅ SET TO TRUE
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+2348110252143',
        // Add security question/answer for testing
        securityQuestion: 'What is your favorite color?',
        securityAnswerHash: await bcrypt.hash('blue', 10),
        lastPasswordChange: new Date(),
      },
    });
    
    console.log('✅ Created SUPER ADMIN user:', adminEmail);
    console.log('📋 Login details:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('✅ User is fully set up (no forced password change)');
  } else {
    console.log('ℹ️ User already exists, updating...');
    
    // Update existing user to have proper setup
    const hash = await bcrypt.hash(adminPassword, 10);
    
    user = await prisma.user.update({
      where: { email: adminEmail },
      data: {
        passwordHash: hash,
        forcePasswordChange: false,
        hasSecurityQuestion: true,
        securityQuestion: 'What is your favorite color?',
        securityAnswerHash: await bcrypt.hash('blue', 10),
        lastPasswordChange: new Date(),
      },
    });
    
    console.log('✅ Updated user to be fully set up');
  }

  // Create default business settings if they don't exist
  const settings = await prisma.businessSettings.findFirst();
  if (!settings) {
    await prisma.businessSettings.create({
      data: {
        businessName: 'MyPadiFood',
        businessType: 'food',
        phone: '+2348110252143',
        whatsappNumber: '+2348110252143',
        currency: 'NGN',
        language: 'en',
      },
    });
    console.log('✅ Created default business settings');
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