// frontend/pages/index.js
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
      const [productsData, testimonialsData, settingsData] = await Promise.all([
        productsApi.getAll({ inStock: 'true' }),
        testimonialsApi.getAll(),
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`).then(r => r.json()),
      ]);
      setProducts(productsData);
      setTestimonials(testimonialsData);
      setSettings(settingsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = (product) => {
    addItem(product);
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success notification
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

  if (loading) return <Layout><Loading fullScreen message="Loading delicious menu..." /></Layout>;
  if (error) return <Layout><div className="error-container">Error: {error}</div></Layout>;

  const currency = settings?.currency || 'NGN';

  return (
    <Layout>
      {/* Success Notification */}
      {notification && (
        <div className="notification-toast">
          {notification}
        </div>
      )}

      {/* Hero Section - Enhanced */}
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
            Order authentic local dishes made with love and delivered to your doorstep. 
            Fast, fresh, and always delicious! 🍛
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

      {/* Menu Section - Card Grid */}
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
                          title="Order via WhatsApp"
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