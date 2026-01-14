# 🍲 MyPadiFood Business Suite

**A plug-and-play retail business template for 1-1,000 daily users**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Setup Guide](#setup-guide)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Customization](#customization)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

MyPadiFood is a complete e-commerce solution designed specifically for small local businesses in food, fashion, electronics, pharmacy, and retail sectors. It eliminates the traditional barriers of online commerce while maintaining professional standards.

### Why MyPadiFood?

**The Problem:** Traditional e-commerce platforms force customers to create accounts, remember passwords, and navigate complex checkout processes. This creates friction that kills conversion rates for local businesses.

**Our Solution:** Orders-first architecture that captures sales through familiar channels (WhatsApp) while maintaining structured digital records for business owners.

### Key Differentiators

✅ **No mandatory customer registration**  
✅ **WhatsApp-first sales closure**  
✅ **Atomic inventory management**  
✅ **Multi-business type support**  
✅ **1-click deployment**

---

## ✨ Features

### Customer Experience
- 🛒 **Frictionless Shopping** - Browse and add to cart without account creation
- 📱 **WhatsApp Integration** - Complete orders through familiar messaging
- 💳 **Quick Checkout** - Minimal information required
- 🔍 **Product Search** - Fast product discovery
- 📦 **Order Tracking** - Real-time status updates (optional)

### Business Owner Dashboard
- 📊 **Analytics Dashboard** - Sales metrics, top products, revenue tracking
- 🏪 **Product Management** - CRUD operations with image uploads
- 📝 **Order Management** - View, export, and manage all orders
- 👥 **User Management** - Role-based access control (super-admin/admin)
- 📈 **Inventory Tracking** - Stock alerts and management
- 📤 **CSV Export** - Export orders and products

### Technical Features
- 🔐 **Security First** - JWT authentication, bcrypt hashing, rate limiting
- 🎨 **Theme System** - Pre-configured themes for 5 business types
- 💱 **Multi-Currency** - Support for 7 currencies (NGN, USD, GBP, EUR, GHS, KES, ZAR)
- 🌍 **Multi-Environment** - Development, staging, production configs
- 🐳 **Docker Ready** - Containerized deployment
- 🔄 **Automated Backups** - Scheduled database backups
- 📱 **Responsive Design** - Mobile-first UI

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 15+ or [Supabase](https://supabase.com) account
- pnpm (auto-installed by setup wizard)

### One-Click Setup

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/mypadifood.git
cd mypadifood

# 2. Make setup wizard executable
chmod +x setup-wizard.sh

# 3. Run the wizard
./setup-wizard.sh

# 4. Follow the prompts and you're done!
```

The wizard will:
- ✅ Check prerequisites
- ✅ Configure your business details
- ✅ Set up database connections
- ✅ Create admin account
- ✅ Install dependencies
- ✅ Initialize database with seed data
- ✅ Generate startup scripts

### Manual Setup

<details>
<summary>Click to expand manual setup instructions</summary>

#### 1. Install Dependencies

```bash
# Backend
cd backend
pnpm install

# Frontend
cd ../frontend
pnpm install
```

#### 2. Configure Environment

```bash
# Backend
cp backend/.env.development.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.local.development frontend/.env.local
# Edit frontend/.env.local with your configuration
```

#### 3. Database Setup

```bash
cd backend

# Push schema to database
pnpm run prisma:push

# Generate Prisma client
pnpm run prisma:generate

# Seed initial data
pnpm run seed
```

#### 4. Start Development Servers

```bash
# Backend (Terminal 1)
cd backend
pnpm run dev

# Frontend (Terminal 2)
cd frontend
pnpm run dev
```

</details>

---

## 🏗️ Architecture

### System Overview

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Customer  │────────▶│   Next.js   │────────▶│   Express   │
│   Browser   │         │   Frontend  │         │   Backend   │
└─────────────┘         └─────────────┘         └──────┬──────┘
                                                        │
                        ┌───────────────────────────────┤
                        │                               │
                  ┌─────▼──────┐              ┌────────▼────────┐
                  │ PostgreSQL │              │   Cloudinary    │
                  │  Database  │              │ (Image Storage) │
                  └────────────┘              └─────────────────┘
                        │
                        │
                  ┌─────▼──────┐
                  │  WhatsApp  │
                  │  Business  │
                  └────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 - React framework
- Custom CSS - Lightweight styling
- localStorage - Client-side cart management

**Backend:**
- Express.js 5 - Web framework
- Prisma ORM - Database toolkit
- JWT - Authentication
- bcrypt - Password hashing

**Database:**
- PostgreSQL 15 - Primary database
- Supabase - Managed PostgreSQL (recommended)

**Infrastructure:**
- Docker - Containerization
- Docker Compose - Multi-container orchestration

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | ✅ |
| `DIRECT_URL` | Direct database URL (for migrations) | - | ✅ |
| `JWT_SECRET` | Secret key for JWT signing | - | ✅ |
| `PORT` | Server port | 5000 | ❌ |
| `NODE_ENV` | Environment (development/staging/production) | development | ❌ |
| `CORS_ORIGIN` | Allowed CORS origins | * | ❌ |
| `BUSINESS_NAME` | Your business name | - | ✅ |
| `BUSINESS_TYPE` | Business type (food/fashion/electronics/pharmacy/general) | general | ❌ |
| `WHATSAPP_NUMBER` | WhatsApp business number | - | ✅ |
| `DEFAULT_CURRENCY` | Default currency code | NGN | ❌ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - | ❌ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - | ❌ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - | ❌ |

#### Frontend (.env.local)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL | ✅ |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp business number | ✅ |
| `NEXT_PUBLIC_BUSINESS_NAME` | Business name | ✅ |
| `NEXT_PUBLIC_BUSINESS_TYPE` | Business type | ✅ |
| `NEXT_PUBLIC_CURRENCY` | Currency code | ✅ |

---

## 🌐 Deployment

### Option 1: Traditional VPS (Ubuntu/Debian)

```bash
# 1. Install Node.js and pnpm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm

# 2. Clone and setup
git clone https://github.com/yourusername/mypadifood.git
cd mypadifood
./setup-wizard.sh

# 3. Use PM2 for process management
sudo npm install -g pm2

# Start backend
cd backend
pm2 start "pnpm start" --name mypadifood-backend

# Start frontend
cd ../frontend
pm2 start "pnpm start" --name mypadifood-frontend

# Save PM2 configuration
pm2 save
pm2 startup
```

### Option 2: Docker Deployment

```bash
# 1. Build and start containers
docker-compose up -d

# 2. Check status
docker-compose ps

# 3. View logs
docker-compose logs -f

# 4. Stop containers
docker-compose down
```

### Option 3: Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

**Backend on Railway:**
1. Connect your GitHub repository to [Railway](https://railway.app)
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Option 4: Heroku

```bash
# Backend
cd backend
heroku create mypadifood-api
heroku addons:create heroku-postgresql:mini
git push heroku main

# Frontend
cd frontend
heroku create mypadifood-web
git push heroku main
```

---

## 🎨 Customization

### Theme Customization

The system includes 5 pre-configured themes:

1. **Food & Restaurant** - Warm colors, food emojis
2. **Fashion & Boutique** - Elegant, purple/pink palette
3. **Electronics & Tech** - Modern, blue tones
4. **Pharmacy & Healthcare** - Clean, green accents
5. **General Store** - Versatile, neutral colors

**Change theme:**

```javascript
// frontend/lib/themes.js

// Edit existing theme
businessThemes.food.primaryColor = '#YOUR_COLOR';

// Or add custom theme
businessThemes.custom = {
  name: 'Custom Business',
  primaryColor: '#FF0000',
  // ... more properties
};
```

### Adding Custom Currency

```javascript
// lib/currency.js

currencies.XYZ = {
  code: 'XYZ',
  name: 'Your Currency',
  symbol: 'Ƶ',
  locale: 'en-XX',
  decimals: 2,
  position: 'before',
  countries: ['Your Country'],
};
```

### Custom Product Fields

```prisma
// backend/prisma/schema.prisma

model Product {
  // ... existing fields
  
  // Add custom fields
  weight      Float?
  dimensions  String?
  brand       String?
  sku         String?  @unique
}
```

After schema changes:
```bash
cd backend
pnpm run prisma:push
pnpm run prisma:generate
```

---

## 📚 API Documentation

### Public Endpoints

#### Get All Products
```http
GET /api/products?search=&inStock=true
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Meat Pie",
    "price": 200,
    "stock": 20,
    "description": "Hot Nigerian meat pie",
    "imageUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Create Quick Order
```http
POST /api/orders
Content-Type: application/json

{
  "customerName": "John Doe",
  "phone": "2348012345678",
  "email": "john@example.com",
  "address": "123 Main St",
  "productId": 1,
  "quantity": 2
}
```

#### Checkout Cart
```http
POST /api/orders/checkout
Content-Type: application/json

{
  "customerName": "John Doe",
  "phone": "2348012345678",
  "email": "john@example.com",
  "address": "123 Main St",
  "message": "Extra spicy",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

### Admin Endpoints (Require Authentication)

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "ok": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@example.com",
    "role": "super-admin"
  }
}
```

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "New Product",
  "price": 500,
  "stock": 10,
  "description": "Product description",
  "imageUrl": "https://..."
}
```

#### Get Orders (Admin)
```http
GET /api/orders?limit=50&offset=0
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Export Orders CSV (Admin)
```http
GET /api/orders/export/csv
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Errors

**Error:** `Error: P1001: Can't reach database server`

**Solution:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Or verify Supabase connection
psql "postgresql://postgres:PASSWORD@your-project.supabase.co:5432/postgres"

# Update DATABASE_URL in backend/.env
```

#### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 PID

# Or change port in backend/.env
PORT=5001
```

#### JWT Token Expired

**Error:** `403: Invalid or expired token`

**Solution:**
- Re-login to get new token
- Check `JWT_EXPIRES_IN` in constants.js
- Clear localStorage and login again

#### Prisma Migration Errors

**Error:** `Migration failed`

**Solution:**
```bash
cd backend

# Reset database (WARNING: Deletes all data)
pnpm run prisma:reset

# Or push schema without migration
pnpm run prisma:push --skip-generate
pnpm run prisma:generate
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

---

## 🙏 Acknowledgments

- Built with ❤️ for small business owners
- Inspired by real-world commerce challenges
- Designed for African markets, scalable globally

---

## 📞 Support

- 📧 Email: support@mypadifood.com
- 💬 Discord: [Join Community](https://discord.gg/mypadifood)
- 📖 Documentation: [docs.mypadifood.com](https://docs.mypadifood.com)
- 🐦 Twitter: [@mypadifood](https://twitter.com/mypadifood)

---

**Made with 🍲 for local businesses worldwide**