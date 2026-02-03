// backend/src/lib/prisma.js - CORRECTED
const { PrismaClient } = require('@prisma/client');

// Create a single instance of PrismaClient
const prisma = new PrismaClient({
  log: ['error', 'warn'],
  // Prisma will automatically use DATABASE_URL from .env
  // No need to manually specify datasources here
});

// Test connection on startup
prisma.$connect()
  .then(() => {
    console.log('🗄️  Prisma Client connected successfully');
  })
  .catch((error) => {
    console.error('❌ Prisma Client connection failed:', error.message);
  });

module.exports = prisma;