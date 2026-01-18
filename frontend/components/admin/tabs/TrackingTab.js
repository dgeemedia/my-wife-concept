// frontend/components/admin/tabs/TrackingTab.js
import { formatCurrency } from '../../../lib/currency';

export default function TrackingTab({
  statusStats,
  statusOptions,
  trackingStatus,
  ordersByStatus,
  selectedOrder,
  statusUpdate,
  settings,
  fetchOrdersByStatus,
  handleUpdateOrderStatus,
  setSelectedOrder,
  handleCancelOrder,
  router,
  handleBulkStatusUpdate,
  setStatusUpdate
}) {
  return (
    <div className="tracking-section">
      <h2>📦 Order Tracking & Status Management</h2>
      
      {statusStats && (
        <div className="status-stats">
          <h3>Order Status Distribution</h3>
          <div className="stats-grid-small">
            {statusStats.statistics?.map(stat => (
              <div key={stat.status} className="status-stat-card">
                <span className="status-label" style={{ color: statusOptions.find(s => s.value === stat.status)?.color }}>
                  {stat.status}
                </span>
                <span className="status-count">{stat.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="status-filter">
        <h3>Filter by Status</h3>
        <div className="status-buttons">
          {statusOptions.map(option => (
            <button
              key={option.value}
              className={`status-btn ${trackingStatus === option.value ? 'active' : ''}`}
              onClick={() => fetchOrdersByStatus(option.value)}
              style={{ 
                background: trackingStatus === option.value ? option.color : '#f0f0f0',
                color: trackingStatus === option.value ? 'white' : '#333'
              }}
            >
              {option.label} ({statusStats?.statistics?.find(s => s.status === option.value)?.count || 0})
            </button>
          ))}
        </div>
      </div>

      <div className="tracking-orders-list">
        <h3>Orders ({ordersByStatus.length})</h3>
        
        {ordersByStatus.length === 0 ? (
          <div className="empty-state">
            <p>No orders found with status: {trackingStatus}</p>
          </div>
        ) : (
          <>
            <div className="orders-grid">
              {ordersByStatus.map(order => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-id">Order #{order.id}</div>
                    <div className="order-amount">
                      {formatCurrency(order.totalAmount, settings.currency)}
                    </div>
                  </div>
                  
                  <div className="order-details">
                    <div className="order-info">
                      <div>
                        <strong>Customer:</strong> {order.customerName}
                      </div>
                      <div>
                        <strong>Phone:</strong> {order.phone}
                      </div>
                      <div>
                        <strong>Payment:</strong>
                        <span className={`payment-status ${order.paymentStatus?.toLowerCase()}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div>
                        <strong>Status:</strong>
                        <span className="current-status" style={{ 
                          color: statusOptions.find(s => s.value === order.status)?.color 
                        }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    {order.items && order.items.length > 0 && (
                      <div className="order-items">
                        <strong>Items:</strong>
                        <ul>
                          {order.items.map(item => (
                            <li key={item.id}>
                              <span>{item.product?.name} x{item.quantity}</span>
                              <span className="item-price">
                                {formatCurrency(item.unitPrice, settings.currency)} each
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="order-actions">
                      <button 
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="action-btn"
                      >
                        {selectedOrder?.id === order.id ? 'Hide Update' : 'Update Status'}
                      </button>
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="action-btn cancel"
                      >
                        Cancel Order
                      </button>
                      <button 
                        onClick={() => router.push(`/track/${order.id}?phone=${order.phone}`)}
                        className="action-btn track"
                      >
                        Track Order
                      </button>
                    </div>
                    
                    {selectedOrder?.id === order.id && (
                      <div className="status-update-form">
                        <select
                          className="status-select"
                          value={statusUpdate.status}
                          onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        
                        <textarea
                          className="status-notes"
                          placeholder="Add notes (optional)"
                          value={statusUpdate.notes}
                          onChange={(e) => setStatusUpdate({...statusUpdate, notes: e.target.value})}
                          rows={3}
                        />
                        
                        <div className="status-form-actions">
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id)}
                            className="update-btn"
                          >
                            Update Status
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedOrder(null);
                              setStatusUpdate({ status: 'CONFIRMED', notes: '' });
                            }}
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bulk-actions">
              <h3>Bulk Actions</h3>
              <div className="bulk-form">
                <select
                  className="bulk-select"
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <textarea
                  className="bulk-notes"
                  placeholder="Bulk update notes (optional)"
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({...statusUpdate, notes: e.target.value})}
                  rows={2}
                />
                
                <button 
                  onClick={handleBulkStatusUpdate}
                  className="bulk-update-btn"
                >
                  Update Selected Orders
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}