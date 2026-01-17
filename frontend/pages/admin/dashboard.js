// frontend/pages/admin/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { analyticsApi, ordersApi, productsApi, usersApi, trackingApi } from '../../lib/api';
import { formatCurrency } from '../../lib/currency';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Data states
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  
  // Tracking states
  const [trackingStatus, setTrackingStatus] = useState('PENDING');
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [statusStats, setStatusStats] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'CONFIRMED',
    notes: ''
  });
  
  // Form states
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    imageUrl: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'admin'
  });
  const [paymentAction, setPaymentAction] = useState({});

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    if (parsedUser.forcePasswordChange) {
      router.push('/admin/first-login');
      return;
    }

    await fetchAllData();
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch settings FIRST
      const settingsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`);
      const settingsData = await settingsRes.json();
      setSettings(settingsData);
      
      // Fetch other data in parallel
      const [statsData, productsData, ordersData, statusStatsData] = await Promise.all([
        analyticsApi.getStats(),
        productsApi.getAll(),
        ordersApi.getAll({ limit: 50 }),
        trackingApi.getStatusStatistics(),
      ]);

      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData.orders || []);
      setStatusStats(statusStatsData);
      
      // Filter pending payments
      const pending = (ordersData.orders || []).filter(order => 
        order.paymentStatus === 'PENDING'
      );
      setPendingPayments(pending);

      // Fetch initial tracking orders
      await fetchOrdersByStatus(trackingStatus);

      // Fetch users if super-admin
      if (user?.role === 'super-admin') {
        const usersData = await usersApi.getAll();
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.message.includes('401')) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByStatus = async (status) => {
    try {
      setTrackingStatus(status);
      const response = await trackingApi.getOrdersByStatus(status, 50, 0);
      setOrdersByStatus(response.orders || []);
    } catch (err) {
      console.error('Error fetching orders by status:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId) => {
    if (!statusUpdate.status) {
      alert('Please select a status');
      return;
    }

    try {
      await trackingApi.updateOrderStatus(orderId, statusUpdate.status, statusUpdate.notes);
      alert('Order status updated successfully!');
      
      // Refresh data
      await fetchOrdersByStatus(trackingStatus);
      await fetchAllData();
      
      // Reset form
      setStatusUpdate({ status: 'CONFIRMED', notes: '' });
      setSelectedOrder(null);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = prompt('Enter reason for cancellation:');
    if (!reason) return;

    try {
      await trackingApi.cancelOrder(orderId, reason);
      alert('Order cancelled successfully!');
      await fetchOrdersByStatus(trackingStatus);
      await fetchAllData();
    } catch (err) {
      alert('Error cancelling order: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const confirmPayment = async (orderId, paymentMethod = 'TRANSFER') => {
    try {
      const response = await ordersApi.confirmPayment(orderId, {
        paymentMethod,
        paymentProof: paymentAction[orderId]?.proof || ''
      });
      
      if (response.ok) {
        alert('Payment confirmed successfully!');
        await fetchAllData();
        setPaymentAction(prev => {
          const updated = { ...prev };
          delete updated[orderId];
          return updated;
        });
      }
    } catch (err) {
      alert('Error confirming payment: ' + err.message);
    }
  };

  const rejectPayment = async (orderId, reason = '') => {
    if (!reason) {
      reason = prompt('Enter reason for rejection:');
      if (!reason) return;
    }
    
    try {
      const response = await ordersApi.rejectPayment(orderId, { reason });
      if (response.ok) {
        alert('Payment rejected!');
        await fetchAllData();
      }
    } catch (err) {
      alert('Error rejecting payment: ' + err.message);
    }
  };

  if (loading || !user || !settings) {
    return (
      <Layout>
        <Loading fullScreen message="Loading dashboard..." />
      </Layout>
    );
  }

  const statusOptions = [
    { value: 'PENDING', label: 'Pending', color: '#FF9800' },
    { value: 'CONFIRMED', label: 'Confirmed', color: '#2196F3' },
    { value: 'PREPARING', label: 'Preparing', color: '#9C27B0' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: '#673AB7' },
    { value: 'DELIVERED', label: 'Delivered', color: '#4CAF50' },
    { value: 'CANCELLED', label: 'Cancelled', color: '#F44336' },
    { value: 'REFUNDED', label: 'Refunded', color: '#795548' },
  ];

  return (
    <Layout>
      <div className="admin-dashboard">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="business-name">{settings.businessName}</p>
          </div>
          <div className="user-info">
            <span>{user.email} ({user.role})</span>
            <button onClick={() => router.push('/admin/settings')} className="settings-btn">
              ⚙️ Settings
            </button>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>

        {/* Stats Overview */}
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

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={activeTab === 'tracking' ? 'active' : ''}
            onClick={() => setActiveTab('tracking')}
          >
            Order Tracking ({statusStats?.totalOrders || 0})
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button 
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
          {user.role === 'super-admin' && (
            <button 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          )}
          <button 
            className={activeTab === 'payments' ? 'active' : ''}
            onClick={() => setActiveTab('payments')}
          >
            Pending Payments ({pendingPayments.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* ORDER TRACKING TAB */}
          {activeTab === 'tracking' && (
            <div className="tracking-section">
              <h2>📦 Order Tracking & Status Management</h2>
              
              {/* Status Statistics */}
              {statusStats && (
                <div className="status-stats">
                  <h3>Order Status Overview</h3>
                  <div className="stats-grid-small">
                    {statusStats.statistics?.map((stat, index) => (
                      <div key={index} className="status-stat-card" style={{ borderLeft: `4px solid ${statusOptions.find(s => s.value === stat.status)?.color || '#ccc'}` }}>
                        <span className="status-label">{statusOptions.find(s => s.value === stat.status)?.label || stat.status}</span>
                        <span className="status-count">{stat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Filter */}
              <div className="status-filter">
                <h3>Filter by Status</h3>
                <div className="status-buttons">
                  {statusOptions.map(status => (
                    <button
                      key={status.value}
                      onClick={() => fetchOrdersByStatus(status.value)}
                      className={`status-btn ${trackingStatus === status.value ? 'active' : ''}`}
                      style={{ 
                        backgroundColor: trackingStatus === status.value ? status.color : '#f5f5f5',
                        color: trackingStatus === status.value ? 'white' : '#333'
                      }}
                    >
                      {status.label} 
                      {statusStats?.statistics?.find(s => s.status === status.value)?.count || 0}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              <div className="tracking-orders-list">
                <h3>Orders - {statusOptions.find(s => s.value === trackingStatus)?.label}</h3>
                
                {ordersByStatus.length === 0 ? (
                  <div className="empty-state">
                    <p>No orders with status "{trackingStatus}"</p>
                  </div>
                ) : (
                  <div className="orders-grid">
                    {ordersByStatus.map(order => (
                      <div key={order.id} className="order-card">
                        <div className="order-header">
                          <div className="order-id">Order #{order.id}</div>
                          <div className="order-customer">
                            <strong>{order.customerName}</strong>
                            <span>{order.phone}</span>
                          </div>
                          <div className="order-amount">
                            {formatCurrency(order.totalAmount || 0, settings.currency)}
                          </div>
                        </div>

                        <div className="order-details">
                          <div className="order-info">
                            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                            <p><strong>Payment:</strong> 
                              <span className={`payment-status ${order.paymentStatus?.toLowerCase()}`}>
                                {order.paymentStatus}
                              </span>
                            </p>
                            <p><strong>Current Status:</strong>
                              <span className="current-status" style={{ 
                                color: statusOptions.find(s => s.value === order.status)?.color || '#333'
                              }}>
                                {statusOptions.find(s => s.value === order.status)?.label}
                              </span>
                            </p>
                          </div>

                          {/* Order Items */}
                          {order.items && order.items.length > 0 && (
                            <div className="order-items">
                              <p><strong>Items:</strong></p>
                              <ul>
                                {order.items.map(item => (
                                  <li key={item.id}>
                                    {item.product?.name} x{item.quantity}
                                    <span className="item-price">
                                      {formatCurrency(item.unitPrice, settings.currency)} each
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Status Update Form */}
                          {selectedOrder === order.id ? (
                            <div className="status-update-form">
                              <select
                                value={statusUpdate.status}
                                onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                                className="status-select"
                              >
                                {statusOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              
                              <textarea
                                placeholder="Add notes (optional)"
                                value={statusUpdate.notes}
                                onChange={(e) => setStatusUpdate({...statusUpdate, notes: e.target.value})}
                                rows={2}
                                className="status-notes"
                              />
                              
                              <div className="status-form-actions">
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id)}
                                  className="update-btn"
                                >
                                  Update Status
                                </button>
                                <button 
                                  onClick={() => setSelectedOrder(null)}
                                  className="cancel-btn"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="order-actions">
                              <button 
                                onClick={() => {
                                  setSelectedOrder(order.id);
                                  setStatusUpdate({ 
                                    status: order.status === 'PENDING' ? 'CONFIRMED' : order.status,
                                    notes: ''
                                  });
                                }}
                                className="action-btn"
                              >
                                Update Status
                              </button>
                              
                              {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && order.status !== 'REFUNDED' && (
                                <button 
                                  onClick={() => handleCancelOrder(order.id)}
                                  className="action-btn cancel"
                                >
                                  Cancel Order
                                </button>
                              )}
                              
                              <button 
                                onClick={() => router.push(`/track/${order.id}?phone=${order.phone}`)}
                                className="action-btn track"
                              >
                                View Tracking
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bulk Actions */}
              <div className="bulk-actions">
                <h3>Bulk Actions</h3>
                <div className="bulk-form">
                  <select
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({...statusUpdate, status: e.target.value})}
                    className="bulk-select"
                  >
                    <option value="">Select status to update...</option>
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  
                  <textarea
                    placeholder="Notes for bulk update (optional)"
                    value={statusUpdate.notes}
                    onChange={(e) => setStatusUpdate({...statusUpdate, notes: e.target.value})}
                    rows={2}
                    className="bulk-notes"
                  />
                  
                  <button 
                    onClick={() => {
                      const selectedOrders = ordersByStatus.filter(o => document.getElementById(`select-${o.id}`)?.checked);
                      if (selectedOrders.length === 0) {
                        alert('Please select orders to update');
                        return;
                      }
                      // TODO: Implement bulk update
                      alert(`Will update ${selectedOrders.length} orders to ${statusUpdate.status}`);
                    }}
                    className="bulk-update-btn"
                  >
                    Update Selected Orders
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* (Other tabs remain the same - products, orders, users, payments, overview) */}
          {/* ... existing code for other tabs ... */}
          
        </div>
      </div>   
    </Layout>
  );
}