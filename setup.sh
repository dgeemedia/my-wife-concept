#!/bin/bash
# setup.sh - Quick setup script for MyPadiFood

set -e

echo "🍲 MyPadiFood Single-Tenant Setup"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed${NC}"
    echo "Install it with: npm install -g pnpm"
    exit 1
fi

echo -e "${GREEN}✓ pnpm found${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker not found. Proceeding with local setup...${NC}"
    USE_DOCKER=false
else
    echo -e "${GREEN}✓ Docker found${NC}"
    USE_DOCKER=true
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Backend setup
echo "Setting up backend..."
cd backend
pnpm install

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cat > .env << 'EOF'
# Database (Use local PostgreSQL or Supabase free tier)
DATABASE_URL="postgresql://postgres:password@localhost:5432/mypadifood_dev"
DIRECT_URL="postgresql://postgres:password@localhost:5432/mypadifood_dev"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-jwt-secret-here-change-this-min-32-chars"

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Business
BUSINESS_NAME="My Food Business"
BUSINESS_TYPE=food
WHATSAPP_NUMBER=2348110252143
DEFAULT_CURRENCY=NGN

# Cloudinary (Optional - leave empty for development)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=dev-images

# Seed Admin
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=password123

# Features
FEATURE_ORDER_TRACKING=true
FEATURE_ANALYTICS=true
FEATURE_SMS=false
FEATURE_EMAIL=false

# Payment
ENABLE_PAYMENT_CONFIRMATION=true

# Tracking
FRONTEND_URL=http://localhost:3000
TRACKING_ENABLED=true
EOF
    echo -e "${GREEN}✓ Backend .env created${NC}"
    echo -e "${YELLOW}⚠️  Please update backend/.env with your database credentials${NC}"
else
    echo -e "${GREEN}✓ Backend .env exists${NC}"
fi

cd ..

# Frontend setup
echo ""
echo "Setting up frontend..."
cd frontend
pnpm install

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "Creating frontend .env.local file..."
    cat > .env.local << 'EOF'
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_WHATSAPP_NUMBER=2348110252143
NEXT_PUBLIC_BUSINESS_NAME="My Food Business"
NEXT_PUBLIC_BUSINESS_TYPE=food
NEXT_PUBLIC_CURRENCY=NGN
NEXT_PUBLIC_APP_ENV=development
EOF
    echo -e "${GREEN}✓ Frontend .env.local created${NC}"
else
    echo -e "${GREEN}✓ Frontend .env.local exists${NC}"
fi

cd ..

echo ""
echo "🗄️  Database setup..."
echo ""

if [ "$USE_DOCKER" = true ]; then
    read -p "Use Docker for database? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting PostgreSQL with Docker..."
        docker run -d \
            --name mypadifood_postgres \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=password \
            -e POSTGRES_DB=mypadifood_dev \
            -p 5432:5432 \
            postgres:15-alpine
        
        echo "Waiting for PostgreSQL to be ready..."
        sleep 5
        
        echo -e "${GREEN}✓ PostgreSQL started on port 5432${NC}"
    fi
fi

echo ""
echo "Running Prisma migrations..."
cd backend
pnpm run prisma:push
echo -e "${GREEN}✓ Database schema created${NC}"

echo ""
echo "Seeding database..."
pnpm run seed
echo -e "${GREEN}✓ Database seeded with sample data${NC}"

cd ..

echo ""
echo "=================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=================================="
echo ""
echo "📝 Next steps:"
echo ""
echo "1. Start the backend:"
echo "   cd backend && pnpm run dev"
echo ""
echo "2. Start the frontend (in another terminal):"
echo "   cd frontend && pnpm run dev"
echo ""
echo "3. Open your browser:"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🔧 Backend:  http://localhost:5000/health"
echo "   👨‍💼 Admin:    http://localhost:3000/admin/login"
echo ""
echo "4. Default admin credentials:"
echo "   Email:    admin@example.com"
echo "   Password: password123"
echo "   ⚠️  Change this password after first login!"
echo ""
echo "=================================="
echo ""
echo "💡 Tips:"
echo "   - Update backend/.env with your database URL if not using Docker"
echo "   - Add Cloudinary credentials to enable image uploads"
echo "   - Check README.md for more information"
echo ""
echo "🎉 Happy coding!"