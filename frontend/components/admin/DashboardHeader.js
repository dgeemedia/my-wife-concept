// frontend/components/admin/DashboardHeader.js
export default function DashboardHeader({ user, settings, handleLogout, router }) {
  return (
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
  );
}