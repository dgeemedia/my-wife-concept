// frontend/pages/cart.js - FIXED VERSION
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import useCart from '../hooks/useCart';
import { ordersApi } from '../lib/api';
import { formatWhatsAppMessage } from '../lib/cart';

export default function CartPage() {
  const router = useRouter();
  const { cart, total, updateQuantity, removeItem, clear, isLoading } = useCart();
  const [checkoutInfo, setCheckoutInfo] = useState({
    customerName: '',
    phone: '',
    address: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348110252143';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!checkoutInfo.customerName || !checkoutInfo.phone) {
      setError('Please fill in your name and phone number');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Build payload
      const payload = {
        customerName: checkoutInfo.customerName.trim(),
        phone: checkoutInfo.phone.trim(),
        address: checkoutInfo.address?.trim() || '',
        email: checkoutInfo.email?.trim() || '',
        message: checkoutInfo.message?.trim() || '',
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      console.log('Submitting checkout:', payload);

      // Call API
      const response = await ordersApi.checkout(payload);

      console.log('Checkout response:', response);

      // Check for success
      if (response && response.success) {
        // Format WhatsApp message
        const waMessage = formatWhatsAppMessage(cart, checkoutInfo);
        const whatsappLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
        
        // Clear cart
        clear();
        
        // Set WhatsApp URL and show success modal
        setWhatsappUrl(whatsappLink);
        setShowSuccess(true);
        
        // Try to open WhatsApp immediately
        const whatsappWindow = window.open(whatsappLink, '_blank');
        
        // If popup was blocked, user can still click the button in success modal
        if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
          console.log('Popup blocked - user will use button in success modal');
        }
        
      } else {
        setError(response?.error || 'Checkout failed. Please try again.');
      }
    } catch (err) {
      console.error('❌ Checkout error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
        error: err
      });
      
      // Better error messages
      let errorMessage = 'An error occurred during checkout. Please try again.';
      
      if (err.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message?.includes('CORS')) {
        errorMessage = 'Connection error. Please try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // FIX: Wait for router to be ready before rendering
  if (!router.isReady || isLoading) {
    return (
      <Layout>
        <Loading fullScreen message="Loading cart..." />
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Success Modal */}
      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
            }}>
              ✅
            </div>
            <h2 style={{
              fontSize: '24px',
              marginBottom: '16px',
              color: '#4CAF50',
            }}>
              Order Placed Successfully!
            </h2>
            <p style={{
              fontSize: '16px',
              marginBottom: '24px',
              color: '#666',
            }}>
              Click the button below to complete your order on WhatsApp
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: '#25D366',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '18px',
                marginBottom: '16px',
                transition: 'background 0.3s',
              }}
              onMouseOver={(e) => e.target.style.background = '#128C7E'}
              onMouseOut={(e) => e.target.style.background = '#25D366'}
            >
              📱 Continue on WhatsApp
            </a>
            <br />
            <button
              onClick={() => {
                setShowSuccess(false);
                if (router && router.isReady) {
                  router.push('/');
                } else {
                  window.location.href = '/';
                }
              }}
              style={{
                padding: '12px 24px',
                background: '#f5f5f5',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '8px',
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <div className="cart-container">
        <h1 className="cart-title">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-text">Your cart is empty</p>
            <button 
              onClick={() => router.isReady && router.push('/')} 
              className="cart-shop-button"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            {/* Cart Items */}
            <div className="cart-section">
              <h2 className="cart-section-title">Items ({cart.length})</h2>
              
              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="cart-item-image" />
                      ) : (
                        <div className="cart-image-placeholder">🍽️</div>
                      )}
                    </div>
                    
                    <div className="cart-item-details">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-price">₦{item.price.toLocaleString()}</p>
                    </div>

                    <div className="cart-item-actions">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, e.target.value)}
                        className="cart-quantity-input"
                      />
                      <p className="cart-item-total">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="cart-remove-button"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-total">
                <span className="cart-total-label">Total:</span>
                <span className="cart-total-amount">₦{total.toLocaleString()}</span>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="cart-checkout-section">
              <h2 className="cart-section-title">Checkout</h2>
              
              {error && <div className="cart-error">{error}</div>}

              <form onSubmit={handleSubmit} className="cart-form">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={checkoutInfo.customerName}
                  onChange={(e) => setCheckoutInfo({ ...checkoutInfo, customerName: e.target.value })}
                  required
                  className="cart-input"
                />

                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={checkoutInfo.phone}
                  onChange={(e) => setCheckoutInfo({ ...checkoutInfo, phone: e.target.value })}
                  required
                  className="cart-input"
                />

                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={checkoutInfo.email}
                  onChange={(e) => setCheckoutInfo({ ...checkoutInfo, email: e.target.value })}
                  className="cart-input"
                />

                <textarea
                  placeholder="Delivery Address"
                  value={checkoutInfo.address}
                  onChange={(e) => setCheckoutInfo({ ...checkoutInfo, address: e.target.value })}
                  className="cart-textarea"
                  rows={3}
                />

                <textarea
                  placeholder="Additional Message (optional)"
                  value={checkoutInfo.message}
                  onChange={(e) => setCheckoutInfo({ ...checkoutInfo, message: e.target.value })}
                  className="cart-textarea"
                  rows={2}
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className={`cart-submit-button ${submitting ? 'home-button-disabled' : ''}`}
                >
                  {submitting ? 'Processing...' : 'Order Now'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}