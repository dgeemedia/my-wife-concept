// backend/scripts/reset-admin.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');
require('dotenv').config();

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask question with promise
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function resetPassword() {
  try {
    console.log('🔄 EMERGENCY ADMIN PASSWORD RESET 🚨');
    console.log('=' .repeat(50));

    // Get target email
    const targetEmail = await question('Enter admin email to reset [SuperAdmin@mypadifood.com]: ') || 'SuperAdmin@mypadifood.com';

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      select: { id: true, email: true, role: true, active: true }
    });

    if (!user) {
      console.error(`❌ User with email "${targetEmail}" not found!`);
      console.log('Available users:');
      const allUsers = await prisma.user.findMany({
        select: { email: true, role: true, active: true },
        orderBy: { createdAt: 'desc' }
      });
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.role}) ${u.active ? '✅' : '❌'}`));
      rl.close();
      return;
    }

    console.log(`\n🔍 Found user: ${user.email} (${user.role})`);
    
    // Ask for confirmation
    const confirm = await question(`Are you sure you want to reset password for ${user.email}? (yes/no): `);
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Reset cancelled.');
      rl.close();
      return;
    }

    // Password options
    console.log('\n🔐 Password options:');
    console.log('1. Use environment variable (SEED_ADMIN_PASSWORD)');
    console.log('2. Generate random password');
    console.log('3. Enter custom password');
    
    const option = await question('Choose option [1-3]: ');
    
    let newPassword;
    
    switch(option) {
      case '1':
        newPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123';
        console.log(`Using password from .env: ${newPassword}`);
        break;
      case '2':
        newPassword = generateRandomPassword(10);
        console.log(`Generated password: ${newPassword}`);
        break;
      case '3':
        newPassword = await question('Enter new password (min 8 chars): ');
        if (newPassword.length < 8) {
          console.error('❌ Password must be at least 8 characters!');
          rl.close();
          return;
        }
        break;
      default:
        console.error('❌ Invalid option!');
        rl.close();
        return;
    }

    // Confirm again with password
    console.log(`\n⚠️  You are about to reset password for: ${user.email}`);
    console.log(`   New password: ${newPassword}`);
    const finalConfirm = await question('Type "CONFIRM" to proceed: ');
    
    if (finalConfirm !== 'CONFIRM') {
      console.log('❌ Reset cancelled.');
      rl.close();
      return;
    }

    // Hash and update password
    const hash = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { email: targetEmail },
      data: {
        passwordHash: hash,
        forcePasswordChange: true,
        active: true,
        accountLockedUntil: null,
        failedLoginAttempts: 0,
        hasSecurityQuestion: false, // Reset security question too
        securityQuestion: null,
        securityAnswerHash: null,
      },
    });

    // Log the action
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_PASSWORD_RESET',
          entity: 'user',
          entityId: user.id,
          details: JSON.stringify({ 
            resetBy: 'Emergency Script',
            resetAt: new Date().toISOString()
          }),
          ipAddress: '127.0.0.1',
          userAgent: 'Emergency Reset Script',
        },
      });
    } catch (error) {
      // ActivityLog might not exist yet, that's okay
      console.log('⚠️  Note: Could not log activity (ActivityLog table might not exist)');
    }

    console.log(`\n✅ Password reset successful!`);
    console.log('=' .repeat(50));
    console.log('📋 Login details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${newPassword}`);
    console.log('=' .repeat(50));
    console.log('⚠️  IMPORTANT:');
    console.log('   - User MUST change password on next login');
    console.log('   - Security question has been cleared');
    console.log('   - Account is now active and unlocked');
    console.log('=' .repeat(50));
    
    // Show quick instructions
    console.log('\n🚀 Quick next steps:');
    console.log('1. User should login and change password immediately');
    console.log('2. User should set a new security question');
    console.log('3. Consider updating .env file if needed');

  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    if (error.code === 'P1001') {
      console.error('   Database connection failed. Is your database running?');
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

function generateRandomPassword(length = 10) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  for (let i = 4; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  // Shuffle
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Run if called directly
if (require.main === module) {
  resetPassword().catch(console.error);
} else {
  module.exports = { resetPassword, generateRandomPassword };
}