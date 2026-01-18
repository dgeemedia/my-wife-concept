// frontend/components/admin/tabs/UsersTab.js
export default function UsersTab({
  users,
  newUser,
  user: currentUser,
  setNewUser,
  handleCreateUser,
  handleDeleteUser,
  handleResetUserPassword,
  handleToggleUserStatus
}) {
  return (
    <div className="users-section">
      <div className="section-header">
        <h2>👥 User Management ({users.length})</h2>
        <p className="section-subtitle">Manage admin users and their permissions</p>
      </div>

      {/* Add User Form */}
      <div className="user-form-card">
        <h3>➕ Add New User</h3>
        <form onSubmit={handleCreateUser}>
          <div className="form-grid">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Role *</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Create User
            </button>
          </div>
          <p className="form-hint">
            A temporary password will be generated and displayed after creation.
          </p>
        </form>
      </div>

      {/* Users List */}
      <div className="users-list">
        <h3>Active Users</h3>
        {users.length === 0 ? (
          <div className="empty-state">
            <p>No users found. Create your first admin user.</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className={u.id === currentUser.id ? 'current-user' : ''}>
                    <td className="user-id">#{u.id}</td>
                    <td className="user-email">
                      <div>{u.email}</div>
                      {u.id === currentUser.id && (
                        <span className="current-user-badge">(You)</span>
                      )}
                    </td>
                    <td className="user-role">
                      <span className={`role-badge ${u.role}`}>
                        {u.role.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="user-status">
                      <span className={`status-badge ${u.active ? 'active' : 'inactive'}`}>
                        {u.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="user-created">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="user-last-login">
                      {u.lastLogin 
                        ? new Date(u.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="user-actions">
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleToggleUserStatus(u.id, u.active)}
                          className={`btn-status ${u.active ? 'suspend' : 'activate'}`}
                          disabled={u.id === currentUser.id}
                          title={u.active ? 'Suspend User' : 'Activate User'}
                        >
                          {u.active ? 'Suspend' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleResetUserPassword(u.id)}
                          className="btn-reset"
                          title="Reset Password"
                        >
                          🔄 Reset
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn-delete"
                          disabled={u.id === currentUser.id}
                          title="Delete User"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                      {u.id === currentUser.id && (
                        <div className="self-action-note">
                          <small>Cannot modify your own account</small>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Statistics */}
      {users.length > 0 && (
        <div className="user-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Users</h4>
              <p className="stat-number">{users.length}</p>
            </div>
            <div className="stat-card">
              <h4>Active Users</h4>
              <p className="stat-number">
                {users.filter(u => u.active).length}
              </p>
            </div>
            <div className="stat-card">
              <h4>Super Admins</h4>
              <p className="stat-number">
                {users.filter(u => u.role === 'super-admin').length}
              </p>
            </div>
            <div className="stat-card">
              <h4>Admins</h4>
              <p className="stat-number">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}