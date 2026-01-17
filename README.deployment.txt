# 🚀 MyPadiFood Single-Tenant Deployment Guide

## 📋 Prerequisites

- Domain: **mypadifood.com** (you have this ✓)
- PostgreSQL database (Supabase free tier recommended)
- Cloudinary account (free tier)
- Vercel account (for frontend)
- Railway/Render account (for backend)

---

## 🗄️ Step 1: Database Setup (Supabase)

### Create Supabase Project

1. Go to https://supabase.com
2. Create new project: `mypadifood-production`
3. Copy connection strings:

```env
# Direct URL (for Prisma)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# Pooled URL (for production)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:6543/postgres?pgbouncer=true"
```

### Run Migrations

```bash
cd backend
pnpm run prisma:push
pnpm run seed
```

---

## ☁️ Step 2: Cloudinary Setup

1. Go to https://cloudinary.com
2. Copy credentials:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_FOLDER=mypadifood-prod
```

---

## 🎯 Step 3: Backend Deployment (Railway)

### Create Railway Project

1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select your repo → Choose `backend` folder

### Configure Environment Variables

In Railway dashboard, add:

```env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=mypadifood-prod

# Business
BUSINESS_NAME=MyPadiFood
BUSINESS_TYPE=food
WHATSAPP_NUMBER=2348110252143
DEFAULT_CURRENCY=NGN

# CORS
CORS_ORIGIN=https://mypadifood.com,https://www.mypadifood.com

# Features
FEATURE_ORDER_TRACKING=true
FEATURE_ANALYTICS=true

# Seed Admin
SEED_ADMIN_EMAIL=admin@mypadifood.com
SEED_ADMIN_PASSWORD=SecurePassword123!
```

### Railway Settings

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install && pnpm run build"
  },
  "deploy": {
    "startCommand": "pnpm start",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Get Backend URL

After deployment, copy the URL: `https://mypadifood-production.up.railway.app`

---

## 🌐 Step 4: Frontend Deployment (Vercel)

### Create Vercel Project

1. Go to https://vercel.com
2. "New Project" → Import your repo
3. Root Directory: `frontend`
4. Framework Preset: **Next.js**

### Environment Variables

```env
NEXT_PUBLIC_BACKEND_URL=https://mypadifood-production.up.railway.app
NEXT_PUBLIC_WHATSAPP_NUMBER=2348110252143
NEXT_PUBLIC_BUSINESS_NAME=MyPadiFood
NEXT_PUBLIC_BUSINESS_TYPE=food
NEXT_PUBLIC_CURRENCY=NGN
NEXT_PUBLIC_APP_ENV=production
```

### Vercel Settings

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

---

## 🌍 Step 5: Domain Configuration

### For mypadifood.com (Main Domain)

#### In Your Domain Registrar (e.g., Namecheap):

```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

#### In Vercel Dashboard:

1. Go to Project Settings → Domains
2. Add domain: `mypadifood.com`
3. Add domain: `www.mypadifood.com`
4. Vercel will auto-configure SSL

---

## 🏪 Step 6: Client Subdomain Setup

For client: **mywifeconcept.mypadifood.com**

### Option A: Separate Vercel Project (Recommended)

1. Deploy new Vercel project from same repo
2. Set environment variable:

```env
NEXT_PUBLIC_BACKEND_URL=https://mypadifood-production.up.railway.app
NEXT_PUBLIC_WHATSAPP_NUMBER=2348123456789
NEXT_PUBLIC_BUSINESS_NAME=My Wife Concept
NEXT_PUBLIC_BUSINESS_TYPE=fashion
NEXT_PUBLIC_CURRENCY=NGN
```

3. In Vercel → Add domain: `mywifeconcept.mypadifood.com`

### Option B: Wildcard Subdomain (Future Multi-Tenant)

#### In Domain Registrar:

```
Type    Name    Value
CNAME   *       cname.vercel-dns.com
```

This allows any subdomain like:
- `client1.mypadifood.com`
- `client2.mypadifood.com`

---

## 🔧 Step 7: Post-Deployment Setup

### 1. Create First Admin User

```bash
# SSH into Railway container or run locally
cd backend
pnpm run seed
```

### 2. Login to Admin Dashboard

1. Go to https://mypadifood.com/admin/login
2. Email: `admin@mypadifood.com`
3. Password: `SecurePassword123!`
4. **IMMEDIATELY change password**

### 3. Configure Business Settings

1. Dashboard → Settings
2. Upload logo
3. Update business name
4. Set WhatsApp number
5. Configure currency

---

## 📊 Step 8: Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://mypadifood-production.up.railway.app/health

# Frontend health
curl https://mypadifood.com
```

### Railway Logs

```bash
# View in Railway dashboard or CLI
railway logs
```

### Vercel Logs

```bash
# View in Vercel dashboard or CLI
vercel logs
```

---

## 🔒 Security Checklist

- [ ] Change default admin password
- [ ] Enable 2FA on Vercel/Railway accounts
- [ ] Use strong JWT_SECRET (min 32 chars)
- [ ] Configure CORS properly
- [ ] Enable HTTPS only (auto via Vercel)
- [ ] Set up database backups in Supabase
- [ ] Monitor error logs weekly

---

## 💰 Cost Estimate (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | $0 (up to 100GB bandwidth) |
| Railway | Starter | $5 (500 hours execution) |
| Supabase | Free | $0 (500MB database) |
| Cloudinary | Free | $0 (25 credits/month) |
| Domain | Renewal | ~$12/year |
| **Total** | | **~$5/month** |

---

## 🚨 Troubleshooting

### Backend won't start

```bash
# Check Railway logs
railway logs

# Common fixes:
- Verify DATABASE_URL is correct
- Ensure JWT_SECRET is set
- Check Node version (should be 18+)
```

### Frontend shows 502 errors

```bash
# Verify backend is running
curl https://your-backend.railway.app/health

# Check NEXT_PUBLIC_BACKEND_URL in Vercel env vars
```

### Database connection issues

```bash
# Test connection
cd backend
pnpm run prisma:studio

# If fails, verify Supabase connection pooling is enabled
```

---

## 📞 Support & Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## 🎉 Go Live Checklist

Before announcing to the client:

1. [ ] Test full order flow (add to cart → checkout → WhatsApp)
2. [ ] Test admin features (products, orders, users)
3. [ ] Upload client's logo
4. [ ] Configure client's WhatsApp number
5. [ ] Add 5-10 sample products with images
6. [ ] Test on mobile devices
7. [ ] Verify email notifications work
8. [ ] Check order tracking page
9. [ ] Test payment confirmation flow
10. [ ] Create user guide for client

---

## 📱 Client Handover Package

### Admin Login Credentials

```
URL: https://mywifeconcept.mypadifood.com/admin
Email: owner@mywifeconcept.com
Password: [Generated secure password]

IMPORTANT: Change password immediately after first login
```

### Quick Start Guide for Client

1. **Adding Products**
   - Go to Dashboard → Products → Add New
   - Upload high-quality images (recommended: 800x600px)
   - Set price and stock quantity
   - Save

2. **Managing Orders**
   - Dashboard → Orders
   - Click "Confirm Payment" when customer pays
   - Update order status (Preparing → Out for Delivery → Delivered)

3. **Updating WhatsApp Number**
   - Dashboard → Settings → WhatsApp Number
   - Enter new number (with country code)
   - Save changes

4. **Uploading Logo**
   - Dashboard → Settings → Business Logo
   - Choose file (max 2MB, PNG/JPEG)
   - Upload

---

## 🔄 Updates & Maintenance

### Weekly Tasks

- Check error logs in Railway/Vercel
- Review new orders
- Monitor disk space in Supabase

### Monthly Tasks

- Update dependencies: `pnpm update`
- Review database backups
- Check analytics for traffic patterns
- Optimize slow queries if needed

---

## 🎯 Success Metrics

Track these KPIs for the client:

- Daily active users
- Conversion rate (visits → orders)
- Average order value
- Popular products
- Peak ordering times

Access analytics: Dashboard → Analytics

---

## 🆘 Emergency Contacts

**Critical Issues:**
- Backend down: Check Railway status
- Payment issues: Verify WhatsApp number
- Database issues: Contact Supabase support

**Developer Support:**
[Your contact information here]

---

## 🎁 Bonus: Performance Optimization

### Image Optimization

Images are auto-optimized via Cloudinary:
- Automatic format conversion (WebP)
- Responsive sizing
- Lazy loading

### Caching

- Static pages cached at edge (Vercel)
- API responses cached 5 minutes
- Database queries optimized with indexes

---

**Deployment completed! 🎊**

Your client can now start selling online at:
**https://mywifeconcept.mypadifood.com**