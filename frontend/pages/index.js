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

