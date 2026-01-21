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



use
// frontend/pages/index.js - MINIMAL CHANGES - Just add Quick Order Modal
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { productsApi, testimonialsApi } from '../lib/api';
import useCart from '../hooks/useCart';
import Image from 'next/image';
import { formatCurrency } from '../lib/currency';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState('');
  const { addItem } = useCart();

  // 🔥 NEW: Quick Order Modal States
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quickOrderInfo, setQuickOrderInfo] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    message: '',
    quantity: 1,
  });
  const [quickOrderError, setQuickOrderError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      let settingsData = null;
      try {
        const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`);
        if (settingsRes.ok) {
          settingsData = await settingsRes.json();
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        settingsData = {
          businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'MyPadiFood',
          currency: process.env.NEXT_PUBLIC_CURRENCY || 'NGN',
          whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
        };
      }
      
      setSettings(settingsData);

      const [productsData, testimonialsData] = await Promise.all([
        productsApi.getAll({ inStock: 'true' }).catch(() => []),
        testimonialsApi.getAll().catch(() => []),
      ]);
      
      setProducts(productsData);
      setTestimonials(testimonialsData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = (product) => {
    addItem(product);
    window.dispatchEvent(new Event('cartUpdated'));
    
    setNotification(`✓ ${product.name} added to cart!`);
    setTimeout(() => setNotification(''), 3000);
  };

  // 🔥 NEW: Open Quick Order Modal
  const openQuickOrderModal = (product) => {
    setSelectedProduct(product);
    setQuickOrderInfo({
      customerName: '',
      phone: '',
      email: '',
      address: '',
      message: '',
      quantity: 1,
    });
    setQuickOrderError('');
    setShowQuickOrder(true);
  };

  // 🔥 NEW: Close Quick Order Modal
  const closeQuickOrderModal = () => {
    setShowQuickOrder(false);
    setSelectedProduct(null);
    setQuickOrderError('');
  };

  // 🔥 NEW: Submit Quick Order
  const submitQuickOrder = (e) => {
    e.preventDefault();
    
    if (!quickOrderInfo.customerName.trim() || !quickOrderInfo.phone.trim()) {
      setQuickOrderError('Please fill in your name and phone number');
      return;
    }

    if (quickOrderInfo.phone.trim().length < 10) {
      setQuickOrderError('Please enter a valid phone number');
      return;
    }

    if (quickOrderInfo.quantity < 1 || quickOrderInfo.quantity > selectedProduct.stock) {
      setQuickOrderError(`Please enter quantity between 1 and ${selectedProduct.stock}`);
      return;
    }

    const waNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const currency = settings?.currency || 'NGN';
    const totalPrice = selectedProduct.price * quickOrderInfo.quantity;

    const text = `
🛒 *New Order*

*Customer Details:*
Name: ${quickOrderInfo.customerName}
Phone: ${quickOrderInfo.phone}
${quickOrderInfo.email ? `Email: ${quickOrderInfo.email}` : ''}
${quickOrderInfo.address ? `Address: ${quickOrderInfo.address}` : ''}

*Order:*
Product: ${selectedProduct.name}
Quantity: ${quickOrderInfo.quantity}
Unit Price: ${formatCurrency(selectedProduct.price, currency)}
Total: ${formatCurrency(totalPrice, currency)}

${quickOrderInfo.message ? `\n*Special Instructions:*\n${quickOrderInfo.message}` : ''}
    `.trim();

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');

    setNotification(`✓ Order sent to WhatsApp!`);
    setTimeout(() => setNotification(''), 3000);

    closeQuickOrderModal();
  };

  if (loading) {
    return (
      <Layout>
        <Loading fullScreen message="Loading delicious menu..." />
      </Layout>
    );
  }

  const showPlaceholder = products.length === 0 && (!settings?.businessName || settings?.businessName === 'My Business');

  if (showPlaceholder) {
    return (
      <Layout>
        {/* Your existing placeholder code */}
      </Layout>
    );
  }

  const currency = settings?.currency || 'NGN';

  return (
    <Layout>
      {/* 🔥 NEW: Quick Order Modal */}
      {showQuickOrder && selectedProduct && (
        <div className="modal-overlay" onClick={closeQuickOrderModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeQuickOrderModal}>✕</button>

            <div className="modal-header">
              <h2 className="modal-title">Quick Order</h2>
              <p className="modal-subtitle">Complete your order details</p>
            </div>

            <div className="modal-product-info">
              <div className="modal-product-image">
                {selectedProduct.imageUrl ? (
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
                ) : (
                  <div className="modal-product-placeholder">🍽️</div>
                )}
              </div>
              <div>
                <h3 className="modal-product-name">{selectedProduct.name}</h3>
                <p className="modal-product-price">{formatCurrency(selectedProduct.price, currency)}</p>
              </div>
            </div>

            {quickOrderError && <div className="modal-error">{quickOrderError}</div>}

            <form onSubmit={submitQuickOrder} className="modal-form">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={quickOrderInfo.customerName}
                  onChange={(e) => setQuickOrderInfo({ ...quickOrderInfo, customerName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g., 08012345678"
                  value={quickOrderInfo.phone}
                  onChange={(e) => setQuickOrderInfo({ ...quickOrderInfo, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email (Optional)</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  value={quickOrderInfo.email}
                  onChange={(e) => setQuickOrderInfo({ ...quickOrderInfo, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter your delivery address"
                  rows={2}
                  value={quickOrderInfo.address}
                  onChange={(e) => setQuickOrderInfo({ ...quickOrderInfo, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className="form-input"
                  min="1"
                  max={selectedProduct.stock}
                  value={quickOrderInfo.quantity}
                  onChange={(e) => setQuickOrderInfo({ ...quickOrderInfo, quantity: parseInt(e.target.value) || 1 })}
                  required
                />
                <small className="form-hint">Available stock: {selectedProduct.stock}</small>
              </div>

              <div className="form-group">
                <label className="form-label">Special Instructions (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Any special requests?"
                  rows={2}
                  value={quickOrderInfo.message}
                  onChange={(e) => setQuickOrderInfo({ ...quickOrderInfo, message: e.target.value })}
                />
              </div>

              <div className="modal-total">
                <span>Total:</span>
                <span className="modal-total-price">
                  {formatCurrency(selectedProduct.price * quickOrderInfo.quantity, currency)}
                </span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeQuickOrderModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  💬 Order Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {notification && (
        <div className="notification-toast">
          {notification}
        </div>
      )}

      {/* Your existing Hero Section */}
      <section className="hero-modern">
        {/* ... existing hero code ... */}
      </section>

      {/* Your existing Menu Section */}
      <section id="menu" className="menu-section-modern">
        <div className="container-modern">
          <div className="section-header-modern">
            <h2 className="section-title-modern">
              Our Menu
              <span className="title-underline"></span>
            </h2>
            <p className="section-subtitle-modern">
              Handpicked dishes made fresh daily
            </p>
          </div>
          
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <p className="empty-text">No products available at the moment.</p>
              <p className="empty-subtext">Check back soon for delicious updates!</p>
            </div>
          ) : (
            <div className="product-grid-modern">
              {products.map(product => (
                <div key={product.id} className="product-card-modern">
                  <div className="product-image-container">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={400}
                        height={300}
                        className="product-image-modern"
                        priority={false}
                      />
                    ) : (
                      <div className="product-placeholder">
                        <span className="placeholder-icon">🍽️</span>
                      </div>
                    )}
                    
                    {product.stock > 0 ? (
                      <div className="stock-badge in-stock">✓ Available</div>
                    ) : (
                      <div className="stock-badge out-of-stock">✕ Sold Out</div>
                    )}
                  </div>

                  <div className="product-info">
                    <h3 className="product-name-modern">{product.name}</h3>
                    
                    {product.description && (
                      <p className="product-description-modern">{product.description}</p>
                    )}

                    <div className="product-footer">
                      <div className="price-tag-modern">
                        {formatCurrency(product.price, currency)}
                      </div>

                      <div className="product-actions">
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock <= 0}
                          className="btn-add-cart"
                          title="Add to cart"
                        >
                          🛒
                        </button>
                        
                        {/* 🔥 UPDATED: Quick Order Button now opens modal */}
                        <button
                          onClick={() => openQuickOrderModal(product)}
                          disabled={product.stock <= 0}
                          className="btn-whatsapp"
                          title="Quick Order"
                        >
                          💬
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Your existing Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="testimonials-section-modern">
          {/* ... existing testimonials code ... */}
        </section>
      )}

      {/* Your existing CTA Section */}
      <section className="cta-section">
        {/* ... existing CTA code ... */}
      </section>

      {/* 🔥 NEW: Modal Styles - Add at the end */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          overflow-y: auto;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #f5f5f5;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          color: #666;
          transition: all 0.2s;
          z-index: 1;
        }

        .modal-close:hover {
          background: #e0e0e0;
          color: #333;
        }

        .modal-header {
          padding: 32px 32px 16px;
          border-bottom: 1px solid #eee;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #2c3e50;
          margin: 0 0 8px;
        }

        .modal-subtitle {
          font-size: 14px;
          color: #6c757d;
          margin: 0;
        }

        .modal-product-info {
          display: flex;
          gap: 16px;
          padding: 20px 32px;
          background: #f8f9fa;
          align-items: center;
        }

        .modal-product-image {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .modal-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-product-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          font-size: 32px;
        }

        .modal-product-name {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 4px;
        }

        .modal-product-price {
          font-size: 16px;
          color: #4CAF50;
          font-weight: 600;
          margin: 0;
        }

        .modal-error {
          margin: 16px 32px 0;
          padding: 12px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          color: #c33;
          font-size: 14px;
        }

        .modal-form {
          padding: 24px 32px 32px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 8px;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
          font-family: inherit;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .form-textarea {
          resize: vertical;
          min-height: 60px;
        }

        .form-hint {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #6c757d;
        }

        .modal-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-top: 2px solid #eee;
          margin-bottom: 24px;
          font-size: 18px;
          font-weight: 600;
        }

        .modal-total-price {
          color: #4CAF50;
          font-size: 24px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
        }

        .btn-cancel,
        .btn-submit {
          flex: 1;
          padding: 14px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancel {
          background: #f5f5f5;
          color: #666;
        }

        .btn-cancel:hover {
          background: #e0e0e0;
        }

        .btn-submit {
          background: #25D366;
          color: white;
        }

        .btn-submit:hover {
          background: #128C7E;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
        }

        .notification-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 10001;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 768px) {
          .modal-content {
            margin: 20px;
            max-height: calc(100vh - 40px);
          }

          .modal-header {
            padding: 24px 20px 16px;
          }

          .modal-product-info {
            padding: 16px 20px;
          }

          .modal-form {
            padding: 20px;
          }

          .modal-actions {
            flex-direction: column;
          }

          .btn-cancel,
          .btn-submit {
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}

