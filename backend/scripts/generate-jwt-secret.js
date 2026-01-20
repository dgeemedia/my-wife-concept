// backend/scripts/generate-jwt-secret.js
const crypto = require('crypto');

// Generate a 64-byte random string
const secret = crypto.randomBytes(64).toString('base64');

console.log('\n=================================');
console.log('🔐 JWT SECRET GENERATED');
console.log('=================================\n');
console.log('Copy this to your .env file:\n');
console.log(`JWT_SECRET="${secret}"`);
console.log('\n=================================\n');
console.log('⚠️  IMPORTANT:');
console.log('1. Keep this secret SAFE');
console.log('2. Never commit to Git');
console.log('3. Use different secrets for dev/prod');
console.log('4. Store in environment variables');
console.log('=================================\n');