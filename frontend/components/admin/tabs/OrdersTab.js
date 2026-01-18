// frontend/components/admin/tabs/OrdersTab.js
import { formatCurrency } from '../../../lib/currency';

export default function OrdersTab({
  orders,
  settings,
  statusOptions,
  handleExportOrders,
  router
}) {
  return (
    <div className="orders-section">
      <div className="section-header">
        <h2>📋 All Orders ({orders.length})</h2>
        <div className="header-actions">
          <button onClick={handleExportOrders} className="btn-secondary">
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className="orders-table-container">
        {orders.length === 0 ? (
          <div className="empty-state">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="order-id-cell">#{order.id}</td>
                    <td className="customer-cell">
                      <div className="customer-name">{order.customerName}</div>
                      {order.email && <div className="customer-email">{order.email}</div>}
                    </td>
                    <td className="phone-cell">{order.phone}</td>
                    <td className="total-cell">
                      {formatCurrency(order.totalAmount, settings.currency)}
                    </td>
                    <td className="payment-cell">
                      <span className={`payment-badge ${order.paymentStatus?.toLowerCase()}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="status-cell">
                      <span 
                        className="status-badge" 
                        style={{ 
                          backgroundColor: `${statusOptions.find(s => s.value === order.status)?.color}15`,
                          color: statusOptions.find(s => s.value === order.status)?.color 
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="date-cell">
                      <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className="time-text">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="actions-cell">
                      <button 
                        onClick={() => router.push(`/track/${order.id}?phone=${order.phone}`)}
                        className="btn-view"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders Summary */}
      {orders.length > 0 && (
        <div className="orders-summary">
          <div className="summary-card">
            <h4>Total Orders</h4>
            <div className="summary-value">{orders.length}</div>
          </div>
          <div className="summary-card">
            <h4>Total Revenue</h4>
            <div className="summary-value">
              {formatCurrency(
                orders.reduce((sum, order) => sum + order.totalAmount, 0),
                settings.currency
              )}
            </div>
          </div>
          <div className="summary-card">
            <h4>Pending Payments</h4>
            <div className="summary-value warning">
              {orders.filter(o => o.paymentStatus === 'PENDING').length}
            </div>
          </div>
          <div className="summary-card">
            <h4>Avg. Order Value</h4>
            <div className="summary-value">
              {formatCurrency(
                orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length,
                settings.currency
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}