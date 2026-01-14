// backend/src/routes/tenant.js

router.post('/register', asyncHandler(async (req, res) => {
  const {
    subdomain,
    businessName,
    businessType,
    ownerEmail,
    ownerPhone,
    whatsappNumber,
    password,
  } = req.body;

  // Validate subdomain
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    throw new AppError('Invalid subdomain format', 400);
  }

  // Check if subdomain exists
  const existing = await prisma.tenant.findUnique({
    where: { subdomain },
  });

  if (existing) {
    throw new AppError('Subdomain already taken', 400);
  }

  // Create tenant and admin user in transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create tenant
    const tenant = await tx.tenant.create({
      data: {
        subdomain,
        businessName,
        businessType,
        ownerEmail,
        ownerPhone,
        whatsappNumber,
        plan: 'free', // Start with free plan
        status: 'active',
      },
    });

    // Create admin user for this tenant
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await tx.user.create({
      data: {
        email: ownerEmail,
        passwordHash,
        role: 'super-admin',
        tenantId: tenant.id,
        active: true,
      },
    });

    // Seed with sample products
    await tx.product.createMany({
      data: [
        {
          name: 'Sample Product 1',
          price: 100,
          stock: 10,
          description: 'Edit or delete this sample product',
          tenantId: tenant.id,
        },
        {
          name: 'Sample Product 2',
          price: 200,
          stock: 5,
          tenantId: tenant.id,
        },
      ],
    });

    return { tenant, user };
  });

  // Send welcome email (optional)
  // await sendWelcomeEmail(ownerEmail, subdomain);

  res.status(201).json({
    ok: true,
    message: 'Business created successfully',
    subdomain,
    url: `https://${subdomain}.mypadifood.com`,
  });
}));