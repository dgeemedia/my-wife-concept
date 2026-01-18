// frontend/components/admin/StatsOverview.js
import { formatCurrency } from '../../lib/currency';

export default function StatsOverview({ stats, pendingPayments, settings }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Today's Orders</h3>
        <p className="stat-value">{stats?.ordersToday || 0}</p>
      </div>
      <div className="stat-card">
        <h3>Today's Revenue</h3>
        <p className="stat-value">{formatCurrency(stats?.revenueToday || 0, settings.currency)}</p>
      </div>
      <div className="stat-card">
        <h3>Total Orders</h3>
        <p className="stat-value">{stats?.totalOrders || 0}</p>
      </div>
      <div className="stat-card">
        <h3>Pending Payments</h3>
        <p className="stat-value warning">{pendingPayments.length}</p>
      </div>
    </div>
  );
}