// frontend/pages/index.js
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { productsApi, testimonialsApi } from '../lib/api';
import useCart from '../hooks/useCart';
import Image from 'next/image';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addItem } = useCart();

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348110252143';

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [productsData, testimonialsData] = await Promise.all([
        productsApi.getAll({ inStock: 'true' }),
        testimonialsApi.getAll(),
      ]);
      setProducts(productsData);
      setTestimonials(testimonialsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAddToCart = (product) => {
    addItem(product);
    window.dispatchEvent(new Event('cartUpdated'));
    alert(`${product.name} added to cart!`);
  };

  const orderViaWhatsApp = (product) => {
    const text = `
🛒 *New Order*

Product: ${product.name}
Price: ₦${product.price.toLocaleString()}
Quantity: 1

Please confirm my order.
    `.trim();

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <Layout><Loading fullScreen message="Loading menu..." /></Layout>;
  if (error) return <Layout><div className="cart-error" style={{ padding: 20, textAlign: 'center' }}>Error: {error}</div></Layout>;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1 className="home-hero-title">🍲 Delicious Local Foods</h1>
          <p className="home-hero-text">
            Freshly cooked Nigerian meals delivered to your door. 
            Add to cart or order instantly via WhatsApp!
          </p>
          <a href="#menu" className="home-cta-button">
            Browse Menu
          </a>
        </div>
        <div className="home-hero-image">
          <div className="home-hero-image-placeholder">🍛</div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="home-menu-section">
        <div className="home-container">
          <h2 className="home-section-title">Our Menu</h2>
          
          {products.length === 0 ? (
            <p style={{ textAlign: 'center', padding: 40 }}>No products available at the moment.</p>
          ) : (
            <div className="home-grid">
              {products.map(product => (
                <div key={product.id} className="home-card">
                  <div className="home-product-image">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={280}
                        height={200}
                        style={{ objectFit: 'cover' }}
                        priority={false}
                      />
                    ) : (
                      <div className="home-image-placeholder">🍽️</div>
                    )}
                  </div>
                  <h3 className="home-product-name">{product.name}</h3>
                  <p className="home-product-description">{product.description}</p>
                  <p className="home-product-price">₦{product.price.toLocaleString()}</p>
                  <p className="home-product-stock">
                    {product.stock > 0 ? `In stock: ${product.stock}` : 'Out of stock'}
                  </p>
                  <div className="home-button-group">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`home-add-button ${product.stock <= 0 ? 'home-button-disabled' : ''}`}
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => orderViaWhatsApp(product)}
                      disabled={product.stock <= 0}
                      className={`home-wa-button ${product.stock <= 0 ? 'home-button-disabled' : ''}`}
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="home-testimonials-section">
          <div className="home-container">
            <h2 className="home-section-title">What Our Customers Say</h2>
            <div className="home-testimonials-grid">
              {testimonials.map(testimonial => (
                <div key={testimonial.id} className="home-testimonial-card">
                  <p className="home-testimonial-content">"{testimonial.content}"</p>
                  <p className="home-testimonial-author">- {testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}