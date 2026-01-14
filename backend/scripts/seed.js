// backend/scripts/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'password123';

  let user = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!user) {
    const hash = await bcrypt.hash(adminPassword, 10);
    user = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: hash,
        role: 'super-admin',
        active: true,
        forcePasswordChange: false,
      },
    });
    console.log('✅ Created admin user:', adminEmail);
  } else {
    console.log('ℹ️  Admin user already exists:', adminEmail);
  }

  // Create sample products
  const products = [
    {
      name: 'Meat Pie',
      price: 200.0,
      stock: 20,
      description: 'Hot Nigerian meat pie with savory filling',
      imageUrl: 'https://example.com/meat-pie.jpg',
    },
    {
      name: 'Jollof Rice (Small)',
      price: 800.0,
      stock: 15,
      description: 'Spicy Nigerian jollof rice',
      imageUrl: 'https://example.com/jollof.jpg',
    },
    {
      name: 'Chicken Suya',
      price: 500.0,
      stock: 25,
      description: 'Grilled spiced chicken skewers',
      imageUrl: 'https://example.com/suya.jpg',
    },
    {
      name: 'Puff Puff',
      price: 100.0,
      stock: 30,
      description: 'Sweet fried dough balls',
      imageUrl: 'https://example.com/puff-puff.jpg',
    },
    {
      name: 'Moi Moi',
      price: 300.0,
      stock: 18,
      description: 'Steamed bean pudding',
      imageUrl: 'https://example.com/moi-moi.jpg',
    },
  ];

  for (const product of products) {
    const exists = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!exists) {
      await prisma.product.create({ data: product });
      console.log('✅ Created product:', product.name);
    } else {
      console.log('ℹ️  Product already exists:', product.name);
    }
  }

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