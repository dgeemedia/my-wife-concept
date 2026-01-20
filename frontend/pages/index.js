// frontend/pages/index.js - WITH PLACEHOLDER
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

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch settings with error handling
      let settingsData = null;
      try {
        const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`);
        if (settingsRes.ok) {
          settingsData = await settingsRes.json();
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
        // Use default settings if fetch fails
        settingsData = {
          businessName: process.env.NEXT_PUBLIC_BUSINESS_NAME || 'MyPadiFood',
          currency: process.env.NEXT_PUBLIC_CURRENCY || 'NGN',
          whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
        };
      }
      
      setSettings(settingsData);

      // Fetch products and testimonials
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

  const orderViaWhatsApp = (product) => {
    const waNumber = settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    const currency = settings?.currency || 'NGN';
    
    const text = `
🛒 *New Order*

Product: ${product.name}
Price: ${formatCurrency(product.price, currency)}
Quantity: 1

Please confirm my order.
    `.trim();

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <Layout>
        <Loading fullScreen message="Loading delicious menu..." />
      </Layout>
    );
  }

  // Show placeholder if no products AND no settings configured
  const showPlaceholder = products.length === 0 && (!settings?.businessName || settings?.businessName === 'My Business');

  if (showPlaceholder) {
    return (
      <Layout>
        <div className="placeholder-container">
          <div className="placeholder-card">
            <div className="placeholder-icon">🏪</div>
            <h1 className="placeholder-title">Welcome to Your Food Business</h1>
            <p className="placeholder-subtitle">
              Your online store is ready, but it needs some setup to get started!
            </p>
            
            <div className="placeholder-steps">
              <div className="step-item">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Configure Business Settings</h3>
                  <p>Set your business name, contact information, and branding</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Add Your Products</h3>
                  <p>Upload your menu items with prices and descriptions</p>
                </div>
              </div>
              
              <div className="step-item">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Start Receiving Orders</h3>
                  <p>Customers can browse and order via WhatsApp</p>
                </div>
              </div>
            </div>

            <div className="placeholder-actions">
              <a href="/admin/login" className="btn-primary-large">
                🔐 Go to Admin Dashboard
              </a>
              <a href="/admin/settings" className="btn-secondary-large">
                ⚙️ Configure Settings
              </a>
            </div>

            <div className="placeholder-help">
              <p>
                Need help? Check out our <a href="/docs" className="help-link">setup guide</a>
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          .placeholder-container {
            min-height: calc(100vh - 200px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .placeholder-card {
            background: white;
            border-radius: 20px;
            padding: 60px 40px;
            max-width: 800px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.2);
            text-align: center;
          }

          .placeholder-icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
          }

          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }

          .placeholder-title {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            margin-bottom: 16px;
          }

          .placeholder-subtitle {
            font-size: 18px;
            color: #6c757d;
            margin-bottom: 40px;
          }

          .placeholder-steps {
            text-align: left;
            margin-bottom: 40px;
          }

          .step-item {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            align-items: flex-start;
          }

          .step-number {
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            flex-shrink: 0;
          }

          .step-content h3 {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
          }

          .step-content p {
            color: #6c757d;
            font-size: 14px;
          }

          .placeholder-actions {
            display: flex;
            gap: 16px;
            justify-content: center;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }

          .btn-primary-large,
          .btn-secondary-large {
            padding: 16px 32px;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            display: inline-block;
          }

          .btn-primary-large {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
          }

          .btn-primary-large:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          }

          .btn-secondary-large {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
          }

          .btn-secondary-large:hover {
            background: #667eea;
            color: white;
          }

          .placeholder-help {
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
          }

          .help-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
          }

          .help-link:hover {
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .placeholder-card {
              padding: 40px 20px;
            }

            .placeholder-title {
              font-size: 24px;
            }

            .placeholder-actions {
              flex-direction: column;
            }

            .btn-primary-large,
            .btn-secondary-large {
              width: 100%;
            }
          }
        `}</style>
      </Layout>
    );
  }

  const currency = settings?.currency || 'NGN';

  return (
    <Layout>
      {/* Success Notification */}
      {notification && (
        <div className="notification-toast">
          {notification}
        </div>
      )}

      {/* Hero Section */}
      <section className="hero-modern">
        <div className="hero-content">
          <div className="hero-badge">
            ⭐ {settings?.businessName || 'Quality Food Delivery'}
          </div>
          
          <h1 className="hero-title-modern">
            Delicious Meals
            <span className="hero-gradient-text">Delivered Fresh</span>
          </h1>
          
          <p className="hero-subtitle-modern">
            {settings?.description || 'Order authentic local dishes made with love and delivered to your doorstep. Fast, fresh, and always delicious! 🍛'}
          </p>
          
          <div className="hero-cta-group">
            <a href="#menu" className="btn-primary-modern">
              🍽️ Browse Menu
            </a>
            <a 
              href={`https://wa.me/${settings?.whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-modern"
            >
              💬 Chat on WhatsApp
            </a>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="badge-item">
              <span className="badge-icon">⚡</span>
              <span className="badge-text">Fast Delivery</span>
            </div>
            <div className="badge-item">
              <span className="badge-icon">✓</span>
              <span className="badge-text">Fresh Ingredients</span>
            </div>
            <div className="badge-item">
              <span className="badge-icon">❤️</span>
              <span className="badge-text">Made with Love</span>
            </div>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <div className="hero-image-placeholder">
              🍲
              <div className="pulse-ring"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
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
              <a href="/admin/login" className="empty-action">
                Add Products (Admin)
              </a>
            </div>
          ) : (
            <div className="product-grid-modern">
              {products.map(product => (
                <div key={product.id} className="product-card-modern">
                  {/* Product Image */}
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
                    
                    {/* Stock Badge */}
                    {product.stock > 0 ? (
                      <div className="stock-badge in-stock">
                        ✓ Available
                      </div>
                    ) : (
                      <div className="stock-badge out-of-stock">
                        ✕ Sold Out
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="product-info">
                    <h3 className="product-name-modern">{product.name}</h3>
                    
                    {product.description && (
                      <p className="product-description-modern">
                        {product.description}
                      </p>
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
                        
                        <button
                          onClick={() => orderViaWhatsApp(product)}
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

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="testimonials-section-modern">
          <div className="container-modern">
            <h2 className="section-title-modern">
              Happy Customers
              <span className="title-underline"></span>
            </h2>
            
            <div className="testimonials-grid">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="testimonial-card">
                  <div className="quote-icon">❝</div>
                  <p className="testimonial-text">{testimonial.content}</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div className="author-info">
                      <div className="author-name">{testimonial.author}</div>
                      <div className="author-rating">⭐⭐⭐⭐⭐</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Order?</h2>
          <p className="cta-text">Get your favorite meals delivered in minutes!</p>
          <div className="cta-buttons">
            <a href="#menu" className="btn-primary-modern">
              View Full Menu
            </a>
            <a href="/cart" className="btn-secondary-modern">
              Go to Cart
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}