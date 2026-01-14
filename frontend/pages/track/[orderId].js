// frontend/pages/track/[orderId].js - NEW FILE

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';

const statusSteps = [
  { key: 'PENDING', label: 'Order Received', icon: '📝' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: '✅' },
  { key: 'PREPARING', label: 'Preparing', icon: '👨🍳' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚚' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉' },
];

export default function TrackOrder() {
  const router = useRouter();
  const { orderId } = router.query;
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(true);

  // Check if phone is in URL (from WhatsApp link)
  useEffect(() => {
    if (router.query.phone) {
      setPhone(router.query.phone);
      fetchOrder(orderId, router.query.phone);
    }
  }, [router.query]);

  const fetchOrder = async (id, phoneNumber) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tracking/track/${id}?phone=${phoneNumber}`
      );

      const data = await response.json();

      if (data.ok) {
        setOrder(data.order);
        setShowForm(false);
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (err) {
      setError('Failed to fetch order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone || !orderId) {
      setError('Please enter your phone number');
      return;
    }
    fetchOrder(orderId, phone);
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    
    if (order.status === 'CANCELLED') return -1;
    if (order.status === 'REFUNDED') return -1;
    
    return statusSteps.findIndex(step => step.key === order.status);
  };

  const currentStep = getCurrentStepIndex();

  if (loading) {
    return (
      <Layout>
        <Loading fullScreen message="Loading order details..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="tracking-container">
        <h1 className="tracking-title">📦 Track Your Order</h1>

        {showForm ? (
          <div className="tracking-form-card">
            <p className="tracking-subtitle">
              Enter your phone number to view order status
            </p>
            
            {error && <div className="tracking-error">{error}</div>}

            <form onSubmit={handleSubmit} className="tracking-form">
              <div className="tracking-order-id">
                <strong>Order ID:</strong> #{orderId}
              </div>

              <input
                type="tel"
                placeholder="Phone Number (e.g., 2348012345678)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="tracking-input"
                required
              />

              <button type="submit" className="tracking-submit-btn">
                Track Order
              </button>
            </form>
          </div>
        ) : order ? (
          <div className="tracking-details">
            {/* Order Info */}
            <div className="tracking-info-card">
              <h2>Order #{order.id}</h2>
              <p><strong>Customer:</strong> {order.customerName}</p>
              <p><strong>Total:</strong> ₦{order.totalAmount?.toLocaleString()}</p>
              <p>
                <strong>Placed:</strong>{' '}
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Status Timeline */}
            {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' ? (
              <div className="tracking-timeline">
                <h3>Order Status</h3>
                <div className="timeline-steps">
                  {statusSteps.map((step, index) => (
                    <div
                      key={step.key}
                      className={`timeline-step ${
                        index <= currentStep ? 'completed' : ''
                      } ${index === currentStep ? 'current' : ''}`}
                    >
                      <div className="step-icon">{step.icon}</div>
                      <div className="step-label">{step.label}</div>
                      {index < statusSteps.length - 1 && (
                        <div className="step-connector" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="tracking-cancelled">
                <p className="cancelled-status">
                  {order.status === 'CANCELLED' ? '❌ Order Cancelled' : '💰 Order Refunded'}
                </p>
                {order.notes && <p className="cancelled-reason">Reason: {order.notes}</p>}
              </div>
            )}

            {/* Order Items */}
            <div className="tracking-items">
              <h3>Order Items</h3>
              {order.items.map((item, index) => (
                <div key={index} className="tracking-item">
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="item-image"
                    />
                  )}
                  <div className="item-details">
                    <strong>{item.product.name}</strong>
                    <span>Quantity: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="tracking-history">
                <h3>Status History</h3>
                {order.statusHistory.map((entry, index) => (
                  <div key={index} className="history-entry">
                    <span className="history-status">{entry.status}</span>
                    <span className="history-time">
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                    {entry.notes && <p className="history-notes">{entry.notes}</p>}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowForm(true);
                setOrder(null);
                setPhone('');
              }}
              className="tracking-back-btn"
            >
              Track Another Order
            </button>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}
