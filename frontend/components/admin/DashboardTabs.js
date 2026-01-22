// frontend/components/admin/DashboardTabs.js
export default function DashboardTabs({
  activeTab,
  setActiveTab,
  statusStats,
  products,
  orders,
  pendingPayments,
  users,
  user
}) {
  const isSuperAdmin = user?.role === 'super-admin';

  return (
    <div className="dashboard-tabs">
      <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
        Overview
      </button>

      <button className={activeTab === 'tracking' ? 'active' : ''} onClick={() => setActiveTab('tracking')}>
        Order Tracking ({statusStats?.totalOrders || 0})
      </button>

      <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
        Products ({(products || []).length})
      </button>

      <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
        Orders ({(orders || []).length})
      </button>

      {isSuperAdmin && (
        <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
          Users ({(users || []).length})
        </button>
      )}

      <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>
        Pending Payments ({(pendingPayments || []).length})
      </button>

      {isSuperAdmin && (
        <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}>
          Activity Log
        </button>
      )}
    </div>
  );
}
