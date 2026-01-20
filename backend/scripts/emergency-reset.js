// backend/scripts/emergency-reset.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
  console.log('🚨 EMERGENCY ADMIN PASSWORD RESET');
  
  const adminEmail = 'SuperAdmin@mypadifood.com';
  const newPassword = process.env.EMERGENCY_PASSWORD || 'Emergency123';
  
  console.log(`Resetting password for: ${adminEmail}`);
  console.log(`New password will be: ${newPassword}`);
  
  if (newPassword.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  
  const hash = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hash,
      forcePasswordChange: true,
      active: true,
      accountLockedUntil: null,
      failedLoginAttempts: 0,
      hasSecurityQuestion: false,
      securityQuestion: null,
      securityAnswerHash: null,
    },
    create: {
      email: adminEmail,
      passwordHash: hash,
      role: 'super-admin',
      active: true,
      forcePasswordChange: true,
      hasSecurityQuestion: false,
      firstName: 'Super',
      lastName: 'Admin',
    },
  });
  
  console.log('✅ Password reset successful!');
  console.log(`📋 Login with:`);
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${newPassword}`);
  console.log('⚠️  Change password immediately after login!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());