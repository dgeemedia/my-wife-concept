// frontend/app/platform/dashboard/components/OverviewTab.tsx
import { Building2, Users, Package, ShoppingCart, AlertCircle, Plus, TrendingUp, TrendingDown, CreditCard, Zap, Clock } from 'lucide-react'
import StatCard from './StatCard'
import { DashboardStats } from '../types'

interface OverviewTabProps {
  stats: DashboardStats
  onNavigateToRequests: () => void
  onNavigateToBusinesses: () => void
  onCreateNewBusiness: () => void
  onManageSubscriptions?: () => void
}

export default function OverviewTab({ 
  stats, 
  onNavigateToRequests, 
  onNavigateToBusinesses,
  onCreateNewBusiness,
  onManageSubscriptions
}: OverviewTabProps) {
  const subscribedBusinesses = stats.subscribedBusinesses || 0
  const expiringSoon = stats.expiringSoon || 0
  const expiredSubscriptions = stats.expiredSubscriptions || 0
  const activeBusinesses = stats.activeBusinesses || 0
  const suspendedBusinesses = stats.suspendedBusinesses || 0
  const totalBusinesses = stats.totalBusinesses || 0

  const statCards = [
    {
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      label: "Total Businesses",
      value: totalBusinesses,
      bgColor: "bg-blue-50",
      subLabel: `${activeBusinesses} active, ${suspendedBusinesses} suspended`,
      trend: totalBusinesses > 0 ? 'up' : 'neutral' as const,
      change: "+12%"
    },
    {
      icon: <CreditCard className="w-8 h-8 text-purple-600" />,
      label: "Subscribed",
      value: subscribedBusinesses,
      bgColor: "bg-purple-50",
      subLabel: `${expiringSoon} expiring, ${expiredSubscriptions} expired`,
      trend: subscribedBusinesses > 0 ? 'up' : 'neutral' as const,
      change: "+8%"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      label: "Total Users",
      value: stats.totalUsers || 0,
      bgColor: "bg-green-50",
      subLabel: "Across all businesses",
      trend: 'up' as const,
      change: "+24%"
    },
    {
      icon: <ShoppingCart className="w-8 h-8 text-orange-600" />,
      label: "Total Orders",
      value: stats.totalOrders || 0,
      bgColor: "bg-orange-50",
      subLabel: "All time orders",
      trend: 'up' as const,
      change: "+18%"
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-yellow-600" />,
      label: "Pending Requests",
      value: stats.pendingRequests || 0,
      bgColor: "bg-yellow-50",
      subLabel: `${stats.approvedRequests || 0} approved, ${stats.rejectedRequests || 0} rejected`,
      trend: stats.pendingRequests && stats.pendingRequests > 0 ? 'up' : 'neutral' as const,
      change: "+5"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className={`${card.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
              {card.icon}
            </div>
            <div className="flex items-end justify-between mb-1">
              <div className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</div>
              {card.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
              {card.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
            </div>
            <div className="text-gray-600 font-medium mb-1">{card.label}</div>
            <div className="text-sm text-gray-500">{card.subLabel}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={onCreateNewBusiness}
            className="flex flex-col items-center justify-center space-y-3 p-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-xl font-semibold">Create New Business</span>
            <p className="text-blue-100 text-sm text-center">Manually create a new business account</p>
          </button>
          <button
            onClick={onNavigateToRequests}
            className="flex flex-col items-center justify-center space-y-3 p-8 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
            <span className="text-xl font-semibold">View Requests ({stats.pendingRequests || 0})</span>
            <p className="text-green-100 text-sm text-center">Review new business onboarding requests</p>
          </button>
          <button
            onClick={onManageSubscriptions || onNavigateToBusinesses}
            className="flex flex-col items-center justify-center space-y-3 p-8 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-8 h-8" />
            </div>
            <span className="text-xl font-semibold">Manage Subscriptions</span>
            <p className="text-purple-100 text-sm text-center">View and update business subscriptions</p>
          </button>
        </div>
      </div>

      {/* Subscription Alerts */}
      {(expiringSoon > 0 || expiredSubscriptions > 0) && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Alerts</h2>
          <div className="space-y-4">
            {expiringSoon > 0 && (
              <div className="flex items-center justify-between p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Expiring Subscriptions</h3>
                    <p className="text-sm text-gray-600">
                      {expiringSoon} business{expiringSoon !== 1 ? 'es' : ''} will expire within 30 days
                    </p>
                  </div>
                </div>
                <button
                  onClick={onManageSubscriptions || onNavigateToBusinesses}
                  className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                >
                  Review
                </button>
              </div>
            )}
            
            {expiredSubscriptions > 0 && (
              <div className="flex items-center justify-between p-6 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <Zap className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Expired Subscriptions</h3>
                    <p className="text-sm text-gray-600">
                      {expiredSubscriptions} business{expiredSubscriptions !== 1 ? 'es' : ''} have expired subscriptions
                    </p>
                  </div>
                </div>
                <button
                  onClick={onManageSubscriptions || onNavigateToBusinesses}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Business Growth</h3>
                <p className="text-sm text-gray-600">
                  {activeBusinesses} active businesses generating revenue
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{activeBusinesses}</div>
              <div className="text-sm text-gray-500">Active Businesses</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-green-50 rounded-xl border border-green-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Total Revenue</h3>
                <p className="text-sm text-gray-600">Across all business transactions</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                ₦{((stats.totalOrders || 0) * 5000).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Estimated Revenue</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-6 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Subscription Revenue</h3>
                <p className="text-sm text-gray-600">
                  {subscribedBusinesses} businesses with active subscriptions
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                ₦{(subscribedBusinesses * 25000).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Monthly Recurring</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}