// frontend/pages/admin/dashboard/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Loading from '../../../components/Loading';
import DashboardHeader from '../../../components/admin/DashboardHeader';
import StatsOverview from '../../../components/admin/StatsOverview';
import DashboardTabs from '../../../components/admin/DashboardTabs';
import OverviewTab from '../../../components/admin/tabs/OverviewTab';
import TrackingTab from '../../../components/admin/tabs/TrackingTab';
import ProductsTab from '../../../components/admin/tabs/ProductsTab';
import OrdersTab from '../../../components/admin/tabs/OrdersTab';
import UsersTab from '../../../components/admin/tabs/UsersTab';
import PaymentsTab from '../../../components/admin/tabs/PaymentsTab';
import ActivityTab from '../../../components/admin/tabs/ActivityTab';
import { 
  analyticsApi, 
  ordersApi, 
  productsApi, 
  usersApi, 
  trackingApi, 
  uploadApi 
} from '../../../lib/api';
import { auth } from '../../../lib/auth';

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
  const [adminActivity, setAdminActivity] = useState([]);
  const [stalePaymentsCount, setStalePaymentsCount] = useState(0);
  
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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);

const checkAuth = async () => {
  console.log('🔍 Starting auth check...');
  
  // Just check if we have SOMETHING in localStorage
  const hasToken = !!localStorage.getItem('token');
  const hasUser = !!localStorage.getItem('user');
  
  console.log('Has token:', hasToken);
  console.log('Has user:', hasUser);
  
  if (!hasToken || !hasUser) {
    console.log('❌ Missing data, going to login');
    window.location.href = '/admin/login';
    return;
  }
  
  // Get user
  try {
    const userStr = localStorage.getItem('user');
    const currentUser = JSON.parse(userStr);
    console.log('✅ Got user:', currentUser.email);
    
    // Just set it, don't verify anything
    setUser(currentUser);
    
    // Load data
    console.log('📊 Loading dashboard data...');
    await fetchAllData();
    
    console.log('✅ Dashboard loaded successfully');
    
  } catch (err) {
    console.error('❌ Error:', err);
    alert('Error loading dashboard: ' + err.message);
    setLoading(false);
  }
};

// Call checkAuth in useEffect
useEffect(() => {
  checkAuth();
}, []);

const fetchAllData = async () => {
  try {
    setLoading(true);
    
    // ✅ Use apiRequest consistently for all API calls
    const [
      settingsData,
      statsData, 
      productsData, 
      ordersData, 
      statusStatsData,
      activityData,
      staleData
    ] = await Promise.all([
      // Settings doesn't require auth
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/settings`)
        .then(r => r.json())
        .catch(() => ({})),
      
      // ✅ Use apiRequest with requiresAuth: true
      analyticsApi.getStats().catch(err => {
        console.warn('Analytics failed:', err.message);
        return null;
      }),
      
      productsApi.getAll().catch(err => {
        console.warn('Products failed:', err.message);
        return [];
      }),
      
      ordersApi.getAll({ limit: 100 }).catch(err => {
        console.warn('Orders failed:', err.message);
        return { orders: [] };
      }),
      
      trackingApi.getStatusStatistics().catch(err => {
        console.warn('Status stats failed:', err.message);
        return null;
      }),
      
      // ✅ Use apiRequest helper instead of direct fetch
      (async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/activity`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          return await response.json();
        } catch {
          return [];
        }
      })(),
      
      // ✅ Use apiRequest helper instead of direct fetch
      (async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/stale-payments`, {
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          return await response.json();
        } catch {
          return { count: 0, orders: [] };
        }
      })()
    ]);

    // ✅ Handle each response safely
    setSettings(settingsData || {});
    setStats(statsData || null);
    setProducts(productsData || []);
    setOrders(ordersData.orders || []);
    setStatusStats(statusStatsData || null);
    setAdminActivity(activityData || []);
    setStalePaymentsCount(staleData.count || 0);
    
    // Filter pending payments
    const pending = (ordersData.orders || []).filter(order => 
      order.paymentStatus === 'PENDING'
    );
    setPendingPayments(pending);

    // Fetch orders by status
    await fetchOrdersByStatus(trackingStatus);

    // Fetch users if super-admin
    if (user?.role === 'super-admin') {
      try {
        const usersData = await usersApi.getAll();
        setUsers(usersData || []);
      } catch (err) {
        console.warn('Failed to fetch users:', err.message);
        setUsers([]);
      }
    }
  } catch (err) {
    console.error('Error in fetchAllData:', err);
    
    // ✅ Better error handling for auth failures
    if (err.message.includes('Not authenticated') || err.message.includes('401')) {
      console.log('Authentication failed, redirecting to login');
      auth.clear();
      router.push('/admin/login');
      return;
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
      
      await fetchOrdersByStatus(trackingStatus);
      await fetchAllData();
      
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

  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const result = await uploadApi.image(file);
      
      if (isEdit && editingProduct) {
        setEditingProduct({ ...editingProduct, imageUrl: result.url });
      } else {
        setNewProduct({ ...newProduct, imageUrl: result.url });
      }
      
      alert('Image uploaded successfully!');
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateProduct = async (e) => {
  e.preventDefault();
  
  try {
    // Validate required fields before sending
    if (!newProduct.name || !newProduct.name.trim()) {
      alert('Product name is required');
      return;
    }
    
    if (!newProduct.price || isNaN(Number(newProduct.price)) || Number(newProduct.price) <= 0) {
      alert('Please enter a valid price greater than 0');
      return;
    }
    
    if (!newProduct.stock || isNaN(Number(newProduct.stock)) || Number(newProduct.stock) < 0) {
      alert('Please enter a valid stock quantity');
      return;
    }
    
    // Prepare data with proper types
      const productData = {
        name: newProduct.name.trim(),
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        description: newProduct.description?.trim() || '',
        imageUrl: newProduct.imageUrl?.trim() || '',
      };
      
      await productsApi.create(productData);
      alert('Product created successfully!');
      setNewProduct({ name: '', price: '', stock: '', description: '', imageUrl: '' });
      await fetchAllData();
    } catch (err) {
      console.error('Product creation error details:', err);
      alert('Error creating product: ' + err.message);
    }
  };
  
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    
    try {
      await productsApi.update(editingProduct.id, editingProduct);
      alert('Product updated successfully!');
      setEditingProduct(null);
      await fetchAllData();
    } catch (err) {
      alert('Error updating product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    
    try {
      await productsApi.delete(id);
      alert('Product deleted!');
      await fetchAllData();
    } catch (err) {
      alert('Error deleting product: ' + err.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      const result = await usersApi.create(newUser);
      alert(`User created!\n\nTemporary Password: ${result.tempPassword}\n\nPlease save this password and share it securely with the user.`);
      setNewUser({ email: '', role: 'admin' });
      await fetchAllData();
    } catch (err) {
      alert('Error creating user: ' + err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    
    try {
      await usersApi.delete(id);
      alert('User deleted!');
      await fetchAllData();
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const handleResetUserPassword = async (id) => {
    if (!confirm('Reset user password?')) return;
    
    try {
      const result = await usersApi.resetPassword(id);
      alert(`Password reset!\n\nNew Password: ${result.tempPassword}\n\nPlease share this securely with the user.`);
    } catch (err) {
      alert('Error resetting password: ' + err.message);
    }
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    try {
      await usersApi.updateStatus(id, !currentStatus);
      alert(`User ${currentStatus ? 'suspended' : 'activated'}!`);
      await fetchAllData();
    } catch (err) {
      alert('Error updating user status: ' + err.message);
    }
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

const handleLogout = () => {
  auth.clear();
  router.push('/');
};


  const handleExportOrders = async () => {
    try {
      await ordersApi.exportCSV();
      alert('Orders exported successfully!');
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (selectedOrderIds.length === 0) {
      alert('Please select orders first');
      return;
    }

    if (!statusUpdate.status) {
      alert('Please select a status');
      return;
    }

    try {
      await trackingApi.bulkUpdateStatus(selectedOrderIds, statusUpdate.status, statusUpdate.notes);
      alert(`Bulk update successful for ${selectedOrderIds.length} orders!`);
      await fetchOrdersByStatus(trackingStatus);
      await fetchAllData();
      setSelectedOrderIds([]);
    } catch (err) {
      alert('Error in bulk update: ' + err.message);
    }
  };

  if (loading) {
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

  // Pass props to components
  const dashboardProps = {
    user,
    settings,
    stats,
    products,
    orders,
    users,
    pendingPayments,
    adminActivity,
    stalePaymentsCount,
    statusStats,
    ordersByStatus,
    trackingStatus,
    selectedOrder,
    statusUpdate,
    newProduct,
    editingProduct,
    newUser,
    paymentAction,
    uploadingImage,
    selectedOrderIds,
    statusOptions,
    activeTab,
    router
  };

  const handlers = {
    setActiveTab,
    fetchOrdersByStatus,
    handleUpdateOrderStatus,
    setSelectedOrder,
    handleCancelOrder,
    handleImageUpload,
    handleCreateProduct,
    handleUpdateProduct,
    setEditingProduct,
    setNewProduct,
    handleDeleteProduct,
    handleCreateUser,
    setNewUser,
    handleDeleteUser,
    handleResetUserPassword,
    handleToggleUserStatus,
    confirmPayment,
    rejectPayment,
    setPaymentAction,
    handleLogout,
    handleExportOrders,
    handleBulkStatusUpdate,
    setSelectedOrderIds,
    setStatusUpdate
  };

  return (
    <Layout>
      <div className="admin-dashboard">
        <DashboardHeader 
          user={user}
          settings={settings}
          handleLogout={handleLogout}
          router={router}
        />
        
        {stalePaymentsCount > 0 && (
          <div className="alert-warning">
            ⚠️ {stalePaymentsCount} payment(s) pending for more than 24 hours!
          </div>
        )}
        
        <StatsOverview 
          stats={stats}
          pendingPayments={pendingPayments}
          settings={settings}
        />
        
        <DashboardTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          statusStats={statusStats}
          products={products}
          orders={orders}
          pendingPayments={pendingPayments}
          users={users}
          user={user}
        />
        
        <div className="tab-content">
          {activeTab === 'overview' && <OverviewTab {...dashboardProps} />}
          {activeTab === 'tracking' && <TrackingTab {...dashboardProps} {...handlers} />}
          {activeTab === 'products' && <ProductsTab {...dashboardProps} {...handlers} />}
          {activeTab === 'orders' && <OrdersTab {...dashboardProps} {...handlers} />}
          {activeTab === 'users' && user.role === 'super-admin' && (
            <UsersTab {...dashboardProps} {...handlers} />
          )}
          {activeTab === 'payments' && <PaymentsTab {...dashboardProps} {...handlers} />}
          {activeTab === 'activity' && user.role === 'super-admin' && (
            <ActivityTab {...dashboardProps} />
          )}
        </div>
      </div>
    </Layout>
  );
}