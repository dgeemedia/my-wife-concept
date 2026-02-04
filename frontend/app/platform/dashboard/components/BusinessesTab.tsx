// frontend/app/platform/dashboard/components/BusinessesTab.tsx
import { Search, Plus, CreditCard, Clock, AlertCircle, Play, Pause } from 'lucide-react'
import { useState } from 'react'
import { DashboardBusiness } from '../types'
import SubscriptionModal from './SubscriptionModal'

interface BusinessesTabProps {
  businesses: DashboardBusiness[]
  searchTerm: string
  onSearchChange: (term: string) => void
  onAddBusiness: () => void
  onToggleStatus: (businessId: number, currentStatus: boolean) => void
  onRefresh?: () => void
}

export default function BusinessesTab({
  businesses,
  searchTerm,
  onSearchChange,
  onAddBusiness,
  onToggleStatus,
  onRefresh
}: BusinessesTabProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<DashboardBusiness | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'suspended' | 'expiring'>('all')
  const [filterSubscription, setFilterSubscription] = useState<'all' | 'trial' | 'monthly' | 'annual' | 'none'>('all')

  // Calculate subscription status
  const getSubscriptionStatus = (business: DashboardBusiness) => {
    const now = new Date()
    
    if (business.subscriptionPlan === 'free_trial' && business.trialEndsAt) {
      const trialEnd = new Date(business.trialEndsAt)
      const daysRemaining = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      return {
        status: daysRemaining > 0 ? 'trial' : 'trial_expired',
        daysRemaining: Math.max(0, daysRemaining),
        color: daysRemaining > 0 ? 'yellow' : 'red'
      }
    }
    
    if (business.subscriptionExpiry) {
      const expiry = new Date(business.subscriptionExpiry)
      const daysRemaining = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysRemaining <= 0) {
        return { status: 'expired', daysRemaining: 0, color: 'red' }
      }
      if (daysRemaining <= 7) {
        return { status: 'expiring_soon', daysRemaining, color: 'orange' }
      }
      return { status: 'active', daysRemaining, color: 'green' }
    }
    
    return { status: 'none', daysRemaining: null, color: 'gray' }
  }

  // Filter businesses
  const filteredBusinesses = businesses.filter(business => {
    // Search filter
    const matchesSearch = business.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.slug.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Status filter
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && business.isActive) ||
      (filterStatus === 'suspended' && !business.isActive) ||
      (filterStatus === 'expiring' && getSubscriptionStatus(business).status === 'expiring_soon')
    
    // Subscription filter
    const matchesSubscription = filterSubscription === 'all' ||
      business.subscriptionPlan === filterSubscription ||
      (filterSubscription === 'none' && !business.subscriptionPlan)
    
    return matchesSearch && matchesStatus && matchesSubscription
  })

  const statusColors = {
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  }

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search businesses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="expiring">Expiring Soon</option>
          </select>

          {/* Subscription Filter */}
          <select
            value={filterSubscription}
            onChange={(e) => setFilterSubscription(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Plans</option>
            <option value="trial">Free Trial</option>
            <option value="monthly">Monthly</option>
            <option value="annual">Annual</option>
            <option value="none">No Plan</option>
          </select>

          {/* Add Business Button */}
          <button
            onClick={onAddBusiness}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ml-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Business</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        Showing {filteredBusinesses.length} of {businesses.length} businesses
      </div>

      {/* Businesses List */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {filteredBusinesses.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-600">No businesses found</p>
          </div>
        ) : (
          filteredBusinesses.map((business) => {
            const subStatus = getSubscriptionStatus(business)
            const colors = statusColors[subStatus.color as keyof typeof statusColors]

            return (
              <div key={business.id} className="p-6 border-b hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  {/* Business Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-lg">
                        {business.businessName.charAt(0)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name and Status Badges */}
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {business.businessName}
                        </h3>
                        
                        {/* Active/Suspended Badge */}
                        {business.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                            Suspended
                          </span>
                        )}

                        {/* Subscription Status Badge */}
                        <span className={`px-2 py-1 ${colors.bg} ${colors.text} text-xs rounded-full font-medium flex items-center space-x-1`}>
                          {subStatus.status === 'trial' && <Clock className="w-3 h-3" />}
                          {subStatus.status === 'expiring_soon' && <AlertCircle className="w-3 h-3" />}
                          {subStatus.status === 'expired' && <AlertCircle className="w-3 h-3" />}
                          <span>
                            {subStatus.status === 'trial' && `Trial - ${subStatus.daysRemaining}d left`}
                            {subStatus.status === 'trial_expired' && 'Trial Expired'}
                            {subStatus.status === 'expiring_soon' && `Expires in ${subStatus.daysRemaining}d`}
                            {subStatus.status === 'expired' && 'Expired'}
                            {subStatus.status === 'active' && `${business.subscriptionPlan} - ${subStatus.daysRemaining}d left`}
                            {subStatus.status === 'none' && 'No Subscription'}
                          </span>
                        </span>
                      </div>

                      {/* Subdomain */}
                      <p className="text-sm text-gray-600 mb-1">
                        {business.slug}.mypadifood.com
                      </p>

                      {/* Meta Info */}
                      <p className="text-xs text-gray-500">
                        {business.businessType} • Created {new Date(business.createdAt).toLocaleDateString()}
                      </p>

                      {/* Suspension Reason */}
                      {!business.isActive && business.suspensionReason && (
                        <div className="mt-2 px-3 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                          <strong>Reason:</strong> {business.suspensionReason}
                        </div>
                      )}

                      {/* Expiry Date */}
                      {business.subscriptionExpiry && (
                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Expires:</strong> {new Date(business.subscriptionExpiry).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center space-x-6 ml-4">
                    {/* Stats */}
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{business._count?.users || 0}</div>
                        <div className="text-xs text-gray-500">Users</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{business._count?.products || 0}</div>
                        <div className="text-xs text-gray-500">Products</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{business._count?.orders || 0}</div>
                        <div className="text-xs text-gray-500">Orders</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Manage Subscription */}
                      <button
                        onClick={() => setSelectedBusiness(business)}
                        className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                        title="Manage Subscription"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm font-medium">Subscription</span>
                      </button>

                      {/* Suspend/Activate */}
                      <button
                        onClick={() => onToggleStatus(business.id, business.isActive)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                          business.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={business.isActive ? 'Suspend Business' : 'Reactivate Business'}
                      >
                        {business.isActive ? (
                          <>
                            <Pause className="w-4 h-4" />
                            <span className="text-sm font-medium">Suspend</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span className="text-sm font-medium">Activate</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Subscription Modal */}
      {selectedBusiness && (
        <SubscriptionModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onSuccess={() => {
            onRefresh?.()
            setSelectedBusiness(null)
          }}
        />
      )}
    </div>
  )
}