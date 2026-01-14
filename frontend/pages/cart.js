// frontend/pages/cart.js
import { useState } from 'react';
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

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348110252143';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      const payload = {
        customerName: checkoutInfo.customerName,
        phone: checkoutInfo.phone,
        address: checkoutInfo.address,
        email: checkoutInfo.email,
        message: checkoutInfo.message,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      const response = await ordersApi.checkout(payload);

      if (response.success) {
        const waMessage = formatWhatsAppMessage(cart, checkoutInfo);
        clear();
        window.open(
          `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`,
          '_blank'
        );
        alert('Order placed successfully! Redirecting to WhatsApp...');
        router.push('/');
      } else {
        setError(response.error || 'Checkout failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <Loading fullScreen message="Loading cart..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cart-container">
        <h1 className="cart-title">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <p className="cart-empty-text">Your cart is empty</p>
            <button onClick={() => router.push('/')} className="cart-shop-button">
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
                  {submitting ? 'Processing...' : 'Proceed to WhatsApp'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}