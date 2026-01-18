// frontend/components/admin/tabs/ActivityTab.js
export default function ActivityTab({ adminActivity, user }) {
  // Filter activity types
  const activityTypes = [...new Set(adminActivity.map(a => a.actionType))];
  
  // Calculate statistics
  const stats = {
    total: adminActivity.length,
    last24h: adminActivity.filter(a => {
      const activityTime = new Date(a.createdAt);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return activityTime > oneDayAgo;
    }).length,
    uniqueUsers: [...new Set(adminActivity.map(a => a.user?.email).filter(Boolean))].length,
    mostActiveUser: adminActivity
      .filter(a => a.user?.email)
      .reduce((acc, curr) => {
        const email = curr.user.email;
        acc[email] = (acc[email] || 0) + 1;
        return acc;
      }, {})
  };

  const mostActiveEmail = Object.entries(stats.mostActiveUser).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="activity-section">
      <div className="section-header">
        <h2>📝 Admin Activity Log</h2>
        <div className="activity-controls">
          <div className="time-filter">
            <span>Show:</span>
            <select defaultValue="all">
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
          </div>
          <button 
            className="btn-secondary"
            onClick={() => window.print()}
          >
            📄 Print Report
          </button>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="activity-stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Actions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🕐</div>
          <div className="stat-content">
            <div className="stat-number">{stats.last24h}</div>
            <div className="stat-label">Last 24h</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.uniqueUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-number">{stats.mostActiveUser[mostActiveEmail] || 0}</div>
            <div className="stat-label">Most Active User</div>
            {mostActiveEmail && (
              <div className="stat-subtext">{mostActiveEmail}</div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Type Filter */}
      {activityTypes.length > 0 && (
        <div className="activity-type-filter">
          <h4>Filter by Action Type:</h4>
          <div className="type-buttons">
            <button className="type-btn active">All Types</button>
            {activityTypes.map(type => (
              <button key={type} className="type-btn">
                {type} ({adminActivity.filter(a => a.actionType === type).length})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Table */}
      {adminActivity.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No activity recorded yet</p>
          <small>Admin activities will appear here as they occur</small>
        </div>
      ) : (
        <div className="activity-table-container">
          <div className="activity-table">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>IP Address</th>
                  <th>Browser</th>
                </tr>
              </thead>
              <tbody>
                {adminActivity.map(activity => (
                  <tr key={activity.id} className="activity-row">
                    <td className="timestamp-cell">
                      <div className="date">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </div>
                      <div className="time">
                        {new Date(activity.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="user-cell">
                      <div className="user-info">
                        <div className="user-email">
                          {activity.user?.email || 'System'}
                        </div>
                        <div className="user-role">
                          {activity.user?.role || 'system'}
                        </div>
                      </div>
                    </td>
                    <td className="action-cell">
                      <span className={`action-badge ${activity.actionType?.toLowerCase()}`}>
                        {activity.actionType || 'ACTION'}
                      </span>
                    </td>
                    <td className="details-cell">
                      <div className="details-summary">
                        {activity.description || activity.entityType || 'No details'}
                      </div>
                      {activity.details && (
                        <details className="details-expand">
                          <summary>View Details</summary>
                          <pre className="details-json">
                            {typeof activity.details === 'string' 
                              ? activity.details 
                              : JSON.stringify(activity.details, null, 2)}
                          </pre>
                        </details>
                      )}
                      {activity.entityId && (
                        <div className="entity-id">
                          ID: <code>{activity.entityId}</code>
                        </div>
                      )}
                    </td>
                    <td className="ip-cell">
                      <code className="ip-address">
                        {activity.ipAddress || 'N/A'}
                      </code>
                    </td>
                    <td className="browser-cell">
                      <div className="browser-info">
                        {activity.userAgent ? (
                          <>
                            <span className="browser-name">
                              {activity.userAgent.includes('Chrome') ? 'Chrome' : 
                               activity.userAgent.includes('Firefox') ? 'Firefox' : 
                               activity.userAgent.includes('Safari') ? 'Safari' : 'Browser'}
                            </span>
                            <span className="device-type">
                              {activity.userAgent.includes('Mobile') ? '📱' : '💻'}
                            </span>
                          </>
                        ) : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Export Options */}
      {adminActivity.length > 0 && (
        <div className="activity-export">
          <h4>Export Activity Log</h4>
          <div className="export-buttons">
            <button className="btn-secondary">
              📄 Export as CSV
            </button>
            <button className="btn-secondary">
              📊 Export as JSON
            </button>
            <button className="btn-secondary">
              🖨️ Generate PDF Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}