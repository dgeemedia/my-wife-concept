// frontend/components/admin/DashboardHeader.js
export default function DashboardHeader({ user, settings, handleLogout, router }) {
  const businessName = settings?.businessName || 'Your Business';
  const userEmail = user?.email || 'Unknown';
  const userRole = user?.role || 'admin';

  return (
    <div className="dashboard-header">
      <div>
        <h1>Admin Dashboard</h1>
        <p className="business-name">{businessName}</p>
      </div>
      <div className="user-info">
        <span>{userEmail} ({userRole})</span>
        <button onClick={() => router.push('/admin/settings')} className="settings-btn">
          ⚙️ Settings
        </button>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}
