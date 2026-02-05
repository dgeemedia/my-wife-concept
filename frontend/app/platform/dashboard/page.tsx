// frontend/app/platform/dashboard/page.tsx
'use client'

import Header from './components/Header'
import TabNavigation from './components/TabNavigation'
import OverviewTab from './components/OverviewTab'
import BusinessesTab from './components/BusinessesTab'
import RequestsTab from './components/RequestsTab'
import SettingsTab from './components/SettingsTab'
import CreateBusinessModal from './components/CreateBusinessModal'
import { useDashboard } from './hooks/useDashboard'

export default function PlatformDashboard() {
  const {
    user,
    loading,
    activeTab,
    setActiveTab,
    dashboardStats,
    pendingRequests,
    filteredBusinesses,
    searchTerm,
    setSearchTerm,
    selectedRequest,
    showCreateModal,
    setShowCreateModal,
    expiringSubscriptionsCount,
    handleToggleBusinessStatus,
    handleUpdateSubscription,
    handleApproveRequest,
    handleRejectRequest,
    handleApproveAndCreate,
    handleCreateBusiness,
    handleLogout,
    router
  } = useDashboard()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        userEmail={user?.email || ''}
        pendingRequestsCount={pendingRequests.length}
        onLogout={handleLogout}
        onNavigateToRequests={() => setActiveTab('requests')}
      />

      <TabNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingRequestsCount={pendingRequests.length}
        expiringSubscriptionsCount={expiringSubscriptionsCount}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab
            stats={dashboardStats}
            onNavigateToRequests={() => setActiveTab('requests')}
            onNavigateToBusinesses={() => setActiveTab('businesses')}
            onCreateNewBusiness={() => router.push('/super-admin/businesses/new')}
            onManageSubscriptions={() => setActiveTab('businesses')}
          />
        )}

        {activeTab === 'businesses' && (
          <BusinessesTab
            businesses={filteredBusinesses}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddBusiness={() => router.push('/super-admin/businesses/new')}
            onToggleStatus={handleToggleBusinessStatus}
            onUpdateSubscription={handleUpdateSubscription}
          />
        )}

        {activeTab === 'requests' && (
          <RequestsTab
            requests={pendingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onApproveAndCreate={handleApproveAndCreate}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab currentUser={user} />
        )}
      </div>

      {showCreateModal && selectedRequest && (
        <CreateBusinessModal
          request={selectedRequest}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedRequest(null)
          }}
          onCreate={handleCreateBusiness}
        />
      )}
    </div>
  )
}