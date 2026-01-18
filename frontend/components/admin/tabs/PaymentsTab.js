// frontend/components/admin/tabs/PaymentsTab.js
import { formatCurrency } from '../../../lib/currency';

export default function PaymentsTab({
  pendingPayments,
  settings,
  paymentAction,
  setPaymentAction,
  confirmPayment,
  rejectPayment,
  router
}) {
  return (
    <div className="payments-section">
      <div className="section-header">
        <h2>💳 Pending Payments ({pendingPayments.length})</h2>
        <div className="section-subtitle">
          Review and approve pending payments
        </div>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="empty-state success">
          <div className="empty-icon">✅</div>
          <p>No pending payments</p>
          <small>All payments have been processed</small>
        </div>
      ) : (
        <div className="payments-container">
          {/* Payment Stats */}
          <div className="payment-stats">
            <div className="stat-item">
              <span className="stat-label">Total Pending Amount:</span>
              <span className="stat-value">
                {formatCurrency(
                  pendingPayments.reduce((sum, order) => sum + order.totalAmount, 0),
                  settings.currency
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Amount:</span>
              <span className="stat-value">
                {formatCurrency(
                  pendingPayments.reduce((sum, order) => sum + order.totalAmount, 0) / pendingPayments.length,
                  settings.currency
                )}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Oldest Payment:</span>
              <span className="stat-value">
                {Math.max(
                  ...pendingPayments.map(order => 
                    Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60))
                  )
                )} hours ago
              </span>
            </div>
          </div>

          {/* Payments Grid */}
          <div className="payments-grid">
            {pendingPayments.map(order => (
              <div key={order.id} className="payment-card">
                <div className="payment-card-header">
                  <div className="payment-card-title">
                    <h3>Order #{order.id}</h3>
                    <span className="payment-time">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span className="payment-amount highlight">
                    {formatCurrency(order.totalAmount, settings.currency)}
                  </span>
                </div>

                <div className="payment-card-body">
                  <div className="customer-info">
                    <div className="info-row">
                      <span className="info-label">Customer:</span>
                      <span className="info-value">{order.customerName}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{order.phone}</span>
                    </div>
                    {order.email && (
                      <div className="info-row">
                        <span className="info-label">Email:</span>
                        <span className="info-value">{order.email}</span>
                      </div>
                    )}
                    <div className="info-row">
                      <span className="info-label">Items:</span>
                      <span className="info-value">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="order-items-preview">
                      <strong>Order Items:</strong>
                      <div className="items-list">
                        {order.items.slice(0, 3).map(item => (
                          <div key={item.id} className="item-row">
                            <span className="item-name">{item.product?.name}</span>
                            <span className="item-details">
                              {item.quantity} × {formatCurrency(item.unitPrice, settings.currency)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="more-items">
                            + {order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Actions */}
                <div className="payment-card-actions">
                  <div className="payment-method-selector">
                    <label>Payment Method:</label>
                    <select
                      value={paymentAction[order.id]?.method || 'TRANSFER'}
                      onChange={(e) => setPaymentAction({
                        ...paymentAction,
                        [order.id]: { ...paymentAction[order.id], method: e.target.value }
                      })}
                    >
                      <option value="CASH">Cash</option>
                      <option value="TRANSFER">Bank Transfer</option>
                      <option value="CARD">Credit Card</option>
                      <option value="QR">QR Payment</option>
                    </select>
                  </div>

                  <div className="payment-proof-input">
                    <label>Payment Proof/Reference:</label>
                    <input
                      type="text"
                      placeholder="Enter transaction ID or reference"
                      value={paymentAction[order.id]?.proof || ''}
                      onChange={(e) => setPaymentAction({
                        ...paymentAction,
                        [order.id]: { ...paymentAction[order.id], proof: e.target.value }
                      })}
                    />
                  </div>

                  <div className="action-buttons">
                    <button 
                      onClick={() => confirmPayment(order.id, paymentAction[order.id]?.method)}
                      className="btn-confirm"
                      title="Confirm Payment"
                    >
                      ✅ Confirm Payment
                    </button>
                    <button 
                      onClick={() => rejectPayment(order.id)}
                      className="btn-reject"
                      title="Reject Payment"
                    >
                      ❌ Reject
                    </button>
                    <button 
                      onClick={() => router.push(`/track/${order.id}?phone=${order.phone}`)}
                      className="btn-view"
                      title="View Order Details"
                    >
                      👁️ View Order
                    </button>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="payment-notes">
                  <textarea
                    placeholder="Add notes about this payment (optional)"
                    value={paymentAction[order.id]?.notes || ''}
                    onChange={(e) => setPaymentAction({
                      ...paymentAction,
                      [order.id]: { ...paymentAction[order.id], notes: e.target.value }
                    })}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Bulk Actions */}
          {pendingPayments.length > 1 && (
            <div className="bulk-payment-actions">
              <h4>Bulk Actions</h4>
              <div className="bulk-actions-grid">
                <select 
                  className="bulk-method-select"
                  defaultValue="TRANSFER"
                  onChange={(e) => {
                    const newActions = { ...paymentAction };
                    pendingPayments.forEach(order => {
                      newActions[order.id] = { 
                        ...newActions[order.id], 
                        method: e.target.value 
                      };
                    });
                    setPaymentAction(newActions);
                  }}
                >
                  <option value="TRANSFER">Set all to Bank Transfer</option>
                  <option value="CASH">Set all to Cash</option>
                  <option value="CARD">Set all to Card</option>
                </select>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    const reason = prompt('Enter rejection reason for all:');
                    if (reason) {
                      pendingPayments.forEach(order => rejectPayment(order.id, reason));
                    }
                  }}
                >
                  ❌ Reject All
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}