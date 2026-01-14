// frontend/pages/admin/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Loading from '../../components/Loading';
import { productsApi, ordersApi, usersApi, analyticsApi } from '../../lib/api';

export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // 🔐 Subscription state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [canAcceptOrders, setCanAcceptOrders] = useState(true);
  const [dashboardLocked, setDashboardLocked] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    imageUrl: '',
  });
  const [editingProduct, setEditingProduct] = useState(null);

  const [userForm, setUserForm] = useState({
    email: '',
    role: 'admin',
    securityQuestion: '',
    securityAnswer: '',
  });

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
      router.push('/admin/change-password');
      return;
    }

    await checkSubscriptionStatus();
    await fetchData();
  };

  async function checkSubscriptionStatus() {
    try {
      const res = await fetch('/api/tenant/status', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) return;

      const data = await res.json();

      if (data.status === 'LIMIT_REACHED') {
        setShowUpgradeModal(true);
        setCanAcceptOrders(false);
      }

      if (data.status === 'SUBSCRIPTION_EXPIRED') {
        setShowPaymentModal(true);
        setDashboardLocked(true);
      }
    } catch (err) {
      console.error('Subscription status check failed', err);
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true);

      const [statsData, productsData, ordersData] = await Promise.all([
        analyticsApi.getStats(),
        productsApi.getAll(),
        ordersApi.getAll({ limit: 10 }),
      ]);

      setStats(statsData);
      setProducts(productsData);
      setOrders(ordersData.orders || []);

      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData.role === 'super-admin') {
        const usersData = await usersApi.getAll();
        setUsers(usersData);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      if (err.message.includes('401') || err.message.includes('403')) {
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async (orderId) => {
    if (!confirm('Confirm payment for this order?')) return;
    try {
      await ordersApi.confirmPayment(orderId);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const rejectPayment = async (orderId) => {
    if (!confirm('Reject payment for this order?')) return;
    try {
      await ordersApi.rejectPayment(orderId);
      await fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (loading || !user) {
    return (
      <Layout>
        <Loading fullScreen message="Loading dashboard..." />
      </Layout>
    );
  }

  return (
    <Layout>
      {dashboardLocked && (
        <div className="dashboard-lock-banner">
          🚫 Subscription expired — dashboard access is restricted.
        </div>
      )}

      {showUpgradeModal && (
        <div className="dashboard-alert">
          ⚠️ Order limit reached. Upgrade your plan.
        </div>
      )}

      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div>
            {user.email} ({user.role})
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="dashboard-tabs">
          {['overview', 'products', 'orders', user.role === 'super-admin' && 'users']
            .filter(Boolean)
            .map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'active' : ''}
              >
                {tab.toUpperCase()}
              </button>
            ))}
        </div>

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="dashboard-table">
            {orders.map(order => (
              <div key={order.id} className="dashboard-order-row">
                <strong>Order #{order.id}</strong>
                <span>₦{order.totalAmount?.toLocaleString()}</span>

                {order.paymentStatus === 'PENDING' && canAcceptOrders && (
                  <div>
                    <button onClick={() => confirmPayment(order.id)}>Confirm</button>
                    <button onClick={() => rejectPayment(order.id)}>Reject</button>
                  </div>
                )}

                {order.paymentStatus === 'CONFIRMED' && <span>✅ PAID</span>}
                {order.paymentStatus === 'REJECTED' && <span>❌ REJECTED</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
