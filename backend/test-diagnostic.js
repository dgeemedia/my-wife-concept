// backend/test-diagnostic.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function diagnose() {
  console.log('=== DIAGNOSTIC CHECK ===\n');
  
  // 1. Check database connection
  console.log('1. Database Connection Test:');
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('   ✅ Database connected\n');
  } catch (err) {
    console.log('   ❌ Database connection failed:', err.message, '\n');
    return;
  }
  
  // 2. Check user exists
  console.log('2. Check SuperAdmin User:');
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'SuperAdmin@mypadifood.com' }
    });
    
    if (user) {
      console.log('   ✅ User found:', user.email);
      console.log('      ID:', user.id);
      console.log('      Role:', user.role);
      console.log('      Active:', user.active);
      console.log('      Force Password Change:', user.forcePasswordChange);
      console.log('      Has Security Question:', user.hasSecurityQuestion, '\n');
      
      // 3. Test password
      console.log('3. Test Password:');
      const testPassword = 'Emergency123';
      const isValid = await bcrypt.compare(testPassword, user.passwordHash);
      
      if (isValid) {
        console.log('   ✅ Password "Emergency123" is VALID\n');
      } else {
        console.log('   ❌ Password "Emergency123" is INVALID\n');
        
        // Show what the hash looks like
        console.log('   Hash in DB (first 50 chars):', user.passwordHash.substring(0, 50) + '...');
        
        // Create a new hash for comparison
        const newHash = await bcrypt.hash('Emergency123', 10);
        console.log('   New hash of "Emergency123":', newHash.substring(0, 50) + '...');
      }
    } else {
      console.log('   ❌ User not found!\n');
    }
  } catch (err) {
    console.log('   ❌ Error checking user:', err.message, '\n');
  }
  
  // 4. Count total users
  console.log('4. User Count:');
  try {
    const count = await prisma.user.count();
    console.log(`   Total users in database: ${count}\n`);
  } catch (err) {
    console.log('   ❌ Error counting users:', err.message, '\n');
  }
  
  await prisma.$disconnect();
  console.log('=== DIAGNOSTIC COMPLETE ===');
}

diagnose().catch(console.error);