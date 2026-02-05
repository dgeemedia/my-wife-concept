// frontend/app/platform/dashboard/components/BusinessItem.tsx
import { Building2, Power, PowerOff, Users, Package, ShoppingCart, Calendar, Globe, CreditCard, Clock, Zap } from 'lucide-react'
import { DashboardBusiness } from '../types'
import { getDisplayDomain } from '@/lib/domain-helper'

interface BusinessItemProps {
  business: DashboardBusiness
  onToggleStatus: (businessId: number, currentStatus: boolean) => void
  onUpdateSubscription?: (businessId: number) => void
}

export default function BusinessItem({ business, onToggleStatus, onUpdateSubscription }: BusinessItemProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getBusinessTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      'food': '🍔',
      'retail': '🛍️',
      'service': '🔧',
      'ecommerce': '🛒',
      'education': '📚',
      'health': '🏥',
      'entertainment': '🎬',
      'technology': '💻'
    }
    return icons[type] || '🏢'
  }

  const getSubscriptionStatus = () => {
    if (!business.subscriptionExpiry) {
      return {
        status: 'none',
        text: 'No Subscription',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        icon: '📭',
        daysLeft: null
      }
    }
    
    const expiryDate = new Date(business.subscriptionExpiry)
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (expiryDate < today) {
      return {
        status: 'expired',
        text: `Expired ${Math.abs(daysLeft)} days ago`,
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '❌',
        daysLeft
      }
    } else if (expiryDate <= thirtyDaysFromNow) {
      return {
        status: 'expiring',
        text: `Expires in ${daysLeft} days`,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⏳',
        daysLeft
      }
    } else {
      return {
        status: 'active',
        text: `Active (${daysLeft} days left)`,
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅',
        daysLeft
      }
    }
  }

  const subscriptionStatus = getSubscriptionStatus()
  const isSubscriptionExpiring = subscriptionStatus.status === 'expiring'
  const isSubscriptionExpired = subscriptionStatus.status === 'expired'

  // Get display domain - always shows .mypadifood.com to clients
  const displayDomain = getDisplayDomain(business.slug, true)

  return (
    <div className={`p-6 border-b transition-all duration-200 group ${
      isSubscriptionExpiring ? 'bg-yellow-50 hover:bg-yellow-100' :
      isSubscriptionExpired ? 'bg-red-50 hover:bg-red-100' :
      'hover:bg-gray-50'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          {/* Business Logo/Initials */}
          <div className="relative">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md ${
              isSubscriptionExpiring ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
              isSubscriptionExpired ? 'bg-gradient-to-br from-red-500 to-red-600' :
              'bg-gradient-to-br from-blue-500 to-blue-600'
            }`}>
              {business.logo ? (
                <img 
                  src={business.logo} 
                  alt={business.businessName}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {getInitials(business.businessName)}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-xs">{getBusinessTypeIcon(business.businessType)}</span>
            </div>
          </div>

          {/* Business Details */}
          <div className="flex-1">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                {business.businessName}
              </h3>
              
              {/* Business Status Badge */}
              {business.isActive ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                  Active
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full border border-red-200 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                  Suspended
                </span>
              )}

              {/* Subscription Status */}
              <span className={`px-3 py-1 text-xs font-medium rounded-full border flex items-center ${subscriptionStatus.color}`}>
                <span className="mr-1.5">{subscriptionStatus.icon}</span>
                {subscriptionStatus.text}
              </span>
            </div>

            {/* Subdomain - Shows production domain */}
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600 font-medium">
                {displayDomain}
              </p>
            </div>

            {/* Stats Row */}
            <div className="flex items-center space-x-6 mb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">{business._count?.users || 0}</span> users
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">{business._count?.products || 0}</span> products
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-700">
                  <span className="font-semibold">{business._count?.orders || 0}</span> orders
                </span>
              </div>
              
              {/* Subscription Expiry */}
              {business.subscriptionExpiry && (
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-700">
                    <span className="font-semibold">{formatDate(business.subscriptionExpiry)}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Created {formatDate(business.createdAt)}</span>
              </div>
              {business.suspendedAt && (
                <div className="flex items-center space-x-1">
                  <span className="w-3 h-3">⏸️</span>
                  <span>Suspended {formatDate(business.suspendedAt)}</span>
                </div>
              )}
              {business.businessType && (
                <div className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                  {business.businessType}
                </div>
              )}
            </div>

            {/* Suspension Reason */}
            {!business.isActive && business.suspensionReason && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  <span className="font-semibold">Suspension Reason:</span> {business.suspensionReason}
                </p>
              </div>
            )}
            
            {/* Subscription Alert */}
            {isSubscriptionExpiring && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Subscription Expiring Soon:</span> 
                  &nbsp;This business has {subscriptionStatus.daysLeft} days left on their subscription.
                </p>
              </div>
            )}
            
            {isSubscriptionExpired && (
              <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Subscription Expired:</span> 
                  &nbsp;This business needs to renew their subscription.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ml-4 flex flex-col items-end space-y-3">
          <div className="flex space-x-2">
            {onUpdateSubscription && (
              <button
                onClick={() => onUpdateSubscription(business.id)}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow hover:shadow-md"
              >
                <CreditCard className="w-4 h-4" />
                <span>Update Subscription</span>
              </button>
            )}
            <button
              onClick={() => onToggleStatus(business.id, business.isActive)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium ${
                business.isActive
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow hover:shadow-md'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow hover:shadow-md'
              }`}
            >
              {business.isActive ? (
                <>
                  <PowerOff className="w-4 h-4" />
                  <span>Suspend</span>
                </>
              ) : (
                <>
                  <Power className="w-4 h-4" />
                  <span>Reactivate</span>
                </>
              )}
            </button>
          </div>
          
          {/* Quick Stats Summary */}
          <div className="mt-3 text-center">
            <div className={`text-2xl font-bold ${
              isSubscriptionExpiring ? 'text-yellow-700' :
              isSubscriptionExpired ? 'text-red-700' :
              'text-gray-900'
            }`}>
              {business._count?.users || 0}
            </div>
            <div className="text-xs text-gray-500">Active Users</div>
          </div>
        </div>
      </div>
    </div>
  )
}