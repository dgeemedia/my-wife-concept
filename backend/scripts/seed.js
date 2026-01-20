// backend/scripts/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin user with your specified email
  const adminEmail = 'SuperAdmin@mypadifood.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123';

  // Validate password meets your 8-character requirement
  if (adminPassword.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    process.exit(1);
  }

  let user = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!user) {
    const hash = await bcrypt.hash(adminPassword, 10);
    user = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        role: 'super-admin',
        active: true,
        forcePasswordChange: true,
        hasSecurityQuestion: false,
        firstName: 'Super',
        lastName: 'Admin',
        phone: '+2348110252143',
      },
    });
    console.log('✅ Created SUPER ADMIN user:', adminEmail);
    console.log('📋 Login details:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword} (${adminPassword.length} characters)`);
    console.log('⚠️  IMPORTANT: You MUST change this password on first login!');
  } else {
    console.log('ℹ️  Super admin user already exists:', adminEmail);
  }

  console.log('ℹ️  Skipping product creation as requested');
  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });