// frontend/components/admin/tabs/OverviewTab.js
import { formatCurrency } from '../../../lib/currency';

export default function OverviewTab({ stats, products, settings, statusOptions }) {
  const currency = settings?.currency || 'NGN';

  return (
    <div className="overview-section">
      <h2>📊 Business Overview</h2>
      
      <div className="overview-grid">
        <div className="overview-card">
          <h3>Quick Stats</h3>
          <ul className="stats-list">
            <li>Total Products: <strong>{(products || []).length}</strong></li>
            <li>Low Stock Items: <strong>{stats?.lowStockProducts?.length || 0}</strong></li>
            <li>Orders This Month: <strong>{stats?.totalOrders || 0}</strong></li>
            <li>Revenue Today: <strong>{formatCurrency(stats?.revenueToday || 0, currency)}</strong></li>
          </ul>
        </div>

        <div className="overview-card">
          <h3>🔥 Top Products</h3>
          {(stats?.topProducts || []).slice(0, 5).map(product => (
            <div key={product.productId} className="top-product-item">
              <span>{product.name}</span>
              <span className="product-sold">{product.totalSold} sold</span>
            </div>
          ))}
        </div>

        <div className="overview-card">
          <h3>⚠️ Low Stock Alert</h3>
          {(stats?.lowStockProducts || []).slice(0, 5).map(product => (
            <div key={product.id} className="low-stock-item">
              <span>{product.name}</span>
              <span className="stock-count">{product.stock} left</span>
            </div>
          ))}
        </div>

        <div className="overview-card">
          <h3>📦 Recent Orders</h3>
          {(stats?.recentOrders || []).slice(0, 5).map(order => (
            <div key={order.id} className="recent-order-item">
              <div>
                <strong>#{order.id}</strong> - {order.customerName}
              </div>
              <div className="order-status" style={{ color: statusOptions.find(s => s.value === order.status)?.color }}>
                {order.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
